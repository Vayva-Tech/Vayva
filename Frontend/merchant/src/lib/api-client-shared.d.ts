/**
 * Centralized client-side API fetch helper with strict typing and error handling.
 * Prevents runtime crashes from empty/unknown JSON responses.
 */
export declare function apiJson<T>(input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]): Promise<T>;
