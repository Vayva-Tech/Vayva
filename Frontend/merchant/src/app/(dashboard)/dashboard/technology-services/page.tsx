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
  Code, 
  Server, 
  BarChart3,
  Megaphone,
  Settings,
  TrendingUp,
  Clock,
  CheckCircle
} from "lucide-react";

export default function TechnologyServicesDashboardHub() {
  return (
    <ErrorBoundary componentName="Technology Services Dashboard Hub">
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50">
        {/* Breadcrumb */}
        <Breadcrumbs items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Technology Services", href: "/dashboard/technology-services" },
        ]} />
        
        <div className="flex">
          {/* Sidebar Navigation */}
          <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4 fixed left-0 top-[73px]">
            <nav className="space-y-1">
              {/* Core Operations */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Technology Services Operations
              </div>
              
              <a
                href="/dashboard/technology-services"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md bg-violet-100 text-violet-700"
              >
                <div className="flex items-center gap-3">
                  <Home size={18} className="text-violet-600" />
                  <span>Dashboard</span>
                </div>
                <span className="w-2 h-2 bg-violet-600 rounded-full"></span>
              </a>
              
              <a
                href="/dashboard/technology-services/clients"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Users size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Clients</span>
                </div>
              </a>
              
              <a
                href="/dashboard/technology-services/projects"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Briefcase size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Projects</span>
                </div>
              </a>
              
              <a
                href="/dashboard/technology-services/tickets"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Code size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Support Tickets</span>
                </div>
              </a>
              
              <a
                href="/dashboard/technology-services/time-tracking"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Time Tracking</span>
                </div>
              </a>
              
              <a
                href="/dashboard/technology-services/invoices"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <DollarSign size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Invoices</span>
                </div>
              </a>
              
              <a
                href="/dashboard/technology-services/contracts"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Server size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>SLA Contracts</span>
                </div>
              </a>
              
              <a
                href="/dashboard/technology-services/deliverables"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Deliverables</span>
                </div>
              </a>
              
              {/* Business Management */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">
                Business Management
              </div>
              
              <a
                href="/dashboard/technology-services/finance"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <DollarSign size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Finance</span>
                </div>
              </a>
              
              <a
                href="/dashboard/technology-services/marketing"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Megaphone size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Marketing</span>
                </div>
              </a>
              
              <a
                href="/dashboard/technology-services/analytics"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Analytics</span>
                </div>
              </a>
              
              <a
                href="/dashboard/technology-services/settings"
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
                  href="/dashboard/technology-services/staff"
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
              <h1 className="text-3xl font-bold text-gray-900">Technology Services Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage IT projects, support tickets, and SLAs</p>
            </div>
            
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                title="Active Projects"
                value="14"
                change="+3 this month"
                trend="up"
                icon={Briefcase}
                color="violet"
              />
              <MetricCard
                title="Open Tickets"
                value="47"
                change="-8 resolved today"
                trend="down"
                icon={Code}
                color="purple"
              />
              <MetricCard
                title="Revenue (MTD)"
                value="$124,670"
                change="+14.2%"
                trend="up"
                icon={DollarSign}
                color="violet"
              />
              <MetricCard
                title="SLA Compliance"
                value="98.7%"
                change="+0.3%"
                trend="up"
                icon={CheckCircle}
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
                  { id: 1, title: "Critical Ticket", description: "Server outage - Client #2847", severity: "error", time: "30m ago" },
                  { id: 2, title: "Project Milestone", description: "Cloud migration Phase 2 complete", severity: "success", time: "2h ago" },
                  { id: 3, title: "Contract Renewal", description: "Annual SLA expires in 30 days", severity: "warning", time: "4h ago" },
                ]} />
              </div>
            </div>
            
            {/* Tasks Module */}
            <TasksModule tasks={[
              { id: 1, title: "Review critical ticket escalations", completed: false, priority: "high" },
              { id: 2, title: "Approve project timelines", completed: true, priority: "medium" },
              { id: 3, title: "Update SLA documentation", completed: false, priority: "low" },
              { id: 4, title: "Plan team training", completed: false, priority: "medium" },
            ]} />
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
