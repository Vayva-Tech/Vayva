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
export const OnboardingClientService = {
  getState: async () => {
    try {
      // Fetch from backend API
      const data = await apiJson<{
        data?: Record<string, unknown>;
        status?: string;
        onboardingStatus?: string;
        currentStepKey?: string;
        currentStep?: string;
      }>("/api/onboarding/state");
      const storedData = data?.data || {};
      const status = String(
        data?.status || data?.onboardingStatus || "IN_PROGRESS",
      );
      const currentStep =
        data?.currentStepKey || data?.currentStep || "welcome";
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
    } catch (error) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("Error reading onboarding state", {
        error: _errMsg,
        app: "merchant",
      });
      // Try localStorage fallback
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          logger.warn("Recovered state from localStorage", "onboarding");
          return JSON.parse(stored);
        }
      }
      logger.warn("Returning default onboarding state.", "onboarding");
      return defaultState;
    }
  },
  saveStep: async (stepId: string, data: Record<string, unknown>) => {
    try {
      // Save to backend API
      await apiJson<{ success: boolean }>("/api/onboarding/state", {
        method: "PUT",
        body: JSON.stringify({
          data: data,
          step: stepId,
          status: "IN_PROGRESS",
        }),
      });
      logger.info(`Saved step ${stepId} to backend`, { app: "merchant" });
      // Also save to localStorage as backup
      if (typeof window !== "undefined") {
        const currentState = await OnboardingClientService.getState();
        const newState = {
          ...currentState,
          ...data,
          currentStep: stepId,
          lastUpdatedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      }
    } catch (error) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("Error saving onboarding step", {
        error: _errMsg,
        stepId,
        app: "merchant",
      });
      // Fallback to localStorage only
      if (typeof window !== "undefined") {
        const currentState = await OnboardingClientService.getState();
        const newState = {
          ...currentState,
          ...data,
          currentStep: stepId,
          lastUpdatedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      }
    }
  },
  complete: async () => {
    try {
      // Mark as complete via API
      const currentState = await OnboardingClientService.getState();
      await apiJson<{ success: boolean }>("/api/onboarding/state", {
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
    } catch (error) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("Error completing onboarding", {
        error: _errMsg,
        app: "merchant",
      });
      // Still try to save locally
      await OnboardingClientService.saveStep("review", { isComplete: true });
      throw error;
    }
  },
  reset: async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  },
};
