import { prisma, Prisma } from "@vayva/db";
import crypto from "crypto";

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(
    JSON.stringify(value, (_key, item) => {
      if (item instanceof Date) return item.toISOString();
      if (typeof item === "bigint") return item.toString();
      return item;
    }),
  );
}

export class IdempotencyService {
  static async execute<T>(
    scope: string,
    key: string,
    storeId: string | null,
    fn: () => Promise<T>,
  ): Promise<T> {
    // Check if key exists
    const existing = await prisma.idempotencyKeyV2.findUnique({
      where: { storeId_scope_key: { storeId: storeId || "", scope, key } },
    });

    if (existing) {
      if (existing.status === "COMPLETED") {
        // Return cached response
        return existing.responseJson as T;
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
    await prisma.idempotencyKeyV2.upsert({
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
      await prisma.idempotencyKeyV2.update({
        where: { storeId_scope_key: { storeId: storeId || "", scope, key } },
        data: {
          status: "COMPLETED",
          responseHash,
          responseJson: toJsonValue(result),
        },
      });

      return result;
    } catch (error) {
      // Mark as FAILED
      await prisma.idempotencyKeyV2.update({
        where: { storeId_scope_key: { storeId: storeId || "", scope, key } },
        data: { status: "FAILED" },
      });
      throw error;
    }
  }
}
