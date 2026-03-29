/**
 * Media & Entertainment Dashboard Hub - Main Page
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
  Camera,
  Users,
  DollarSign,
  TrendingUp,
  Eye,
  Video,
  Calendar,
  BarChart3,
  Megaphone,
  Settings,
} from "lucide-react";

const sidebarNavItems = [
  // CORE OPERATIONS
  { label: "Dashboard", href: "/dashboard/media", icon: Home, active: true },
  { label: "Content", href: "/dashboard/media/content", icon: Video },
  { label: "Audience", href: "/dashboard/media/audience", icon: Users },
  { label: "Campaigns", href: "/dashboard/media/campaigns", icon: Calendar },
  
  // INDUSTRY-SPECIFIC
  { label: "Analytics", href: "/dashboard/media/analytics", icon: Eye },
  { label: "Revenue Streams", href: "/dashboard/media/revenue", icon: DollarSign },
  { label: "Productions", href: "/dashboard/media/productions", icon: Camera },
  { label: "Staff", href: "/dashboard/media/staff", icon: Users },
  
  // BUSINESS MANAGEMENT
  { label: "Finance", href: "/dashboard/media/finance", icon: DollarSign },
  { label: "Marketing", href: "/dashboard/media/marketing", icon: Megaphone },
  { label: "Settings", href: "/dashboard/media/settings", icon: Settings },
];

export default function MediaDashboardHub() {
  return (
    <ErrorBoundary componentName="Media Dashboard Hub">
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <Breadcrumbs
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Media", href: "/dashboard/media" },
            ]}
          />
        </div>

        <div className="flex">
          <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4 fixed left-0 top-[73px] overflow-y-auto">
            <nav className="space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Media & Entertainment
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
                        ? "bg-red-50 text-red-900"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={18}
                        className={isActive ? "text-red-600" : "text-gray-400 group-hover:text-gray-500"}
                      />
                      <span>{item.label}</span>
                    </div>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                    )}
                  </a>
                );
              })}
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Team
                </div>
                <a
                  href="/dashboard/media/staff"
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
                Media Dashboard
              </h1>
              <p className="text-sm text-gray-500 mt-2">
                Content performance, audience analytics, and revenue
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <MetricCard
                label="Total Views"
                value="2.4M"
                change={45}
                trend="up"
                icon={<Eye size={16} className="text-red-600" />}
              />
              <MetricCard
                label="Revenue (MTD)"
                value="₦1.2M"
                change={28}
                trend="up"
                icon={<DollarSign size={16} className="text-emerald-600" />}
              />
              <MetricCard
                label="Engagement Rate"
                value="8.7%"
                change={12}
                trend="up"
                icon={<TrendingUp size={16} className="text-purple-600" />}
              />
              <MetricCard
                label="Active Campaigns"
                value="12"
                change={4}
                trend="up"
                icon={<Calendar size={16} className="text-blue-600" />}
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
