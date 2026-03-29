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
  Tag, 
  Package, 
  Users, 
  FileText, 
  DollarSign,
  BarChart3,
  Megaphone,
  Settings,
  TrendingUp,
  Truck,
  ClipboardCheck
} from "lucide-react";

export default function WholesaleDashboardHub() {
  return (
    <ErrorBoundary componentName="Wholesale Dashboard Hub">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        {/* Breadcrumb */}
        <Breadcrumbs items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Wholesale", href: "/dashboard/wholesale" },
        ]} />
        
        <div className="flex">
          {/* Sidebar Navigation */}
          <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4 fixed left-0 top-[73px]">
            <nav className="space-y-1">
              {/* Core Operations */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Wholesale Operations
              </div>
              
              <a
                href="/dashboard/wholesale"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md bg-blue-100 text-blue-700"
              >
                <div className="flex items-center gap-3">
                  <Home size={18} className="text-blue-600" />
                  <span>Dashboard</span>
                </div>
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              </a>
              
              <a
                href="/dashboard/wholesale/orders"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>B2B Orders</span>
                </div>
              </a>
              
              <a
                href="/dashboard/wholesale/pricing"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Tag size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Bulk Pricing</span>
                </div>
              </a>
              
              <a
                href="/dashboard/wholesale/catalog"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Package size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Catalog</span>
                </div>
              </a>
              
              <a
                href="/dashboard/wholesale/customers"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Users size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>CRM</span>
                </div>
              </a>
              
              <a
                href="/dashboard/wholesale/purchase-orders"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Purchase Orders</span>
                </div>
              </a>
              
              <a
                href="/dashboard/wholesale/inventory"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Package size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Inventory</span>
                </div>
              </a>
              
              <a
                href="/dashboard/wholesale/shipping"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Truck size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Shipping</span>
                </div>
              </a>
              
              {/* Business Management */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">
                Business Management
              </div>
              
              <a
                href="/dashboard/wholesale/finance"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <DollarSign size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Finance</span>
                </div>
              </a>
              
              <a
                href="/dashboard/wholesale/marketing"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Megaphone size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Marketing</span>
                </div>
              </a>
              
              <a
                href="/dashboard/wholesale/analytics"
                className="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 size={18} className="text-gray-400 group-hover:text-gray-600" />
                  <span>Analytics</span>
                </div>
              </a>
              
              <a
                href="/dashboard/wholesale/settings"
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
                  href="/dashboard/wholesale/staff"
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
              <h1 className="text-3xl font-bold text-gray-900">Wholesale Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage B2B orders, pricing, and bulk sales</p>
            </div>
            
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                title="Total Orders (MTD)"
                value="847"
                change="+12.4%"
                trend="up"
                icon={ShoppingCart}
                color="blue"
              />
              <MetricCard
                title="Revenue (MTD)"
                value="$284,590"
                change="+18.7%"
                trend="up"
                icon={DollarSign}
                color="indigo"
              />
              <MetricCard
                title="Active Accounts"
                value="326"
                change="+5.2%"
                trend="up"
                icon={Users}
                color="blue"
              />
              <MetricCard
                title="Order Fulfillment"
                value="98.3%"
                change="+1.2%"
                trend="up"
                icon={ClipboardCheck}
                color="indigo"
              />
            </div>
            
            {/* Charts and Modules */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <RevenueChart />
              </div>
              <div>
                <AlertsModule alerts={[
                  { id: 1, title: "Large Order Pending", description: "Order #WH-8472 requires approval ($52K)", severity: "info", time: "30m ago" },
                  { id: 2, title: "Stock Alert", description: "SKU-4829 below reorder point", severity: "warning", time: "2h ago" },
                  { id: 3, title: "Payment Received", description: "$28,450 from Acme Corp", severity: "success", time: "4h ago" },
                ]} />
              </div>
            </div>
            
            {/* Tasks Module */}
            <TasksModule tasks={[
              { id: 1, title: "Review bulk pricing proposals", completed: false, priority: "high" },
              { id: 2, title: "Approve credit applications", completed: true, priority: "high" },
              { id: 3, title: "Update product catalog", completed: false, priority: "medium" },
              { id: 4, title: "Schedule client meetings", completed: false, priority: "low" },
            ]} />
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
