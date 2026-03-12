import { prisma, Prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

function _isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(
    JSON.stringify(value, (_key, item) => {
      if (item instanceof Date) return item.toISOString();
      if (typeof item === "bigint") return item.toString();
      return item;
    }),
  );
}

export async function logActivity({
  storeId,
  actorUserId,
  action,
  targetType,
  targetId,
  before,
  after,
  reason,
}: {
  storeId: string;
  actorUserId: string;
  action: string;
  targetType: string;
  targetId: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  reason?: string;
}) {
  try {
    // Calculate minimal diff if both states provided
    let diffBefore: Record<string, unknown> | null = null;
    let diffAfter: Record<string, unknown> | null = null;
    if (before && after) {
      diffBefore = {};
      diffAfter = {};
      const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
      allKeys.forEach((key) => {
        const valBefore = before[key];
        const valAfter = after[key];
        // Simple equality check (works for primitives, need recursion for deep objects if robust diff needed)
        if (valBefore !== valAfter) {
          diffBefore![key] = valBefore;
          diffAfter![key] = valAfter;
        }
      });
      // If no changes, maybe don't log? Or log action without diff.
      if (Object.keys(diffBefore).length === 0) {
        // No functional change
        return;
      }
    } else {
      // One-sided log (Creation or Deletion)
      diffBefore = before || null;
      diffAfter = after || null;
    }
    await prisma.adminAuditLog.create({
      data: {
        storeId,
        actorUserId,
        action,
        targetType,
        targetId,
        reason,
        before: diffBefore ? toJsonValue(diffBefore) : undefined,
        after: diffAfter ? toJsonValue(diffAfter) : undefined,
      },
    });
  } catch (error: unknown) {
    // Fail silent? detailed logs shouldn't break the app flow
    logger.error("Failed to log activity", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      storeId,
      action,
    });
  }
}
