/**
 * Feature Flags Configuration
 * 
 * Feature flags, A/B tests, and rollout percentages
 */

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage?: number; // 0-100
  environments?: ('development' | 'staging' | 'production')[];
  plans?: ('starter' | 'pro' | 'pro_plus')[];
}

/**
 * Feature flags registry
 */
export const FEATURE_FLAGS: Record<string, FeatureFlag> = {
  // Dashboard Features
  'dashboard-v2': {
    id: 'dashboard-v2',
    name: 'Dashboard V2',
    description: 'New dashboard design with improved UX',
    enabled: true,
    rolloutPercentage: 100,
    environments: ['development', 'staging', 'production'],
  },
  
  'realtime-analytics': {
    id: 'realtime-analytics',
    name: 'Real-time Analytics',
    description: 'Live analytics updates via WebSocket',
    enabled: true,
    rolloutPercentage: 100,
    plans: ['pro', 'pro_plus'],
  },
  
  'ai-insights': {
    id: 'ai-insights',
    name: 'AI Insights',
    description: 'AI-powered business insights and recommendations',
    enabled: true,
    rolloutPercentage: 100,
    plans: ['pro', 'pro_plus'],
  },
  
  'predictive-analytics': {
    id: 'predictive-analytics',
    name: 'Predictive Analytics',
    description: 'Predictive trends and forecasting',
    enabled: false,
    rolloutPercentage: 0,
    plans: ['pro_plus'],
  },
  
  // Onboarding Features
  'onboarding-wizard-v2': {
    id: 'onboarding-wizard-v2',
    name: 'Onboarding Wizard V2',
    description: 'Improved onboarding flow with industry-specific steps',
    enabled: true,
    rolloutPercentage: 100,
  },
  
  'skip-onboarding-steps': {
    id: 'skip-onboarding-steps',
    name: 'Skip Onboarding Steps',
    description: 'Allow Pro+ users to skip optional onboarding steps',
    enabled: true,
    rolloutPercentage: 100,
    plans: ['pro_plus'],
  },
  
  // Product Features
  'bulk-product-editor': {
    id: 'bulk-product-editor',
    name: 'Bulk Product Editor',
    description: 'Edit multiple products at once',
    enabled: true,
    rolloutPercentage: 100,
    plans: ['pro', 'pro_plus'],
  },
  
  'ai-product-descriptions': {
    id: 'ai-product-descriptions',
    name: 'AI Product Descriptions',
    description: 'Generate product descriptions with AI',
    enabled: true,
    rolloutPercentage: 50,
    plans: ['pro', 'pro_plus'],
  },
  
  // Order Features
  'auto-order-approval': {
    id: 'auto-order-approval',
    name: 'Auto Order Approval',
    description: 'Automatically approve low-risk orders',
    enabled: false,
    rolloutPercentage: 0,
  },
  
  'kitchen-display-system': {
    id: 'kitchen-display-system',
    name: 'Kitchen Display System',
    description: 'KDS for food preparation tracking',
    enabled: true,
    rolloutPercentage: 100,
  },
  
  // Marketing Features
  'email-campaigns': {
    id: 'email-campaigns',
    name: 'Email Campaigns',
    description: 'Create and send email marketing campaigns',
    enabled: true,
    rolloutPercentage: 100,
    plans: ['pro', 'pro_plus'],
  },
  
  'sms-marketing': {
    id: 'sms-marketing',
    name: 'SMS Marketing',
    description: 'SMS campaign management',
    enabled: false,
    rolloutPercentage: 25,
    plans: ['pro_plus'],
  },
  
  // Customer Features
  'customer-segmentation': {
    id: 'customer-segmentation',
    name: 'Customer Segmentation',
    description: 'Advanced customer grouping and targeting',
    enabled: true,
    rolloutPercentage: 100,
    plans: ['pro', 'pro_plus'],
  },
  
  'loyalty-program': {
    id: 'loyalty-program',
    name: 'Loyalty Program',
    description: 'Customer loyalty and rewards system',
    enabled: false,
    rolloutPercentage: 10,
    plans: ['pro_plus'],
  },
  
  // Inventory Features
  'low-stock-alerts': {
    id: 'low-stock-alerts',
    name: 'Low Stock Alerts',
    description: 'Get notified when inventory is low',
    enabled: true,
    rolloutPercentage: 100,
  },
  
  'expiry-tracking': {
    id: 'expiry-tracking',
    name: 'Expiry Tracking',
    description: 'Track product expiration dates',
    enabled: true,
    rolloutPercentage: 100,
  },
  
  // Payment Features
  'split-payments': {
    id: 'split-payments',
    name: 'Split Payments',
    description: 'Accept partial payments',
    enabled: false,
    rolloutPercentage: 0,
  },
  
  'buy-now-pay-later': {
    id: 'buy-now-pay-later',
    name: 'Buy Now Pay Later',
    description: 'BNPL integration',
    enabled: false,
    rolloutPercentage: 0,
  },
};

/**
 * Check if feature is enabled
 */
export function isFeatureEnabled(
  featureId: string,
  context?: {
    environment?: string;
    plan?: 'starter' | 'pro' | 'pro_plus';
  }
): boolean {
  const flag = FEATURE_FLAGS[featureId];
  
  if (!flag || !flag.enabled) {
    return false;
  }
  
  // Check environment
  if (context?.environment && flag.environments) {
    if (!flag.environments.includes(context.environment as never)) {
      return false;
    }
  }
  
  // Check plan access
  if (context?.plan && flag.plans) {
    if (!flag.plans.includes(context.plan)) {
      return false;
    }
  }
  
  // Check rollout percentage (simple check - in production would use user ID for consistency)
  if (flag.rolloutPercentage !== undefined && flag.rolloutPercentage < 100) {
    const random = Math.random() * 100;
    return random < flag.rolloutPercentage;
  }
  
  return true;
}

/**
 * Get all enabled features
 */
export function getEnabledFeatures(context?: {
  environment?: string;
  plan?: 'starter' | 'pro' | 'pro_plus';
}): string[] {
  return Object.keys(FEATURE_FLAGS).filter(id => 
    isFeatureEnabled(id, context)
  );
}
