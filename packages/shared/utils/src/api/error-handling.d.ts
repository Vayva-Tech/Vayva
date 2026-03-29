type ReplyLike = {
    statusCode: number;
    status: (code: number) => ReplyLike;
    send: (payload: unknown) => unknown;
};
type OnSendHook = (request: unknown, reply: ReplyLike, payload: unknown) => unknown | Promise<unknown>;
type ErrorHandler = (err: unknown, request: unknown, reply: ReplyLike) => void;
type FastifyLike = {
    setErrorHandler: (handler: ErrorHandler) => void;
    addHook: (name: "onSend", hook: OnSendHook) => void;
};
export declare function registerApiErrorHandling(server: FastifyLike): void;
export {};
//# sourceMappingURL=error-handling.d.ts.map