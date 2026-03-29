"use client";

import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { TasksModule } from "@/components/dashboard/TasksModule";
import { AlertsModule } from "@/components/dashboard/AlertsModule";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { 
  Home, 
  Calendar, 
  Users, 
  DollarSign, 
  ClipboardList, 
  Mail, 
  BarChart3,
  Megaphone,
  Settings,
  TrendingUp,
  Clock,
  CheckCircle
} from "lucide-react";

export default function EventPlanningDashboardHub() {
  return (
    <ErrorBoundary componentName="Event Planning Dashboard Hub">
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        {/* Breadcrumb */}
        <Breadcrumbs items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Event Planning", href: "/dashboard/event-planning" },
        ]} />
        
        <div className="flex">
          {/* Sidebar Navigation */}
          <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4 fixed left-0 top-[73px]">
            <nav className="space-y-1">
              {/* Core Operations */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Event Planning Operations
              </div>
              
              <a
                href="/dashboard/event-planning"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md bg-purple-100 text-purple-700"
              >
                <div className="flex items-center gap-3">
                  <Home size={18} className="text-purple-600" />
                  <span>Dashboard</span>
                </div>
                <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
              </a>
              
              <a
                href="/dashboard/event-planning/events"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Events</span>
                </div>
              </a>
              
              <a
                href="/dashboard/event-planning/clients"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Users size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Clients</span>
                </div>
              </a>
              
              <a
                href="/dashboard/event-planning/bookings"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <ClipboardList size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Bookings</span>
                </div>
              </a>
              
              <a
                href="/dashboard/event-planning/vendors"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Users size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Vendors</span>
                </div>
              </a>
              
              <a
                href="/dashboard/event-planning/budgets"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <DollarSign size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Budgets</span>
                </div>
              </a>
              
              <a
                href="/dashboard/event-planning/timelines"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Timelines</span>
                </div>
              </a>
              
              <a
                href="/dashboard/event-planning/checklists"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Checklists</span>
                </div>
              </a>
              
              {/* Business Management */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">
                Business Management
              </div>
              
              <a
                href="/dashboard/event-planning/finance"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <DollarSign size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Finance</span>
                </div>
              </a>
              
              <a
                href="/dashboard/event-planning/marketing"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Megaphone size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Marketing</span>
                </div>
              </a>
              
              <a
                href="/dashboard/event-planning/analytics"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Analytics</span>
                </div>
              </a>
              
              <a
                href="/dashboard/event-planning/settings"
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
                  href="/dashboard/event-planning/staff"
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
              <h1 className="text-3xl font-bold text-gray-900">Event Planning Dashboard</h1>
              <p className="text-gray-600 mt-1">Coordinate events, clients, and vendors</p>
            </div>
            
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                title="Active Events"
                value="24"
                change="+3 this month"
                trend="up"
                icon={Calendar}
                color="purple"
              />
              <MetricCard
                title="Revenue (MTD)"
                value="$67,890"
                change="+22.4%"
                trend="up"
                icon={DollarSign}
                color="pink"
              />
              <MetricCard
                title="Upcoming This Week"
                value="7"
                change="2 weddings, 5 corporate"
                trend="neutral"
                icon={Clock}
                color="purple"
              />
              <MetricCard
                title="Client Satisfaction"
                value="4.9/5"
                change="+0.1"
                trend="up"
                icon={CheckCircle}
                color="pink"
              />
            </div>
            
            {/* Charts and Modules */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <RevenueChart />
              </div>
              <div>
                <AlertsModule alerts={[
                  { id: 1, title: "Wedding Tomorrow", description: "Johnson wedding - final walkthrough at 10 AM", severity: "info", time: "2h ago" },
                  { id: 2, title: "Vendor Confirmation", description: "Catering company needs menu approval", severity: "warning", time: "4h ago" },
                  { id: 3, title: "New Booking", description: "Corporate event for 200 people inquired", severity: "success", time: "6h ago" },
                ]} />
              </div>
            </div>
            
            {/* Tasks Module */}
            <TasksModule tasks={[
              { id: 1, title: "Finalize vendor contracts", completed: false, priority: "high" },
              { id: 2, title: "Send client invoices", completed: true, priority: "high" },
              { id: 3, title: "Update event timelines", completed: false, priority: "medium" },
              { id: 4, title: "Review venue layouts", completed: false, priority: "low" },
            ]} />
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
