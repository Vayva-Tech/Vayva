"use client";

import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { TasksModule } from "@/components/dashboard/TasksModule";
import { AlertsModule } from "@/components/dashboard/AlertsModule";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { 
  Home, 
  UtensilsCrossed, 
  MapPin, 
  DollarSign, 
  Package, 
  Users, 
  Calendar, 
  BarChart3,
  Megaphone,
  Settings,
  Clock,
  TrendingUp,
  ShoppingBag
} from "lucide-react";

export default function FoodTruckDashboardHub() {
  return (
    <ErrorBoundary componentName="Food Truck Dashboard Hub">
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        {/* Breadcrumb */}
        <Breadcrumbs items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Food Truck", href: "/dashboard/food-truck" },
        ]} />
        
        <div className="flex">
          {/* Sidebar Navigation */}
          <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4 fixed left-0 top-[73px]">
            <nav className="space-y-1">
              {/* Core Operations */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Food Truck Operations
              </div>
              
              <a
                href="/dashboard/food-truck"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md bg-orange-100 text-orange-700"
              >
                <div className="flex items-center gap-3">
                  <Home size={18} className="text-orange-600" />
                  <span>Dashboard</span>
                </div>
                <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
              </a>
              
              <a
                href="/dashboard/food-truck/menu"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <UtensilsCrossed size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Menu</span>
                </div>
              </a>
              
              <a
                href="/dashboard/food-truck/routes"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Route Schedule</span>
                </div>
              </a>
              
              <a
                href="/dashboard/food-truck/location"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Location Tracker</span>
                </div>
              </a>
              
              <a
                href="/dashboard/food-truck/sales"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <DollarSign size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Sales</span>
                </div>
              </a>
              
              <a
                href="/dashboard/food-truck/inventory"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Package size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Inventory</span>
                </div>
              </a>
              
              <a
                href="/dashboard/food-truck/customers"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Users size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Customers</span>
                </div>
              </a>
              
              <a
                href="/dashboard/food-truck/events"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Events</span>
                </div>
              </a>
              
              {/* Business Management */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">
                Business Management
              </div>
              
              <a
                href="/dashboard/food-truck/finance"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <DollarSign size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Finance</span>
                </div>
              </a>
              
              <a
                href="/dashboard/food-truck/marketing"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Megaphone size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Marketing</span>
                </div>
              </a>
              
              <a
                href="/dashboard/food-truck/analytics"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Analytics</span>
                </div>
              </a>
              
              <a
                href="/dashboard/food-truck/settings"
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
                  href="/dashboard/food-truck/staff"
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
              <h1 className="text-3xl font-bold text-gray-900">Food Truck Dashboard</h1>
              <p className="text-gray-600 mt-1">Track locations, sales, and operations on the go</p>
            </div>
            
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                title="Today's Revenue"
                value="$1,247"
                change="+18.2%"
                trend="up"
                icon={DollarSign}
                color="orange"
              />
              <MetricCard
                title="Active Location"
                value="Downtown Plaza"
                change="8 hrs today"
                trend="neutral"
                icon={MapPin}
                color="red"
              />
              <MetricCard
                title="Orders Today"
                value="87"
                change="+12.5%"
                trend="up"
                icon={ShoppingBag}
                color="orange"
              />
              <MetricCard
                title="Avg Ticket"
                value="$14.32"
                change="+5.7%"
                trend="up"
                icon={TrendingUp}
                color="red"
              />
            </div>
            
            {/* Charts and Modules */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <RevenueChart />
              </div>
              <div>
                <AlertsModule alerts={[
                  { id: 1, title: "Low Inventory", description: "Running low on packaging supplies", severity: "warning", time: "2h ago" },
                  { id: 2, title: "Event Tomorrow", description: "Music Festival - arrive by 10 AM", severity: "info", time: "3h ago" },
                  { id: 3, title: "Permit Renewal", description: "Health permit expires in 14 days", severity: "warning", time: "1d ago" },
                ]} />
              </div>
            </div>
            
            {/* Tasks Module */}
            <TasksModule tasks={[
              { id: 1, title: "Restock ingredients", completed: false, priority: "high" },
              { id: 2, title: "Confirm event location", completed: true, priority: "medium" },
              { id: 3, title: "Update menu prices", completed: false, priority: "low" },
              { id: 4, title: "Schedule maintenance", completed: false, priority: "medium" },
            ]} />
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
