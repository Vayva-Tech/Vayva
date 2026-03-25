/**
 * Enhanced Pro Dashboard Navigation
 * Industry-adaptive sidebar with all dashboard routes
 */
'use client';

import { Button } from "@vayva/ui";
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Building,
  Megaphone,
  ChartLine,
  GearSix as Settings,
  Wrench,
  Package,
  ShoppingCart,
  Users,
  Lightning as Zap,
  Flask,
  Sparkle as Sparkles,
  FileText,
  CreditCard,
  Storefront as Store,
  Plug,
  CaretDown as ChevronDown,
  CaretRight as ChevronRight,
  SquaresFour as LayoutDashboard
} from '@phosphor-icons/react';
import { useStore } from '@/providers/store-provider';
import { getThemeColors } from '@/lib/design-system/theme-components';
import { 
  DASHBOARD_ROUTES, 
  NAVIGATION_CATEGORIES, 
  getRoutesByCategory,
  getAdaptedRouteTitle
} from '@/config/dashboard-routes';
import { INDUSTRY_CONFIG } from '@/config/industry';
import type { IndustrySlug } from '@/lib/templates/types';

interface NavItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  href: string;
  isActive: boolean;
  isPro?: boolean;
  children?: NavItem[];
}

export function ProDashboardNavigation() {
  const pathname = usePathname();
  const { store } = useStore();
  const industry = (store?.industrySlug || 'retail') as IndustrySlug;
  const industryConfig = (INDUSTRY_CONFIG as any)[industry] ?? (INDUSTRY_CONFIG as any).retail;
  const colors = getThemeColors(industry);
  const isProUser = true; // Assuming pro access for this component
  
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    business: true,
    marketing: true
  });

  // Get icon component by name
  const getIcon = (iconName: string, size: number = 20) => {
    const iconProps = { className: `h-${size/4} w-${size/4}` };
    
    switch (iconName) {
      case 'LayoutDashboard': return <LayoutDashboard {...iconProps} />;
      case 'Building': return <Building {...iconProps} />;
      case 'Megaphone': return <Megaphone {...iconProps} />;
      case 'ChartLine': return <ChartLine {...iconProps} />;
      case 'Settings': return <Settings {...iconProps} />;
      case 'Wrench': return <Wrench {...iconProps} />;
      case 'Package': return <Package {...iconProps} />;
      case 'ShoppingCart': return <ShoppingCart {...iconProps} />;
      case 'Users': return <Users {...iconProps} />;
      case 'Zap': return <Zap {...iconProps} />;
      case 'Flask': return <Flask {...iconProps} />;
      case 'Sparkles': return <Sparkles {...iconProps} />;
      case 'FileText': return <FileText {...iconProps} />;
      case 'CreditCard': return <CreditCard {...iconProps} />;
      case 'Store': return <Store {...iconProps} />;
      case 'Plug': return <Plug {...iconProps} />;
      default: return <LayoutDashboard {...iconProps} />;
    }
  };

  const getIndustryModuleLinks = () => {
    const moduleRoutes: Record<string, any> | undefined = (industryConfig as any)?.moduleRoutes;
    if (!moduleRoutes) return [];

    const moduleLabels: Record<string, string> | undefined = (industryConfig as any)?.moduleLabels;
    const moduleIcons: Record<string, string> | undefined = (industryConfig as any)?.moduleIcons;

    return Object.entries(moduleRoutes)
      .map(([moduleKey, cfg]) => {
        const path = cfg?.index;
        if (typeof path !== 'string' || !path.startsWith('/dashboard')) return null;
        return {
          id: `industry-module:${moduleKey}`,
          title: moduleLabels?.[moduleKey] ?? moduleKey.replace(/_/g, ' '),
          icon: getIcon(moduleIcons?.[moduleKey] ?? 'LayoutDashboard'),
          href: path,
          isActive: pathname === path,
          isPro: false,
        } satisfies NavItem;
      })
      .filter(Boolean) as NavItem[];
  };

  // Build navigation structure
  const navigationStructure = NAVIGATION_CATEGORIES.map(category => {
    const routes = getRoutesByCategory(industry, isProUser)[category.id] || [];
    const industryModuleLinks =
      category.id === 'business' ? getIndustryModuleLinks() : [];
    
    return {
      id: category.id,
      title: category.label,
      icon: getIcon(category.icon),
      isExpanded: expandedCategories[category.id] ?? true,
      items: [
        ...industryModuleLinks,
        ...routes.map(route => ({
        id: route.id,
        title: getAdaptedRouteTitle(route.id, industry),
        icon: getIcon(route.icon),
        href: route.path,
        isActive: pathname === route.path,
        isPro: route.requiresPro
        }))
      ]
    };
  });

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  return (
    <div className="w-80 bg-white border-r border-gray-100 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${colors.primary}15` }}
          >
            <Building 
              className="h-6 w-6" 
              style={{ color: colors.primary }} 
            />
          </div>
          <div>
            <h2 className="font-semibold text-lg">{industryConfig.displayName}</h2>
            <p className="text-sm text-gray-500">Pro Dashboard</p>
          </div>
        </div>
        
        {/* Industry Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
          <Store className="h-4 w-4 text-gray-500" />
          <span className="text-xs font-medium text-gray-500">
            {industryConfig.displayName} Mode
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {navigationStructure.map((category) => (
          <div key={category.id} className="space-y-1">
            {/* Category Header */}
            <Button
              onClick={() => toggleCategory(category.id)}
              className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                {category.icon}
                {category.title}
              </div>
              {category.isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>

            {/* Category Items */}
            {category.isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="ml-2 space-y-1"
              >
                {category.items.map((item) => (
                  <Link key={item.id} href={item.href}>
                    <div
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                        item.isActive
                          ? 'bg-green-500 text-white shadow-sm'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                      } ${item.isPro ? 'border border-green-500/20' : ''}`}
                    >
                      {item.icon}
                      <span className="flex-1 truncate">{item.title}</span>
                      {item.isPro && (
                        <span 
                          className="px-1.5 py-0.5 rounded text-xs font-medium"
                          style={{ 
                            backgroundColor: item.isActive ? 'rgba(255,255,255,0.2)' : `${colors.primary}20`,
                            color: item.isActive ? 'white' : colors.primary
                          }}
                        >
                          PRO
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </motion.div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <div className="space-y-3">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-gray-100 rounded-lg text-center">
              <p className="text-xs text-gray-500">Today's Revenue</p>
              <p className="font-semibold text-green-500">₦0</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg text-center">
              <p className="text-xs text-gray-500">Active Orders</p>
              <p className="font-semibold text-secondary">0</p>
            </div>
          </div>

          {/* Upgrade Prompt (if not enterprise) */}
          <div className="p-3 bg-gradient-to-r from-green-500/10 to-accent/10 rounded-lg border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-green-500">Pro Features</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Unlock advanced analytics, AI insights, and automation tools.
            </p>
            <Button className="w-full py-1.5 px-3 bg-green-500 text-white rounded text-xs font-medium hover:opacity-90 transition-opacity">
              Upgrade Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}