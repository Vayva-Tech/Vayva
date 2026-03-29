/**
 * Grocery Dashboard Hub - Main Page
 */

"use client";

import React from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { MetricCard } from "@/components/dashboard/modules";
import { TasksModule } from "@/components/dashboard/modules/TasksModule";
import { AlertsModule } from "@/components/dashboard/modules/AlertsModule";
import { RevenueChart } from "@/components/dashboard/modules/ChartsModule";
import { ErrorBoundary } from "@/components/error-boundary/ErrorBoundary";
import {
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  Clock,
  Tag,
  TrendingUp,
  BarChart3,
  Megaphone,
  Settings,
} from "lucide-react";

const sidebarNavItems = [
  // CORE OPERATIONS
  { label: "Dashboard", href: "/dashboard/grocery", icon: Home, active: true },
  { label: "POS / Sales", href: "/dashboard/grocery/pos", icon: ShoppingCart },
  { label: "Inventory", href: "/dashboard/grocery/inventory", icon: Package },
  { label: "Customers", href: "/dashboard/grocery/customers", icon: Users },
  
  // INDUSTRY-SPECIFIC
  { label: "Expiry Tracking", href: "/dashboard/grocery/expiry", icon: Clock },
  { label: "Fresh Produce", href: "/dashboard/grocery/produce", icon: Tag },
  { label: "Weekly Specials", href: "/dashboard/grocery/specials", icon: Tag },
  { label: "Staff", href: "/dashboard/grocery/staff", icon: Users },
  
  // BUSINESS MANAGEMENT
  { label: "Finance", href: "/dashboard/grocery/finance", icon: DollarSign },
  { label: "Marketing", href: "/dashboard/grocery/marketing", icon: Megaphone },
  { label: "Analytics", href: "/dashboard/grocery/analytics", icon: BarChart3 },
  { label: "Settings", href: "/dashboard/grocery/settings", icon: Settings },
];

export default function GroceryDashboardHub() {
  return (
    <ErrorBoundary componentName="Grocery Dashboard Hub">
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <Breadcrumbs
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Grocery", href: "/dashboard/grocery" },
            ]}
          />
        </div>

        <div className="flex">
          <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4 fixed left-0 top-[73px] overflow-y-auto">
            <nav className="space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Grocery Store
              </div>
              
              {sidebarNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.active;
                
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className={`group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? "bg-green-50 text-green-900"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={18}
                        className={isActive ? "text-green-600" : "text-gray-400 group-hover:text-gray-500"}
                      />
                      <span>{item.label}</span>
                    </div>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                    )}
                  </a>
                );
              })}
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Team
                </div>
                <a
                  href="/dashboard/grocery/staff"
                  className="group flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <Users size={18} className="text-gray-400 group-hover:text-gray-500" />
                  <span>Staff Management</span>
                </a>
              </div>
            </nav>
          </aside>

          <main className="ml-64 flex-1 p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Grocery Dashboard
              </h1>
              <p className="text-sm text-gray-500 mt-2">
                Fresh inventory, POS, and expiry tracking
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <MetricCard
                label="Today's Sales"
                value="₦320K"
                change={18}
                trend="up"
                icon={<DollarSign size={16} className="text-green-600" />}
              />
              <MetricCard
                label="Transactions"
                value="234"
                change={12}
                trend="up"
                icon={<ShoppingCart size={16} className="text-blue-600" />}
              />
              <MetricCard
                label="Products Expiring Soon"
                value="23"
                change={-15}
                trend="down"
                icon={<Clock size={16} className="text-orange-600" />}
              />
              <MetricCard
                label="Avg Transaction"
                value="₦1,370"
                change={8}
                trend="up"
                icon={<TrendingUp size={16} className="text-purple-600" />}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Revenue Trend
                </h3>
                <RevenueChart />
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Priority Tasks
                </h3>
                <TasksModule limit={5} />
              </div>
            </div>

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

function Home({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
