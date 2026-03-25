const LOG_LEVELS = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};
const CURRENT_LOG_LEVEL = process.env.LOG_LEVEL
    ? process.env.LOG_LEVEL.toLowerCase()
    : "info";
function writeLine(line, streamName) {
    try {
        const p = typeof process !== "undefined" ? process : undefined;
        const stream = streamName === "stderr" ? p === null || p === void 0 ? void 0 : p.stderr : p === null || p === void 0 ? void 0 : p.stdout;
        if (stream && typeof stream.write === "function") {
            stream.write(`${line}\n`);
        }
    }
    catch {
        // no-op in non-node runtimes
    }
}
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
    const line = JSON.stringify(logEntry);
    if (level === "warn" || level === "error") {
        writeLine(line, "stderr");
        return;
    }
    writeLine(line, "stdout");
}
export const logger = {
    debug: (msg, fields) => log("debug", msg, fields),
    info: (msg, fields) => log("info", msg, fields),
    warn: (msg, fields) => log("warn", msg, fields),
    error: (msg, fields) => log("error", msg, fields),
};
