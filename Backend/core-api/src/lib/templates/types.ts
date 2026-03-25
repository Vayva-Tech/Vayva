import {
  MerchantContext,
  OnboardingStatus,
  SubscriptionPlan
} from "@vayva/shared";
import type { IndustrySlug } from "@vayva/industry-core";

export type { IndustrySlug };

export type PrimaryObject =
  | "product"
  | "service"
  | "event"
  | "course"
  | "post"
  | "project"
  | "campaign"
  | "listing"
  | "menu_item"
  | "digital_asset"
  | string;

export interface IndustryConfig {
  displayName: string;
  description?: string;
  primaryObject: string;
  modules: string[];
  moduleLabels?: Record<string, string>;
  moduleRoutes?: Record<string, { index?: string; create?: string }>;
  moduleIcons?: Record<string, string>;
  dashboardWidgets: unknown[];
  forms: Record<string, unknown>;
  onboardingSteps: string[];
  features?: {
    bookings?: boolean;
    delivery?: boolean;
    content?: boolean;
    inventory?: boolean;
    reservations?: boolean;
    tickets?: boolean;
    quotes?: boolean;
    donations?: boolean;
    enrollments?: boolean;
    viewings?: boolean;
    testDrives?: boolean;
    /** Industry-specific flags beyond the core set (synced with merchant INDUSTRY_CONFIG). */
    [key: string]: boolean | undefined;
  };
  aiTools?: string[];
}

export interface TemplateConfig {
  templateId: string;
  slug: string;
  displayName: string;
  category?: string;
  industry?: string;
  businessModel?: string;
  primaryUseCase?: string;
  requiredPlan?: string;
  defaultTheme?: string;
  status?: string;
  preview?: {
    thumbnailUrl?: string | null;
    mobileUrl?: string | null;
    desktopUrl?: string | null;
  };
  compare?: {
    headline?: string;
    bullets?: string[];
    bestFor?: string[];
    keyModules?: string[];
  };
  routes?: string[];
  layoutKey?: string;
  componentProps?: Record<string, unknown>;
  onboardingProfile?: Record<string, unknown>;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  industrySlug: IndustrySlug;
  currency: string;
  themeConfig?: unknown;
}

export interface ExtendedMerchant extends Omit<
  MerchantContext,
  "industrySlug" | "onboardingStatus" | "plan"
> {
  industrySlug?: IndustrySlug;
  enabledExtensionIds?: string[];
  onboardingCompleted?: boolean;
  onboardingStatus?: OnboardingStatus;
  firstName?: string;
  lastName?: string;
  businessName?: string;
  store?: {
    name?: string;
  };
  plan?: SubscriptionPlan | string;
  logoUrl?: string;
  externalManifests?: Record<string, unknown>[];
}

export interface SidebarItem {
  name: string;
  href: string;
  icon: string;
}

export interface SidebarGroup {
  name: string;
  items: SidebarItem[];
}
