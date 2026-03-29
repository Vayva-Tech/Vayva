/**
 * Onboarding API Client
 * 
 * Centralized API client for onboarding-related endpoints.
 * All requests use the /api/v1/onboarding prefix.
 */

import { apiJson } from "@/lib/api-client-shared";
import type {
  OnboardingState,
  OnboardingUpdatePayload,
  OnboardingCompletePayload,
  IndustryPreset,
  SkipStepPayload,
} from "../types/onboarding";

const BASE_PATH = "/onboarding";

/**
 * Get current onboarding state
 */
export async function getOnboardingState(): Promise<{
  success: boolean;
  data: Partial<OnboardingState>;
  currentStepKey: string;
  status: string;
}> {
  return apiJson(`${BASE_PATH}/state`);
}

/**
 * Update onboarding state (save progress)
 */
export async function updateOnboardingState(
  payload: OnboardingUpdatePayload
): Promise<{ success: boolean; data: unknown }> {
  return apiJson(`${BASE_PATH}/state`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * Complete specific onboarding step
 */
export async function completeOnboardingStep(
  step: string,
  data?: Record<string, unknown>
): Promise<{ success: boolean; data: { step: string } }> {
  return apiJson(`${BASE_PATH}/${step}`, {
    method: "PATCH",
    body: JSON.stringify({ data }),
  });
}

/**
 * Mark onboarding as complete (launch store)
 */
export async function completeOnboarding(
  data: OnboardingCompletePayload["data"]
): Promise<{ success: boolean; message: string }> {
  return apiJson(`${BASE_PATH}/complete`, {
    method: "POST",
    body: JSON.stringify({ data }),
  });
}

/**
 * Skip optional step (Pro/Pro+ only)
 */
export async function skipOnboardingStep(
  payload: SkipStepPayload
): Promise<{ success: boolean; message: string }> {
  return apiJson(`${BASE_PATH}/skip`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Get industry-specific configuration
 */
export async function getIndustryPresets(
  slug: string
): Promise<{ success: boolean; data: IndustryPreset }> {
  return apiJson(`${BASE_PATH}/industry-presets/${slug}`);
}
