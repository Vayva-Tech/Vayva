// @ts-nocheck
/**
 * Control Center Pro Dashboard
 * Industry-adaptive dashboard for all business operations and settings
 */

'use client';

import { useStore } from '@/providers/store-provider';
import { UniversalProDashboardV2 } from '@/components/dashboard-v2/UniversalProDashboardV2';
import { getIndustryConfig } from '@/lib/utils/industry-adaptation';
import { Layout } from '@phosphor-icons/react';

export default function ControlCenterProPage() {
  const { store } = useStore();
  const industry = store?.industrySlug || 'retail';
  const industryConfig = getIndustryConfig(industry);

  return (
    <UniversalProDashboardV2 
      industry={industry}
      title={`${industryConfig.displayName} Control Center`}
      subtitle="Manage all aspects of your business operations with industry-specific insights"
      icon={<Layout className="h-8 w-8" />}
      showAiAssistant={true}
      showQuickActions={true}
      quickActions={[
        {
          id: 'products',
          title: `${industryConfig.primaryObject.replace(/_/g, " ")} Management`,
          description: `Manage your ${industryConfig.primaryObject.replace(/_/g, " ").toLowerCase()} catalog`,
          icon: 'Package',
          href: `/dashboard/${industryConfig.primaryObject}s`,
          color: 'primary'
        },
        {
          id: 'orders',
          title: industryConfig.hasOrders ? 'Order Processing' : 'Transaction Management',
          description: industryConfig.hasOrders ? 'Handle orders and fulfillment' : 'Manage transactions',
          icon: 'ShoppingCart',
          href: '/dashboard/orders',
          color: 'secondary'
        },
        {
          id: 'customers',
          title: 'Customer Database',
          description: 'Manage customer relationships',
          icon: 'Users',
          href: '/dashboard/customers',
          color: 'accent'
        },
        {
          id: 'analytics',
          title: 'Business Analytics',
          description: 'Track performance metrics',
          icon: 'ChartLine',
          href: '/dashboard/analytics',
          color: 'primary'
        },
        {
          id: 'marketing',
          title: 'Marketing Campaigns',
          description: 'Create and track campaigns',
          icon: 'Megaphone',
          href: '/dashboard/marketing',
          color: 'secondary'
        },
        {
          id: 'settings',
          title: 'Store Settings',
          description: 'Configure your store preferences',
          icon: 'Gear',
          href: '/dashboard/settings/profile',
          color: 'accent'
        }
      ]}
    />
  );
}