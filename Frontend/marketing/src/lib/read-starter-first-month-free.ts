import { prisma } from "@vayva/db";
import { FEATURE_FLAG_STARTER_FIRST_MONTH_FREE } from "@vayva/shared";

/**
 * Reads ops-controlled promo mode. No DB row → treat as **on** (backward compatible).
 * When a row exists, `FeatureFlag.enabled` is the toggle (true = first month free mode).
 */
export async function readStarterFirstMonthFreeEnabled(): Promise<boolean> {
  try {
    const row = await prisma.featureFlag.findUnique({
      where: { key: FEATURE_FLAG_STARTER_FIRST_MONTH_FREE },
      select: { enabled: true },
    });
    if (!row) return true;
    return row.enabled;
  } catch {
    return true;
  }
}
