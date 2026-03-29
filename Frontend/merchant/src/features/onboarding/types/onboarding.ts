/**
 * Onboarding Type Definitions
 * 
 * Centralized type definitions for onboarding flow.
 */

// Step IDs matching the backend and frontend step sequence
export type OnboardingStepId =
  | "welcome"
  | "plan_selection"
  | "identity"
  | "business"
  | "industry"
  | "tools"
  | "first_item"
  | "socials"
  | "finance"
  | "kyc"
  | "policies"
  | "publish"
  | "review";

// Onboarding status values
export type OnboardingStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETE"
  | "TRIAL_MODE";

// Identity information
export interface IdentityData {
  fullName?: string;
  phone?: string;
  email?: string;
  nin?: string;
  bvn?: string;
}

// Business details
export interface BusinessData {
  storeName?: string;
  country?: string;
  storeSlug?: string;
  legalName?: string;
  registeredAddress?: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    landmark?: string;
  };
}

// Finance/banking information
export interface FinanceData {
  currency?: string;
  payoutScheduleAcknowledged?: boolean;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  bankCode?: string;
}

// KYC verification data
export interface KycData {
  nin?: string;
  bvn?: string;
  verificationStatus?: string;
}

// Social media connections
export interface SocialsData {
  instagram?: string;
  whatsapp?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
}

// Tools/features selection
export interface ToolsData {
  enabledTools?: string[];
}

// Industry-specific configuration
export interface IndustryPreset {
  slug: string;
  recommendedTools: string[];
  defaultPolicies: string[];
  kpis: string[];
}

// Complete onboarding state
export interface OnboardingState {
  schemaVersion?: number;
  industrySlug?: string;
  kycStatus?: string;
  identity?: IdentityData;
  business?: BusinessData;
  finance?: FinanceData;
  kyc?: KycData;
  socials?: SocialsData;
  tools?: ToolsData;
  logistics?: {
    deliveryMode?: string;
    pickupAddress?: string;
  };
  whatsapp?: {
    number?: string;
  };
  storeDetails?: {
    slug?: string;
    domainPreference?: string;
    publishStatus?: string;
  };
}

// Payload for updating onboarding state
export interface OnboardingUpdatePayload {
  data?: Partial<OnboardingState>;
  step?: string;
  isComplete?: boolean;
  status?: OnboardingStatus;
}

// Payload for completing onboarding
export interface OnboardingCompletePayload {
  data: OnboardingState;
}

// Payload for skipping steps
export interface SkipStepPayload {
  stepId?: string;
  reason?: string;
}

// Context type for onboarding provider
export interface OnboardingContextType {
  state: Partial<OnboardingState>;
  currentStep: OnboardingStepId;
  isLoading: boolean;
  isSaving: boolean;
  updateData: (
    data: Partial<OnboardingState>,
    showToast?: boolean
  ) => Promise<void>;
  goToStep: (step: OnboardingStepId) => void;
  nextStep: (additionalData?: Partial<OnboardingState>) => void;
  prevStep: () => void;
  completeOnboarding: () => Promise<void>;
  skipOnboarding: () => Promise<void>;
  steps: OnboardingStepId[];
  refresh: () => void;
}
