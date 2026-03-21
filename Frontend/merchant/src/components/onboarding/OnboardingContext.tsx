// @ts-nocheck
"use client";

import { logger } from "@vayva/shared";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { OnboardingState, OnboardingStepId } from "@/types/onboarding";
import useSWR from "swr";

// Google Analytics gtag type
declare global {
  interface Window {
    gtag?: (
      command: "event",
      eventName: string,
      eventParams?: Record<string, unknown>,
    ) => void;
  }
}

interface OnboardingContextType {
  state: Partial<OnboardingState>;
  currentStep: OnboardingStepId;
  isLoading: boolean;
  isSaving: boolean;
  updateData: (data: Partial<OnboardingState>, showToast?: boolean) => Promise<void>;
  goToStep: (step: OnboardingStepId) => void;
  nextStep: (additionalData?: Partial<OnboardingState>) => void;
  prevStep: () => void;
  completeOnboarding: () => Promise<void>;
  skipOnboarding: () => Promise<void>;
  steps: OnboardingStepId[];
  refresh: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined,
);

const STEPS: OnboardingStepId[] = [
  "welcome",
  "identity",
  "business",
  "tools",
  "first_item",
  "socials",
  "finance",
  "kyc",
  "policies",
  "publish",
  "review",
];

import { apiJson } from "@/lib/api-client-shared";

const trackOnboardingEvent = (
  event: "step_viewed" | "step_completed" | "step_skipped" | "onboarding_completed" | "onboarding_error",
  data: Record<string, unknown>,
) => {
  try {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", event, data);
    }
    logger.info(`[ONBOARDING_ANALYTICS] ${event}`, data);
  } catch {
    // Silently fail analytics
  }
};

