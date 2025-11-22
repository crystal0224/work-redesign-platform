/**
 * API 에러 처리 유틸리티
 * 프로덕션 환경에서 사용자에게 명확한 에러 메시지 제공
 */

/**
 * API 에러 클래스
 * 서버로부터 받은 에러를 구조화하여 처리
 */
export class APIError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number,
    code?: string,
    details?: any
  ) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    // TypeScript에서 Error를 상속할 때 필요한 설정
    Object.setPrototypeOf(this, APIError.prototype);
  }

  /**
   * 사용자에게 표시할 친화적인 메시지 반환
   */
  getUserMessage(): string {
    // Rate limit 에러
    if (this.statusCode === 429) {
      return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
    }

    // 인증 에러
    if (this.statusCode === 401) {
      return '로그인이 필요합니다.';
    }

    if (this.statusCode === 403) {
      return '접근 권한이 없습니다.';
    }

    // 404 에러
    if (this.statusCode === 404) {
      return '요청하신 리소스를 찾을 수 없습니다.';
    }

    // 서버 에러
    if (this.statusCode >= 500) {
      return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    }

    // 기타 클라이언트 에러
    if (this.statusCode >= 400) {
      return this.message || '요청을 처리할 수 없습니다.';
    }

    return this.message || '알 수 없는 오류가 발생했습니다.';
  }

  /**
   * 개발자용 상세 에러 정보 반환
   */
  getDebugInfo(): object {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      details: this.details,
      stack: this.stack,
    };
  }
}

/**
 * 네트워크 에러 클래스
 * 서버 연결 실패, 타임아웃 등의 네트워크 문제
 */
export class NetworkError extends Error {
  constructor(message: string = '네트워크 오류가 발생했습니다.') {
    super(message);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }

  getUserMessage(): string {
    return '인터넷 연결을 확인하고 다시 시도해주세요.';
  }
}

/**
 * Validation 에러 클래스
 * 클라이언트 측 유효성 검증 실패
 */
export class ValidationError extends Error {
  public readonly fields?: Record<string, string>;

  constructor(message: string, fields?: Record<string, string>) {
    super(message);
    this.name = 'ValidationError';
    this.fields = fields;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  getUserMessage(): string {
    if (this.fields) {
      const firstError = Object.values(this.fields)[0];
      return firstError || this.message;
    }
    return this.message;
  }
}

/**
 * API Response 처리 헬퍼
 * fetch 응답을 파싱하고 에러 처리
 */
export async function handleAPIResponse<T>(response: Response): Promise<T> {
  // 응답이 성공인 경우
  if (response.ok) {
    // 204 No Content인 경우
    if (response.status === 204) {
      return {} as T;
    }

    try {
      const data = await response.json();
      return data;
    } catch (error) {
      throw new APIError(
        '서버 응답을 파싱할 수 없습니다',
        response.status,
        'PARSE_ERROR'
      );
    }
  }

  // 에러 응답 처리
  let errorData: any = {};
  try {
    errorData = await response.json();
  } catch {
    // JSON 파싱 실패 시 기본 에러 메시지 사용
  }

  throw new APIError(
    errorData.message || errorData.error || `HTTP ${response.status} 오류`,
    response.status,
    errorData.code,
    errorData.details
  );
}

/**
 * 에러 메시지 추출 헬퍼
 * 다양한 에러 타입에서 사용자에게 표시할 메시지 추출
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof APIError) {
    return error.getUserMessage();
  }

  if (error instanceof NetworkError) {
    return error.getUserMessage();
  }

  if (error instanceof ValidationError) {
    return error.getUserMessage();
  }

  if (error instanceof Error) {
    // TypeError: Failed to fetch
    if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
      return '서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.';
    }

    // Abort error (timeout)
    if (error.name === 'AbortError') {
      return '요청 시간이 초과되었습니다. 다시 시도해주세요.';
    }

    return error.message;
  }

  return '알 수 없는 오류가 발생했습니다.';
}

/**
 * 에러 로깅 헬퍼
 * 프로덕션에서는 에러 추적 서비스로 전송 가능
 */
export function logError(error: unknown, context?: Record<string, any>): void {
  if (process.env.NODE_ENV === 'development') {
    console.error('🔴 Error:', error);
    if (context) {
      console.error('📋 Context:', context);
    }

    if (error instanceof APIError) {
      console.error('🐛 Debug Info:', error.getDebugInfo());
    }
  } else {
    // 프로덕션: Sentry, LogRocket 등으로 전송
    // Example: Sentry.captureException(error, { contexts: { custom: context } });
    console.error('Error:', getErrorMessage(error));
  }
}

/**
 * Fetch wrapper with error handling
 * 자동으로 에러 처리 및 타임아웃 설정
 */
export async function fetchWithErrorHandling<T = any>(
  url: string,
  options?: RequestInit & { timeout?: number }
): Promise<T> {
  const { timeout = 30000, ...fetchOptions } = options || {};

  // Timeout 설정
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    return await handleAPIResponse<T>(response);
  } catch (error) {
    clearTimeout(timeoutId);

    // Network 에러
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError();
    }

    // Abort 에러 (timeout)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new APIError('요청 시간이 초과되었습니다', 408, 'TIMEOUT');
    }

    // 이미 처리된 APIError는 그대로 throw
    if (error instanceof APIError) {
      throw error;
    }

    // 기타 에러
    throw new APIError(
      error instanceof Error ? error.message : '알 수 없는 오류',
      500,
      'UNKNOWN_ERROR'
    );
  }
}

/**
 * 에러 타입 체크 헬퍼들
 */
export const isAPIError = (error: unknown): error is APIError => {
  return error instanceof APIError;
};

export const isNetworkError = (error: unknown): error is NetworkError => {
  return error instanceof NetworkError;
};

export const isValidationError = (error: unknown): error is ValidationError => {
  return error instanceof ValidationError;
};

export const isRateLimitError = (error: unknown): boolean => {
  return isAPIError(error) && error.statusCode === 429;
};

export const isAuthError = (error: unknown): boolean => {
  return isAPIError(error) && (error.statusCode === 401 || error.statusCode === 403);
};
