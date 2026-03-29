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
  Bone, 
  Scissors, 
  DollarSign,
  BarChart3,
  Megaphone,
  Settings,
  TrendingUp,
  Heart,
  Clock
} from "lucide-react";

export default function PetSuppliesDashboardHub() {
  return (
    <ErrorBoundary componentName="Pet Supplies Dashboard Hub">
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50">
        {/* Breadcrumb */}
        <Breadcrumbs items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Pet Supplies", href: "/dashboard/pet-supplies" },
        ]} />
        
        <div className="flex">
          {/* Sidebar Navigation */}
          <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4 fixed left-0 top-[73px]">
            <nav className="space-y-1">
              {/* Core Operations */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Pet Supplies Operations
              </div>
              
              <a
                href="/dashboard/pet-supplies"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md bg-amber-100 text-amber-700"
              >
                <div className="flex items-center gap-3">
                  <Home size={18} className="text-amber-600" />
                  <span>Dashboard</span>
                </div>
                <span className="w-2 h-2 bg-amber-600 rounded-full"></span>
              </a>
              
              <a
                href="/dashboard/pet-supplies/orders"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Orders</span>
                </div>
              </a>
              
              <a
                href="/dashboard/pet-supplies/inventory"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Package size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Inventory</span>
                </div>
              </a>
              
              <a
                href="/dashboard/pet-supplies/products"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Bone size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Products</span>
                </div>
              </a>
              
              <a
                href="/dashboard/pet-supplies/customers"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Users size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Customers</span>
                </div>
              </a>
              
              <a
                href="/dashboard/pet-supplies/grooming"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Scissors size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Grooming Services</span>
                </div>
              </a>
              
              <a
                href="/dashboard/pet-supplies/appointments"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Appointments</span>
                </div>
              </a>
              
              <a
                href="/dashboard/pet-supplies/pet-health"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Heart size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Pet Health Records</span>
                </div>
              </a>
              
              {/* Business Management */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">
                Business Management
              </div>
              
              <a
                href="/dashboard/pet-supplies/finance"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <DollarSign size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Finance</span>
                </div>
              </a>
              
              <a
                href="/dashboard/pet-supplies/marketing"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Megaphone size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Marketing</span>
                </div>
              </a>
              
              <a
                href="/dashboard/pet-supplies/analytics"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Analytics</span>
                </div>
              </a>
              
              <a
                href="/dashboard/pet-supplies/settings"
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
                  href="/dashboard/pet-supplies/staff"
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
              <h1 className="text-3xl font-bold text-gray-900">Pet Supplies Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage pet products, grooming, and services</p>
            </div>
            
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                title="Revenue (MTD)"
                value="$42,670"
                change="+13.8%"
                trend="up"
                icon={DollarSign}
                color="amber"
              />
              <MetricCard
                title="Orders This Month"
                value="892"
                change="+10.4%"
                trend="up"
                icon={ShoppingCart}
                color="yellow"
              />
              <MetricCard
                title="Grooming Appointments"
                value="167"
                change="+18.2%"
                trend="up"
                icon={Scissors}
                color="amber"
              />
              <MetricCard
                title="Active Pet Profiles"
                value="2,847"
                change="+234 this month"
                trend="up"
                icon={Heart}
                color="yellow"
              />
            </div>
            
            {/* Charts and Modules */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <RevenueChart />
              </div>
              <div>
                <AlertsModule alerts={[
                  { id: 1, title: "Low Stock Alert", description: "Premium dog food running low", severity: "warning", time: "2h ago" },
                  { id: 2, title: "Busy Day Ahead", description: "12 grooming appointments tomorrow", severity: "info", time: "4h ago" },
                  { id: 3, title: "New Product Arrival", description: "Organic cat treats now in stock", severity: "success", time: "6h ago" },
                ]} />
              </div>
            </div>
            
            {/* Tasks Module */}
            <TasksModule tasks={[
              { id: 1, title: "Restock popular brands", completed: false, priority: "high" },
              { id: 2, title: "Update grooming schedule", completed: true, priority: "medium" },
              { id: 3, title: "Review pet health records", completed: false, priority: "low" },
              { id: 4, title: "Plan loyalty program", completed: false, priority: "medium" },
            ]} />
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
