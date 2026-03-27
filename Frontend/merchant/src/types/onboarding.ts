import { OnboardingStatus } from "@vayva/shared";
import { IndustrySlug } from "../lib/templates/types";

export type OnboardingStepId =
  | "welcome"
  | "plan_selection"
  | "identity"
  | "business"
  | "tools"
  | "first_item"
  | "socials"
  | "finance"
  | "kyc"
  | "policies"
  | "publish"
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
  settings?: {
    enabledTools?: string[];
  };
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
    businessType?: "b2b" | "b2c" | "nonprofit" | "hybrid";
    organizationType?: "for_profit" | "nonprofit" | "government";
    employeeCount?: number;
    businessSize?: "solo" | "small" | "medium" | "large";
    enableWholesale?: boolean;
    hasEvents?: boolean;
    needsTicketing?: boolean;
  };
  logistics?: {
    pickupAddress?: string;
    pickupAddressObj?: Address;
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
  intent?: {
    segment?: string;
  };
  b2bConfig?: {
    enableQuotes?: boolean;
    enableCreditAccounts?: boolean;
    defaultCreditLimit?: number;
    paymentTerms?: "net_15" | "net_30" | "net_60" | "due_on_receipt";
    requireApproval?: boolean;
  };
  nonprofitConfig?: {
    acceptDonations?: boolean;
    volunteerManagement?: boolean;
    fundraisingGoals?: number;
  };
  eventsConfig?: {
    enableTickets?: boolean;
    venueCapacity?: number;
    enableRSVP?: boolean;
  };
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

export type OnboardingData = Partial<OnboardingState>;
