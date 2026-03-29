/**
 * Ensures that a request with a specific Idempotency-Key is only processed once.
 *
 * @param key The idempotency key from the request header
 * @param userId The ID of the user perfroming the action
 * @param merchantId The ID of the merchant/store
 * @param route The API route being called
 * @param execute The operation to perform if the key is new
 */
export declare function withIdempotency<T>(key: string, userId: string, merchantId: string, route: string, execute: () => Promise<T>): Promise<T>;
//# sourceMappingURL=idempotency.d.ts.map