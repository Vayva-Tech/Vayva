/**
 * Centralized API Error Handler
 * Provides consistent error handling, logging, and user feedback
 */

import { logger } from "@vayva/shared";

export interface ApiError extends Error {
  status?: number;
  correlationId?: string | null;
  code?: string;
  details?: Record<string, unknown>;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  requestId?: string;
}

/**
 * Handle API errors with proper logging and fallback behavior
 * 
 * @param error - The caught error
 * @param context - Context information for logging
 * @param fallbackData - Optional fallback data to return instead of throwing
 * @returns Never throws if fallbackData is provided, otherwise rethrows
 */
export function handleApiError<T>(
  error: unknown,
  context: {
    endpoint: string;
    operation: string;
    storeId?: string;
    userId?: string;
    additionalInfo?: Record<string, unknown>;
  },
  fallbackData?: T
): T {
  const apiError = normalizeError(error);
  
  // Log the error with full context
  logger.error(`[API_ERROR] ${context.operation}`, {
    endpoint: context.endpoint,
    operation: context.operation,
    storeId: context.storeId,
    userId: context.userId,
    error: {
      message: apiError.message,
      stack: apiError.stack,
      status: apiError.status,
      code: apiError.code,
      correlationId: apiError.correlationId,
      details: apiError.details,
    },
    additionalInfo: context.additionalInfo,
    timestamp: new Date().toISOString(),
  });

  // If fallback data is provided, return it (graceful degradation)
  if (fallbackData !== undefined) {
    logger.warn(`[API_FALLBACK] Using fallback data for ${context.endpoint}`, {
      endpoint: context.endpoint,
      operation: context.operation,
    });
    return fallbackData;
  }

  // Otherwise, rethrow the error
  throw apiError;
}

/**
 * Normalize different error types into a standard ApiError format
 */
export function normalizeError(error: unknown): ApiError {
  if (error instanceof Error) {
    const apiError = error as ApiError;
    
    // Extract additional properties if they exist
    if (!apiError.code && 'code' in apiError) {
      apiError.code = (apiError as any).code;
    }
    
    if (!apiError.status && 'status' in apiError) {
      apiError.status = (apiError as any).status;
    }
    
    if (!apiError.correlationId && 'correlationId' in apiError) {
      apiError.correlationId = (apiError as any).correlationId;
    }
    
    return apiError;
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return new Error(error) as ApiError;
  }
  
  // Handle object errors
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>;
    const message = typeof errorObj.message === 'string' ? errorObj.message : 'Unknown error occurred';
    const normalized = new Error(message) as ApiError;
    
    if (typeof errorObj.code === 'string') {
      normalized.code = errorObj.code;
    }
    if (typeof errorObj.status === 'number') {
      normalized.status = errorObj.status;
    }
    if (typeof errorObj.correlationId === 'string') {
      normalized.correlationId = errorObj.correlationId;
    }
    if (typeof errorObj.details === 'object' && errorObj.details !== null) {
      normalized.details = errorObj.details as Record<string, unknown>;
    }
    
    return normalized;
  }
  
  // Fallback for unknown types
  return new Error(String(error)) as ApiError;
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  error: ApiError,
  requestId?: string
): ErrorResponse {
  return {
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: error.message,
      details: error.details,
    },
    requestId,
  };
}

/**
 * Check if an error is retryable
 * Retryable errors: network errors, timeouts, 503s
 */
export function isRetryableError(error: unknown): boolean {
  const apiError = normalizeError(error);
  
  // Network errors
  if (apiError.message.includes('fetch') || apiError.message.includes('network')) {
    return true;
  }
  
  // Timeout errors
  if (apiError.message.includes('timeout') || apiError.code === 'ETIMEDOUT') {
    return true;
  }
  
  // Service unavailable
  if (apiError.status === 503) {
    return true;
  }
  
  return false;
}

/**
 * Format error for user display (hides sensitive technical details)
 */
export function formatUserErrorMessage(error: unknown): string {
  const apiError = normalizeError(error);
  
  // User-friendly messages for common errors
  const userMessages: Record<string, string> = {
    'UNAUTHORIZED': 'Please sign in to continue',
    'PERMISSION_DENIED': 'You don\'t have permission to perform this action',
    'NOT_FOUND': 'The requested resource was not found',
    'RATE_LIMITED': 'Too many requests. Please wait a moment.',
    'NETWORK_ERROR': 'Unable to connect to server. Please check your connection.',
    'TIMEOUT': 'Request timed out. Please try again.',
  };
  
  if (apiError.code && userMessages[apiError.code]) {
    return userMessages[apiError.code];
  }
  
  if (apiError.status) {
    switch (apiError.status) {
      case 401:
        return 'Please sign in to continue';
      case 403:
        return 'You don\'t have permission to perform this action';
      case 404:
        return 'The requested resource was not found';
      case 429:
        return 'Too many requests. Please wait a moment.';
      case 500:
        return 'An unexpected error occurred. Please try again.';
      case 502:
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
    }
  }
  
  // Default to the error message or a generic message
  return apiError.message || 'An unexpected error occurred. Please try again.';
}
