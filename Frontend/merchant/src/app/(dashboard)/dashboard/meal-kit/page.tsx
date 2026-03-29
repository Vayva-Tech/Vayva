"use client";

import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { TasksModule } from "@/components/dashboard/TasksModule";
import { AlertsModule } from "@/components/dashboard/AlertsModule";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { 
  Home, 
  Box, 
  ShoppingCart, 
  Users, 
  Package, 
  Truck, 
  DollarSign,
  BarChart3,
  Megaphone,
  Settings,
  ClipboardList,
  TrendingUp,
  Clock
} from "lucide-react";

export default function MealKitDashboardHub() {
  return (
    <ErrorBoundary componentName="Meal Kit Dashboard Hub">
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50">
        {/* Breadcrumb */}
        <Breadcrumbs items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Meal Kit", href: "/dashboard/meal-kit" },
        ]} />
        
        <div className="flex">
          {/* Sidebar Navigation */}
          <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4 fixed left-0 top-[73px]">
            <nav className="space-y-1">
              {/* Core Operations */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Meal Kit Operations
              </div>
              
              <a
                href="/dashboard/meal-kit"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md bg-green-100 text-green-700"
              >
                <div className="flex items-center gap-3">
                  <Home size={18} className="text-green-600" />
                  <span>Dashboard</span>
                </div>
                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
              </a>
              
              <a
                href="/dashboard/meal-kit/recipes"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <ClipboardList size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Recipes</span>
                </div>
              </a>
              
              <a
                href="/dashboard/meal-kit/subscriptions"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Box size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Subscription Boxes</span>
                </div>
              </a>
              
              <a
                href="/dashboard/meal-kit/meal-plans"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Package size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Meal Plans</span>
                </div>
              </a>
              
              <a
                href="/dashboard/meal-kit/orders"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Orders</span>
                </div>
              </a>
              
              <a
                href="/dashboard/meal-kit/ingredients"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Package size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Ingredients</span>
                </div>
              </a>
              
              <a
                href="/dashboard/meal-kit/deliveries"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Truck size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Deliveries</span>
                </div>
              </a>
              
              <a
                href="/dashboard/meal-kit/customers"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Users size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Customers</span>
                </div>
              </a>
              
              {/* Business Management */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">
                Business Management
              </div>
              
              <a
                href="/dashboard/meal-kit/finance"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <DollarSign size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Finance</span>
                </div>
              </a>
              
              <a
                href="/dashboard/meal-kit/marketing"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Megaphone size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Marketing</span>
                </div>
              </a>
              
              <a
                href="/dashboard/meal-kit/analytics"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Analytics</span>
                </div>
              </a>
              
              <a
                href="/dashboard/meal-kit/settings"
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
                  href="/dashboard/meal-kit/staff"
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
              <h1 className="text-3xl font-bold text-gray-900">Meal Kit Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage recipes, subscriptions, and deliveries</p>
            </div>
            
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                title="Active Subscriptions"
                value="2,847"
                change="+8.4%"
                trend="up"
                icon={Box}
                color="green"
              />
              <MetricCard
                title="Boxes This Week"
                value="1,234"
                change="+12.1%"
                trend="up"
                icon={Package}
                color="teal"
              />
              <MetricCard
                title="Revenue (MTD)"
                value="$84,290"
                change="+15.3%"
                trend="up"
                icon={DollarSign}
                color="green"
              />
              <MetricCard
                title="On-Time Delivery"
                value="96.8%"
                change="+2.1%"
                trend="up"
                icon={Clock}
                color="teal"
              />
            </div>
            
            {/* Charts and Modules */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <RevenueChart />
              </div>
              <div>
                <AlertsModule alerts={[
                  { id: 1, title: "Ingredient Shortage", description: "Organic chicken running low", severity: "warning", time: "1h ago" },
                  { id: 2, title: "Delivery Delay", description: "Route 45 experiencing delays", severity: "info", time: "3h ago" },
                  { id: 3, title: "New Recipe Approved", description: "Mediterranean Bowl ready for production", severity: "success", time: "5h ago" },
                ]} />
              </div>
            </div>
            
            {/* Tasks Module */}
            <TasksModule tasks={[
              { id: 1, title: "Review weekly menu", completed: false, priority: "high" },
              { id: 2, title: "Approve ingredient orders", completed: true, priority: "high" },
              { id: 3, title: "Update nutrition info", completed: false, priority: "medium" },
              { id: 4, title: "Plan promotional campaign", completed: false, priority: "low" },
            ]} />
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
