import { prisma } from "../client";
import _crypto from "crypto";

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
    const existing = await prisma.idempotencyKeyV2.findUnique({
        where: {
            storeId_scope_key: {
                storeId: merchantId,
                scope: route,
                key: key
            }
        }
    });

    if (existing) {
        if (existing.status === "COMPLETED" && existing.responseJson) {
            return existing.responseJson as T;
        }
        // If it's still in progress or failed, we might want to handle it differently.
        // For now, if it exists, we throw to prevent concurrent executions if not COMPLETED.
        if (existing.status === "STARTED") {
            throw new Error("Request still in progress");
        }
    }

    // Execute the operation
    const result = await execute();

    // Record the result
    await prisma.idempotencyKeyV2.upsert({
        where: {
            storeId_scope_key: {
                storeId: merchantId,
                scope: route,
                key: key
            }
        },
        update: {
            status: "COMPLETED",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            responseJson: result as any,
            updatedAt: new Date()
        },
        create: {
            storeId: merchantId,
            scope: route,
            key: key,
            status: "COMPLETED",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            responseJson: result as any
        }
    });

    return result;
}
