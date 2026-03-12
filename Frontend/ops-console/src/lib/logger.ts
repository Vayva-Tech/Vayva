/* eslint-disable no-console */
import { captureException } from "./sentry";

type LogLevel = "info" | "warn" | "error";

interface LogPayload {
  route?: string;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error?: any;
  requestId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: any;
  code?: string;
}

export const logger = {
  log: (level: LogLevel, payload: LogPayload) => {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      environment: process.env.NODE_ENV,
      ...payload,
    };

    if (typeof window === "undefined") {
      // Server: JSON Structure for aggregators
      // Use console.error for errors to ensure they hit stderr
      if (level === "error") {
        console.error(JSON.stringify(entry));
      }
    } else {
      // Client: Readable
      // Skip info logs in production to reduce noise?
      // Keeping them for now for debugging as requested via "debuggability"
      if (level === "error") {
        console.error(
          `[${level.toUpperCase()}]`,
          payload.message,
          payload.error || "",
          payload.context || "",
        );
      } else {
        console.log(
          `[${level.toUpperCase()}]`,
          payload.message,
          payload.context || "",
        );
      }
    }
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: (message: string, error?: any, context?: any) => {
    logger.log("error", { message, error, context });
    captureException(error || new Error(message), { ...context, message });
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn: (message: string, context?: any) => {
    logger.log("warn", { message, context });
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info: (message: string, context?: any) => {
    logger.log("info", { message, context });
  },
};
