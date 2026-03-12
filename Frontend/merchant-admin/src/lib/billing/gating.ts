export const Gating = {
    allow: () => ({ ok: true }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    deny: (code: any, message: any, context: { requiredPlan?: string; currentPlan?: string; details?: unknown } | undefined) => {
        return {
            ok: false,
            error: {
                code,
                message,
                requiredPlan: context?.requiredPlan,
                currentPlan: context?.currentPlan,
                // Default upgrade URL, can be overridden if we have specific flows
                upgradeUrl: `/dashboard/billing?upgrade=${context?.requiredPlan || "PRO"}`,
                details: context?.details,
            },
        };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    requirePro: (currentPlan: any, featureName: unknown) => {
        return Gating.deny("PLAN_REQUIRED", `${featureName} is only available on the Pro plan.`, { requiredPlan: "PRO", currentPlan });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    seatLimit: (currentPlan: any, limit: unknown) => {
        return Gating.deny("SEAT_LIMIT", `You have reached the limit of ${limit} seats on your ${currentPlan} plan.`, { requiredPlan: "PRO", currentPlan, details: { limit } });
    },
};
