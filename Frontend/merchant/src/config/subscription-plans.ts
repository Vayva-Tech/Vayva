/**
 * Subscription Plans & Feature Matrix
 * Single source of truth for plan features and pricing
 */

import type { SubscriptionTier, BillingCycle } from '@/services/subscription';

export interface PlanFeature {
  key: string;
  name: string;
  description: string;
  category: 'core' | 'analytics' | 'automation' | 'support' | 'advanced';
}

export interface PlanLimits {
  products: number; // -1 for unlimited
  orders: number; // -1 for unlimited
  teamMembers: number;
  customers: number;
  aiTokens: number;
  whatsappMessages: number;
  automationRules: number;
  credits: number;
  templates: number;
  dashboardMetrics: number;
  customReports: boolean;
  apiAccess: boolean;
  customDomains: boolean;
  prioritySupport: boolean;
  removeBranding: boolean;
  advancedAnalytics: boolean;
  industryDashboards: boolean;
  mergedIndustryDashboard: boolean;
  visualWorkflowBuilder: boolean;
}

export interface PlanPricing {
  monthly: number;
  quarterly: number; // 3 months with discount
  annual: number; // 12 months with best discount
}

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  tagline: string;
  description: string;
  pricing: PlanPricing;
  trialDays?: number; // Number of free trial days (0 for no trial)
  limits: PlanLimits;
  features: PlanFeature[];
  recommended?: boolean;
}

// Feature definitions
export const FEATURES: Record<string, PlanFeature> = {
  // Core Features
  basic_dashboard: {
    key: 'basic_dashboard',
    name: 'Basic Dashboard',
    description: 'Essential business metrics and KPIs',
    category: 'core',
  },
  paystack_payments: {
    key: 'paystack_payments',
    name: 'Paystack Payments',
    description: 'Accept payments via Paystack',
    category: 'core',
  },
  csv_import: {
    key: 'csv_import',
    name: 'CSV Import',
    description: 'Bulk import data via CSV files',
    category: 'core',
  },
  
  // Analytics
  basic_analytics: {
    key: 'basic_analytics',
    name: 'Basic Analytics',
    description: 'Standard reports and insights',
    category: 'analytics',
  },
  advanced_analytics: {
    key: 'advanced_analytics',
    name: 'Advanced Analytics',
    description: 'Deep dive analytics with custom filters',
    category: 'analytics',
  },
  financial_charts: {
    key: 'financial_charts',
    name: 'Financial Charts',
    description: 'Revenue, profit, and expense visualization',
    category: 'analytics',
  },
  
  // Automation
  automation: {
    key: 'automation',
    name: 'Marketing Automation',
    description: 'Automated campaigns and workflows',
    category: 'automation',
  },
  ai_autopilot: {
    key: 'ai_autopilot',
    name: 'AI Autopilot',
    description: 'AI-powered business recommendations',
    category: 'automation',
  },
  
  // Support
  email_support: {
    key: 'email_support',
    name: 'Email Support',
    description: '24/7 email support',
    category: 'support',
  },
  priority_support: {
    key: 'priority_support',
    name: 'Priority Support',
    description: 'Priority email + chat support',
    category: 'support',
  },
  
  // Advanced
  accounting: {
    key: 'accounting',
    name: 'Accounting Integration',
    description: 'Connect with accounting software',
    category: 'advanced',
  },
  multi_store: {
    key: 'multi_store',
    name: 'Multi-Store Management',
    description: 'Manage multiple locations',
    category: 'advanced',
  },
  api_access: {
    key: 'api_access',
    name: 'API Access',
    description: 'REST API for custom integrations',
    category: 'advanced',
  },
  webhooks: {
    key: 'webhooks',
    name: 'Webhooks',
    description: 'Real-time event notifications',
    category: 'advanced',
  },
  industry_dashboards: {
    key: 'industry_dashboards',
    name: 'Industry Dashboards',
    description: 'Specialized dashboards for your industry',
    category: 'advanced',
  },
  merged_industry_dashboard: {
    key: 'merged_industry_dashboard',
    name: 'Merged Industry Dashboard',
    description: 'Cross-industry analytics and insights',
    category: 'advanced',
  },
  visual_workflow_builder: {
    key: 'visual_workflow_builder',
    name: 'Visual Workflow Builder',
    description: 'Drag-and-drop automation builder',
    category: 'advanced',
  },
  custom_domain: {
    key: 'custom_domain',
    name: 'Custom Domain',
    description: 'Use your own domain',
    category: 'advanced',
  },
  remove_branding: {
    key: 'remove_branding',
    name: 'Remove Branding',
    description: 'White-label experience',
    category: 'advanced',
  },
  custom_integrations: {
    key: 'custom_integrations',
    name: 'Custom Integrations',
    description: 'Build custom third-party integrations',
    category: 'advanced',
  },
};

