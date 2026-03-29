/**
 * useOnboardingState Hook
 *
 * Manages onboarding state with persistence and validation.
 */

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useRef } from "react";
import type {
  OnboardingState,
  OnboardingStepId,
  OnboardingStatus,
} from "../types/onboarding";
import {
  getOnboardingState,
  updateOnboardingState,
} from "../services/onboarding.api";
import { buildStepSequence } from "./stepBuilder";

interface UseOnboardingStateReturn {
  state: Partial<OnboardingState>;
  currentStep: OnboardingStepId;
  isLoading: boolean;
  isSaving: boolean;
  steps: OnboardingStepId[];
  status: OnboardingStatus;
  updateState: (
    data: Partial<OnboardingState>,
    showToast?: boolean,
  ) => Promise<void>;
  setCurrentStep: (step: OnboardingStepId) => void;
  refresh: () => Promise<void>;
}

export function useOnboardingState(): UseOnboardingStateReturn {
  const [state, setState] = useState<Partial<OnboardingState>>({});
  const [currentStep, setCurrentStep] = useState<OnboardingStepId>("welcome");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimer = useRef<number | null>(null);
  const DEBOUNCE_MS = 200;
  const [status, setStatus] = useState<OnboardingStatus>("IN_PROGRESS");
  const [steps, setSteps] = useState<OnboardingStepId[]>([]);

  /**
   * Load initial state from backend
   */
  const loadState = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getOnboardingState();

      if (response.data) {
        setState(response.data);
      }

      if (response.currentStepKey) {
        setCurrentStep(response.currentStepKey as OnboardingStepId);
      }

      if (response.status) {
        setStatus(response.status as OnboardingStatus);
      }

      // Build dynamic step sequence based on merchant data
      const stepSequence = buildStepSequence(response.data || {});
      setSteps(stepSequence);
    } catch (error) {
      console.error("Failed to load onboarding state:", error);
      toast.error("Failed to load your progress");
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update state with debounce and persistence
   */
  const updateState = useCallback(
    async (data: Partial<OnboardingState>, showToast = true) => {
      setIsSaving(true);
      // Optimistic update
      setState((prev) => ({ ...prev, ...data }));

      // Debounced persistence to backend
      if (saveTimer.current) {
        window.clearTimeout(saveTimer.current);
      }
      saveTimer.current = window.setTimeout(async () => {
        try {
          await updateOnboardingState({
            data,
            step: currentStep,
            status,
          });
          if (showToast) {
            toast.success("Progress saved");
          }
        } catch (error) {
          console.error("Failed to save onboarding state:", error);
          toast.error("Failed to save progress");
          throw error;
        } finally {
          setIsSaving(false);
        }
      }, DEBOUNCE_MS);
    },
    [currentStep, status],
  );

  /**
   * Refresh state from backend
   */
  const refresh = useCallback(async () => {
    await loadState();
  }, [loadState]);

  // Load state on mount
  useEffect(() => {
    loadState();
  }, [loadState]);

  // Rebuild step sequence when state changes
  useEffect(() => {
    const stepSequence = buildStepSequence(state);
    setSteps(stepSequence);
  }, [state]);

  return {
    state,
    currentStep,
    isLoading,
    isSaving,
    steps,
    status,
    updateState,
    setCurrentStep,
    refresh,
  };
}
