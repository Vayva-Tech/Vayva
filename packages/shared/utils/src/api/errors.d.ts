import { ApiErrorCode } from "./types";
export declare class BaseError extends Error {
    readonly statusCode: number;
    readonly code: ApiErrorCode | string;
    readonly details?: any | undefined;
    constructor(statusCode: number, code: ApiErrorCode | string, message: string, details?: any | undefined);
}
export declare class BadRequestError extends BaseError {
    constructor(message?: string, code?: ApiErrorCode | string, details?: any);
}
export declare class UnauthorizedError extends BaseError {
    constructor(message?: string, code?: ApiErrorCode | string, details?: any);
}
export declare class ForbiddenError extends BaseError {
    constructor(message?: string, code?: ApiErrorCode | string, details?: any);
}
export declare class NotFoundError extends BaseError {
    constructor(message?: string, code?: ApiErrorCode | string, details?: any);
}
export declare class ConflictError extends BaseError {
    constructor(message?: string, code?: ApiErrorCode | string, details?: any);
}
export declare class RateLimitedError extends BaseError {
    constructor(message?: string, retryAfter?: number, details?: any);
}
export declare class InternalError extends BaseError {
    constructor(message?: string, details?: any);
}
//# sourceMappingURL=errors.d.ts.map