// Plan definitions
export const PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  STARTER: {
    tier: 'STARTER',
    name: 'Starter',
    tagline: 'For growing businesses',
    description: 'Essential tools to get started online - First 7 days free!',
    pricing: {
      monthly: 25000, // ₦25,000
      quarterly: 60000, // ₦60,000 (₦20k/month, 20% off)
      annual: 200000, // ₦200,000 (₦16.7k/month, 33% off)
    },
    trialDays: 7,
    limits: {
      products: 100,
      orders: 500,
      teamMembers: 1,
      customers: 1000,
      aiTokens: 0,
      whatsappMessages: 0,
      automationRules: 5,
      credits: 0,
      templates: 1,
      dashboardMetrics: 6,
      customReports: false,
      apiAccess: false,
      customDomains: false,
      prioritySupport: false,
      removeBranding: true,
      advancedAnalytics: true,
      industryDashboards: false,
      mergedIndustryDashboard: false,
      visualWorkflowBuilder: false,
    },
    features: [
      FEATURES.basic_dashboard,
      FEATURES.paystack_payments,
      FEATURES.csv_import,
      FEATURES.basic_analytics,
      FEATURES.advanced_analytics,
      FEATURES.email_support,
      FEATURES.remove_branding,
      FEATURES.automation,
      FEATURES.financial_charts,
    ],
  },
  
  STARTER: {
    tier: 'STARTER',
    name: 'Starter',
    tagline: 'For growing businesses',
    description: 'Essential tools to get started online',
    pricing: {
      monthly: 25000, // ₦25,000
      quarterly: 60000, // ₦60,000 (₦20k/month, 20% off)
      annual: 200000, // ₦200,000 (₦16.7k/month, 33% off)
    },
    limits: {
      products: 100,
      orders: 500,
      teamMembers: 1,
      customers: 1000,
      aiTokens: 0,
      whatsappMessages: 0,
      automationRules: 5,
      credits: 0,
      templates: 1,
      dashboardMetrics: 6,
      customReports: false,
      apiAccess: false,
      customDomains: false,
      prioritySupport: false,
      removeBranding: true,
      advancedAnalytics: true,
      industryDashboards: false,
      mergedIndustryDashboard: false,
      visualWorkflowBuilder: false,
    },
    features: [
      FEATURES.basic_dashboard,
      FEATURES.paystack_payments,
      FEATURES.csv_import,
      FEATURES.basic_analytics,
      FEATURES.advanced_analytics,
      FEATURES.email_support,
      FEATURES.remove_branding,
      FEATURES.automation,
      FEATURES.financial_charts,
    ],
  },
  
  PRO: {
    tier: 'PRO',
    name: 'Pro',
    tagline: 'Advanced features for scaling',
    description: 'Everything you need to grow faster',
    pricing: {
      monthly: 35000, // ₦35,000
      quarterly: 84000, // ₦84,000 (₦28k/month, 20% off)
      annual: 280000, // ₦280,000 (₦23.3k/month, 33% off)
    },
    limits: {
      products: 300,
      orders: 10000,
      teamMembers: 3,
      customers: 10000,
      aiTokens: 50000,
      whatsappMessages: 1000,
      automationRules: 20,
      credits: 5000,
      templates: 2,
      dashboardMetrics: 10,
      customReports: true,
      apiAccess: true,
      customDomains: true,
      prioritySupport: false,
      removeBranding: true,
      advancedAnalytics: true,
      industryDashboards: true,
      mergedIndustryDashboard: false,
      visualWorkflowBuilder: false,
    },
    features: [
      FEATURES.basic_dashboard,
      FEATURES.paystack_payments,
      FEATURES.csv_import,
      FEATURES.basic_analytics,
      FEATURES.advanced_analytics,
      FEATURES.accounting,
      FEATURES.multi_store,
      FEATURES.api_access,
      FEATURES.webhooks,
      FEATURES.industry_dashboards,
      FEATURES.custom_domain,
      FEATURES.remove_branding,
      FEATURES.automation,
      FEATURES.custom_integrations,
      FEATURES.financial_charts,
      FEATURES.ai_autopilot,
    ],
    recommended: true,
  },
  
  PRO_PLUS: {
    tier: 'PRO_PLUS',
    name: 'Pro+',
    tagline: 'Maximum power and flexibility',
    description: 'Unlimited access to all features',
    pricing: {
      monthly: 50000, // ₦50,000
      quarterly: 120000, // ₦120,000 (₦40k/month, 20% off)
      annual: 400000, // ₦400,000 (₦33.3k/month, 33% off)
    },
    limits: {
      products: 500,
      orders: -1, // Unlimited
      teamMembers: 5,
      customers: -1,
      aiTokens: 200000,
      whatsappMessages: 10000,
      automationRules: -1,
      credits: 25000,
      templates: 5,
      dashboardMetrics: -1,
      customReports: true,
      apiAccess: true,
      customDomains: true,
      prioritySupport: true,
      removeBranding: true,
      advancedAnalytics: true,
      industryDashboards: true,
      mergedIndustryDashboard: true,
      visualWorkflowBuilder: true,
    },
    features: [
      FEATURES.basic_dashboard,
      FEATURES.paystack_payments,
      FEATURES.csv_import,
      FEATURES.basic_analytics,
      FEATURES.advanced_analytics,
      FEATURES.accounting,
      FEATURES.multi_store,
      FEATURES.priority_support,
      FEATURES.api_access,
      FEATURES.webhooks,
      FEATURES.industry_dashboards,
      FEATURES.merged_industry_dashboard,
      FEATURES.visual_workflow_builder,
      FEATURES.custom_domain,
      FEATURES.remove_branding,
      FEATURES.automation,
      FEATURES.custom_integrations,
      FEATURES.financial_charts,
      FEATURES.ai_autopilot,
    ],
  },
};

