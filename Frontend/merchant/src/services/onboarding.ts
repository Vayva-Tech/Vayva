import { apiJson } from "@/lib/api-client-shared";
import { logger } from "@/lib/logger";

const STORAGE_KEY = "vayva_onboarding_state"; // nosecret

const defaultState = {
    isComplete: false,
    currentStep: "welcome", // Start at Industry Selection
    lastUpdatedAt: new Date().toISOString(),
    whatsappConnected: false,
    templateSelected: false,
    kycStatus: "not_started",
    plan: "free",
};

/**
 * Deep merge two objects. Nested objects are merged recursively.
 * Arrays are replaced (not merged) to avoid unexpected behavior.
 */
function deepMerge<T extends Record<string, unknown>>(target: T, source: Record<string, unknown>): T {
    const result = { ...target } as Record<string, unknown>;

    for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            const sourceValue = source[key];
            const targetValue = result[key];

            if (
                sourceValue &&
                typeof sourceValue === "object" &&
                !Array.isArray(sourceValue) &&
                targetValue &&
                typeof targetValue === "object" &&
                !Array.isArray(targetValue)
            ) {
                // Recursively merge nested objects
                result[key] = deepMerge(
                    targetValue as Record<string, unknown>,
                    sourceValue as Record<string, unknown>
                );
            } else {
                // Replace primitives, arrays, or null values
                result[key] = sourceValue;
            }
        }
    }

    return result as T;
}
export const OnboardingService = {
    getState: async () => {
        try {
            // Fetch from backend API
            const data = await apiJson<any>("/onboarding/state");
            const storedData = data?.data || {};
            const status = String(data?.status || data?.onboardingStatus || "IN_PROGRESS");
            const currentStep = data?.currentStepKey || data?.currentStep || "welcome";
            return {
                isComplete: [
                    "COMPLETE",
                    "REQUIRED_COMPLETE",
                    "OPTIONAL_INCOMPLETE",
                ].includes(status),
                currentStep,
                lastUpdatedAt: new Date().toISOString(),
                whatsappConnected: storedData?.whatsappConnected || false,
                templateSelected: storedData?.templateSelected || false,
                kycStatus: storedData?.kycStatus || "not_started",
                plan: storedData?.plan || "free",
                ...storedData,
            };
        }
        catch (error) {
            logger.error("Error reading onboarding state", error);
            // Try localStorage fallback
            if (typeof window !== "undefined") {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    logger.warn("Recovered state from localStorage");
                    return JSON.parse(stored);
                }
            }
            logger.warn("Returning default onboarding state.");
            return defaultState;
        }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    saveStep: async (stepId: any, data: any) => {
        try {
            // Save to backend API
            await apiJson("/onboarding/state", {
                method: "PUT",
                body: JSON.stringify({
                    data: data,
                    step: stepId,
                    status: "IN_PROGRESS",
                }),
            });
            logger.info(`Saved step ${stepId} to backend`);
            // Also save to localStorage as backup
            if (typeof window !== "undefined") {
                const currentState = await OnboardingService.getState();
                const newState = deepMerge(
                    currentState as Record<string, unknown>,
                    data as Record<string, unknown>
                );
                newState.currentStep = stepId;
                newState.lastUpdatedAt = new Date().toISOString();
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
            }
        }
        catch (error) {
            logger.error("Error saving onboarding step", error);
            // Fallback to localStorage only
            if (typeof window !== "undefined") {
                const currentState = await OnboardingService.getState();
                const newState = deepMerge(
                    currentState as Record<string, unknown>,
                    data as Record<string, unknown>
                );
                newState.currentStep = stepId;
                newState.lastUpdatedAt = new Date().toISOString();
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
            }
        }
    },
    complete: async () => {
        try {
            // Mark as complete via API
            const currentState = await OnboardingService.getState();
            await apiJson("/onboarding/state", {
                method: "PUT",
                body: JSON.stringify({
                    data: currentState,
                    step: "review",
                    status: "COMPLETE",
                    isComplete: true,
                }),
            });
            // Clear localStorage
            if (typeof window !== "undefined") {
                localStorage.removeItem(STORAGE_KEY);
            }
        }
        catch (error) {
            logger.error("Error completing onboarding", error);
            // Still try to save locally
            await OnboardingService.saveStep("review", { isComplete: true });
            throw error;
        }
    },
    reset: async () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem(STORAGE_KEY);
        }
    },
};
