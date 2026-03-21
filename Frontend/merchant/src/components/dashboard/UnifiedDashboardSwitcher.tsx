// @ts-nocheck
/**
 * Unified Pro Dashboard Switcher
 * Allows seamless switching between different dashboard views with industry adaptation
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard,
  Store,
  ChartLine,
  Megaphone,
  Wrench,
  Users,
  ShoppingCart,
  Package,
  ArrowRight
} from '@phosphor-icons/react';
import { useStore } from '@/providers/store-provider';
import { getIndustryConfig } from '@/lib/utils/industry-adaptation';
import { ThemedCard, getThemeColors } from '@/lib/design-system/theme-components';

interface DashboardOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  isPro?: boolean;
  industrySpecific?: boolean;
}

export function UnifiedDashboardSwitcher() {
  const { store } = useStore();
  const industry = store?.industrySlug || 'retail';
  const industryConfig = getIndustryConfig(industry);
  const colors = getThemeColors(industry);
  
  const [activeCategory, setActiveCategory] = useState('business');

  const categories = [
    { id: 'business', label: 'Business Operations' },
    { id: 'marketing', label: 'Marketing & Growth' },
    { id: 'analytics', label: 'Analytics & Insights' }
  ];

  const dashboardOptions: Record<string, DashboardOption[]> = {
    business: [
      {
        id: 'overview',
        title: `${industryConfig.displayName} Dashboard`,
        description: 'Main business overview with key metrics',
        icon: <LayoutDashboard className="h-6 w-6" />,
        path: '/dashboard',
        isPro: false,
        industrySpecific: true
      },
      {
        id: 'control-center',
        title: 'Control Center',
        description: 'Manage all business operations and settings',
        icon: <Wrench className="h-6 w-6" />,
        path: '/dashboard/control-center',
        isPro: false
      },
      {
        id: 'control-center-pro',
        title: 'Control Center Pro',
        description: 'Advanced control center with AI insights',
        icon: <Wrench className="h-6 w-6" />,
        path: '/dashboard/control-center/pro',
        isPro: true
      },
      {
        id: 'products',
        title: `${industryConfig.primaryObject.replace(/_/g, " ")} Management`,
        description: `Manage your ${industryConfig.primaryObject.replace(/_/g, " ").toLowerCase()} catalog`,
        icon: <Package className="h-6 w-6" />,
        path: `/dashboard/${industryConfig.primaryObject}s`,
        industrySpecific: true
      }
    ],
    marketing: [
      {
        id: 'marketing-hub',
        title: 'Marketing Hub',
        description: 'Campaign management and marketing tools',
        icon: <Megaphone className="h-6 w-6" />,
        path: '/dashboard/marketing',
        isPro: false
      },
      {
        id: 'marketing-pro',
        title: 'Marketing Pro',
        description: 'Advanced marketing with automation and AI',
        icon: <Megaphone className="h-6 w-6" />,
        path: '/dashboard/marketing/pro',
        isPro: true
      },
      {
        id: 'automation',
        title: 'Marketing Automation',
        description: 'Automated workflows and campaigns',
        icon: <ChartLine className="h-6 w-6" />,
        path: '/dashboard/marketing/automation'
      },
      {
        id: 'customers',
        title: 'Customer Management',
        description: 'Manage customer relationships and segmentation',
        icon: <Users className="h-6 w-6" />,
        path: '/dashboard/customers'
      }
    ],
    analytics: [
      {
        id: 'analytics',
        title: 'Business Analytics',
        description: 'Detailed performance metrics and insights',
        icon: <ChartLine className="h-6 w-6" />,
        path: '/dashboard/analytics'
      },
      {
        id: 'reports',
        title: 'Reports & Export',
        description: 'Generate reports and export data',
        icon: <LayoutDashboard className="h-6 w-6" />,
        path: '/dashboard/reports'
      },
      {
        id: 'ai-insights',
        title: 'AI Insights',
        description: 'AI-powered business recommendations',
        icon: <ChartLine className="h-6 w-6" />,
        path: '/dashboard/ai-insights',
        isPro: true
      }
    ]
  };

  return (
    <ThemedCard industry={industry} className="p-6">
      <div className="space-y-6">
        {/* Category Navigation */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeCategory === category.id
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Dashboard Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dashboardOptions[activeCategory].map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={option.path}>
                <div 
                  className="group p-5 border border-gray-100 rounded-xl hover:shadow-lg transition-all cursor-pointer h-full flex flex-col"
                  style={{
                    borderColor: option.isPro ? `${colors.primary}40` : undefined,
                    backgroundColor: option.isPro ? `${colors.primary}05` : undefined
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div 
                      className="p-3 rounded-xl"
                      style={{ 
                        backgroundColor: option.isPro 
                          ? `${colors.primary}15` 
                          : `${colors.secondary}15` 
                      }}
                    >
                      {option.icon}
                    </div>
                    {option.isPro && (
                      <span 
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: `${colors.primary}20`,
                          color: colors.primary
                        }}
                      >
                        PRO
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2 group-hover:text-green-500 transition-colors">
                      {option.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {option.description}
                    </p>
                    
                    {option.industrySpecific && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs">
                        <Store className="h-3 w-3" />
                        Industry-Specific
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <span 
                      className="text-sm font-medium group-hover:text-green-500 transition-colors"
                      style={{ color: option.isPro ? colors.primary : undefined }}
                    >
                      Open Dashboard
                    </span>
                    <ArrowRight 
                      className="h-4 w-4 text-gray-500 group-hover:text-green-500 transition-colors"
                      style={{ color: option.isPro ? colors.primary : undefined }}
                    />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick Access Footer */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Switch between different dashboard views for your {industryConfig.displayName.toLowerCase()} business
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: colors.primary }}
              />
              <span>Pro Features Available</span>
            </div>
          </div>
        </div>
      </div>
    </ThemedCard>
  );
}