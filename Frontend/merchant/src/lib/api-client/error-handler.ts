/**
 * API Error Handler
 * 
 * Centralized error handling with classification and user-friendly messages
 */

import { ApiError } from './base';
import { logger } from '@/lib/logger';

export type ErrorCategory = 
  | 'NETWORK'
  | 'AUTH'
  | 'VALIDATION'
  | 'SERVER'
  | 'RATE_LIMIT'
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'TIMEOUT'
  | 'UNKNOWN';

export interface ErrorClassification {
  category: ErrorCategory;
  userMessage: string;
  technicalMessage: string;
  isRetryable: boolean;
  shouldLogToSentry: boolean;
}

/**
 * HTTP status code to error category mapping
 */
const STATUS_CODE_MAPPING: Record<number, ErrorCategory> = {
  400: 'VALIDATION',
  401: 'AUTH',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  408: 'TIMEOUT',
  429: 'RATE_LIMIT',
  500: 'SERVER',
  502: 'SERVER',
  503: 'SERVER',
  504: 'TIMEOUT',
};

/**
 * User-friendly error messages by category
 */
const USER_MESSAGES: Record<ErrorCategory, string> = {
  NETWORK: 'Unable to connect to server. Please check your internet connection.',
  AUTH: 'Session expired. Please sign in again.',
  VALIDATION: 'Some information is invalid. Please check your input.',
  SERVER: 'Something went wrong on our end. Please try again later.',
  RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
  NOT_FOUND: 'The requested resource was not found.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  TIMEOUT: 'Request timed out. Please try again.',
  UNKNOWN: 'An unexpected error occurred. Please try again.',
};

/**
 * Classify an API error
 */
export function classifyError(error: ApiError): ErrorClassification {
  const category = error.status 
    ? STATUS_CODE_MAPPING[error.status] || 'UNKNOWN'
    : error.code === 'TIMEOUT'
      ? 'TIMEOUT'
      : 'NETWORK';

  const isRetryable = category === 'SERVER' || category === 'RATE_LIMIT' || category === 'TIMEOUT';
  const shouldLogToSentry = category === 'SERVER' || category === 'UNKNOWN';

  return {
    category,
    userMessage: USER_MESSAGES[category],
    technicalMessage: error.message,
    isRetryable,
    shouldLogToSentry,
  };
}

/**
 * Get user-friendly error message from error
 */
export function getUserMessage(error: ApiError): string {
  const classification = classifyError(error);
  
  // If it's a validation error with details, show first detail
  if (classification.category === 'VALIDATION' && error.details) {
    const firstField = Object.keys(error.details)[0];
    const firstMessage = error.details[firstField]?.[0];
    if (firstMessage) {
      return firstMessage;
    }
  }

  // Use custom error message if provided and not too generic
  if (error.message && !['Request failed', 'Unknown error'].includes(error.message)) {
    return error.message;
  }

  return classification.userMessage;
}

/**
 * Log error with context
 */
export function logError(
  error: ApiError,
  context: {
    operation?: string;
    endpoint?: string;
    userId?: string;
    metadata?: Record<string, unknown>;
  }
): void {
  const classification = classifyError(error);

  const logContext = {
    error: {
      name: error.name,
      message: error.message,
      status: error.status,
      code: error.code,
      correlationId: error.correlationId,
      category: classification.category,
    },
    context,
    timestamp: new Date().toISOString(),
  };

  if (classification.shouldLogToSentry) {
    logger.error('[API_ERROR]', logContext);
  } else {
    logger.warn('[API_ERROR]', logContext);
  }
}

/**
 * Handle API error with classification, logging, and user message
 */
export function handleApiError(
  error: unknown,
  context: {
    operation?: string;
    endpoint?: string;
    userId?: string;
    metadata?: Record<string, unknown>;
  } = {}
): {
  userMessage: string;
  classification: ErrorClassification;
  shouldRetry: boolean;
} {
  // Convert to ApiError if needed
  const apiError = error instanceof ApiError
    ? error
    : new ApiError(error instanceof Error ? error.message : 'Unknown error');

  // Classify
  const classification = classifyError(apiError);

  // Log
  logError(apiError, context);

  // Return handled error info
  return {
    userMessage: getUserMessage(apiError),
    classification,
    shouldRetry: classification.isRetryable,
  };
}

/**
 * Create specific error types for common scenarios
 */
export const ApiErrors = {
  /**
   * Create authentication error
   */
  auth(message = 'Authentication required'): ApiError {
    return new ApiError(message, {
      status: 401,
      code: 'UNAUTHORIZED',
    });
  },

  /**
   * Create forbidden error
   */
  forbidden(message = 'Access denied'): ApiError {
    return new ApiError(message, {
      status: 403,
      code: 'FORBIDDEN',
    });
  },

  /**
   * Create not found error
   */
  notFound(resource = 'Resource'): ApiError {
    return new ApiError(`${resource} not found`, {
      status: 404,
      code: 'NOT_FOUND',
    });
  },

  /**
   * Create validation error
   */
  validation(details: Record<string, string[]>, message = 'Validation failed'): ApiError {
    return new ApiError(message, {
      status: 400,
      code: 'VALIDATION_ERROR',
      details,
    });
  },

  /**
   * Create rate limit error
   */
  rateLimit(retryAfter?: number): ApiError {
    return new ApiError('Rate limit exceeded', {
      status: 429,
      code: 'RATE_LIMIT_EXCEEDED',
    });
  },

  /**
   * Create timeout error
   */
  timeout(): ApiError {
    return new ApiError('Request timed out', {
      status: 408,
      code: 'TIMEOUT',
    });
  },

  /**
   * Create network error
   */
  network(): ApiError {
    return new ApiError('Network error. Please check your connection.', {
      code: 'NETWORK_ERROR',
    });
  },
};
