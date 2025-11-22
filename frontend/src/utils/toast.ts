import toast from 'react-hot-toast';

/**
 * Toast notification utilities
 * Provides consistent toast messages across the application
 */

export const showToast = {
  success: (message: string, options?: { duration?: number }) => {
    return toast.success(message, {
      duration: options?.duration || 3000,
      ...options,
    });
  },

  error: (message: string, options?: { duration?: number }) => {
    return toast.error(message, {
      duration: options?.duration || 5000,
      ...options,
    });
  },

  loading: (message: string) => {
    return toast.loading(message);
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(promise, messages);
  },

  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },

  // Custom toast presets for common scenarios
  fileUploaded: (filename: string) => {
    return toast.success(`파일이 업로드되었습니다: ${filename}`, {
      icon: '📁',
      duration: 3000,
    });
  },

  fileUploadFailed: (filename: string, error?: string) => {
    return toast.error(`파일 업로드 실패: ${filename}${error ? ` - ${error}` : ''}`, {
      icon: '⚠️',
      duration: 5000,
    });
  },

  aiAnalysisStarted: () => {
    return toast.loading('AI가 문서를 분석하고 있습니다...', {
      icon: '🤖',
    });
  },

  aiAnalysisComplete: (tasksCount: number) => {
    return toast.success(`분석 완료! ${tasksCount}개의 업무를 발견했습니다`, {
      icon: '✨',
      duration: 4000,
    });
  },

  aiAnalysisFailed: (error?: string) => {
    return toast.error(`AI 분석 실패${error ? `: ${error}` : ''}`, {
      icon: '❌',
      duration: 5000,
    });
  },

  saved: (itemName?: string) => {
    return toast.success(`${itemName ? `${itemName}이(가) ` : ''}저장되었습니다`, {
      icon: '💾',
      duration: 2500,
    });
  },

  deleted: (itemName?: string) => {
    return toast.success(`${itemName ? `${itemName}이(가) ` : ''}삭제되었습니다`, {
      icon: '🗑️',
      duration: 2500,
    });
  },

  copied: () => {
    return toast.success('클립보드에 복사되었습니다', {
      icon: '📋',
      duration: 2000,
    });
  },

  networkError: () => {
    return toast.error('네트워크 오류가 발생했습니다. 다시 시도해주세요.', {
      icon: '🌐',
      duration: 5000,
    });
  },

  rateLimitExceeded: (retryAfter?: number) => {
    return toast.error(
      `요청 한도를 초과했습니다. ${retryAfter ? `${retryAfter}초 후에 다시 시도해주세요.` : '잠시 후 다시 시도해주세요.'}`,
      {
        icon: '⏱️',
        duration: 6000,
      }
    );
  },

  validationError: (message: string) => {
    return toast.error(message, {
      icon: '⚠️',
      duration: 4000,
    });
  },
};

export default showToast;
