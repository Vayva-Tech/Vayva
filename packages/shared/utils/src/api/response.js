"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiError = apiError;
exports.standardHeaders = standardHeaders;
function apiError(code, message, details) {
    return {
        success: false,
        error: {
            code,
            message,
            details,
        },
    };
}
function standardHeaders(requestId) {
    return {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "X-Request-Id": requestId,
    };
}
//# sourceMappingURL=response.js.map