/**
 * Marketing Pro Dashboard
 * Industry-adaptive marketing hub with automation and analytics
 */

'use client';

import { useStore } from '@/providers/store-provider';
import { UniversalProDashboardV2 } from '@/components/dashboard-v2/UniversalProDashboardV2';
import { getIndustryConfig } from '@/lib/utils/industry-adaptation';
import { Megaphone } from '@phosphor-icons/react';

export default function MarketingProPage() {
  const { store } = useStore();
  const industry = store?.industrySlug || 'retail';
  const industryConfig = getIndustryConfig(industry);

  return (
    <UniversalProDashboardV2 
      industry={industry}
      title={`${industryConfig.displayName} Marketing Hub`}
      subtitle="Create campaigns, automate workflows, and track marketing performance"
      icon={<Megaphone className="h-8 w-8" />}
      showAiAssistant={true}
      showQuickActions={true}
      quickActions={[
        {
          id: 'campaigns',
          title: 'Campaign Manager',
          description: 'Create and manage marketing campaigns',
          icon: 'Megaphone',
          href: '/dashboard/marketing/campaigns',
          color: 'primary'
        },
        {
          id: 'automation',
          title: 'Marketing Automation',
          description: 'Set up automated workflows and sequences',
          icon: 'Zap',
          href: '/dashboard/marketing/automation',
          color: 'secondary'
        },
        {
          id: 'analytics',
          title: 'Performance Analytics',
          description: 'Track campaign performance and ROI',
          icon: 'ChartLine',
          href: '/dashboard/analytics',
          color: 'accent'
        },
        {
          id: 'audience',
          title: 'Audience Segmentation',
          description: 'Manage customer segments and targeting',
          icon: 'Users',
          href: '/dashboard/customers',
          color: 'primary'
        },
        {
          id: 'templates',
          title: 'Marketing Templates',
          description: 'Email, social media, and content templates',
          icon: 'Target',
          href: '/dashboard/marketing/templates',
          color: 'secondary'
        },
        {
          id: 'ab-tests',
          title: 'A/B Testing',
          description: 'Run experiments and optimize campaigns',
          icon: 'Flask',
          href: '/dashboard/ab-testing',
          color: 'accent'
        }
      ]}
    />
  );
}