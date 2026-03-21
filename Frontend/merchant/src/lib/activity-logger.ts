import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function logActivity({ storeId, actorUserId, action, targetType, targetId, before, after, reason }: { storeId: string; actorUserId: any; action: string; targetType: string; targetId: string; before?: any; after?: any; reason?: any }) {
    try {
        // Calculate minimal diff if both states provided
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let diffBefore: any= null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let diffAfter: any= null;
        if (before && after) {
            diffBefore = {};
            diffAfter = {};
            const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            allKeys.forEach((key: string) => {
                const valBefore = before[key];
                const valAfter = after[key];
                // Simple equality check (works for primitives, need recursion for deep objects if robust diff needed)
                if (valBefore !== valAfter) {
                    diffBefore[key] = valBefore;
                    diffAfter[key] = valAfter;
                }
            });
            // If no changes, maybe don't log? Or log action without diff.
            if (Object.keys(diffBefore).length === 0) {
                // No functional change
                return;
            }
        }
        else {
            // One-sided log (Creation or Deletion)
            diffBefore = before;
            diffAfter = after;
        }
        await prisma.adminAuditLog.create({
            data: {
                storeId,
                actorUserId,
                action,
                targetType,
                targetId,
                reason,
                before: diffBefore ? diffBefore : undefined,
                after: diffAfter ? diffAfter : undefined,
            }
        });
    }
    catch (error) {
        // Fail silent? detailed logs shouldn't break the app flow
        logger.error("Failed to log activity", { error: (error as Error).message, stack: (error as Error).stack, storeId, action });
    }
}
