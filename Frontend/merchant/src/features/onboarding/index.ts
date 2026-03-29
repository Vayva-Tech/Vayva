/**
 * Onboarding Feature Module
 * 
 * Centralized exports for the onboarding feature.
 * Import from this file instead of relative paths.
 */

// Types
export type {
  OnboardingState,
  OnboardingStepId,
  OnboardingStatus,
  OnboardingUpdatePayload,
  OnboardingCompletePayload,
  SkipStepPayload,
  IndustryPreset,
  IdentityData,
  BusinessData,
  FinanceData,
  KycData,
  SocialsData,
  ToolsData,
  OnboardingContextType,
} from "./types/onboarding";

// API Client
export {
  getOnboardingState,
  updateOnboardingState,
  completeOnboardingStep,
  completeOnboarding,
  skipOnboardingStep,
  getIndustryPresets,
} from "./services/onboarding.api";

// Validation Schemas
export {
  IdentitySchema,
  BusinessSchema,
  FinanceSchema,
  KycSchema,
  SocialsSchema,
  ToolsSchema,
  IndustrySlugSchema,
  OnboardingStateSchema,
  OnboardingUpdatePayloadSchema,
  SkipStepPayloadSchema,
} from "./validation/onboarding.validation";

// Configuration
export {
  ONBOARDING_STEPS,
  STEP_MAP,
  REQUIRED_STEPS,
  OPTIONAL_STEPS,
  getStepConfig,
  getStepIndex,
  getNextStep,
  getPrevStep,
} from "./config/onboarding-steps";

export {
  INDUSTRY_PRESETS,
  getIndustryPreset,
  getAllIndustryPresets,
  hasIndustryPreset,
} from "./config/industry-onboarding-presets";

// Hooks
export { useOnboardingFlow } from "./hooks/useOnboardingFlow";
export { useOnboardingState } from "./hooks/useOnboardingState";
export { buildStepSequence, calculateProgress } from "./hooks/stepBuilder";

// Components
export { OnboardingWizard } from "./components/OnboardingWizard";
