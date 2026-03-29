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
  Trophy, 
  Shirt, 
  DollarSign,
  BarChart3,
  Megaphone,
  Settings,
  TrendingUp,
  Target,
  Medal
} from "lucide-react";

export default function SportsEquipmentDashboardHub() {
  return (
    <ErrorBoundary componentName="Sports Equipment Dashboard Hub">
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        {/* Breadcrumb */}
        <Breadcrumbs items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Sports Equipment", href: "/dashboard/sports-equipment" },
        ]} />
        
        <div className="flex">
          {/* Sidebar Navigation */}
          <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4 fixed left-0 top-[73px]">
            <nav className="space-y-1">
              {/* Core Operations */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Sports Equipment Operations
              </div>
              
              <a
                href="/dashboard/sports-equipment"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md bg-orange-100 text-orange-700"
              >
                <div className="flex items-center gap-3">
                  <Home size={18} className="text-orange-600" />
                  <span>Dashboard</span>
                </div>
                <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
              </a>
              
              <a
                href="/dashboard/sports-equipment/orders"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Orders</span>
                </div>
              </a>
              
              <a
                href="/dashboard/sports-equipment/inventory"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Package size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Inventory</span>
                </div>
              </a>
              
              <a
                href="/dashboard/sports-equipment/products"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Trophy size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Products</span>
                </div>
              </a>
              
              <a
                href="/dashboard/sports-equipment/customers"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Users size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Customers</span>
                </div>
              </a>
              
              <a
                href="/dashboard/sports-equipment/teams"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Target size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Team Sales</span>
                </div>
              </a>
              
              <a
                href="/dashboard/sports-equipment/apparel"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Shirt size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Apparel</span>
                </div>
              </a>
              
              <a
                href="/dashboard/sports-equipment/equipment-rental"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Medal size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Equipment Rental</span>
                </div>
              </a>
              
              {/* Business Management */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">
                Business Management
              </div>
              
              <a
                href="/dashboard/sports-equipment/finance"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <DollarSign size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Finance</span>
                </div>
              </a>
              
              <a
                href="/dashboard/sports-equipment/marketing"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Megaphone size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Marketing</span>
                </div>
              </a>
              
              <a
                href="/dashboard/sports-equipment/analytics"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Analytics</span>
                </div>
              </a>
              
              <a
                href="/dashboard/sports-equipment/settings"
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
                  href="/dashboard/sports-equipment/staff"
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
              <h1 className="text-3xl font-bold text-gray-900">Sports Equipment Dashboard</h1>
              <p className="text-gray-600 mt-1">Track gear sales, team orders, and rentals</p>
            </div>
            
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                title="Total Sales (MTD)"
                value="$94,230"
                change="+16.7%"
                trend="up"
                icon={DollarSign}
                color="orange"
              />
              <MetricCard
                title="Orders This Month"
                value="487"
                change="+11.2%"
                trend="up"
                icon={ShoppingCart}
                color="amber"
              />
              <MetricCard
                title="Team Contracts"
                value="23"
                change="+3 this month"
                trend="up"
                icon={Target}
                color="orange"
              />
              <MetricCard
                title="Equipment Rentals"
                value="156"
                change="+8.4%"
                trend="up"
                icon={Medal}
                color="amber"
              />
            </div>
            
            {/* Charts and Modules */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <RevenueChart />
              </div>
              <div>
                <AlertsModule alerts={[
                  { id: 1, title: "Seasonal Demand Spike", description: "Basketball equipment up 45% this week", severity: "info", time: "1h ago" },
                  { id: 2, title: "Team Order Pending", description: "High School Tigers - $8,500 order", severity: "warning", time: "3h ago" },
                  { id: 3, title: "New Brand Partnership", description: "Nike wholesale agreement signed", severity: "success", time: "5h ago" },
                ]} />
              </div>
            </div>
            
            {/* Tasks Module */}
            <TasksModule tasks={[
              { id: 1, title: "Review team contract proposals", completed: false, priority: "high" },
              { id: 2, title: "Update seasonal inventory", completed: true, priority: "medium" },
              { id: 3, title: "Plan spring sports promotion", completed: false, priority: "medium" },
              { id: 4, title: "Schedule equipment maintenance", completed: false, priority: "low" },
            ]} />
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
