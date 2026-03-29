"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerApiErrorHandling = registerApiErrorHandling;
const response_1 = require("./response");
const types_1 = require("./types");
function isRecord(value) {
    return typeof value === "object" && value !== null;
}
function isApiErrorResponse(payload) {
    if (!isRecord(payload))
        return false;
    if (payload.success !== false)
        return false;
    if (!isRecord(payload.error))
        return false;
    const code = payload.error.code;
    const message = payload.error.message;
    return typeof code === "string" && typeof message === "string";
}
function codeFromStatus(status) {
    if (status === 400)
        return types_1.ApiErrorCode.VALIDATION_ERROR;
    if (status === 401)
        return types_1.ApiErrorCode.UNAUTHORIZED;
    if (status === 403)
        return types_1.ApiErrorCode.FORBIDDEN;
    if (status === 404)
        return types_1.ApiErrorCode.NOT_FOUND;
    if (status === 429)
        return types_1.ApiErrorCode.RATE_LIMIT_EXCEEDED;
    return types_1.ApiErrorCode.INTERNAL_SERVER_ERROR;
}
function registerApiErrorHandling(server) {
    server.setErrorHandler((err, _req, reply) => {
        const isZodError = isRecord(err) && err.name === "ZodError";
        const statusFromError = isRecord(err) && typeof err.statusCode === "number"
            ? err.statusCode
            : undefined;
        const statusCode = statusFromError ??
            (isZodError ? 400 : reply.statusCode >= 400 ? reply.statusCode : 500);
        const code = codeFromStatus(statusCode);
        const messageFromError = isRecord(err) && typeof err.message === "string"
            ? err.message
            : undefined;
        const message = statusCode >= 500
            ? "Internal Server Error"
            : statusCode === 400
                ? "Validation Error"
                : messageFromError || "Request failed";
        reply.status(statusCode).send((0, response_1.apiError)(code, message, err));
    });
    server.addHook("onSend", async (_request, reply, payload) => {
        if (reply.statusCode < 400)
            return payload;
        if (isApiErrorResponse(payload)) {
            return payload;
        }
        const status = reply.statusCode;
        const code = codeFromStatus(status);
        if (typeof payload === "string") {
            return (0, response_1.apiError)(code, payload);
        }
        const obj = isRecord(payload) ? payload : undefined;
        if (obj && "error" in obj) {
            const errorValue = obj.error;
            const detailsValue = obj.details;
            if (typeof errorValue === "string") {
                return (0, response_1.apiError)(code, errorValue, detailsValue);
            }
            if (isRecord(errorValue)) {
                const maybeCode = typeof errorValue.code === "string" ? errorValue.code : undefined;
                const maybeMessage = typeof errorValue.message === "string"
                    ? errorValue.message
                    : undefined;
                const maybeDetails = errorValue.details;
                return (0, response_1.apiError)(maybeCode || code, maybeMessage || "Request failed", maybeDetails ?? detailsValue);
            }
        }
        if (obj && typeof obj.message === "string") {
            return (0, response_1.apiError)(code, obj.message, obj);
        }
        return (0, response_1.apiError)(code, "Request failed", payload);
    });
}
//# sourceMappingURL=error-handling.js.map