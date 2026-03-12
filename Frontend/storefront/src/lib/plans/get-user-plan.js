import { TemplatePlanTier } from "@/lib/templates-registry";
/**
 * Resolves the PLAN TIER for the current context.
 *
 * @param store - Optional store object if we are in a storefront context context.
 * @param testOverride - Optional override for testing/demos.
 */
export async function getUserPlan(store, testOverride) {
    // 1. Dev/Demo Override
    if (testOverride) {
        return { tier: testOverride, source: "test" };
    }
    // 2. Store Context (Runtime)
    // If the store object has a 'plan' field, use it.
    if (store && store.plan) {
        // Map string to enum if necessary
        const tier = Object.values(TemplatePlanTier).find((t) => t === store.plan) ||
            TemplatePlanTier.FREE;
        return { tier, source: "store" };
    }
    // 3. Fallback / Default
    // Most demos are free unless explicitly set otherwise in our tests.
    // We can eventually wire this to a real DB call if we have a direct DB connection here,
    // but Storefront app usually acts as a client.
    return { tier: TemplatePlanTier.FREE, source: "test" };
}
