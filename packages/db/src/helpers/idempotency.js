import { prisma } from "@vayva/db";
/**
 * Ensures that a request with a specific Idempotency-Key is only processed once.
 *
 * @param key The idempotency key from the request header
 * @param userId The ID of the user perfroming the action
 * @param merchantId The ID of the merchant/store
 * @param route The API route being called
 * @param execute The operation to perform if the key is new
 */
export async function withIdempotency(key, userId, merchantId, route, execute) {
    // Check for existing record
    const existing = await prisma.idempotencyRecord.findUnique({
        where: { key }
    });
    if (existing) {
        if (existing.userId !== userId || existing.merchantId !== merchantId) {
            throw new Error("Idempotency key collision or unauthorized reuse");
        }
        return existing.response;
    }
    // Execute the operation
    const result = await execute();
    // Record the result
    await prisma.idempotencyRecord.create({
        data: {
            key,
            userId,
            merchantId,
            route,
            response: result,
            responseHash: "", // Optional: for integrity checks
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h expiry
        }
    });
    return result;
}
