export type PublicCheckoutPlanKey = "STARTER" | "PRO" | "PRO_PLUS";
export type PublicBillingCycle = "monthly" | "quarterly";

/** Matches merchant `lib/billing/plans` NGN totals. */
const PLAN_NGN: Record<
  PublicCheckoutPlanKey,
  { monthly: number; quarterly: number }
> = {
  STARTER: { monthly: 25_000, quarterly: 60_000 },
  PRO: { monthly: 35_000, quarterly: 84_000 },
  PRO_PLUS: { monthly: 50_000, quarterly: 120_000 },
};

export function parsePublicPlanKey(raw: string): PublicCheckoutPlanKey | null {
  const u = raw.trim().toUpperCase().replace(/-/g, "_");
  if (u === "STARTER" || u === "PRO" || u === "PRO_PLUS") return u;
  return null;
}

export function publicCheckoutAmountNgn(
  plan: PublicCheckoutPlanKey,
  cycle: PublicBillingCycle,
): number {
  const row = PLAN_NGN[plan];
  return cycle === "quarterly" ? row.quarterly : row.monthly;
}

export function mapToStoreSubscriptionPlan(
  plan: PublicCheckoutPlanKey,
): { plan: "STARTER" | "PRO"; tier: string | null } {
  if (plan === "PRO_PLUS") return { plan: "PRO", tier: "PRO_PLUS" };
  if (plan === "PRO") return { plan: "PRO", tier: null };
  return { plan: "STARTER", tier: null };
}

export function slugifyStoreBase(name: string): string {
  const s = name
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return s || "store";
}
