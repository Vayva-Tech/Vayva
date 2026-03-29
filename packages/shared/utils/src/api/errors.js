"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalError = exports.RateLimitedError = exports.ConflictError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = exports.BaseError = void 0;
const types_1 = require("./types");
class BaseError extends Error {
    statusCode;
    code;
    details;
    constructor(statusCode, code, message, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    details) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.BaseError = BaseError;
class BadRequestError extends BaseError {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(message = "Bad Request", code = types_1.ApiErrorCode.VALIDATION_ERROR, details) {
        super(400, code, message, details);
    }
}
exports.BadRequestError = BadRequestError;
class UnauthorizedError extends BaseError {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(message = "Unauthorized", code = types_1.ApiErrorCode.UNAUTHENTICATED, details) {
        super(401, code, message, details);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends BaseError {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(message = "Forbidden", code = types_1.ApiErrorCode.FORBIDDEN, details) {
        super(403, code, message, details);
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends BaseError {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(message = "Not Found", code = types_1.ApiErrorCode.NOT_FOUND, details) {
        super(404, code, message, details);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends BaseError {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(message = "Conflict", code = "CONFLICT", details) {
        super(409, code, message, details);
    }
}
exports.ConflictError = ConflictError;
class RateLimitedError extends BaseError {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(message = "Too Many Requests", retryAfter, details) {
        super(429, types_1.ApiErrorCode.RATE_LIMIT_EXCEEDED, message, {
            ...details,
            retryAfter,
        });
    }
}
exports.RateLimitedError = RateLimitedError;
class InternalError extends BaseError {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(message = "Internal Server Error", details) {
        super(500, types_1.ApiErrorCode.INTERNAL_SERVER_ERROR, message, details);
    }
}
exports.InternalError = InternalError;
//# sourceMappingURL=errors.js.map