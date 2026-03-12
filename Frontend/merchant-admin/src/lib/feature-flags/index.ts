/**
 * Feature Flag System
 * Dynamic feature enabling/disabling based on plan tiers and conditions
 */

export type FeatureFlag = 
  | 'products_unlimited'
  | 'advanced_analytics'
  | 'custom_domains'
  | 'api_access'
  | 'priority_support'
  | 'multi_store'
  | 'automation_rules'
  | 'custom_reports'
  | 'remove_branding'
  | 'team_collaboration';

export interface FeatureConfig {
  key: FeatureFlag;
  name: string;
  description: string;
  enabledForTiers: ('FREE' | 'STARTER' | 'PRO')[];
  requiresCondition?: (context: any) => boolean;
}

export const FEATURE_FLAGS: FeatureConfig[] = [
  {
    key: 'products_unlimited',
    name: 'Unlimited Products',
    description: 'Add unlimited products to your catalog',
    enabledForTiers: ['PRO']
  },
  {
    key: 'advanced_analytics',
    name: 'Advanced Analytics',
    description: 'Access detailed business insights and reports',
    enabledForTiers: ['STARTER', 'PRO']
  },
  {
    key: 'custom_domains',
    name: 'Custom Domains',
    description: 'Use your own domain name for your store',
    enabledForTiers: ['STARTER', 'PRO']
  },
  {
    key: 'api_access',
    name: 'API Access',
    description: 'Programmatic access to your store data',
    enabledForTiers: ['PRO']
  },
  {
    key: 'priority_support',
    name: 'Priority Support',
    description: 'Get faster response times from our support team',
    enabledForTiers: ['PRO']
  },
  {
    key: 'multi_store',
    name: 'Multi-Store Management',
    description: 'Manage multiple stores from one dashboard',
    enabledForTiers: ['PRO']
  },
  {
    key: 'automation_rules',
    name: 'Automation Rules',
    description: 'Create custom automation workflows',
    enabledForTiers: ['STARTER', 'PRO']
  },
  {
    key: 'custom_reports',
    name: 'Custom Reports',
    description: 'Create and schedule custom business reports',
    enabledForTiers: ['PRO']
  },
  {
    key: 'remove_branding',
    name: 'Remove Branding',
    description: 'Remove Vayva branding from your storefront',
    enabledForTiers: ['STARTER', 'PRO']
  },
  {
    key: 'team_collaboration',
    name: 'Team Collaboration',
    description: 'Invite team members and manage permissions',
    enabledForTiers: ['STARTER', 'PRO']
  }
];

export class FeatureFlags {
  private static instance: FeatureFlags;
  private flags: Map<string, boolean> = new Map();

  private constructor() {}

  static getInstance(): FeatureFlags {
    if (!FeatureFlags.instance) {
      FeatureFlags.instance = new FeatureFlags();
    }
    return FeatureFlags.instance;
  }

  /**
   * Initialize feature flags based on user's plan tier
   */
  initialize(tier: 'FREE' | 'STARTER' | 'PRO'): void {
    this.flags.clear();
    
    FEATURE_FLAGS.forEach(flag => {
      const isEnabled = flag.enabledForTiers.includes(tier);
      this.flags.set(flag.key, isEnabled);
    });
  }

  /**
   * Check if a feature is enabled
   */
  isEnabled(feature: FeatureFlag): boolean {
    return this.flags.get(feature) || false;
  }

  /**
   * Enable a feature (override default behavior)
   */
  enable(feature: FeatureFlag): void {
    this.flags.set(feature, true);
  }

  /**
   * Disable a feature (override default behavior)
   */
  disable(feature: FeatureFlag): void {
    this.flags.set(feature, false);
  }

  /**
   * Get all enabled features
   */
  getEnabledFeatures(): FeatureFlag[] {
    return Array.from(this.flags.entries())
      .filter(([_, enabled]) => enabled)
      .map(([feature]) => feature as FeatureFlag);
  }

  /**
   * Get feature configuration
   */
  getFeatureConfig(feature: FeatureFlag): FeatureConfig | undefined {
    return FEATURE_FLAGS.find(f => f.key === feature);
  }
}

/**
 * Higher-order component for feature flag gating
 */
export function withFeatureFlag<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  feature: FeatureFlag,
  fallback?: React.ReactNode
) {
  return function FeatureFlaggedComponent(props: P) {
    const featureFlags = FeatureFlags.getInstance();
    
    if (!featureFlags.isEnabled(feature)) {
      return fallback || (
        <div className="p-8 text-center">
          <h3 className="text-lg font-medium mb-2">Feature Not Available</h3>
          <p className="text-muted-foreground">
            This feature requires a higher plan tier.
          </p>
        </div>
      );
    }
    
    return <WrappedComponent {...props} />;
  };
}