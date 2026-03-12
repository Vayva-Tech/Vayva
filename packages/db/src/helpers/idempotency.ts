import { prisma } from "@vayva/db";
import crypto from "crypto";

/**
 * Ensures that a request with a specific Idempotency-Key is only processed once.
 * 
 * @param key The idempotency key from the request header
 * @param userId The ID of the user perfroming the action
 * @param merchantId The ID of the merchant/store
 * @param route The API route being called
 * @param execute The operation to perform if the key is new
 */
export async function withIdempotency<T>(
    key: string,
    userId: string,
    merchantId: string,
    route: string,
    execute: () => Promise<T>
): Promise<T> {
    // Check for existing record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = await (prisma as any).idempotencyRecord.findUnique({
        where: { key }
    });

    if (existing) {
        if (existing.userId !== userId || existing.merchantId !== merchantId) {
            throw new Error("Idempotency key collision or unauthorized reuse");
        }
        return existing.response as T;
    }

    // Execute the operation
    const result = await execute();

    // Record the result
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).idempotencyRecord.create({
        data: {
            key,
            userId,
            merchantId,
            route,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            response: result as any,
            responseHash: "", // Optional: for integrity checks
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h expiry
        }
    });

    return result;
}
