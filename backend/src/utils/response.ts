import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '@/types';

/**
 * Utility class for standardized API responses
 */
export class ResponseUtil {
  /**
   * Send success response
   */
  static success<T>(res: Response, data?: T, message?: string): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    };

    return res.json(response);
  }

  /**
   * Send error response
   */
  static error(
    res: Response,
    error: string,
    statusCode: number = 400,
    details?: any
  ): Response {
    const response: ApiResponse = {
      success: false,
      error,
      timestamp: new Date().toISOString(),
      ...(details && { details }),
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send paginated response
   */
  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    message?: string
  ): Response {
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const response: ApiResponse<PaginatedResponse<T>> = {
      success: true,
      data: {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext,
          hasPrev,
        },
      },
      message,
      timestamp: new Date().toISOString(),
    };

    return res.json(response);
  }

  /**
   * Send created response (201)
   */
  static created<T>(res: Response, data?: T, message?: string): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message: message || 'Resource created successfully',
      timestamp: new Date().toISOString(),
    };

    return res.status(201).json(response);
  }

  /**
   * Send no content response (204)
   */
  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  /**
   * Send not found response (404)
   */
  static notFound(res: Response, message: string = 'Resource not found'): Response {
    return this.error(res, message, 404);
  }

  /**
   * Send unauthorized response (401)
   */
  static unauthorized(res: Response, message: string = 'Unauthorized'): Response {
    return this.error(res, message, 401);
  }

  /**
   * Send forbidden response (403)
   */
  static forbidden(res: Response, message: string = 'Forbidden'): Response {
    return this.error(res, message, 403);
  }

  /**
   * Send validation error response (400)
   */
  static validationError(res: Response, details: any): Response {
    return this.error(res, 'Validation failed', 400, details);
  }

  /**
   * Send internal server error response (500)
   */
  static internalError(res: Response, message: string = 'Internal server error'): Response {
    return this.error(res, message, 500);
  }

  /**
   * Send conflict response (409)
   */
  static conflict(res: Response, message: string = 'Resource conflict'): Response {
    return this.error(res, message, 409);
  }

  /**
   * Send too many requests response (429)
   */
  static tooManyRequests(res: Response, message: string = 'Too many requests'): Response {
    return this.error(res, message, 429);
  }

  /**
   * Send service unavailable response (503)
   */
  static serviceUnavailable(res: Response, message: string = 'Service unavailable'): Response {
    return this.error(res, message, 503);
  }
}

export default ResponseUtil;