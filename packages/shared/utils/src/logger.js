const LOG_LEVELS = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};
const CURRENT_LOG_LEVEL = process.env.LOG_LEVEL
    ? process.env.LOG_LEVEL.toLowerCase()
    : "info";
export function log(level, msg, fields) {
    // Skip logging if below current log level
    if (LOG_LEVELS[level] < LOG_LEVELS[CURRENT_LOG_LEVEL]) {
        return;
    }
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        level,
        message: msg,
        ...fields,
    };
    switch (level) {
        case "debug":
            console.debug(JSON.stringify(logEntry));
            break;
        case "info":
            console.info(JSON.stringify(logEntry));
            break;
        case "warn":
            console.warn(JSON.stringify(logEntry));
            break;
        case "error":
            console.error(JSON.stringify(logEntry));
            break;
    }
}
export const logger = {
    debug: (msg, fields) => log("debug", msg, fields),
    info: (msg, fields) => log("info", msg, fields),
    warn: (msg, fields) => log("warn", msg, fields),
    error: (msg, fields) => log("error", msg, fields),
};
