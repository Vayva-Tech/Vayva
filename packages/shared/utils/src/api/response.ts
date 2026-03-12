import { ApiErrorCode, ApiResponse } from "./types";

export function apiError(
  code: ApiErrorCode | string,
  message: string,
  details?: unknown,
): ApiResponse<never> {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
}

export function standardHeaders(requestId: string) {
  return {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
    "X-Request-Id": requestId,
  };
}
