"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.log = log;
function log(level, msg, fields = {}) {
    const line = {
        ts: new Date().toISOString(),
        level,
        msg,
        ...fields,
    };
    // eslint-disable-next-line no-console
    console[level === "debug" ? "log" : level](JSON.stringify(line));
}
exports.logger = {
    debug: (msg, fields) => log("debug", msg, fields),
    info: (msg, fields) => log("info", msg, fields),
    warn: (msg, fields) => log("warn", msg, fields),
    error: (msg, fields) => log("error", msg, fields),
};
//# sourceMappingURL=logger.js.map