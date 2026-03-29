/**
 * Onboarding Steps Configuration
 * 
 * Defines the sequence and metadata for all onboarding steps.
 */

import type { OnboardingStepId } from "../types/onboarding";

export interface StepConfig {
  id: OnboardingStepId;
  title: string;
  description: string;
  icon: string;
  required: boolean;
  estimatedTime?: string;
}

// Complete step sequence
export const ONBOARDING_STEPS: StepConfig[] = [
  {
    id: "welcome",
    title: "Welcome",
    description: "Get started with Vayva",
    icon: "Sparkles",
    required: true,
    estimatedTime: "1 min",
  },
  {
    id: "plan_selection",
    title: "Choose Plan",
    description: "Select your subscription plan",
    icon: "Target",
    required: true,
    estimatedTime: "2 min",
  },
  {
    id: "identity",
    title: "Personal Identity",
    description: "Verify your personal details",
    icon: "User",
    required: true,
    estimatedTime: "2 min",
  },
  {
    id: "business",
    title: "Business Details",
    description: "Tell us about your business",
    icon: "Store",
    required: true,
    estimatedTime: "3 min",
  },
  {
    id: "industry",
    title: "Industry Selection",
    description: "Choose your industry vertical",
    icon: "Briefcase",
    required: true,
    estimatedTime: "2 min",
  },
  {
    id: "tools",
    title: "Select Tools",
    description: "Customize your dashboard",
    icon: "Wrench",
    required: true,
    estimatedTime: "2 min",
  },
  {
    id: "first_item",
    title: "Add First Item",
    description: "Create your first product or service",
    icon: "Package",
    required: false, // Can be skipped
    estimatedTime: "3 min",
  },
  {
    id: "socials",
    title: "Connect Socials",
    description: "Link Instagram & WhatsApp",
    icon: "ChatCircle",
    required: false,
    estimatedTime: "2 min",
  },
  {
    id: "finance",
    title: "Payment Setup",
    description: "Add your bank account",
    icon: "CreditCard",
    required: true,
    estimatedTime: "5 min",
  },
  {
    id: "kyc",
    title: "KYC Verification",
    description: "Verify your identity",
    icon: "ShieldCheck",
    required: true,
    estimatedTime: "5 min",
  },
  {
    id: "policies",
    title: "Store Policies",
    description: "Publish required policies",
    icon: "DocumentText",
    required: true,
    estimatedTime: "5 min",
  },
  {
    id: "publish",
    title: "Publish Storefront",
    description: "Make your storefront live",
    icon: "Rocket",
    required: true,
    estimatedTime: "2 min",
  },
  {
    id: "review",
    title: "Review & Finish",
    description: "Check details and launch",
    icon: "CheckCircle",
    required: true,
    estimatedTime: "3 min",
  },
];

// Map for quick step lookup
export const STEP_MAP = new Map<OnboardingStepId, StepConfig>(
  ONBOARDING_STEPS.map((step) => [step.id, step])
);

// Required steps only (for Free plan)
export const REQUIRED_STEPS: OnboardingStepId[] = ONBOARDING_STEPS.filter(
  (step) => step.required
).map((step) => step.id);

// Optional steps (can be skipped by Pro/Pro+)
export const OPTIONAL_STEPS: OnboardingStepId[] = ONBOARDING_STEPS.filter(
  (step) => !step.required
).map((step) => step.id);

// Get step by ID
export function getStepConfig(stepId: OnboardingStepId): StepConfig | undefined {
  return STEP_MAP.get(stepId);
}

// Get step index
export function getStepIndex(stepId: OnboardingStepId): number {
  return ONBOARDING_STEPS.findIndex((step) => step.id === stepId);
}

// Get next step
export function getNextStep(stepId: OnboardingStepId): OnboardingStepId | null {
  const index = getStepIndex(stepId);
  if (index < ONBOARDING_STEPS.length - 1) {
    return ONBOARDING_STEPS[index + 1].id;
  }
  return null;
}

// Get previous step
export function getPrevStep(stepId: OnboardingStepId): OnboardingStepId | null {
  const index = getStepIndex(stepId);
  if (index > 0) {
    return ONBOARDING_STEPS[index - 1].id;
  }
  return null;
}
