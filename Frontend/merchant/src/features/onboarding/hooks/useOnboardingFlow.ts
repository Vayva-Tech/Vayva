/**
 * useOnboardingFlow Hook
 * 
 * Manages navigation and flow between onboarding steps.
 */

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { OnboardingStepId, PartialOnboardingState } from "../types/onboarding";
import {
  ONBOARDING_STEPS,
  getStepIndex,
  getNextStep,
  getPrevStep,
} from "../config/onboarding-steps";
import {
  updateOnboardingState,
  completeOnboardingStep,
  skipOnboardingStep,
} from "../services/onboarding.api";

interface UseOnboardingFlowOptions {
  currentStep: OnboardingStepId;
  state: PartialOnboardingState;
  setCurrentStep: (step: OnboardingStepId) => void;
  setState: (state: PartialOnboardingState) => void;
  refresh?: () => void;
}

export function useOnboardingFlow({
  currentStep,
  state,
  setCurrentStep,
  setState,
  refresh,
}: UseOnboardingFlowOptions) {
  const router = useRouter();

  /**
   * Navigate to specific step
   */
  const goToStep = useCallback(
    async (step: OnboardingStepId) => {
      setCurrentStep(step);
      try {
        await updateOnboardingState({
          data: state,
          step,
          status: "IN_PROGRESS",
        });
        if (refresh) refresh();
      } catch (error) {
        toast.error("Failed to navigate to step");
        console.error(error);
      }
    },
    [state, setCurrentStep, refresh]
  );

  /**
   * Move to next step with optional data merge
   */
  const nextStep = useCallback(
    async (additionalData?: PartialOnboardingState) => {
      const mergedData = additionalData
        ? { ...state, ...additionalData }
        : state;

      const next = getNextStep(currentStep);
      
      if (!next) {
        toast.error("Already at final step");
        return;
      }

      setState(mergedData);
      setCurrentStep(next);

      try {
        await updateOnboardingState({
          data: mergedData,
          step: next,
          status: "IN_PROGRESS",
        });
        if (refresh) refresh();
      } catch (error) {
        toast.error("Failed to save progress");
        console.error(error);
      }
    },
    [currentStep, state, setState, setCurrentStep, refresh]
  );

  /**
   * Move to previous step
   */
  const prevStep = useCallback(
    async () => {
      const prev = getPrevStep(currentStep);
      
      if (!prev) {
        toast.error("Already at first step");
        return;
      }

      setCurrentStep(prev);
      
      try {
        await updateOnboardingState({
          data: state,
          step: prev,
        });
        if (refresh) refresh();
      } catch (error) {
        toast.error("Failed to navigate back");
        console.error(error);
      }
    },
    [currentStep, state, setCurrentStep, refresh]
  );

  /**
   * Complete specific step with data
   */
  const completeStep = useCallback(
    async (step: OnboardingStepId, data: Record<string, unknown>) => {
      try {
        const result = await completeOnboardingStep(step, data);
        
        // Merge completed data into state
        setState({
          ...state,
          ...data,
        });

        toast.success(`✓ ${step.replace("_", " ")} saved`);
        
        return result;
      } catch (error) {
        toast.error(`Failed to save ${step.replace("_", " ")}`);
        throw error;
      }
    },
    [state, setState]
  );

  /**
   * Skip optional step (Pro/Pro+ only)
   */
  const skipStep = useCallback(
    async (stepId: OnboardingStepId, reason?: string) => {
      try {
        await skipOnboardingStep({ stepId, reason });
        
        // Move to next step
        const next = getNextStep(stepId);
        if (next) {
          setCurrentStep(next);
        }
        
        toast.success("Step skipped");
      } catch (error) {
        toast.error("This step cannot be skipped on your plan");
        throw error;
      }
    },
    [setCurrentStep]
  );

  /**
   * Get current step metadata
   */
  const currentStepConfig = useCallback(() => {
    return ONBOARDING_STEPS.find((s) => s.id === currentStep);
  }, [currentStep]);

  /**
   * Get progress percentage
   */
  const progressPercentage = useCallback(() => {
    const currentIndex = getStepIndex(currentStep);
    return Math.round(((currentIndex + 1) / ONBOARDING_STEPS.length) * 100);
  }, [currentStep]);

  /**
   * Check if current step is required or optional
   */
  const isCurrentStepRequired = useCallback(() => {
    const config = currentStepConfig();
    return config?.required ?? true;
  }, [currentStepConfig]);

  return {
    goToStep,
    nextStep,
    prevStep,
    completeStep,
    skipStep,
    currentStepConfig,
    progressPercentage,
    isCurrentStepRequired,
  };
}
