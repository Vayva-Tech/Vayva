import { prisma } from "@vayva/db";
import { FEATURE_FLAG_STARTER_FIRST_MONTH_FREE } from "@vayva/shared";

/**
 * Ops Console → Feature Flags → `STARTER_FIRST_MONTH_FREE.enabled`.
 * No row → **true** (extended promo on). Row exists → use `enabled`.
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
