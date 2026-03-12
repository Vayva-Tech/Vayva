import { ApiErrorCode } from "./types";

export class BaseError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: ApiErrorCode | string,
    message: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public readonly details?: any,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends BaseError {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(
    message = "Bad Request",
    code: ApiErrorCode | string = ApiErrorCode.VALIDATION_ERROR,
    details?: any,
  ) {
    super(400, code, message, details);
  }
}

export class UnauthorizedError extends BaseError {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(
    message = "Unauthorized",
    code: ApiErrorCode | string = ApiErrorCode.UNAUTHENTICATED,
    details?: any,
  ) {
    super(401, code, message, details);
  }
}

export class ForbiddenError extends BaseError {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(
    message = "Forbidden",
    code: ApiErrorCode | string = ApiErrorCode.FORBIDDEN,
    details?: any,
  ) {
    super(403, code, message, details);
  }
}

export class NotFoundError extends BaseError {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(
    message = "Not Found",
    code: ApiErrorCode | string = ApiErrorCode.NOT_FOUND,
    details?: any,
  ) {
    super(404, code, message, details);
  }
}

export class ConflictError extends BaseError {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(
    message = "Conflict",
    code: ApiErrorCode | string = "CONFLICT",
    details?: any,
  ) {
    super(409, code, message, details);
  }
}

export class RateLimitedError extends BaseError {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(
    message = "Too Many Requests",
    retryAfter?: number,
    details?: any,
  ) {
    super(429, ApiErrorCode.RATE_LIMIT_EXCEEDED, message, {
      ...details,
      retryAfter,
    });
  }
}

export class InternalError extends BaseError {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(message = "Internal Server Error", details?: any) {
    super(500, ApiErrorCode.INTERNAL_SERVER_ERROR, message, details);
  }
}
