/**
 * Dashboard Sidebar Component
 * 
 * Navigation sidebar with plan-based feature gating
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn, Icon } from '@vayva/ui';
import { useSubscription } from '@/features/subscription/hooks/useSubscription';
import { getSidebar } from '@/config/sidebar';
import { IndustrySlug } from '@/lib/templates/types';

export interface DashboardSidebarProps {
  className?: string;
}

export function DashboardSidebar({ className }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { currentPlan } = useSubscription();
  const [collapsed, setCollapsed] = useState(false);

  // Get sidebar config based on industry and plan
  const sidebarConfig = getSidebar('retail' as IndustrySlug, currentPlan?.tier || 'starter');

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-30 h-full border-r bg-white dark:bg-gray-800 dark:border-gray-700 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-4 rounded-full bg-white dark:bg-gray-700 border p-1 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600"
      >
        <Icon name={collapsed ? 'PanelRightOpen' : 'PanelLeftOpen'} className="h-4 w-4" />
      </button>

      {/* Logo */}
      <div className="flex h-16 items-center border-b px-4 dark:border-gray-700">
        {!collapsed && (
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Vayva
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="space-y-1 p-2">
        {sidebarConfig.groups.map((group) => (
          <div key={group.id} className="mb-4">
            {!collapsed && group.title && (
              <h3 className="mb-2 px-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {group.title}
              </h3>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                const isDisabled = item.planRequired && currentPlan?.tier !== item.planRequired;

                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors',
                        isActive
                          ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
                          : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700',
                        isDisabled && 'pointer-events-none opacity-50'
                      )}
                    >
                      <Icon name={item.icon} className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1">{item.label}</span>
                          {item.badge && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                              {item.badge}
                            </span>
                          )}
                          {isDisabled && <Icon name="Lock" className="h-3 w-3" />}
                        </>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
