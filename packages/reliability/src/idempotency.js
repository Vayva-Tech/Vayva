import { prisma } from "@vayva/db";
import crypto from "crypto";
export class IdempotencyService {
    static async execute(scope, key, storeId, fn) {
        // Check if key exists
        const existing = await prisma.idempotencyKey.findUnique({
            where: { storeId_scope_key: { storeId: storeId || "", scope, key } },
        });
        if (existing) {
            if (existing.status === "COMPLETED") {
                // Return cached response
                return existing.responseJson;
            }
            if (existing.status === "STARTED") {
                // In progress - return 409 or wait
                throw new Error("Operation in progress");
            }
            if (existing.status === "FAILED") {
                // Retry allowed
            }
        }
        // Create or update key as STARTED
        await prisma.idempotencyKey.upsert({
            where: { storeId_scope_key: { storeId: storeId || "", scope, key } },
            create: { storeId, scope, key, status: "STARTED" },
            update: { status: "STARTED" },
        });
        try {
            // Execute function
            const result = await fn();
            // Mark as COMPLETED with response
            const responseHash = crypto
                .createHash("sha256")
                .update(JSON.stringify(result))
                .digest("hex");
            await prisma.idempotencyKey.update({
                where: { storeId_scope_key: { storeId: storeId || "", scope, key } },
                data: {
                    status: "COMPLETED",
                    responseHash,
                    responseJson: result,
                },
            });
            return result;
        }
        catch (_error) {
            // Mark as FAILED
            await prisma.idempotencyKey.update({
                where: { storeId_scope_key: { storeId: storeId || "", scope, key } },
                data: { status: "FAILED" },
            });
            throw error;
        }
    }
}
