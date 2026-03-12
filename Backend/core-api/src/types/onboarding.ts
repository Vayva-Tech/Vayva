import { OnboardingStatus } from "@vayva/shared";
import { IndustrySlug } from "../lib/templates/types";

export type OnboardingStepId =
  | "welcome"
  | "identity"
  | "business"
  | "socials"
  | "finance"
  | "kyc"
  | "review"
  | "complete";

export interface Address {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  landmark?: string;
  country?: string;
}

export interface KycData {
  nin?: string;
  ninVerified?: boolean;
  bvn?: string;
  cac?: string;
  documentType?: string;
  documentUrl?: string;
  status?: string;
}

export interface OnboardingState {
  id: string;
  storeId: string;
  status: OnboardingStatus | string;
  currentStepKey: OnboardingStepId | string;
  industrySlug?: IndustrySlug;
  metadata?: Record<string, unknown>;
  identity?: {
    fullName?: string;
    phone?: string;
    email?: string;
  };
  business?: {
    storeName?: string;
    legalName?: string;
    registeredAddress?: Address;
    country?: string;
    industry?: string;
    name?: string;
    slug?: string;
    state?: string;
    city?: string;
    email?: string;
    phone?: string;
    businessRegistrationType?: string;
  };
  logistics?: {
    pickupAddress?: string;
    pickupAddressObj?: Address;
  };
  socials?: {
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  finance?: {
    accountNumber?: string;
    bankName?: string;
    bankCode?: string;
    accountName?: string;
    methods?: {
      bankTransfer: boolean;
      cash: boolean;
      pos: boolean;
    };
  };
  kyc?: KycData;
  completedAt?: Date | null;
  updatedAt: Date;
}

export interface OnboardingUpdatePayload {
  step?: string;
  status?: OnboardingStatus | string;
  industrySlug?: IndustrySlug;
  data?: Partial<OnboardingState>;
  isComplete?: boolean;
}
