export interface RouteContext<T = Record<string, string>> {
    params: Promise<T>;
}

// Copied/adapted from previous shared location
export enum ApiErrorCode {
    NOT_FOUND = "NOT_FOUND",
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
    UNAUTHORIZED = "UNAUTHORIZED",
    FORBIDDEN = "FORBIDDEN",
    BAD_REQUEST = "BAD_REQUEST",
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: {
        code: ApiErrorCode;
        message: string;
        details?: unknown;
    };
}

export interface ProductResponseData {
    product: Record<string, unknown>;
}
