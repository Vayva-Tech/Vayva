"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Globe,
  FileText,
  PenTool,
  Mail,
  Package,
  Truck,
  Users,
  BarChart3,
  Grid3X3,
  Video,
  Settings,
  Search,
  Bell,
  Plus,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Zap,
  Clock,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

// Pro/Advanced Tier Dashboard V2 Mockup - Mint Theme
export function DashboardMockup(): React.JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative w-full max-w-6xl mx-auto"
    >
      {/* Browser Chrome */}
      <div className="relative bg-slate-900 rounded-t-xl p-3 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <div className="flex-1 mx-4">
          <div className="bg-slate-800 rounded-lg px-4 py-1.5 text-xs text-slate-400 flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-500/20 flex items-center justify-center">
              <span className="text-emerald-400 text-[10px] font-bold">V</span>
            </div>
            merchant.vayva.ng/dashboard
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center relative">
            <Bell className="w-4 h-4 text-slate-400" />
            <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <span className="text-emerald-400 text-xs font-semibold">AB</span>
          </div>
        </div>
      </div>

      {/* Dashboard Container - Mint Theme */}
      <div className="bg-emerald-50/50 rounded-b-xl overflow-hidden shadow-2xl">
        <div className="flex h-[600px]">
          {/* Left Icon Sidebar - Fixed Settings at Bottom */}
          <div className="w-14 bg-white border-r border-slate-200 flex flex-col items-center py-4">
            {/* Logo at top */}
            <div className="mb-6">
              <Image
                src="/vayva-logo-official.svg"
                alt="Vayva"
                width={32}
                height={22}
                className="w-7 h-auto"
              />
            </div>
            
            {/* Main navigation icons */}
            <div className="flex-1 flex flex-col items-center gap-1">
              <SidebarIcon icon={LayoutDashboard} active />
              <SidebarIcon icon={Globe} />
              <SidebarIcon icon={FileText} />
              <SidebarIcon icon={PenTool} />
              <SidebarIcon icon={Mail} />
              <SidebarIcon icon={Package} />
              <SidebarIcon icon={Truck} />
              <SidebarIcon icon={Users} />
              <SidebarIcon icon={BarChart3} />
              <SidebarIcon icon={Grid3X3} />
              <SidebarIcon icon={Video} />
            </div>
            
            {/* Settings fixed at bottom */}
            <div className="mt-auto pt-4">
              <SidebarIcon icon={Settings} />
            </div>
          </div>

          {/* Left Panel - My Tasks & AI Assistant */}
          <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
            {/* Merchant Header */}
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900">Merchant</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-slate-400">amina.vayva.ng</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-600 rounded">Live</span>
              </div>
            </div>
            
            <div className="flex-1 p-4 overflow-auto">

            {/* My Tasks */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900">My Tasks</h3>
                <Plus className="w-4 h-4 text-slate-400 cursor-pointer" />
              </div>
              <div className="flex gap-2 mb-3">
                <button className="px-3 py-1 bg-slate-900 text-white text-xs font-medium rounded-full">Today</button>
                <button className="px-3 py-1 text-slate-500 text-xs font-medium hover:bg-slate-100 rounded-full">Tomorrow</button>
              </div>
              <div className="space-y-2">
                <TaskItem icon={Package} title="Review 3 pending or..." desc="Orders awaiting confirm..." />
                <TaskItem icon={AlertCircle} title="Restock Ankara Dre..." desc="Only 2 left in inventory" />
                <TaskItem icon={MessageSquare} title="Reply to customer in..." desc="Fatima asked about deliv..." />
              </div>
            </div>

            {/* AI Assistant Card */}
            <div className="bg-slate-50 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900">AI Assistant</h3>
                <Zap className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-violet-100 rounded-lg p-2">
                  <p className="text-[10px] text-violet-600 uppercase">Captured</p>
                  <p className="text-lg font-bold text-violet-700">892</p>
                  <p className="text-[10px] text-violet-500">conversations</p>
                </div>
                <div className="bg-emerald-100 rounded-lg p-2">
                  <p className="text-[10px] text-emerald-600 uppercase">Auto-Orders</p>
                  <p className="text-lg font-bold text-emerald-700">234</p>
                  <p className="text-[10px] text-emerald-500">created</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-2">
                  <p className="text-[10px] text-blue-600 uppercase">Avg Response</p>
                  <p className="text-lg font-bold text-blue-700">1.2s</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-2">
                  <p className="text-[10px] text-amber-600 uppercase">Satisfaction</p>
                  <p className="text-lg font-bold text-amber-700">94%</p>
                </div>
              </div>
            </div>
            </div>
            
            {/* Control Center - Last item before Settings */}
            <div className="p-4 border-t border-slate-100">
              <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Grid3X3 className="w-4 h-4 text-slate-600" />
                </div>
                <span className="text-sm font-medium text-slate-900">Control Center</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Manage and track your store</p>
                <h1 className="text-xl font-semibold text-slate-900">Store Dashboard</h1>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-xl hover:bg-slate-800">
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>

            {/* Key Metrics */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-900">Key Metrics</h3>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
              <div className="grid grid-cols-4 gap-6">
                <KeyMetric label="REVENUE" value="₦2.4M" change="23%" isPositive />
                <KeyMetric label="ORDERS" value="347" change="12%" isPositive />
                <KeyMetric label="CUSTOMERS" value="1,204" change="8%" isPositive />
                <KeyMetric label="CONVERSION" value="4.2%" change="2%" isPositive={false} />
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Revenue & AI Conversions */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-900">Revenue & AI Conversions</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
                      <span className="text-[10px] text-slate-500">Revenue</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-sm bg-violet-300" />
                      <span className="text-[10px] text-slate-500">AI Orders</span>
                    </div>
                  </div>
                </div>
                <RevenueChart />
              </div>

              {/* Orders Overview */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-900">Orders Overview</h3>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path className="text-emerald-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                      <path className="text-emerald-500" strokeDasharray="70, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-slate-900">347</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <LegendItem color="bg-emerald-500" label="Delivered" value="198" />
                    <LegendItem color="bg-blue-400" label="Processing" value="89" />
                    <LegendItem color="bg-amber-400" label="Pending" value="42" />
                    <LegendItem color="bg-slate-300" label="Cancelled" value="18" />
                  </div>
                </div>
              </div>
            </div>

            {/* AI Performance */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-900">AI Performance</h3>
                <span className="text-[10px] px-2 py-1 bg-emerald-100 text-emerald-600 rounded-full">Active</span>
              </div>
              <div className="grid grid-cols-4 gap-6">
                <AIPerformanceMetric icon={MessageSquare} label="CONVERSATIONS" value="892" change="+24%" />
                <AIPerformanceMetric icon={Zap} label="AUTO-ORDERS" value="234" change="+31%" />
                <AIPerformanceMetric icon={Clock} label="AVG RESPONSE" value="1.2s" change="-0.3s" />
                <AIPerformanceMetric icon={CheckCircle2} label="CSAT SCORE" value="94%" change="+2%" />
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-900">Recent Orders</h3>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
              <div className="space-y-3">
                <RecentOrderItem id="#ORD-7821" customer="Chioma Nnamdi" items="Ankara Dress (Red) x2" amount="₦45,000" status="completed" />
                <RecentOrderItem id="#ORD-7820" customer="Tunde Adeyemi" items="Corporate Shirt x1" amount="₦18,500" status="processing" />
                <RecentOrderItem id="#ORD-7819" customer="Fatima Kabir" items="Head Wrap Set x3" amount="₦12,000" status="pending" />
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-56 bg-white border-l border-slate-200 p-4">
            {/* AI Usage */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900">AI Usage</h3>
                <Zap className="w-4 h-4 text-violet-500" />
              </div>
              <AIUsageChart />
              <p className="text-[10px] text-slate-400 mt-2">This week</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                <span className="text-xs text-emerald-600 font-medium">+18%</span>
              </div>
            </div>

            {/* Inventory Alerts */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900">Inventory Alerts</h3>
                <Package className="w-4 h-4 text-slate-400" />
              </div>
              <div className="flex gap-4 mb-3">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase">Low Stock</p>
                  <p className="text-xl font-bold text-slate-900">5</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase">Out</p>
                  <p className="text-xl font-bold text-red-500">1</p>
                </div>
              </div>
              <div className="space-y-2">
                <InventoryAlertItem name="Ankara Dress (Red)" stock={2} />
                <InventoryAlertItem name="Leather Bag (Brown)" stock={0} />
                <InventoryAlertItem name="Body Butter (Shea)" stock={5} />
              </div>
            </div>

            {/* Top Customers */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900">Top Customers</h3>
                <Users className="w-4 h-4 text-slate-400" />
              </div>
              <div className="flex gap-4 mb-3">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase">New</p>
                  <p className="text-xl font-bold text-slate-900">89</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase">Repeat</p>
                  <p className="text-xl font-bold text-slate-900">34%</p>
                </div>
              </div>
              <div className="space-y-2">
                <CustomerItem name="Amina Bello" orders="24 orders" spent="₦680k" />
                <CustomerItem name="Chidi Okafor" orders="18 orders" spent="₦520k" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Sidebar Icon
function SidebarIcon({ icon: Icon, active }: { icon: React.ComponentType<{ className?: string }>; active?: boolean }) {
  return (
    <div className={`w-10 h-10 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${active ? "bg-emerald-50 text-emerald-600" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"}`}>
      <Icon className="w-5 h-5" />
    </div>
  );
}

// Task Item
function TaskItem({ icon: Icon, title, desc }: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-900 truncate">{title}</p>
        <p className="text-[10px] text-slate-500 truncate">{desc}</p>
      </div>
    </div>
  );
}

// Key Metric
function KeyMetric({ label, value, change, isPositive }: { label: string; value: string; change: string; isPositive: boolean }) {
  return (
    <div>
      <p className="text-[10px] text-slate-500 uppercase mb-1">{label}</p>
      <p className="text-xl font-bold text-slate-900">{value}</p>
      <div className="flex items-center gap-1 mt-1">
        {isPositive ? (
          <TrendingUp className="w-3 h-3 text-emerald-500" />
        ) : (
          <TrendingDown className="w-3 h-3 text-red-500" />
        )}
        <span className={`text-xs ${isPositive ? "text-emerald-600" : "text-red-600"}`}>{change}</span>
      </div>
    </div>
  );
}

// Revenue Chart
function RevenueChart() {
  const bars = [
    { h: 30, ai: 20 }, { h: 45, ai: 30 }, { h: 35, ai: 25 }, { h: 55, ai: 40 },
    { h: 65, ai: 35 }, { h: 50, ai: 45 }, { h: 70, ai: 50 }, { h: 60, ai: 40 },
    { h: 75, ai: 55 }, { h: 65, ai: 45 }, { h: 70, ai: 50 }, { h: 60, ai: 40 },
  ];
  const labels = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

  return (
    <div className="h-32 flex items-end gap-2">
      {bars.map((bar, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full flex gap-0.5 items-end justify-center" style={{ height: "80px" }}>
            <div className="w-2 bg-emerald-400 rounded-t" style={{ height: `${bar.h}%` }} />
            <div className="w-2 bg-violet-300 rounded-t" style={{ height: `${bar.ai}%` }} />
          </div>
          <span className="text-[10px] text-slate-400">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

// Legend Item
function LegendItem({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-xs text-slate-600">{label}</span>
      <span className="text-xs text-slate-400 ml-auto">{value}</span>
    </div>
  );
}

// AI Performance Metric
function AIPerformanceMetric({ icon: Icon, label, value, change }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; change: string }) {
  const isPositive = change.startsWith("+") || change.startsWith("-0.3");
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-slate-400" />
        <span className="text-[10px] text-slate-500 uppercase">{label}</span>
      </div>
      <p className="text-lg font-bold text-slate-900">{value}</p>
      <span className={`text-xs ${isPositive ? "text-emerald-600" : "text-red-600"}`}>{change}</span>
    </div>
  );
}

// Recent Order Item
function RecentOrderItem({ id, customer, items, amount, status }: { id: string; customer: string; items: string; amount: string; status: string }) {
  const statusColors: Record<string, string> = {
    completed: "bg-emerald-100 text-emerald-700",
    processing: "bg-blue-100 text-blue-700",
    pending: "bg-amber-100 text-amber-700",
  };

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
        <span className="text-xs font-medium text-slate-600">{customer.charAt(0)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-900">{id}</p>
        <p className="text-[10px] text-slate-500 truncate">{customer} • {items}</p>
      </div>
      <div className="text-right">
        <p className="text-xs font-medium text-slate-900">{amount}</p>
      </div>
      <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColors[status] || "bg-slate-100 text-slate-600"}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </div>
  );
}

// AI Usage Chart
function AIUsageChart() {
  const bars = [40, 55, 45, 65, 50, 70, 85];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="flex items-end gap-1 h-16">
      {bars.map((h, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full bg-violet-400 rounded-t" style={{ height: `${h}%` }} />
          <span className="text-[8px] text-slate-400">{days[i]}</span>
        </div>
      ))}
    </div>
  );
}

// Inventory Alert Item
function InventoryAlertItem({ name, stock }: { name: string; stock: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-600 truncate">{name}</span>
      <span className={`text-xs font-medium ${stock === 0 ? "text-red-500" : stock <= 2 ? "text-amber-500" : "text-slate-500"}`}>{stock}</span>
    </div>
  );
}

// Customer Item
function CustomerItem({ name, orders, spent }: { name: string; orders: string; spent: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
        <span className="text-xs font-medium text-slate-600">{name.charAt(0)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-900 truncate">{name}</p>
        <p className="text-[10px] text-slate-500">{orders}</p>
      </div>
      <span className="text-xs font-medium text-slate-900">{spent}</span>
    </div>
  );
}