// Helper functions
export function getPlanByTier(tier: SubscriptionTier): SubscriptionPlan {
  return PLANS[tier];
}

export function getPlanPrice(
  tier: SubscriptionTier,
  billingCycle: BillingCycle = 'monthly'
): number {
  const plan = PLANS[tier];
  if (!plan) return 0;
  
  switch (billingCycle) {
    case 'quarterly':
      return plan.pricing.quarterly;
    case 'monthly':
    default:
      return plan.pricing.monthly;
  }
}

export function formatCurrency(amount: number, currency: string = 'NGN'): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateSavings(
  tier: SubscriptionTier,
  billingCycle: BillingCycle
): number {
  const plan = PLANS[tier];
  if (!plan) return 0;
  
  if (billingCycle === 'quarterly') {
    return (plan.pricing.monthly * 3) - plan.pricing.quarterly;
  }
  
  return 0;
}

export function getFeaturesByCategory(
  tier: SubscriptionTier
): Record<string, PlanFeature[]> {
  const plan = PLANS[tier];
  if (!plan) return {};
  
  const categories: Record<string, PlanFeature[]> = {};
  
  plan.features.forEach((feature) => {
    if (!categories[feature.category]) {
      categories[feature.category] = [];
    }
    categories[feature.category].push(feature);
  });
  
  return categories;
}

export function isFeatureAvailable(
  tier: SubscriptionTier,
  featureKey: string
): boolean {
  const plan = PLANS[tier];
  if (!plan) return false;
  
  return plan.features.some((f) => f.key === featureKey);
}

export function comparePlans(tiers: SubscriptionTier[]) {
  return tiers.map((tier) => ({
    tier,
    plan: PLANS[tier],
    features: getFeaturesByCategory(tier),
  }));
}
