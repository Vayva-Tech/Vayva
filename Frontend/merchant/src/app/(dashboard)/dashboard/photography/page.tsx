"use client";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Breadcrumbs } from "@/components/shared";
import { MetricCard } from "@/components/dashboard/modules";
import { TasksModule } from "@/components/dashboard/modules";
import { AlertsModule } from "@/components/dashboard/modules";
import { RevenueChart } from "@/components/dashboard/modules";
import { 
  Home, 
  Calendar, 
  Users, 
  DollarSign, 
  Camera, 
  Image, 
  BarChart3,
  Megaphone,
  Settings,
  TrendingUp,
  Clock,
  FolderOpen
} from "lucide-react";

export default function PhotographyDashboardHub() {
  return (
    <ErrorBoundary componentName="Photography Dashboard Hub">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-50">
        {/* Breadcrumb */}
        <Breadcrumbs items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Photography", href: "/dashboard/photography" },
        ]} />
        
        <div className="flex">
          {/* Sidebar Navigation */}
          <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4 fixed left-0 top-[73px]">
            <nav className="space-y-1">
              {/* Core Operations */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Photography Operations
              </div>
              
              <a
                href="/dashboard/photography"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md bg-slate-100 text-slate-700"
              >
                <div className="flex items-center gap-3">
                  <Home size={18} className="text-slate-600" />
                  <span>Dashboard</span>
                </div>
                <span className="w-2 h-2 bg-slate-600 rounded-full"></span>
              </a>
              
              <a
                href="/dashboard/photography/bookings"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Bookings</span>
                </div>
              </a>
              
              <a
                href="/dashboard/photography/clients"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Users size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Clients</span>
                </div>
              </a>
              
              <a
                href="/dashboard/photography/sessions"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Camera size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Sessions</span>
                </div>
              </a>
              
              <a
                href="/dashboard/photography/gallery"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Image size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Gallery</span>
                </div>
              </a>
              
              <a
                href="/dashboard/photography/packages"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <FolderOpen size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Packages</span>
                </div>
              </a>
              
              <a
                href="/dashboard/photography/invoices"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <DollarSign size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Invoices</span>
                </div>
              </a>
              
              <a
                href="/dashboard/photography/equipment"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Equipment</span>
                </div>
              </a>
              
              {/* Business Management */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">
                Business Management
              </div>
              
              <a
                href="/dashboard/photography/finance"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <DollarSign size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Finance</span>
                </div>
              </a>
              
              <a
                href="/dashboard/photography/marketing"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Megaphone size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Marketing</span>
                </div>
              </a>
              
              <a
                href="/dashboard/photography/analytics"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Analytics</span>
                </div>
              </a>
              
              <a
                href="/dashboard/photography/settings"
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
                  href="/dashboard/photography/staff"
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
              <h1 className="text-3xl font-bold text-gray-900">Photography Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage bookings, sessions, and galleries</p>
            </div>
            
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                title="Bookings This Month"
                value="32"
                change="+8.7%"
                trend="up"
                icon={Calendar}
                color="slate"
              />
              <MetricCard
                title="Revenue (MTD)"
                value="$18,450"
                change="+15.2%"
                trend="up"
                icon={DollarSign}
                color="gray"
              />
              <MetricCard
                title="Sessions This Week"
                value="8"
                change="3 weddings, 5 portraits"
                trend="neutral"
                icon={Camera}
                color="slate"
              />
              <MetricCard
                title="Avg Session Value"
                value="$575"
                change="+12.3%"
                trend="up"
                icon={TrendingUp}
                color="gray"
              />
            </div>
            
            {/* Charts and Modules */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <RevenueChart 
                  data={[
                    { date: 'Week 1', value: 4200 },
                    { date: 'Week 2', value: 5100 },
                    { date: 'Week 3', value: 4800 },
                    { date: 'Week 4', value: 5750 },
                  ]}
                  title="Monthly Revenue Trends"
                />
              </div>
              <div>
                <AlertsModule alerts={[
                  { id: "1", title: "Wedding Tomorrow", description: "Sarah & Mike - arrive at 2 PM", severity: "info", time: "1h ago" },
                  { id: "2", title: "Gallery Ready", description: "Johnson family portraits edited", severity: "success", time: "3h ago" },
                  { id: "3", title: "Equipment Maintenance", description: "Camera sensor cleaning due", severity: "warning", time: "5h ago" },
                ]} />
              </div>
            </div>
            
            {/* Tasks Module */}
            <TasksModule tasks={[
              { id: "1", title: "Edit wedding photos", completed: false, priority: "high" },
              { id: "2", title: "Send booking contracts", completed: true, priority: "medium" },
              { id: "3", title: "Update portfolio gallery", completed: false, priority: "low" },
              { id: "4", title: "Review equipment inventory", completed: false, priority: "medium" },
            ]} />
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
