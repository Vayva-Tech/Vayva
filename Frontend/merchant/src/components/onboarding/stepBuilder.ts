/**
 * Dynamic Onboarding Step Builder
 * 
 * Creates personalized onboarding sequences based on merchant responses.
 * Different business types need different setup flows.
 */

import { OnboardingStepId, OnboardingState } from "@/types/onboarding";

/**
 * Base steps that ALL merchants must complete
 */
const BASE_STEPS: OnboardingStepId[] = [
  "welcome",
  "plan_selection",  // Guided plan selector quiz
  "identity",
  "business",
  "industry",      // Critical for dashboard personalization
];

/**
 * Optional/specialized steps
 */
const SPECIALIZED_STEPS: Record<string, OnboardingStepId> = {
  b2b: "b2b_setup",
  nonprofit: "nonprofit_setup",
  events: "events_setup",
};

/**
 * Core commerce steps (after industry selection)
 */
const CORE_COMMERCE_STEPS: OnboardingStepId[] = [
  "tools",
  "first_item",
  "socials",
  "finance",
  "kyc",
  "policies",
  "publish",
  "review",
];

/**
 * Builds a dynamic step sequence based on merchant's business type and needs
 * 
 * @param state - Current onboarding state with business information
 * @returns Personalized array of onboarding step IDs
 */
export function buildStepSequence(state: Partial<OnboardingState>): OnboardingStepId[] {
  const steps: OnboardingStepId[] = [...BASE_STEPS];

  // Check if merchant needs B2B wholesale features
  const isB2B = state.business?.businessType === "b2b" || 
                state.business?.enableWholesale === true ||
                state.metadata?.requiresB2B === true;

  // Check if merchant is a nonprofit organization
  const isNonprofit = state.business?.organizationType === "nonprofit" ||
                      state.business?.businessType === "nonprofit" ||
                      state.metadata?.isNonprofit === true;

  // Check if merchant needs event management
  const hasEvents = state.business?.hasEvents === true ||
                    state.business?.needsTicketing === true ||
                    state.metadata?.requiresEvents === true;

  // Add specialized steps based on business type
  if (isB2B) {
    steps.push(SPECIALIZED_STEPS.b2b);
  }

  if (isNonprofit) {
    steps.push(SPECIALIZED_STEPS.nonprofit);
  }

  if (hasEvents) {
    steps.push(SPECIALIZED_STEPS.events);
  }

  // Add core commerce steps
  steps.push(...CORE_COMMERCE_STEPS);

  return steps;
}

/**
 * Determines if a merchant should see simplified onboarding
 * (fewer steps, minimal required fields)
 * 
 * @param state - Current onboarding state
 * @returns True if simplified flow should be used
 */
export function shouldUseSimplifiedFlow(state: Partial<OnboardingState>): boolean {
  // Solo entrepreneurs or very small businesses
  const isSolo = state.business?.employeeCount === 1 ||
                 state.business?.businessSize === "solo";

  // Express mode requested
  const wantsExpress = state.metadata?.preferSimpleOnboarding === true;

  return isSolo || wantsExpress;
}

/**
 * Gets the appropriate business step component based on preferences
 * 
 * @param state - Current onboarding state
 * @returns "business" for standard, "simplified_business" for express
 */
export function getBusinessStepType(state: Partial<OnboardingState>): "business" | "simplified_business" {
  return shouldUseSimplifiedFlow(state) ? "simplified_business" : "business";
}

/**
 * Checks if a specific step should be shown for this merchant
 * 
 * @param step - The step to check
 * @param state - Current onboarding state
 * @returns True if step should be included
 */
export function shouldIncludeStep(step: OnboardingStepId, state: Partial<OnboardingState>): boolean {
  // Always include base steps
  const baseSteps: OnboardingStepId[] = ["welcome", "identity", "business", "industry"];
  if (baseSteps.includes(step)) {
    return true;
  }

  // Specialized steps depend on business type
  if (step === "b2b_setup") {
    return state.business?.businessType === "b2b" || state.metadata?.requiresB2B === true;
  }

  if (step === "nonprofit_setup") {
    return state.business?.organizationType === "nonprofit" || state.metadata?.isNonprofit === true;
  }

  if (step === "events_setup") {
    return state.business?.hasEvents === true || state.metadata?.requiresEvents === true;
  }

  // Simplified socials for solo merchants
  if (step === "socials") {
    return !shouldUseSimplifiedFlow(state);
  }

  if (step === "simplified_socials") {
    return shouldUseSimplifiedFlow(state);
  }

  // Include all other steps by default
  return true;
}

/**
 * Gets a progress percentage based on completed steps
 * 
 * @param currentStep - Current step ID
 * @param state - Current onboarding state
 * @returns Progress percentage (0-100)
 */
export function calculateProgress(currentStep: OnboardingStepId, state: Partial<OnboardingState>): number {
  const allSteps = buildStepSequence(state);
  const currentIndex = allSteps.indexOf(currentStep);
  
  if (currentIndex === -1) return 0;
  
  // Progress is based on position in sequence
  return Math.round(((currentIndex + 1) / allSteps.length) * 100);
}
