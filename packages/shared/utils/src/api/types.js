"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiErrorCode = void 0;
/**
 * Common API Error Codes
 */
var ApiErrorCode;
(function (ApiErrorCode) {
    ApiErrorCode["UNAUTHORIZED"] = "UNAUTHORIZED";
    ApiErrorCode["UNAUTHENTICATED"] = "UNAUTHENTICATED";
    ApiErrorCode["FORBIDDEN"] = "FORBIDDEN";
    ApiErrorCode["NOT_FOUND"] = "NOT_FOUND";
    ApiErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ApiErrorCode["RATE_LIMIT_EXCEEDED"] = "RATE_LIMIT_EXCEEDED";
    ApiErrorCode["INTERNAL_SERVER_ERROR"] = "INTERNAL_SERVER_ERROR";
})(ApiErrorCode || (exports.ApiErrorCode = ApiErrorCode = {}));
//# sourceMappingURL=types.js.map