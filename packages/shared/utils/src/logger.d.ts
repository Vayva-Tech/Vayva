type Level = "debug" | "info" | "warn" | "error";
export declare function log(level: Level, msg: string, fields?: Record<string, any>): void;
export declare const logger: {
    debug: (msg: string, fields?: Record<string, any>) => void;
    info: (msg: string, fields?: Record<string, any>) => void;
    warn: (msg: string, fields?: Record<string, any>) => void;
    error: (msg: string, fields?: Record<string, any>) => void;
};
export {};
//# sourceMappingURL=logger.d.ts.map