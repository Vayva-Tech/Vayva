/**
 * Unified Error Handling System for Ops Console API
 * 
 * Provides consistent error responses with proper error codes,
 * request IDs for tracing, and safe error messages.
 */

import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { logger } from "@vayva/shared";

/**
 * Standardized API Error Codes
 */
export const ErrorCodes = {
  // Authentication errors (1xx)
  AUTH_UNAUTHORIZED: "AUTH_001",
  AUTH_INVALID_CREDENTIALS: "AUTH_002",
  AUTH_SESSION_EXPIRED: "AUTH_003",
  AUTH_MFA_REQUIRED: "AUTH_004",
  AUTH_MFA_INVALID: "AUTH_005",
  AUTH_INSUFFICIENT_PERMISSIONS: "AUTH_006",
  
  // Validation errors (2xx)
  VALIDATION_INVALID_INPUT: "VAL_001",
  VALIDATION_MISSING_FIELD: "VAL_002",
  VALIDATION_INVALID_FORMAT: "VAL_003",
  
  // Resource errors (3xx)
  RESOURCE_NOT_FOUND: "RES_001",
  RESOURCE_CONFLICT: "RES_002",
  RESOURCE_ALREADY_EXISTS: "RES_003",
  
  // Rate limiting errors (4xx)
  RATE_LIMIT_EXCEEDED: "RATE_001",
  
  // Business logic errors (5xx)
  BUSINESS_RULE_VIOLATION: "BIZ_001",
  BUSINESS_INVALID_STATE: "BIZ_002",
  
  // System errors (9xx)
  SYSTEM_INTERNAL_ERROR: "SYS_001",
  SYSTEM_SERVICE_UNAVAILABLE: "SYS_002",
  SYSTEM_DATABASE_ERROR: "SYS_003",
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

/**
 * Standardized API Error Response
 */
export interface APIErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, string[]>;
  };
  meta: {
    requestId: string;
    timestamp: string;
  };
}

/**
 * Generate unique request ID for tracing
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  code: ErrorCode,
  message: string,
  status: number,
  details?: Record<string, string[]>
): NextResponse<APIErrorResponse> {
  const requestId = generateRequestId();
  
  const body: APIErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
    meta: {
      requestId,
      timestamp: new Date().toISOString(),
    },
  };

  return NextResponse.json(body, { status });
}

/**
 * Handle authentication errors
 */
export function handleAuthError(
  error: unknown,
  context?: { userId?: string; ip?: string }
): NextResponse<APIErrorResponse> {
  const message = error instanceof Error ? error.message : String(error);
  
  // Log security event
  logger.warn("[AUTH_ERROR]", {
    message,
    userId: context?.userId,
    ip: context?.ip,
  });

  if (message.includes("MFA")) {
    return createErrorResponse(
      ErrorCodes.AUTH_MFA_REQUIRED,
      "Multi-factor authentication required",
      401
    );
  }

  if (message.includes("permission") || message.includes("Insufficient")) {
    return createErrorResponse(
      ErrorCodes.AUTH_INSUFFICIENT_PERMISSIONS,
      "You do not have permission to perform this action",
      403
    );
  }

  if (message.includes("Unauthorized") || message.includes("session")) {
    return createErrorResponse(
      ErrorCodes.AUTH_UNAUTHORIZED,
      "Authentication required",
      401
    );
  }

  return createErrorResponse(
    ErrorCodes.AUTH_INVALID_CREDENTIALS,
    "Invalid credentials",
    401
  );
}

/**
 * Handle validation errors
 */
export function handleValidationError(
  errors: Record<string, string[]>
): NextResponse<APIErrorResponse> {
  return createErrorResponse(
    ErrorCodes.VALIDATION_INVALID_INPUT,
    "Validation failed",
    400,
    errors
  );
}

/**
 * Handle resource not found
 */
export function handleNotFound(resource: string): NextResponse<APIErrorResponse> {
  return createErrorResponse(
    ErrorCodes.RESOURCE_NOT_FOUND,
    `${resource} not found`,
    404
  );
}

/**
 * Handle rate limit errors
 */
export function handleRateLimit(
  retryAfter?: number
): NextResponse<APIErrorResponse> {
  const headers: Record<string, string> = {};
  if (retryAfter) {
    headers["Retry-After"] = String(retryAfter);
  }

  const response = createErrorResponse(
    ErrorCodes.RATE_LIMIT_EXCEEDED,
    "Rate limit exceeded. Please try again later.",
    429
  );

  // Add retry-after header
  if (retryAfter) {
    response.headers.set("Retry-After", String(retryAfter));
  }

  return response;
}

/**
 * Handle internal server errors
 * Only logs detailed error, returns generic message to client
 */
export function handleInternalError(
  error: unknown,
  context?: { endpoint?: string; userId?: string; requestId?: string }
): NextResponse<APIErrorResponse> {
  const requestId = context?.requestId || generateRequestId();
  
  // Log detailed error internally
  logger.error("[INTERNAL_ERROR]", {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    endpoint: context?.endpoint,
    userId: context?.userId,
    requestId,
  });

  // Send to Sentry
  Sentry.captureException(error, {
    extra: {
      endpoint: context?.endpoint,
      userId: context?.userId,
      requestId,
    },
  });

  // Return generic message to client
  return createErrorResponse(
    ErrorCodes.SYSTEM_INTERNAL_ERROR,
    "An unexpected error occurred. Please try again later.",
    500
  );
}

/**
 * Async wrapper for API handlers with standardized error handling
 */
export function withErrorHandler<TArgs extends any[], TReturn>(
  handler: (...args: TArgs) => Promise<TReturn>,
  options: {
    endpoint: string;
    requireAuth?: boolean;
  }
): (...args: TArgs) => Promise<TReturn | NextResponse<APIErrorResponse>> {
  return async (...args: TArgs) => {
    try {
      return await handler(...args);
    } catch (error) {
      const requestId = generateRequestId();
      
      if (error instanceof Error) {
        if (error.message.includes("Unauthorized")) {
          return handleAuthError(error);
        }
        if (error.message.includes("not found")) {
          return handleNotFound(options.endpoint);
        }
      }
      
      return handleInternalError(error, {
        endpoint: options.endpoint,
        requestId,
      });
    }
  };
}
