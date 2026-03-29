import { ApiErrorCode, ApiResponse } from "./types";
export declare function apiError(code: ApiErrorCode | string, message: string, details?: unknown): ApiResponse<never>;
export declare function standardHeaders(requestId: string): {
    "Cache-Control": string;
    Pragma: string;
    Expires: string;
    "X-Request-Id": string;
};
//# sourceMappingURL=response.d.ts.map