interface OnboardingServerState {
  data?: Partial<OnboardingState>;
  currentStepKey?: string;
  status?: string;
}

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { refreshProfile } = useAuth();

  const [currentStep, setCurrentStep] = useState<OnboardingStepId>("welcome");
  const [formData, setFormData] = useState<Partial<OnboardingState>>({});
  const [isSaving, setIsSaving] = useState(false);

  const {
    data: serverState,
    error,
    isLoading,
    mutate: reload,
  } = useSWR<OnboardingServerState>(
    "/api/onboarding/state",
    (url: string) => apiJson<OnboardingServerState>(url),
    {
      revalidateOnFocus: false,
      onSuccess: (data: any) => {
        if (data?.data) {
          setFormData(data.data);
        }
        if (data?.currentStepKey) {
          const stepKey = data.currentStepKey as OnboardingStepId;
          if (STEPS.includes(stepKey)) {
            setCurrentStep(stepKey);
          }
        }
        if (data?.status === "COMPLETE") {
          toast.success("Store setup already completed!");
          router.push("/dashboard");
        }
      },
    },
  );

  useEffect(() => {
    if (!isLoading && currentStep) {
      trackOnboardingEvent("step_viewed", {
        step: currentStep,
        step_index: STEPS.indexOf(currentStep),
      });
    }
  }, [currentStep, isLoading]);

  const saveState = useMemo(
    () =>
      async (
        newState: Partial<OnboardingState>,
        newStep?: OnboardingStepId,
        isComplete = false,
        showSaveToast = true,
      ) => {
        setIsSaving(true);
        try {
          const mergedData = { ...formData, ...newState };

          const payload = {
            data: mergedData,
            step: newStep,
            isComplete,
            status: isComplete ? "COMPLETE" : "IN_PROGRESS",
          };

          logger.info("[ONBOARDING_CONTEXT] Saving state", {
            hasKyc: !!mergedData.kyc,
            hasIdentity: !!mergedData.identity,
            isComplete,
          });

          await apiJson<{ success: boolean }>("/api/onboarding/state", {
            method: "PUT",
            body: JSON.stringify(payload),
          });

          await reload();
          
          if (showSaveToast && !isComplete) {
            toast.success("✓ Progress saved", {
              duration: 2000,
            });
          }
        } catch (err: unknown) {
          const _errMsg = err instanceof Error ? err.message : String(err);
          logger.error("[ONBOARDING_CONTEXT] Save error", {
            error: _errMsg,
            app: "merchant",
          });
          toast.error(
            _errMsg || "Failed to save progress. Please check your connection.",
          );
          throw err;
        } finally {
          setIsSaving(false);
        }
      },
    [reload, formData],
  );

  const updateData = async (newData: Partial<OnboardingState>, showToast = true) => {
    setFormData((prev: any) => ({ ...prev, ...newData }));
    // Auto-save after state update with debounce
    const timeoutId = setTimeout(async () => {
      try {
        await saveState(newData, undefined, false, showToast);
      } catch (err) {
        // Error already handled in saveState
      }
    }, 500); // 500ms debounce
    
    return () => clearTimeout(timeoutId);
  };

  const validateStep = (
    step: OnboardingStepId,
    data: Partial<OnboardingState>,
  ): boolean => {
    switch (step) {
      case "identity":
        if (!data.identity?.phone) {
          toast.error("Please fill in your phone number.");
          return false;
        }
        return true;
      case "business":
        if (!data.business?.storeName || !data.business?.country) {
          toast.error("Store name and country are required.");
          return false;
        }
        return true;
      case "tools":
        if (!data.settings?.enabledTools || data.settings.enabledTools.length === 0) {
          toast.error("Please select at least one tool.");
          return false;
        }
        return true;
      case "finance":
        if (!data.finance?.accountNumber && !data.finance?.bankName) {
          return true;
        }
        if (!data.finance?.accountNumber || !data.finance?.bankName) {
          toast.error(
            "Please complete your bank details or clear the form to skip.",
          );
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const goToStep = async (step: OnboardingStepId) => {
    setCurrentStep(step);
    await saveState(formData, step);
  };

  const nextStep = async (additionalData?: Partial<OnboardingState>) => {
    const idx = STEPS.indexOf(currentStep);

    const dataToValidate = additionalData
      ? { ...formData, ...additionalData }
      : formData;

    if (!validateStep(currentStep, dataToValidate)) {
      return;
    }

    if (idx < STEPS.length - 1) {
      const next = STEPS[idx + 1];
      setCurrentStep(next);
      await saveState(dataToValidate, next);
      trackOnboardingEvent("step_completed", {
        step: currentStep,
        step_index: idx,
        next_step: next,
      });
    }
  };

  const prevStep = async () => {
    const idx = STEPS.indexOf(currentStep);
    if (idx > 0) {
      const prev = STEPS[idx - 1];
      setCurrentStep(prev);
      await saveState(formData, prev);
    }
  };

  const completeOnboarding = async () => {
    setIsSaving(true);
    try {
      logger.info("[COMPLETE] Launching store with data", {
        hasFinance: !!formData.finance,
      });

      await apiJson<{ success: boolean }>("/api/merchant/onboarding/complete", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      toast.success("Welcome to Vayva! Your store is now live.");

      trackOnboardingEvent("onboarding_completed", {
        steps_completed: STEPS.length,
        has_finance: !!formData.finance,
        has_kyc: !!formData.kyc,
      });

      await reload();
      await refreshProfile();

      router.push("/dashboard");
      router.refresh();
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("Failed to complete onboarding", {
        error: _errMsg,
        app: "merchant",
      });
      const message =
        _errMsg || "Failed to launch store. Please check your bank details.";
      toast.error(message);

      trackOnboardingEvent("onboarding_error", {
        step: "review",
        error: _errMsg,
      });
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const skipOnboarding = async () => {
    setIsSaving(true);
    try {
      const payload = {
        data: formData,
        status: "TRIAL_MODE",
      };

      await apiJson<{ success: boolean }>("/api/onboarding/state", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      await reload();
      await refreshProfile();

      toast.success("Entering Trial Mode - Explore the demo store!");
      router.push("/dashboard");
      router.refresh();
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[SKIP_ONBOARDING_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error(_errMsg || "Failed to start trial.");
    } finally {
      setIsSaving(false);
    }
  };

  const value = {
    state: formData,
    currentStep,
    isLoading,
    isSaving,
    updateData,
    goToStep,
    nextStep,
    prevStep,
    completeOnboarding,
    skipOnboarding,
    steps: STEPS,
    refresh: reload,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context)
    throw new Error("useOnboarding must be used within OnboardingProvider");
  return context;
};
