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
  TrendingUp as TrendingUpIcon,
  BarChart3,
  Megaphone,
  Settings,
  PieChart,
  Wallet,
  CreditCard
} from "lucide-react";

export default function FinancialServicesDashboardHub() {
  return (
    <ErrorBoundary componentName="Financial Services Dashboard Hub">
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
        {/* Breadcrumb */}
        <Breadcrumbs items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Financial Services", href: "/dashboard/financial-services" },
        ]} />
        
        <div className="flex">
          {/* Sidebar Navigation */}
          <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4 fixed left-0 top-[73px]">
            <nav className="space-y-1">
              {/* Core Operations */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Financial Services Operations
              </div>
              
              <a
                href="/dashboard/financial-services"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md bg-green-100 text-green-700"
              >
                <div className="flex items-center gap-3">
                  <Home size={18} className="text-green-600" />
                  <span>Dashboard</span>
                </div>
                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
              </a>
              
              <a
                href="/dashboard/financial-services/clients"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Users size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Clients</span>
                </div>
              </a>
              
              <a
                href="/dashboard/financial-services/portfolios"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Briefcase size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Portfolios</span>
                </div>
              </a>
              
              <a
                href="/dashboard/financial-services/investments"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <TrendingUpIcon size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Investments</span>
                </div>
              </a>
              
              <a
                href="/dashboard/financial-services/accounts"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Wallet size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Accounts</span>
                </div>
              </a>
              
              <a
                href="/dashboard/financial-services/transactions"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <CreditCard size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Transactions</span>
                </div>
              </a>
              
              <a
                href="/dashboard/financial-services/reports"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Reports</span>
                </div>
              </a>
              
              <a
                href="/dashboard/financial-services/compliance"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <PieChart size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Compliance</span>
                </div>
              </a>
              
              {/* Business Management */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">
                Business Management
              </div>
              
              <a
                href="/dashboard/financial-services/finance"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <DollarSign size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Finance</span>
                </div>
              </a>
              
              <a
                href="/dashboard/financial-services/marketing"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Megaphone size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Marketing</span>
                </div>
              </a>
              
              <a
                href="/dashboard/financial-services/analytics"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Analytics</span>
                </div>
              </a>
              
              <a
                href="/dashboard/financial-services/settings"
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
                  href="/dashboard/financial-services/staff"
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
              <h1 className="text-3xl font-bold text-gray-900">Financial Services Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage portfolios, investments, and client assets</p>
            </div>
            
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                title="Assets Under Management"
                value="$24.7M"
                change="+5.8%"
                trend="up"
                icon={Briefcase}
                color="green"
              />
              <MetricCard
                title="Active Clients"
                value="187"
                change="+12 this month"
                trend="up"
                icon={Users}
                color="emerald"
              />
              <MetricCard
                title="Revenue (MTD)"
                value="$142,890"
                change="+11.3%"
                trend="up"
                icon={DollarSign}
                color="green"
              />
              <MetricCard
                title="Portfolio Growth (Avg)"
                value="+8.4%"
                change="+1.2% vs last month"
                trend="up"
                icon={TrendingUpIcon}
                color="emerald"
              />
            </div>
            
            {/* Charts and Modules */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <RevenueChart />
              </div>
              <div>
                <AlertsModule alerts={[
                  { id: 1, title: "Market Alert", description: "S&P 500 down 2.3% - review client portfolios", severity: "warning", time: "30m ago" },
                  { id: 2, title: "Client Meeting", description: "Portfolio review with Mr. Johnson at 2 PM", severity: "info", time: "2h ago" },
                  { id: 3, title: "Compliance Update", description: "Q1 regulatory filing due in 7 days", severity: "warning", time: "4h ago" },
                ]} />
              </div>
            </div>
            
            {/* Tasks Module */}
            <TasksModule tasks={[
              { id: 1, title: "Rebalance model portfolios", completed: false, priority: "high" },
              { id: 2, title: "Review quarterly performance", completed: true, priority: "high" },
              { id: 3, title: "Update client investment policies", completed: false, priority: "medium" },
              { id: 4, title: "Prepare market commentary", completed: false, priority: "low" },
            ]} />
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
