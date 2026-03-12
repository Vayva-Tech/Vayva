type Level = "debug" | "info" | "warn" | "error";

export function log(
  level: Level,
  msg: string,
  fields: Record<string, any> = {},
) {
  const line = {
    ts: new Date().toISOString(),
    level,
    msg,
    ...fields,
  };
  // eslint-disable-next-line no-console
  console[level === "debug" ? "log" : level](JSON.stringify(line));
}

export const logger = {
  debug: (msg: string, fields?: Record<string, any>) =>
    log("debug", msg, fields),
  info: (msg: string, fields?: Record<string, any>) => log("info", msg, fields),
  warn: (msg: string, fields?: Record<string, any>) => log("warn", msg, fields),
  error: (msg: string, fields?: Record<string, any>) =>
    log("error", msg, fields),
};
