// Simple logger for templates that don't have access to @vayva/shared
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const CURRENT_LOG_LEVEL = process.env.LOG_LEVEL 
  ? process.env.LOG_LEVEL.toLowerCase() as keyof typeof LOG_LEVELS
  : "info";

function log(level: keyof typeof LOG_LEVELS, msg: string, ...args: unknown[]) {
  if (LOG_LEVELS[level] < LOG_LEVELS[CURRENT_LOG_LEVEL]) {
    return;
  }
  
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  
  switch (level) {
    case "debug":
      logger.debug(prefix, msg, ...args);
      break;
    case "info":
      logger.info(prefix, msg, ...args);
      break;
    case "warn":
      logger.warn(prefix, msg, ...args); // eslint-disable-line @typescript-eslint/no-unused-vars
      break;
    case "error":
      logger.error(prefix, msg, ...args);
      break;
  }
}

export const logger = {
  debug: (msg: string, ...args: unknown[]) => log("debug", msg, ...args),
  info: (msg: string, ...args: unknown[]) => log("info", msg, ...args),
  warn: (msg: string, ...args: unknown[]) => log("warn", msg, ...args),
  error: (msg: string, ...args: unknown[]) => log("_error", msg, ...args),
};

export default logger;
