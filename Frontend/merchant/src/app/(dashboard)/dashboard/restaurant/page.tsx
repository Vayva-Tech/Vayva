/**
 * Restaurant Dashboard Hub - Main Page
 * 
 * This is the MAIN restaurant dashboard that shows:
 * - Overview metrics and KPIs
 * - Quick actions
 * - Recent activity
 * - Navigation to all restaurant sub-pages via sidebar
 */

"use client";

import React from "react";
import { motion } from "framer-motion";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { MetricCard } from "@/components/dashboard/modules";
import { TasksModule } from "@/components/dashboard/modules/TasksModule";
import { AlertsModule } from "@/components/dashboard/modules/AlertsModule";
import { RevenueChart, OrderStatusChart } from "@/components/dashboard/modules/ChartsModule";
import { ErrorBoundary } from "@/components/error-boundary/ErrorBoundary";
import {
  ChefHat,
  Clock,
  DollarSign,
  Users,
  ShoppingCart,
  Package,
  LayoutGrid,
  Calendar,
  BarChart3,
  Megaphone,
  Settings,
} from "lucide-react";

// ──────────────────────────────────────────────────────────────────────────
// SIDEBAR NAVIGATION STRUCTURE
// ──────────────────────────────────────────────────────────────────────────

const sidebarNavItems = [
  // CORE OPERATIONS (Always visible)
  { label: "Dashboard", href: "/dashboard/restaurant", icon: Home, active: true },
  { label: "Orders", href: "/dashboard/restaurant/orders", icon: ShoppingCart },
  { label: "Inventory", href: "/dashboard/restaurant/inventory", icon: Package },
  { label: "Customers", href: "/dashboard/restaurant/customers", icon: Users },
  
  // INDUSTRY-SPECIFIC MODULES
  { label: "KDS (Kitchen)", href: "/dashboard/restaurant/kds", icon: ChefHat },
  { label: "Table Management", href: "/dashboard/restaurant/tables", icon: LayoutGrid },
  { label: "Reservations", href: "/dashboard/restaurant/reservations", icon: Calendar },
  { label: "Staff", href: "/dashboard/restaurant/staff", icon: Users },
  
  // BUSINESS MANAGEMENT
  { label: "Finance", href: "/dashboard/restaurant/finance", icon: DollarSign },
  { label: "Marketing", href: "/dashboard/restaurant/marketing", icon: Megaphone },
  { label: "Analytics", href: "/dashboard/restaurant/analytics", icon: BarChart3 },
  { label: "Settings", href: "/dashboard/restaurant/settings", icon: Settings },
];

// ──────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────────────────────────

export default function RestaurantDashboardHub() {
  return (
    <ErrorBoundary componentName="Restaurant Dashboard Hub">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        
        {/* ────────────────────────────────────────────────────────────── */}
        {/* TOP NAVIGATION BAR (Placeholder - you already have this) */}
        {/* ────────────────────────────────────────────────────────────── */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <Breadcrumbs
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Restaurant", href: "/dashboard/restaurant" },
            ]}
          />
        </div>

        {/* ────────────────────────────────────────────────────────────── */}
        {/* TWO-COLUMN LAYOUT: Sidebar + Main Content */}
        {/* ────────────────────────────────────────────────────────────── */}
        <div className="flex">
          
          {/* ──────────────────────────────────────────────────────────── */}
          {/* LEFT SIDEBAR: Restaurant Navigation */}
          {/* ──────────────────────────────────────────────────────────── */}
          <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4 fixed left-0 top-[73px] overflow-y-auto">
            <nav className="space-y-1">
              
              {/* Section Header */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Restaurant Operations
              </div>
              
              {/* Navigation Items */}
              {sidebarNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.active;
                
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className={`group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? "bg-emerald-50 text-emerald-900"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={18}
                        className={isActive ? "text-emerald-600" : "text-gray-400 group-hover:text-gray-500"}
                      />
                      <span>{item.label}</span>
                    </div>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    )}
                  </a>
                );
              })}
              
              {/* Team Section (at bottom of sidebar) */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Team
                </div>
                <a
                  href="/dashboard/restaurant/staff"
                  className="group flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <Users size={18} className="text-gray-400 group-hover:text-gray-500" />
                  <span>Staff Management</span>
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
                Restaurant Dashboard
              </h1>
              <p className="text-sm text-gray-500 mt-2">
                Manage orders, kitchen, tables, and staff performance
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <MetricCard
                label="Active Tickets"
                value="24"
                change={12}
                trend="up"
                icon={<ChefHat size={16} className="text-emerald-600" />}
              />
              <MetricCard
                label="Table Turnover"
                value="2.4h"
                change={-8}
                trend="down"
                icon={<Clock size={16} className="text-blue-600" />}
              />
              <MetricCard
                label="Avg Ticket Size"
                value="₦4,850"
                change={15}
                trend="up"
                icon={<DollarSign size={16} className="text-purple-600" />}
              />
              <MetricCard
                label="Covers Today"
                value="142"
                change={22}
                trend="up"
                icon={<Users size={16} className="text-orange-600" />}
              />
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Revenue Chart */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Revenue Trend - Last 7 Days
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

            {/* Order Status Distribution */}
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Order Status Overview
              </h3>
              <OrderStatusChart />
            </div>

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

// Helper component since we can't import Home directly
function Home({ size, className }: { size: number; className?: string }) {
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
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
