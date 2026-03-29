/**
 * E-commerce Dashboard Hub - Main Page
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
  Truck,
  CreditCard,
  TrendingUp,
  BarChart3,
  Megaphone,
  Settings,
} from "lucide-react";

const sidebarNavItems = [
  // CORE OPERATIONS
  { label: "Dashboard", href: "/dashboard/ecommerce", icon: Home, active: true },
  { label: "Online Orders", href: "/dashboard/ecommerce/orders", icon: ShoppingCart },
  { label: "Products", href: "/dashboard/ecommerce/products", icon: Package },
  { label: "Customers", href: "/dashboard/ecommerce/customers", icon: Users },
  
  // INDUSTRY-SPECIFIC
  { label: "Shopping Cart", href: "/dashboard/ecommerce/cart", icon: ShoppingCart },
  { label: "Shipping", href: "/dashboard/ecommerce/shipping", icon: Truck },
  { label: "Returns", href: "/dashboard/ecommerce/returns", icon: CreditCard },
  { label: "Inventory", href: "/dashboard/ecommerce/inventory", icon: Package },
  
  // BUSINESS MANAGEMENT
  { label: "Finance", href: "/dashboard/ecommerce/finance", icon: DollarSign },
  { label: "Marketing", href: "/dashboard/ecommerce/marketing", icon: Megaphone },
  { label: "Analytics", href: "/dashboard/ecommerce/analytics", icon: BarChart3 },
  { label: "Settings", href: "/dashboard/ecommerce/settings", icon: Settings },
];

export default function EcommerceDashboardHub() {
  return (
    <ErrorBoundary componentName="E-commerce Dashboard Hub">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <Breadcrumbs
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "E-commerce", href: "/dashboard/ecommerce" },
            ]}
          />
        </div>

        <div className="flex">
          <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4 fixed left-0 top-[73px] overflow-y-auto">
            <nav className="space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                E-commerce Store
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
                        ? "bg-blue-50 text-blue-900"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={18}
                        className={isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500"}
                      />
                      <span>{item.label}</span>
                    </div>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    )}
                  </a>
                );
              })}
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Team
                </div>
                <a
                  href="/dashboard/ecommerce/staff"
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
                E-commerce Dashboard
              </h1>
              <p className="text-sm text-gray-500 mt-2">
                Online sales, orders, and customer analytics
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <MetricCard
                label="Orders Today"
                value="89"
                change={18}
                trend="up"
                icon={<ShoppingCart size={16} className="text-blue-600" />}
              />
              <MetricCard
                label="Conversion Rate"
                value="3.2%"
                change={12}
                trend="up"
                icon={<TrendingUp size={16} className="text-emerald-600" />}
              />
              <MetricCard
                label="Revenue (MTD)"
                value="₦3.4M"
                change={22}
                trend="up"
                icon={<DollarSign size={16} className="text-purple-600" />}
              />
              <MetricCard
                label="Avg Order Value"
                value="₦8,900"
                change={8}
                trend="up"
                icon={<Package size={16} className="text-orange-600" />}
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
