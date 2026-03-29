"use client";

import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { TasksModule } from "@/components/dashboard/TasksModule";
import { AlertsModule } from "@/components/dashboard/AlertsModule";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { 
  Home, 
  ShoppingCart, 
  Package, 
  Users, 
  Sofa, 
  Palette, 
  DollarSign,
  BarChart3,
  Megaphone,
  Settings,
  TrendingUp,
  Truck,
  Star
} from "lucide-react";

export default function HomeDecorDashboardHub() {
  return (
    <ErrorBoundary componentName="Home Decor Dashboard Hub">
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50">
        {/* Breadcrumb */}
        <Breadcrumbs items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Home Decor", href: "/dashboard/home-decor" },
        ]} />
        
        <div className="flex">
          {/* Sidebar Navigation */}
          <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4 fixed left-0 top-[73px]">
            <nav className="space-y-1">
              {/* Core Operations */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Home Decor Operations
              </div>
              
              <a
                href="/dashboard/home-decor"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md bg-pink-100 text-pink-700"
              >
                <div className="flex items-center gap-3">
                  <Home size={18} className="text-pink-600" />
                  <span>Dashboard</span>
                </div>
                <span className="w-2 h-2 bg-pink-600 rounded-full"></span>
              </a>
              
              <a
                href="/dashboard/home-decor/orders"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Orders</span>
                </div>
              </a>
              
              <a
                href="/dashboard/home-decor/inventory"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Package size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Inventory</span>
                </div>
              </a>
              
              <a
                href="/dashboard/home-decor/products"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Sofa size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Products</span>
                </div>
              </a>
              
              <a
                href="/dashboard/home-decor/customers"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Users size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Customers</span>
                </div>
              </a>
              
              <a
                href="/dashboard/home-decor/collections"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Palette size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Collections</span>
                </div>
              </a>
              
              <a
                href="/dashboard/home-decor/showroom"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Star size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Showroom</span>
                </div>
              </a>
              
              <a
                href="/dashboard/home-decor/delivery"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Truck size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Delivery Schedule</span>
                </div>
              </a>
              
              {/* Business Management */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">
                Business Management
              </div>
              
              <a
                href="/dashboard/home-decor/finance"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <DollarSign size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Finance</span>
                </div>
              </a>
              
              <a
                href="/dashboard/home-decor/marketing"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Megaphone size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Marketing</span>
                </div>
              </a>
              
              <a
                href="/dashboard/home-decor/analytics"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Analytics</span>
                </div>
              </a>
              
              <a
                href="/dashboard/home-decor/settings"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Settings size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Settings</span>
                </div>
              </a>
              
              {/* Team Section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <a
                  href="/dashboard/home-decor/staff"
                  className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <Users size={18} className="text-gray-400 group-hover:text-gray-600" />
                    <span>Staff Management</span>
                  </div>
                </a>
              </div>
            </nav>
          </aside>
          
          {/* Main Content */}
          <main className="ml-64 flex-1 p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Home Decor Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage furniture, decor, and interior design sales</p>
            </div>
            
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                title="Revenue (MTD)"
                value="$67,890"
                change="+14.2%"
                trend="up"
                icon={DollarSign}
                color="pink"
              />
              <MetricCard
                title="Orders This Month"
                value="234"
                change="+9.8%"
                trend="up"
                icon={ShoppingCart}
                color="rose"
              />
              <MetricCard
                title="Avg Order Value"
                value="$289"
                change="+6.3%"
                trend="up"
                icon={TrendingUp}
                color="pink"
              />
              <MetricCard
                title="Customer Satisfaction"
                value="4.8/5"
                change="+0.2"
                trend="up"
                icon={Star}
                color="rose"
              />
            </div>
            
            {/* Charts and Modules */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <RevenueChart />
              </div>
              <div>
                <AlertsModule alerts={[
                  { id: 1, title: "New Collection Launch", description: "Spring 2024 collection arrives Monday", severity: "info", time: "2h ago" },
                  { id: 2, title: "Large Order", description: "Custom order #HD-2847 requires deposit", severity: "warning", time: "4h ago" },
                  { id: 3, title: "Showroom Appointment", description: "VIP client tomorrow at 2 PM", severity: "info", time: "6h ago" },
                ]} />
              </div>
            </div>
            
            {/* Tasks Module */}
            <TasksModule tasks={[
              { id: 1, title: "Review new supplier catalogs", completed: false, priority: "medium" },
              { id: 2, title: "Update showroom displays", completed: true, priority: "low" },
              { id: 3, title: "Approve custom design proofs", completed: false, priority: "high" },
              { id: 4, title: "Plan spring sale campaign", completed: false, priority: "medium" },
            ]} />
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
