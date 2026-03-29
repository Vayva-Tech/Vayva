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
  Smartphone, 
  Monitor, 
  DollarSign,
  BarChart3,
  Megaphone,
  Settings,
  TrendingUp,
  Zap,
  Shield
} from "lucide-react";

export default function ElectronicsDashboardHub() {
  return (
    <ErrorBoundary componentName="Electronics Dashboard Hub">
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        {/* Breadcrumb */}
        <Breadcrumbs items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Electronics", href: "/dashboard/electronics" },
        ]} />
        
        <div className="flex">
          {/* Sidebar Navigation */}
          <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4 fixed left-0 top-[73px]">
            <nav className="space-y-1">
              {/* Core Operations */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Electronics Operations
              </div>
              
              <a
                href="/dashboard/electronics"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md bg-indigo-100 text-indigo-700"
              >
                <div className="flex items-center gap-3">
                  <Home size={18} className="text-indigo-600" />
                  <span>Dashboard</span>
                </div>
                <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
              </a>
              
              <a
                href="/dashboard/electronics/orders"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Orders</span>
                </div>
              </a>
              
              <a
                href="/dashboard/electronics/inventory"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Package size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Inventory</span>
                </div>
              </a>
              
              <a
                href="/dashboard/electronics/products"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Smartphone size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Products</span>
                </div>
              </a>
              
              <a
                href="/dashboard/electronics/customers"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Users size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Customers</span>
                </div>
              </a>
              
              <a
                href="/dashboard/electronics/warranties"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Shield size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Warranties</span>
                </div>
              </a>
              
              <a
                href="/dashboard/electronics/repairs"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Zap size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Repairs</span>
                </div>
              </a>
              
              <a
                href="/dashboard/electronics/categories"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Monitor size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Categories</span>
                </div>
              </a>
              
              {/* Business Management */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">
                Business Management
              </div>
              
              <a
                href="/dashboard/electronics/finance"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <DollarSign size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Finance</span>
                </div>
              </a>
              
              <a
                href="/dashboard/electronics/marketing"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Megaphone size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Marketing</span>
                </div>
              </a>
              
              <a
                href="/dashboard/electronics/analytics"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Analytics</span>
                </div>
              </a>
              
              <a
                href="/dashboard/electronics/settings"
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
                  href="/dashboard/electronics/staff"
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
              <h1 className="text-3xl font-bold text-gray-900">Electronics Dashboard</h1>
              <p className="text-gray-600 mt-1">Track sales, inventory, and warranties</p>
            </div>
            
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                title="Total Sales (MTD)"
                value="$127,845"
                change="+22.3%"
                trend="up"
                icon={DollarSign}
                color="indigo"
              />
              <MetricCard
                title="Orders Today"
                value="43"
                change="+8.7%"
                trend="up"
                icon={ShoppingCart}
                color="purple"
              />
              <MetricCard
                title="Active Warranties"
                value="1,847"
                change="+15.2%"
                trend="up"
                icon={Shield}
                color="indigo"
              />
              <MetricCard
                title="Avg Order Value"
                value="$287"
                change="+12.4%"
                trend="up"
                icon={TrendingUp}
                color="purple"
              />
            </div>
            
            {/* Charts and Modules */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <RevenueChart />
              </div>
              <div>
                <AlertsModule alerts={[
                  { id: 1, title: "Low Stock Alert", description: "iPhone 15 Pro - only 3 units left", severity: "warning", time: "1h ago" },
                  { id: 2, title: "New Product Launch", description: "Samsung Galaxy S24 arriving next week", severity: "info", time: "3h ago" },
                  { id: 3, title: "Warranty Claim", description: "Claim #WC-2847 approved", severity: "success", time: "5h ago" },
                ]} />
              </div>
            </div>
            
            {/* Tasks Module */}
            <TasksModule tasks={[
              { id: 1, title: "Review warranty claims", completed: false, priority: "high" },
              { id: 2, title: "Update product specifications", completed: true, priority: "medium" },
              { id: 3, title: "Plan flash sale", completed: false, priority: "medium" },
              { id: 4, title: "Train staff on new products", completed: false, priority: "low" },
            ]} />
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
