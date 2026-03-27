/**
 * Error Handling Utilities
 * Standardized error handling patterns for merchant dashboard
 */

import { toast } from 'sonner';
import { logger } from '@vayva/shared';
import { ERROR_CODES, NOTIFICATION } from './constants';

/* ------------------------------------------------------------------ */
/*  Error Types                                                         */
/* ------------------------------------------------------------------ */
export interface ApiError extends Error {
  code?: string;
  status?: number;
  details?: any;
}

export interface ValidationError extends ApiError {
  field: string;
  message: string;
}

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  context?: string;
  fallbackMessage?: string;
}

/* ------------------------------------------------------------------ */
/*  Error Classification                                                */
/* ------------------------------------------------------------------ */
export function classifyError(error: unknown): ApiError {
  if (error instanceof Error) {
    const apiError = error as ApiError;
    
    // Check if it's already an API error
    if (apiError.code || apiError.status) {
      return apiError;
    }

    // Network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return {
        ...error,
        code: ERROR_CODES.NETWORK_ERROR,
        status: 0,
      };
    }

    // Timeout errors
    if (error.message.includes('timeout')) {
      return {
        ...error,
        code: ERROR_CODES.TIMEOUT,
      };
    }

    // Default to internal server error
    return {
      ...error,
      code: ERROR_CODES.INTERNAL_SERVER,
    };
  }

  // Unknown error type
  return {
    name: 'UnknownError',
    message: String(error),
    code: ERROR_CODES.INTERNAL_SERVER,
  };
}

/* ------------------------------------------------------------------ */
/*  User-Friendly Error Messages                                        */
/* ------------------------------------------------------------------ */
export function getUserFriendlyMessage(error: unknown, fallback?: string): string {
  const classified = classifyError(error);
  
  switch (classified.code) {
    case ERROR_CODES.UNAUTHORIZED:
      return 'Please sign in to continue.';
    case ERROR_CODES.FORBIDDEN:
      return "You don't have permission to perform this action.";
    case ERROR_CODES.NOT_FOUND:
      return 'The requested resource was not found.';
    case ERROR_CODES.BAD_REQUEST:
      return classified.details?.message || 'Invalid request. Please check your input.';
    case ERROR_CODES.NETWORK_ERROR:
      return 'Network error. Please check your internet connection.';
    case ERROR_CODES.TIMEOUT:
      return 'Request timed out. Please try again.';
    default:
      return fallback || NOTIFICATION.ERROR_MESSAGE;
  }
}

/* ------------------------------------------------------------------ */
/*  Standard Error Handler                                              */
/* ------------------------------------------------------------------ */
export function handleError(
  error: unknown,
  options: ErrorHandlerOptions = {}
): void {
  const {
    showToast = true,
    logError = true,
    context,
    fallbackMessage,
  } = options;

  const classified = classifyError(error);
  const userMessage = getUserFriendlyMessage(error, fallbackMessage);

  // Log error with context
  if (logError) {
    const errorContext = context ? `[${context}]` : '[GLOBAL_ERROR]';
    logger.error(errorContext, {
      error: classified.message,
      code: classified.code,
      status: classified.status,
      stack: classified.stack,
      details: classified.details,
    });
  }

  // Show toast notification
  if (showToast) {
    toast.error(userMessage, {
      duration: NOTIFICATION.ERROR_TOAST_DURATION,
      description: classified.code !== ERROR_CODES.INTERNAL_SERVER ? classified.code : undefined,
    });
  }
}

/* ------------------------------------------------------------------ */
/*  Async Error Handler Wrapper                                         */
/* ------------------------------------------------------------------ */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context: string,
  options?: ErrorHandlerOptions
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, {
        ...options,
        context,
      });
      throw error; // Re-throw after handling
    }
  }) as T;
}

/* ------------------------------------------------------------------ */
/*  Validation Error Handler                                            */
/* ------------------------------------------------------------------ */
export function handleValidationError(
  error: ValidationError,
  fieldMapping?: Record<string, string>
): void {
  const fieldName = fieldMapping?.[error.field] || error.field;
  
  toast.error(`Validation Error: ${error.message}`, {
    description: `Field: ${fieldName}`,
    duration: NOTIFICATION.ERROR_TOAST_DURATION,
  });

  logger.error('[VALIDATION_ERROR]', {
    field: error.field,
    fieldName,
    message: error.message,
    code: error.code,
  });
}

/* ------------------------------------------------------------------ */
/*  Batch Error Handler (for parallel operations)                       */
/* ------------------------------------------------------------------ */
export interface BatchResult<T> {
  successes: T[];
  failures: Array<{ item: any; error: ApiError }>;
}

export async function handleBatchOperation<T>(
  items: any[],
  operation: (item: any) => Promise<T>,
  context: string
): Promise<BatchResult<T>> {
  const results = await Promise.allSettled(items.map(operation));
  
  const successes: T[] = [];
  const failures: Array<{ item: any; error: ApiError }> = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      successes.push(result.value);
    } else {
      failures.push({
        item: items[index],
        error: classifyError(result.reason),
      });
      
      logger.error(`[BATCH_ERROR][${context}]`, {
        index,
        item: items[index],
        error: result.reason,
      });
    }
  });

  // Show summary toast if there were failures
  if (failures.length > 0) {
    toast.error(`${failures.length} of ${items.length} operations failed`, {
      description: `${successes.length} succeeded, ${failures.length} failed`,
      duration: NOTIFICATION.ERROR_TOAST_DURATION,
    });
  }

  return { successes, failures };
}

/* ------------------------------------------------------------------ */
/*  Retry Logic with Exponential Backoff                                */
/* ------------------------------------------------------------------ */
export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  factor?: number;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    factor = 2,
  } = options;

  let lastError: unknown;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        logger.warn('[RETRY_ATTEMPT]', {
          attempt: attempt + 1,
          maxRetries,
          delay,
          error: classifyError(error).message,
        });

        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * factor, maxDelay);
      }
    }
  }

  throw lastError;
}

/* ------------------------------------------------------------------ */
/*  Safe JSON Parse                                                     */
/* ------------------------------------------------------------------ */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    logger.warn('[JSON_PARSE_ERROR]', { 
      error: classifyError(error).message,
      input: json.substring(0, 100),
    });
    return fallback;
  }
}
