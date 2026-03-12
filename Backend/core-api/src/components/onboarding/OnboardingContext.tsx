"use client";

import { logger } from "@vayva/shared";
import React, { createContext, useContext, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { OnboardingState, OnboardingStepId } from "@/types/onboarding";
import useSWR from "swr";

// Define the shape of the Context
interface OnboardingContextType {
  state: Partial<OnboardingState>;
  currentStep: OnboardingStepId;
  isLoading: boolean;
  isSaving: boolean;
  updateData: (data: Partial<OnboardingState>) => void;
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

// Wizard Steps Definition
const STEPS: OnboardingStepId[] = [
  "welcome",
  "identity",
  "business",
  "socials",
  "finance",
  "kyc",
  "review",
];

import { apiJson } from "@/lib/api-client-shared";

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

  // Local State
  const [currentStep, setCurrentStep] = useState<OnboardingStepId>("welcome");
  const [formData, setFormData] = useState<Partial<OnboardingState>>({});
  const [isSaving, setIsSaving] = useState(false);

  // load from API
  const {
    data: _serverState,
    error: _error,
    isLoading,
    mutate: reload,
  } = useSWR<OnboardingServerState>(
    "/api/onboarding/state",
    (url: string) => apiJson<OnboardingServerState>(url),
    {
      revalidateOnFocus: false,
      onSuccess: (data) => {
        // Hydrate local state
        if (data?.data) {
          setFormData(data.data);
        }
        if (data?.currentStepKey) {
          // Validate step exists
          const stepKey = data.currentStepKey as OnboardingStepId;
          if (STEPS.includes(stepKey)) {
            setCurrentStep(stepKey);
          }
        }
        // If completed, maybe redirect?
        if (data?.status === "COMPLETE") {
          toast.success("Store setup already completed!");
          router.push("/dashboard");
        }
      },
    },
  );

  // Persist to Backend
  const saveState = useMemo(
    () =>
      async (
        newState: Partial<OnboardingState>,
        newStep?: OnboardingStepId,
        isComplete = false,
      ) => {
        setIsSaving(true);
        try {
          // Merge with existing formData to ensure all previous steps' data is included
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

          // Update SWR cache
          await reload();
        } catch (err: unknown) {
          const _errMsg = err instanceof Error ? err.message : String(err);
          logger.error("[ONBOARDING_CONTEXT] Save error", {
            error: _errMsg,
            app: "merchant",
          });
          toast.error(
            _errMsg || "Failed to save progress. Please check your connection.",
          );
          throw err; // Re-throw so completeOnboarding can catch it
        } finally {
          setIsSaving(false);
        }
      },
    [reload, formData],
  );

  // Methods
  const updateData = (newData: Partial<OnboardingState>) => {
    setFormData((prev) => {
      const updated = { ...prev, ...newData };
      // Debounce save or save immediately?
      // For wizard, we usually save on step transition, but "Auto-save" is nice.
      // For now: Local update only. Persist happens on navigation.
      return updated;
    });
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
      case "finance":
        // Allow skipping entirely (no finance data = skip for now)
        if (!data.finance?.accountNumber && !data.finance?.bankName) {
          return true;
        }
        // If partially filled, require both fields
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
    // Persist current step
    await saveState(formData, step);
  };

  const nextStep = async (additionalData?: Partial<OnboardingState>) => {
    const idx = STEPS.indexOf(currentStep);

    // Merge any additional data from the current step
    const dataToValidate = additionalData
      ? { ...formData, ...additionalData }
      : formData;

    // Validate current step before proceeding
    if (!validateStep(currentStep, dataToValidate)) {
      return;
    }

    if (idx < STEPS.length - 1) {
      const next = STEPS[idx + 1];
      setCurrentStep(next);
      // Save with merged data
      await saveState(dataToValidate, next);
      // Update local state
      if (additionalData) {
        setFormData(dataToValidate);
      }
    } else {
      // Last step?
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

      // Call the specialized completion endpoint which includes Paystack verification
      await apiJson<{ success: boolean }>("/api/merchant/onboarding/complete", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      toast.success("Welcome to Vayva! Your store is now live.");

      // Force refresh session to get completed status
      await reload();

      // Redirect to dashboard
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
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const skipOnboarding = async () => {
    setIsSaving(true);
    try {
      // Save status as TRIAL_MODE
      const payload = {
        data: formData,
        status: "TRIAL_MODE",
      };

      await apiJson<{ success: boolean }>("/api/onboarding/state", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      await reload();
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
