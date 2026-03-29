"use client";

import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { TasksModule } from "@/components/dashboard/TasksModule";
import { AlertsModule } from "@/components/dashboard/AlertsModule";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { 
  Home, 
  BedDouble, 
  Calendar, 
  Users, 
  Utensils, 
  Sparkles, 
  DollarSign,
  BarChart3,
  Megaphone,
  Settings,
  TrendingUp,
  Clock,
  Star
} from "lucide-react";

export default function HotelDashboardHub() {
  return (
    <ErrorBoundary componentName="Hotel Dashboard Hub">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
        {/* Breadcrumb */}
        <Breadcrumbs items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Hotel", href: "/dashboard/hotel" },
        ]} />
        
        <div className="flex">
          {/* Sidebar Navigation */}
          <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4 fixed left-0 top-[73px]">
            <nav className="space-y-1">
              {/* Core Operations */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Hotel Operations
              </div>
              
              <a
                href="/dashboard/hotel"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md bg-blue-100 text-blue-700"
              >
                <div className="flex items-center gap-3">
                  <Home size={18} className="text-blue-600" />
                  <span>Dashboard</span>
                </div>
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              </a>
              
              <a
                href="/dashboard/hotel/reservations"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Reservations</span>
                </div>
              </a>
              
              <a
                href="/dashboard/hotel/check-in-out"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Check-In/Out</span>
                </div>
              </a>
              
              <a
                href="/dashboard/hotel/rooms"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <BedDouble size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Room Management</span>
                </div>
              </a>
              
              <a
                href="/dashboard/hotel/guests"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Users size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Guests</span>
                </div>
              </a>
              
              <a
                href="/dashboard/hotel/housekeeping"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Sparkles size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Housekeeping</span>
                </div>
              </a>
              
              <a
                href="/dashboard/hotel/restaurant"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Utensils size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Restaurant</span>
                </div>
              </a>
              
              <a
                href="/dashboard/hotel/services"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Star size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Guest Services</span>
                </div>
              </a>
              
              {/* Business Management */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">
                Business Management
              </div>
              
              <a
                href="/dashboard/hotel/finance"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <DollarSign size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Finance</span>
                </div>
              </a>
              
              <a
                href="/dashboard/hotel/marketing"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Megaphone size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Marketing</span>
                </div>
              </a>
              
              <a
                href="/dashboard/hotel/analytics"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Analytics</span>
                </div>
              </a>
              
              <a
                href="/dashboard/hotel/settings"
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
                  href="/dashboard/hotel/staff"
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
              <h1 className="text-3xl font-bold text-gray-900">Hotel Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage reservations, guests, and hospitality services</p>
            </div>
            
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                title="Occupancy Rate"
                value="87%"
                change="+12%"
                trend="up"
                icon={BedDouble}
                color="blue"
              />
              <MetricCard
                title="Revenue (MTD)"
                value="$184,290"
                change="+18.4%"
                trend="up"
                icon={DollarSign}
                color="cyan"
              />
              <MetricCard
                title="Guests Today"
                value="247"
                change="+15 check-ins"
                trend="up"
                icon={Users}
                color="blue"
              />
              <MetricCard
                title="Avg Daily Rate"
                value="$189"
                change="+8.2%"
                trend="up"
                icon={TrendingUp}
                color="cyan"
              />
            </div>
            
            {/* Charts and Modules */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <RevenueChart />
              </div>
              <div>
                <AlertsModule alerts={[
                  { id: 1, title: "VIP Check-In", description: "Suite 501 - VIP guest arriving at 3 PM", severity: "info", time: "1h ago" },
                  { id: 2, title: "Housekeeping Alert", description: "Rooms 301-315 need urgent cleaning", severity: "warning", time: "2h ago" },
                  { id: 3, title: "Restaurant Reservation", description: "Large party of 12 at 7 PM", severity: "info", time: "4h ago" },
                ]} />
              </div>
            </div>
            
            {/* Tasks Module */}
            <TasksModule tasks={[
              { id: 1, title: "Review today's check-outs", completed: false, priority: "high" },
              { id: 2, title: "Approve housekeeping schedule", completed: true, priority: "medium" },
              { id: 3, title: "Update room rates for season", completed: false, priority: "medium" },
              { id: 4, title: "Plan guest appreciation event", completed: false, priority: "low" },
            ]} />
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
