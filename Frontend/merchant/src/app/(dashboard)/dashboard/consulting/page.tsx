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
  FileText, 
  Presentation,
  BarChart3,
  Megaphone,
  Settings,
  TrendingUp,
  Clock,
  CheckCircle
} from "lucide-react";

export default function ConsultingDashboardHub() {
  return (
    <ErrorBoundary componentName="Consulting Dashboard Hub">
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
        {/* Breadcrumb */}
        <Breadcrumbs items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Consulting", href: "/dashboard/consulting" },
        ]} />
        
        <div className="flex">
          {/* Sidebar Navigation */}
          <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4 fixed left-0 top-[73px]">
            <nav className="space-y-1">
              {/* Core Operations */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Consulting Operations
              </div>
              
              <a
                href="/dashboard/consulting"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md bg-indigo-100 text-indigo-700"
              >
                <div className="flex items-center gap-3">
                  <Home size={18} className="text-indigo-600" />
                  <span>Dashboard</span>
                </div>
                <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
              </a>
              
              <a
                href="/dashboard/consulting/clients"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Users size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Clients</span>
                </div>
              </a>
              
              <a
                href="/dashboard/consulting/projects"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Briefcase size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Projects</span>
                </div>
              </a>
              
              <a
                href="/dashboard/consulting/time-tracking"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Time Tracking</span>
                </div>
              </a>
              
              <a
                href="/dashboard/consulting/invoices"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <DollarSign size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Invoices</span>
                </div>
              </a>
              
              <a
                href="/dashboard/consulting/proposals"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Proposals</span>
                </div>
              </a>
              
              <a
                href="/dashboard/consulting/deliverables"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Deliverables</span>
                </div>
              </a>
              
              <a
                href="/dashboard/consulting/presentations"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Presentation size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Presentations</span>
                </div>
              </a>
              
              {/* Business Management */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">
                Business Management
              </div>
              
              <a
                href="/dashboard/consulting/finance"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <DollarSign size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Finance</span>
                </div>
              </a>
              
              <a
                href="/dashboard/consulting/marketing"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Megaphone size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Marketing</span>
                </div>
              </a>
              
              <a
                href="/dashboard/consulting/analytics"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Analytics</span>
                </div>
              </a>
              
              <a
                href="/dashboard/consulting/settings"
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
                  href="/dashboard/consulting/staff"
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
              <h1 className="text-3xl font-bold text-gray-900">Consulting Dashboard</h1>
              <p className="text-gray-600 mt-1">Track projects, billable hours, and client engagements</p>
            </div>
            
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                title="Active Projects"
                value="12"
                change="+2 this month"
                trend="up"
                icon={Briefcase}
                color="indigo"
              />
              <MetricCard
                title="Billable Hours (MTD)"
                value="487"
                change="+15.3%"
                trend="up"
                icon={Clock}
                color="blue"
              />
              <MetricCard
                title="Revenue (MTD)"
                value="$97,450"
                change="+18.7%"
                trend="up"
                icon={DollarSign}
                color="indigo"
              />
              <MetricCard
                title="Utilization Rate"
                value="78%"
                change="+5%"
                trend="up"
                icon={TrendingUp}
                color="blue"
              />
            </div>
            
            {/* Charts and Modules */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <RevenueChart />
              </div>
              <div>
                <AlertsModule alerts={[
                  { id: 1, title: "Project Deadline", description: "Acme Corp strategy deck due Friday", severity: "warning", time: "1h ago" },
                  { id: 2, title: "Invoice Overdue", description: "TechStart Inc - $12,500 (15 days)", severity: "error", time: "3h ago" },
                  { id: 3, title: "New Proposal Request", description: "Global Retail - digital transformation", severity: "info", time: "5h ago" },
                ]} />
              </div>
            </div>
            
            {/* Tasks Module */}
            <TasksModule tasks={[
              { id: 1, title: "Complete client presentation", completed: false, priority: "high" },
              { id: 2, title: "Submit timesheets", completed: true, priority: "medium" },
              { id: 3, title: "Review project deliverables", completed: false, priority: "high" },
              { id: 4, title: "Update proposal templates", completed: false, priority: "low" },
            ]} />
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
