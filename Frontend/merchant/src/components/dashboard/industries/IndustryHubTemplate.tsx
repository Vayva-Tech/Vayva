/**
 * Industry Hub Page Template - Master Pattern
 * 
 * This is the MAIN dashboard page for each industry that shows:
 * 1. Breadcrumb navigation with full hierarchy
 * 2. Sidebar navigation with industry-specific subpages
 * 3. Main dashboard content area with modular widgets
 * 
 * Usage: Copy this pattern for each industry, customizing:
 * - industry name and branding
 * - sidebar navigation items (subpages)
 * - metrics and KPIs
 * - industry-specific modules
 * 
 * @example
 * /dashboard/restaurant/page.tsx
 * /dashboard/beauty/page.tsx
 * /dashboard/healthcare/page.tsx
 */

"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ErrorBoundary } from "@/components/error-boundary/ErrorBoundary";
import { MetricCard } from "../modules/MetricsModule";
import { TasksModule } from "../modules/TasksModule";
import { AlertsModule } from "../modules/AlertsModule";
import { RevenueChart } from "../modules/ChartsModule";
import { useModuleVisibility } from "@/hooks/useModuleVisibility";
import { FeatureGate } from "@/components/features/FeatureGate";
import type { DashboardPlanTier } from "@/config/dashboard-variants";
import {
  Home,
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  Megaphone,
  BarChart3,
  Settings,
  // Add industry-specific icons
  ChefHat,      // Restaurant
  Scissors,     // Beauty
  Stethoscope,  // Healthcare
  Car,          // Automotive
  GraduationCap,// Education
  Dumbbell,     // Fitness
  // ... etc for each industry
} from "lucide-react";

// ──────────────────────────────────────────────────────────────────────────
// CONFIGURATION: Customize per industry
// ──────────────────────────────────────────────────────────────────────────

interface IndustryHubConfig {
  industry: string;
  displayName: string;
  description: string;
  planTier: DashboardPlanTier;
  designCategory: 'commerce' | 'food-beverage' | 'bookings' | 'content-services';
  
  // Sidebar navigation structure
  sidebarItems: Array<{
    label: string;
    href: string;
    icon: React.ReactNode;
    planTier?: DashboardPlanTier; // Optional: hide based on plan
  }>;
  
  // Metrics to display (customized per industry)
  metrics: Array<{
    label: string;
    value: string | number;
    change: number;
    trend: 'up' | 'down';
    icon: React.ReactNode;
  }>;
}

// ──────────────────────────────────────────────────────────────────────────
// EXAMPLE: Restaurant Industry Configuration
// ──────────────────────────────────────────────────────────────────────────

const restaurantConfig: IndustryHubConfig = {
  industry: 'restaurant',
  displayName: 'Restaurant Operations',
  description: 'Manage orders, kitchen, tables, and staff',
  planTier: 'PRO',
  designCategory: 'food-beverage',
  
  // SIDEBAR NAVIGATION STRUCTURE
  sidebarItems: [
    // CORE PAGES (All industries have these)
    {
      label: 'Dashboard',
      href: '/dashboard/restaurant',
      icon: <Home size={18} />,
    },
    {
      label: 'Orders',
      href: '/dashboard/restaurant/orders',
      icon: <ShoppingCart size={18} />,
    },
    {
      label: 'Inventory',
      href: '/dashboard/restaurant/inventory',
      icon: <Package size={18} />,
    },
    {
      label: 'Customers',
      href: '/dashboard/restaurant/customers',
      icon: <Users size={18} />,
    },
    
    // INDUSTRY-SPECIFIC MODULES
    {
      label: 'KDS (Kitchen)',
      href: '/dashboard/restaurant/kds',
      icon: <ChefHat size={18} />,
      planTier: 'PRO_PLUS', // Only visible to PRO+ plans
    },
    {
      label: 'Table Management',
      href: '/dashboard/restaurant/tables',
      icon: <ShoppingCart size={18} />,
      planTier: 'PRO',
    },
    {
      label: 'Reservations',
      href: '/dashboard/restaurant/reservations',
      icon: <Calendar size={18} />,
      planTier: 'STARTER',
    },
    {
      label: 'Staff',
      href: '/dashboard/restaurant/staff',
      icon: <Users size={18} />,
      planTier: 'STARTER',
    },
    
    // BUSINESS MODULES (Higher tier features)
    {
      label: 'Finance',
      href: '/dashboard/restaurant/finance',
      icon: <DollarSign size={18} />,
      planTier: 'PRO',
    },
    {
      label: 'Marketing',
      href: '/dashboard/restaurant/marketing',
      icon: <Megaphone size={18} />,
      planTier: 'PRO',
    },
    {
      label: 'Analytics',
      href: '/dashboard/restaurant/analytics',
      icon: <BarChart3 size={18} />,
      planTier: 'PRO',
    },
    {
      label: 'Settings',
      href: '/dashboard/restaurant/settings',
      icon: <Settings size={18} />,
      planTier: 'STARTER',
    },
  ],
  
  // INDUSTRY-SPECIFIC METRICS
  metrics: [
    {
      label: 'Active Tickets',
      value: '24',
      change: 12,
      trend: 'up',
      icon: <ChefHat size={16} className="text-emerald-600" />,
    },
    {
      label: 'Table Turnover',
      value: '2.4h',
      change: -8,
      trend: 'down', // Down is GOOD for turnover time
      icon: <Clock size={16} className="text-blue-600" />,
    },
    {
      label: 'Avg Ticket Size',
      value: '₦4,850',
      change: 15,
      trend: 'up',
      icon: <DollarSign size={16} className="text-purple-600" />,
    },
    {
      label: 'Covers Today',
      value: '142',
      change: 22,
      trend: 'up',
      icon: <Users size={16} className="text-orange-600" />,
    },
  ],
};

