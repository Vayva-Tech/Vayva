import { apiError } from "./response";
import { ApiErrorCode } from "./types";

type ReplyLike = {
  statusCode: number;
  status: (code: number) => ReplyLike;
  send: (payload: unknown) => unknown;
};

type OnSendHook = (
  request: unknown,
  reply: ReplyLike,
  payload: unknown,
) => unknown | Promise<unknown>;

type ErrorHandler = (err: unknown, request: unknown, reply: ReplyLike) => void;

type FastifyLike = {
  setErrorHandler: (handler: ErrorHandler) => void;
  addHook: (name: "onSend", hook: OnSendHook) => void;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isApiErrorResponse(payload: unknown): boolean {
  if (!isRecord(payload)) return false;
  if (payload.success !== false) return false;
  if (!isRecord(payload.error)) return false;

  const code = payload.error.code;
  const message = payload.error.message;
  return typeof code === "string" && typeof message === "string";
}

function codeFromStatus(status: number): ApiErrorCode {
  if (status === 400) return ApiErrorCode.VALIDATION_ERROR;
  if (status === 401) return ApiErrorCode.UNAUTHORIZED;
  if (status === 403) return ApiErrorCode.FORBIDDEN;
  if (status === 404) return ApiErrorCode.NOT_FOUND;
  if (status === 429) return ApiErrorCode.RATE_LIMIT_EXCEEDED;
  return ApiErrorCode.INTERNAL_SERVER_ERROR;
}

export function registerApiErrorHandling(server: FastifyLike): void {
  server.setErrorHandler((err, _req, reply) => {
    const isZodError = isRecord(err) && err.name === "ZodError";
    const statusFromError =
      isRecord(err) && typeof err.statusCode === "number" ? err.statusCode : undefined;
    const statusCode =
      statusFromError ?? (isZodError ? 400 : (reply.statusCode >= 400 ? reply.statusCode : 500));

    const code = codeFromStatus(statusCode);

    const messageFromError =
      isRecord(err) && typeof err.message === "string" ? err.message : undefined;
    const message =
      statusCode >= 500
        ? "Internal Server Error"
        : (statusCode === 400 ? "Validation Error" : (messageFromError || "Request failed"));

    reply.status(statusCode).send(apiError(code, message, err));
  });

  server.addHook("onSend", async (_request, reply, payload) => {
    if (reply.statusCode < 400) return payload;

    if (isApiErrorResponse(payload)) {
      return payload;
    }

    const status = reply.statusCode;
    const code = codeFromStatus(status);

    if (typeof payload === "string") {
      return apiError(code, payload);
    }

    const obj = isRecord(payload) ? payload : undefined;
    if (obj && "error" in obj) {
      const errorValue = obj.error;
      const detailsValue = obj.details;

      if (typeof errorValue === "string") {
        return apiError(code, errorValue, detailsValue);
      }

      if (isRecord(errorValue)) {
        const maybeCode = typeof errorValue.code === "string" ? errorValue.code : undefined;
        const maybeMessage = typeof errorValue.message === "string" ? errorValue.message : undefined;
        const maybeDetails = errorValue.details;

        return apiError(
          maybeCode || code,
          maybeMessage || "Request failed",
          maybeDetails ?? detailsValue,
        );
      }
    }

    if (obj && typeof obj.message === "string") {
      return apiError(code, obj.message, obj);
    }

    return apiError(code, "Request failed", payload);
  });
}
