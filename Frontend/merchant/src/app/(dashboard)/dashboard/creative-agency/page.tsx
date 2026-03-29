"use client";

import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { TasksModule } from "@/components/dashboard/TasksModule";
import { AlertsModule } from "@/components/dashboard/AlertsModule";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { 
  Home, 
  Briefcase, 
  Users, 
  DollarSign, 
  Palette, 
  Layers, 
  BarChart3,
  Megaphone,
  Settings,
  TrendingUp,
  Clock,
  FolderOpen
} from "lucide-react";

export default function CreativeAgencyDashboardHub() {
  return (
    <ErrorBoundary componentName="Creative Agency Dashboard Hub">
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50">
        {/* Breadcrumb */}
        <Breadcrumbs items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Creative Agency", href: "/dashboard/creative-agency" },
        ]} />
        
        <div className="flex">
          {/* Sidebar Navigation */}
          <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4 fixed left-0 top-[73px]">
            <nav className="space-y-1">
              {/* Core Operations */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Creative Agency Operations
              </div>
              
              <a
                href="/dashboard/creative-agency"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md bg-pink-100 text-pink-700"
              >
                <div className="flex items-center gap-3">
                  <Home size={18} className="text-pink-600" />
                  <span>Dashboard</span>
                </div>
                <span className="w-2 h-2 bg-pink-600 rounded-full"></span>
              </a>
              
              <a
                href="/dashboard/creative-agency/clients"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Users size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Clients</span>
                </div>
              </a>
              
              <a
                href="/dashboard/creative-agency/projects"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Briefcase size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Projects</span>
                </div>
              </a>
              
              <a
                href="/dashboard/creative-agency/time-tracking"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Time Tracking</span>
                </div>
              </a>
              
              <a
                href="/dashboard/creative-agency/invoices"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <DollarSign size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Invoices</span>
                </div>
              </a>
              
              <a
                href="/dashboard/creative-agency/designs"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Palette size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Designs</span>
                </div>
              </a>
              
              <a
                href="/dashboard/creative-agency/assets"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Layers size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Assets</span>
                </div>
              </a>
              
              <a
                href="/dashboard/creative-agency/portfolio"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <FolderOpen size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Portfolio</span>
                </div>
              </a>
              
              {/* Business Management */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">
                Business Management
              </div>
              
              <a
                href="/dashboard/creative-agency/finance"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <DollarSign size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Finance</span>
                </div>
              </a>
              
              <a
                href="/dashboard/creative-agency/marketing"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Megaphone size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Marketing</span>
                </div>
              </a>
              
              <a
                href="/dashboard/creative-agency/analytics"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Analytics</span>
                </div>
              </a>
              
              <a
                href="/dashboard/creative-agency/settings"
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
                  href="/dashboard/creative-agency/staff"
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
              <h1 className="text-3xl font-bold text-gray-900">Creative Agency Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage creative projects, designs, and clients</p>
            </div>
            
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                title="Active Projects"
                value="18"
                change="+4 this month"
                trend="up"
                icon={Briefcase}
                color="pink"
              />
              <MetricCard
                title="Billable Hours (MTD)"
                value="623"
                change="+12.8%"
                trend="up"
                icon={Clock}
                color="rose"
              />
              <MetricCard
                title="Revenue (MTD)"
                value="$78,920"
                change="+16.4%"
                trend="up"
                icon={DollarSign}
                color="pink"
              />
              <MetricCard
                title="Avg Project Value"
                value="$4,385"
                change="+8.2%"
                trend="up"
                icon={TrendingUp}
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
                  { id: 1, title: "Client Review Needed", description: "Brand refresh concepts ready for feedback", severity: "warning", time: "2h ago" },
                  { id: 2, title: "Project Launch", description: "E-commerce site goes live tomorrow", severity: "info", time: "4h ago" },
                  { id: 3, title: "New Inquiry", description: "Tech startup interested in full rebrand", severity: "success", time: "6h ago" },
                ]} />
              </div>
            </div>
            
            {/* Tasks Module */}
            <TasksModule tasks={[
              { id: 1, title: "Finalize logo concepts", completed: false, priority: "high" },
              { id: 2, title: "Submit client invoices", completed: true, priority: "high" },
              { id: 3, title: "Update portfolio website", completed: false, priority: "medium" },
              { id: 4, title: "Review design team capacity", completed: false, priority: "low" },
            ]} />
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