// ──────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT: Industry Hub Page
// ──────────────────────────────────────────────────────────────────────────

export function IndustryHubTemplate() {
  // Use restaurant as example (replace with your industry config)
  const config = restaurantConfig;
  
  // Get visible modules based on industry and plan
  const { isVisible: showFinance } = useModuleVisibility(
    'finance',
    { industry: config.industry, planTier: config.planTier, enabledFeatures: [] }
  );
  
  const { isVisible: showMarketing } = useModuleVisibility(
    'marketing',
    { industry: config.industry, planTier: config.planTier, enabledFeatures: [] }
  );

  return (
    <ErrorBoundary componentName={`${config.displayName} Hub`}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* ────────────────────────────────────────────────────────────── */}
        {/* BREADCRUMB NAVIGATION */}
        {/* ────────────────────────────────────────────────────────────── */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <Breadcrumbs
            items={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: config.displayName.split(' ')[0], href: `/dashboard/${config.industry}` },
            ]}
          />
        </div>

        {/* ────────────────────────────────────────────────────────────── */}
        {/* TWO-COLUMN LAYOUT: Sidebar + Main Content */}
        {/* ────────────────────────────────────────────────────────────── */}
        <div className="flex">
          
          {/* ──────────────────────────────────────────────────────────── */}
          {/* LEFT SIDEBAR: Industry Navigation */}
          {/* ──────────────────────────────────────────────────────────── */}
          <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4 fixed left-0 top-16 overflow-y-auto">
            <nav className="space-y-1">
              {/* Section Header */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {config.displayName}
              </div>
              
              {/* Navigation Items */}
              {config.sidebarItems.map((item, index) => {
                // Check if hidden by plan tier
                const isHiddenByPlan = item.planTier && getTierLevel(item.planTier) > getTierLevel(config.planTier);
                
                if (isHiddenByPlan) {
                  // Show locked state
                  return (
                    <div
                      key={index}
                      className="group flex items-center justify-between px-3 py-2 text-sm text-gray-400 rounded-lg cursor-not-allowed"
                    >
                      <div className="flex items-center gap-3">
                        {React.cloneElement(item.icon as React.ReactElement, {
                          size: 18,
                          className: 'text-gray-400',
                        })}
                        <span>{item.label}</span>
                      </div>
                      <LockIcon size={14} className="text-gray-400" />
                    </div>
                  );
                }
                
                // Normal navigation item
                return (
                  <a
                    key={index}
                    href={item.href}
                    className="group flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {React.cloneElement(item.icon as React.ReactElement, {
                        size: 18,
                        className: 'text-gray-400 group-hover:text-gray-500',
                      })}
                      <span>{item.label}</span>
                    </div>
                    {item.planTier === 'PRO_PLUS' && (
                      <CrownIcon size={14} className="text-purple-600" />
                    )}
                  </a>
                );
              })}
              
              {/* Team Section (at bottom of sidebar) */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Team
                </div>
                <a
                  href={`/dashboard/${config.industry}/staff`}
                  className="group flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <Users size={18} className="text-gray-400 group-hover:text-gray-500" />
                  <span>Staff Management</span>
                </a>
                <a
                  href={`/dashboard/${config.industry}/settings`}
                  className="group flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <Settings size={18} className="text-gray-400 group-hover:text-gray-500" />
                  <span>Settings</span>
                </a>
              </div>
            </nav>
          </aside>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* MAIN CONTENT AREA */}
          {/* ──────────────────────────────────────────────────────────── */}
          <main className="ml-64 flex-1 p-8">
            
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                {config.displayName}
              </h1>
              <p className="text-sm text-gray-500 mt-2">
                {config.description}
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {config.metrics.map((metric, index) => (
                <MetricCard
                  key={index}
                  label={metric.label}
                  value={metric.value}
                  change={metric.change}
                  trend={metric.trend}
                  icon={metric.icon}
                />
              ))}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Revenue Chart */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Revenue Trend
                </h3>
                <RevenueChart />
              </div>

              {/* Tasks Module */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Priority Tasks
                </h3>
                <TasksModule limit={5} />
              </div>
            </div>

            {/* Industry-Specific Modules */}
            <FeatureGate minPlan="PRO">
              {showFinance && (
                <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Finance Overview
                  </h3>
                  {/* Finance content */}
                </div>
              )}
              
              {showMarketing && (
                <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Marketing Campaigns
                  </h3>
                  {/* Marketing content */}
                </div>
              )}
            </FeatureGate>

            {/* Alerts Module */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Action Required
              </h3>
              <AlertsModule limit={5} />
            </div>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Helper Functions
// ──────────────────────────────────────────────────────────────────────────

function getTierLevel(planTier: DashboardPlanTier): number {
  const tiers: Record<DashboardPlanTier, number> = {
    STARTER: 0,
    PRO: 1,
    PRO_PLUS: 2,
  };
  return tiers[planTier];
}

function LockIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function CrownIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
    </svg>
  );
}
