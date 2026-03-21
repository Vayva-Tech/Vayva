// @ts-nocheck
import { useIndustryAccess } from '@/hooks/use-industry-access';
import type { PlanTier } from '@/lib/access-control/tier-limits';

/**
 * Navigation Item Interface
 */
export interface NavItem {
  id: string;
  title: string;
  href: string;
  icon?: string;
  badge?: string;
  requiredTier?: PlanTier;
  feature?: string;
  children?: NavItem[];
  separator?: boolean;
}

/**
 * Navigation Filtering Service
 * 
 * Filters navigation items based on user's subscription tier and feature access
 */

export class NavigationFilter {
  /**
   * Filter navigation items based on user's tier and feature access
   */
  static filterNavigation(items: NavItem[]): NavItem[] {
    const { currentTier, canAccessIndustryDashboards, canUseAI } = useIndustryAccess();
    
    const tierHierarchy: Record<PlanTier, number> = {
      'FREE': 0,
      'STARTER': 1,
      'PRO': 2
    };

    const currentTierLevel = tierHierarchy[currentTier];

    const filterItem = (item: NavItem): NavItem | null => {
      // Check tier requirements
      if (item.requiredTier && tierHierarchy[item.requiredTier] > currentTierLevel) {
        return null;
      }

      // Check specific feature access
      if (item.feature) {
        switch (item.feature) {
          case 'industryDashboards':
            if (!canAccessIndustryDashboards) return null;
            break;
          case 'aiFeatures':
            if (!canUseAI) return null;
            break;
          // Add more feature checks as needed
        }
      }

      // Process children recursively
      if (item.children) {
        const filteredChildren = item.children
          .map(filterItem)
          .filter((child): child is NavItem => child !== null);

        if (filteredChildren.length === 0 && !item.href) {
          return null; // Remove parent if no children remain
        }

        return {
          ...item,
          children: filteredChildren
        };
      }

      return item;
    };

    return items
      .map(filterItem)
      .filter((item): item is NavItem => item !== null);
  }

  /**
   * Add upgrade badges to restricted items
   */
  static addUpgradeBadges(items: NavItem[], currentTier: PlanTier): NavItem[] {
    const getNextTier = (tier: PlanTier): PlanTier | null => {
      const tierOrder: PlanTier[] = ['FREE', 'STARTER', 'PRO'];
      const currentIndex = tierOrder.indexOf(tier);
      return currentIndex < tierOrder.length - 1 ? tierOrder[currentIndex + 1] : null;
    };

    const processItem = (item: NavItem): NavItem => {
      // Add upgrade badge for items that require higher tier
      if (item.requiredTier && item.requiredTier !== currentTier) {
        const nextTier = getNextTier(currentTier);
        if (nextTier === item.requiredTier) {
          return {
            ...item,
            badge: `Upgrade to ${item.requiredTier}`
          };
        }
      }

      // Process children
      if (item.children) {
        return {
          ...item,
          children: item.children.map(processItem)
        };
      }

      return item;
    };

    return items.map(processItem);
  }

  /**
   * Get available industry dashboard routes for current tier
   */
  static getAvailableIndustries(currentTier: PlanTier): string[] {
    const { canAccessIndustryDashboards } = useIndustryAccess();
    
    if (!canAccessIndustryDashboards) {
      return []; // Free users get no industry dashboards
    }

    // List of all available industries
    const allIndustries = [
      'retail', 'fashion', 'electronics', 'grocery', 'one_product',
      'food', 'restaurant', 'services', 'real_estate', 'events',
      'automotive', 'wholesale', 'nightlife', 'nonprofit', 'petcare',
      'realestate', 'blog', 'creative', 'education', 'healthcare',
      'legal', 'saas', 'marketplace', 'travel_hospitality', 'fitness',
      'jobs', 'hotel', 'salon', 'spa', 'catering'
    ];

    return allIndustries;
  }

  /**
   * Generate tier-specific navigation configuration
   */
  static getTierNavigationConfig(currentTier: PlanTier): NavItem[] {
    const baseNavigation: NavItem[] = [
      {
        id: 'dashboard',
        title: 'Dashboard',
        href: '/dashboard',
        icon: 'LayoutDashboard'
      },
      {
        id: 'analytics',
        title: 'Analytics',
        href: '/dashboard/analytics',
        icon: 'BarChart3'
      },
      {
        id: 'products',
        title: 'Products',
        href: '/dashboard/products',
        icon: 'Package'
      },
      {
        id: 'orders',
        title: 'Orders',
        href: '/dashboard/orders',
        icon: 'ShoppingCart'
      },
      {
        id: 'customers',
        title: 'Customers',
        href: '/dashboard/customers',
        icon: 'Users'
      }
    ];

    // Add tier-specific items
    const tierSpecificItems: Record<PlanTier, NavItem[]> = {
      'FREE': [
        {
          id: 'upgrade-cta',
          title: 'Upgrade to Starter',
          href: '/dashboard/billing',
          icon: 'Rocket',
          badge: '14-day trial'
        }
      ],
      'STARTER': [
        {
          id: 'industry-dashboards',
          title: 'Industry Dashboards',
          href: '/dashboard/industries',
          icon: 'Building2',
          requiredTier: 'STARTER',
          feature: 'industryDashboards'
        },
        {
          id: 'ai-tools',
          title: 'AI Tools',
          href: '/dashboard/ai',
          icon: 'Brain',
          requiredTier: 'STARTER',
          feature: 'aiFeatures'
        },
        {
          id: 'upgrade-cta',
          title: 'Upgrade to Pro',
          href: '/dashboard/billing',
          icon: 'Crown',
          badge: 'Get unlimited access'
        }
      ],
      'PRO': [
        {
          id: 'industry-dashboards',
          title: 'Industry Dashboards',
          href: '/dashboard/industries',
          icon: 'Building2',
          feature: 'industryDashboards'
        },
        {
          id: 'ai-tools',
          title: 'AI Tools',
          href: '/dashboard/ai',
          icon: 'Brain',
          feature: 'aiFeatures'
        },
        {
          id: 'advanced-analytics',
          title: 'Advanced Analytics',
          href: '/dashboard/advanced-analytics',
          icon: 'ChartLine',
          requiredTier: 'PRO'
        },
        {
          id: 'api-access',
          title: 'API Access',
          href: '/dashboard/api',
          icon: 'Code',
          requiredTier: 'PRO'
        }
      ]
    };

    return [...baseNavigation, ...tierSpecificItems[currentTier]];
  }
}

// Export hook for easy usage
export function useFilteredNavigation(baseNavigation: NavItem[]): NavItem[] {
  const { currentTier } = useIndustryAccess();
  
  const filtered = NavigationFilter.filterNavigation(baseNavigation);
  return NavigationFilter.addUpgradeBadges(filtered, currentTier);
}

// Export utility functions
export function useAvailableIndustries(): string[] {
  const { currentTier } = useIndustryAccess();
  return NavigationFilter.getAvailableIndustries(currentTier);
}

export function useTierNavigation(): NavItem[] {
  const { currentTier } = useIndustryAccess();
  return NavigationFilter.getTierNavigationConfig(currentTier);
}