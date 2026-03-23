"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  MoreHorizontal,
  Plus,
  Pencil,
  Maximize2,
  Filter,
  LayoutGrid,
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Users,
  Tag,
  Megaphone,
  PieChart,
  Settings,
  Bell,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Globe,
  Inbox,
  Zap,
  Calendar,
  Package,
  Search,
  Share2,
  ArrowLeft,
  FolderClosed,
  ExternalLink,
  UserPlus,
  Wallet,
  CreditCard,
  BarChart3,
  Bot,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  DollarSign,
  Truck,
  Star,
  Clock,
  Layers,
  Sparkles,
  Sliders,
} from "lucide-react";

// ============================================================================
// Sub-Components — Matching Vayva Design System
// ============================================================================

const WidgetActions = () => (
  <div className="flex items-center gap-0.5">
    <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
      <Pencil size={13} className="text-gray-400" />
    </button>
    <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
      <Maximize2 size={13} className="text-gray-400" />
    </button>
    <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
      <MoreHorizontal size={13} className="text-gray-400" />
    </button>
  </div>
);

const WidgetHeader = ({
  icon: IconComponent,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
}) => (
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-1.5">
      <IconComponent size={15} className="text-gray-500" />
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {subtitle && <span className="text-xs text-gray-400">{subtitle}</span>}
    </div>
    <WidgetActions />
  </div>
);

const KPICard = ({
  icon: Icon,
  label,
  value,
  change,
  positive,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  change: string;
  positive: boolean;
  accent: string;
}) => (
  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent}`}>
        <Icon size={17} className="text-white" />
      </div>
      <WidgetActions />
    </div>
    <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
    <div className="flex items-center justify-between mt-1">
      <p className="text-xs text-gray-500">{label}</p>
      <span className={`flex items-center gap-0.5 text-[11px] font-semibold ${positive ? "text-green-600" : "text-red-500"}`}>
        {positive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
        {change}
      </span>
    </div>
  </div>
);

// Order status pill
const StatusPill = ({ status, count }: { status: string; count: number }) => {
  const colors: Record<string, string> = {
    Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    Processing: "bg-blue-50 text-blue-700 border-blue-200",
    Shipped: "bg-purple-50 text-purple-700 border-purple-200",
    Delivered: "bg-green-50 text-green-700 border-green-200",
    Cancelled: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-xl border ${colors[status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
      <span className="text-xs font-medium">{status}</span>
      <span className="text-sm font-bold">{count}</span>
    </div>
  );
};

// ============================================================================
// Main Dashboard Component — Vayva Merchant Dashboard (Vayva Design System)
// ============================================================================
export function ProDashboardMarketing() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  return (
    <div className="flex min-h-[780px] bg-gray-50/80">
      {/* ============================================================== */}
      {/* SIDEBAR — Collapsed by default, expands on hover               */}
      {/* ============================================================== */}
      <div
        className={`${sidebarExpanded ? "w-[220px]" : "w-[60px]"} bg-white border-r border-gray-200 flex flex-col shrink-0 transition-all duration-300 ease-in-out overflow-hidden`}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      >
        {/* Logo + Collapse */}
        <div className={`h-14 flex items-center ${sidebarExpanded ? "justify-between px-4" : "justify-center px-2"}`}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            {sidebarExpanded && (
              <div className="leading-tight whitespace-nowrap">
                <span className="text-sm font-bold text-gray-900">Merchant</span>
                <p className="text-[10px] text-green-500 hover:text-green-600 cursor-pointer">luxefashion.vayva.ng</p>
              </div>
            )}
          </div>
          {sidebarExpanded && (
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
          )}
        </div>

        {/* Navigation — Mirrors actual Vayva sidebar groups */}
        <nav className={`flex-1 py-2 ${sidebarExpanded ? "px-2.5" : "px-1.5"} overflow-auto text-[13px]`}>

          {/* ── HOME GROUP ── */}
          <div className="mb-3">
            {sidebarExpanded && <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5 whitespace-nowrap">Home</p>}
            <div className={`flex items-center gap-2 ${sidebarExpanded ? "px-2.5" : "px-0 justify-center"} py-[7px] rounded-lg bg-green-50 text-green-700 font-medium`}>
              <LayoutDashboard size={15} className="text-green-600 shrink-0" />
              {sidebarExpanded && <span className="whitespace-nowrap">Dashboard</span>}
            </div>
            <div className={`flex items-center gap-2 ${sidebarExpanded ? "px-2.5" : "px-0 justify-center"} py-[7px] rounded-lg text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer`}>
              <BarChart3 size={15} className="text-gray-400 shrink-0" />
              {sidebarExpanded && <span className="whitespace-nowrap">Analytics</span>}
            </div>
            <div className={`flex items-center gap-2 ${sidebarExpanded ? "px-2.5" : "px-0 justify-center"} py-[7px] rounded-lg text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer`}>
              <Sparkles size={15} className="text-gray-400 shrink-0" />
              {sidebarExpanded && <span className="whitespace-nowrap">AI Intelligence</span>}
            </div>
          </div>

          {/* ── COMMERCE GROUP ── */}
          <div className="mb-3">
            {sidebarExpanded && <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5 whitespace-nowrap">Commerce</p>}
            {[
              { icon: ShoppingBag, label: "Products", badge: "47" },
              { icon: ShoppingCart, label: "Orders", badge: "12" },
              { icon: Calendar, label: "Bookings" },
              { icon: Truck, label: "Fulfillment" },
              { icon: Package, label: "Inventory" },
              { icon: Tag, label: "Categories" },
            ].map((item) => (
              <div key={item.label} className={`flex items-center gap-2 ${sidebarExpanded ? "px-2.5" : "px-0 justify-center"} py-[7px] rounded-lg text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer`}>
                <item.icon size={15} className="text-gray-400 shrink-0" />
                {sidebarExpanded && (
                  <>
                    <span className="whitespace-nowrap">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{item.badge}</span>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {/* ── GROWTH GROUP ── */}
          <div className="mb-3">
            <div className={`flex items-center gap-2 ${sidebarExpanded ? "px-2.5" : "px-0 justify-center"} py-[7px] rounded-lg text-gray-900 font-medium cursor-pointer`}>
              <Megaphone size={15} className="text-gray-500 shrink-0" />
              {sidebarExpanded && (
                <>
                  <span className="whitespace-nowrap">Marketing</span>
                  <ChevronUp size={12} className="ml-auto text-gray-400" />
                </>
              )}
            </div>
            {sidebarExpanded && (
              <div className="ml-4 pl-3 border-l border-gray-100 space-y-0.5">
                {[
                  { label: "Campaigns", count: 3 },
                  { label: "Discounts", count: 8 },
                  { label: "Flash Sales", count: 1 },
                  { label: "Automation" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between px-2 py-[5px] rounded-md text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer text-xs">
                    <span className="whitespace-nowrap">{item.label}</span>
                    {item.count && <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{item.count}</span>}
                  </div>
                ))}
              </div>
            )}
            <div className={`flex items-center gap-2 ${sidebarExpanded ? "px-2.5" : "px-0 justify-center"} py-[7px] rounded-lg text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer`}>
              <Users size={15} className="text-gray-400 shrink-0" />
              {sidebarExpanded && <span className="whitespace-nowrap">Customers</span>}
            </div>
            <div className={`flex items-center gap-2 ${sidebarExpanded ? "px-2.5" : "px-0 justify-center"} py-[7px] rounded-lg text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer`}>
              <Inbox size={15} className="text-gray-400 shrink-0" />
              {sidebarExpanded && <span className="whitespace-nowrap">Support</span>}
            </div>
          </div>

          {/* ── MONEY GROUP ── */}
          <div className="mb-3">
            {sidebarExpanded && <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5 whitespace-nowrap">Money</p>}
            <div className={`flex items-center gap-2 ${sidebarExpanded ? "px-2.5" : "px-0 justify-center"} py-[7px] rounded-lg text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer`}>
              <Wallet size={15} className="text-gray-400 shrink-0" />
              {sidebarExpanded && <span className="whitespace-nowrap">Finance</span>}
            </div>
            <div className={`flex items-center gap-2 ${sidebarExpanded ? "px-2.5" : "px-0 justify-center"} py-[7px] rounded-lg text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer`}>
              <CreditCard size={15} className="text-gray-400 shrink-0" />
              {sidebarExpanded && <span className="whitespace-nowrap">Payouts</span>}
            </div>
          </div>

          {/* ── PLATFORM GROUP ── */}
          <div className="mb-2">
            {sidebarExpanded && <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5 whitespace-nowrap">Platform</p>}
            <div className={`flex items-center gap-2 ${sidebarExpanded ? "px-2.5" : "px-0 justify-center"} py-[7px] rounded-lg text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer`}>
              <Sliders size={15} className="text-gray-400 shrink-0" />
              {sidebarExpanded && <span className="whitespace-nowrap">Control Center</span>}
            </div>
            <div className={`flex items-center gap-2 ${sidebarExpanded ? "px-2.5" : "px-0 justify-center"} py-[7px] rounded-lg text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer relative`}>
              <div className="relative shrink-0">
                <Bell size={15} className="text-gray-400" />
                {!sidebarExpanded && (
                  <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">4</span>
                )}
              </div>
              {sidebarExpanded && (
                <>
                  <span className="whitespace-nowrap">Notifications</span>
                  <span className="ml-auto w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">4</span>
                </>
              )}
            </div>
            <div className={`flex items-center gap-2 ${sidebarExpanded ? "px-2.5" : "px-0 justify-center"} py-[7px] rounded-lg text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer`}>
              <Bot size={15} className="text-gray-400 shrink-0" />
              {sidebarExpanded && <span className="whitespace-nowrap">Autopilot</span>}
            </div>
          </div>
        </nav>

        {/* Bottom Section — Help, Settings, Invite Teams, User Profile */}
        <div className={`shrink-0 ${sidebarExpanded ? "px-2.5" : "px-1.5"} pb-3 pt-2 border-t border-gray-100 text-[13px] space-y-0.5`}>
          <div className={`flex items-center gap-2 ${sidebarExpanded ? "px-2.5" : "px-0 justify-center"} py-[7px] rounded-lg text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer`}>
            <HelpCircle size={15} className="text-gray-400 shrink-0" />
            {sidebarExpanded && (
              <>
                <span className="whitespace-nowrap">Help Center</span>
                <ExternalLink size={10} className="ml-auto text-gray-300" />
              </>
            )}
          </div>
          <div className={`flex items-center gap-2 ${sidebarExpanded ? "px-2.5" : "px-0 justify-center"} py-[7px] rounded-lg text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer`}>
            <Settings size={15} className="text-gray-400 shrink-0" />
            {sidebarExpanded && <span className="whitespace-nowrap">Settings</span>}
          </div>
          <div className={`flex items-center gap-2 ${sidebarExpanded ? "px-2.5" : "px-0 justify-center"} py-[7px] rounded-lg text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer`}>
            <UserPlus size={15} className="text-gray-400 shrink-0" />
            {sidebarExpanded && <span className="whitespace-nowrap">Invite teams</span>}
          </div>

          {/* User Profile */}
          <div className={`flex items-center ${sidebarExpanded ? "gap-2.5 px-2.5" : "justify-center px-1"} py-2 mt-1 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-semibold text-xs shrink-0">
              AO
            </div>
            {sidebarExpanded && (
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">Adaora Okonkwo</p>
                <p className="text-[10px] text-gray-400 truncate">adaora@luxefashion.ng</p>
              </div>
            )}
          </div>
          {sidebarExpanded && (
            <div className="flex items-center gap-2 px-2.5 py-[7px] rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer mt-1">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              <span className="text-xs font-medium whitespace-nowrap">Sign Out</span>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* MAIN CONTENT                                                   */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Breadcrumb / Top Bar — Vayva Style */}
        <div className="h-12 bg-white border-b border-gray-200 px-5 flex items-center gap-3">
          <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={16} className="text-gray-400" />
          </button>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <FolderClosed size={14} className="text-gray-400" />
            <span className="text-gray-700 font-medium">Dashboard</span>
            <ChevronRight size={12} className="text-gray-300" />
            <FolderClosed size={14} className="text-gray-400" />
            <span className="text-gray-700 font-medium">Overview</span>
          </div>

          {/* Search */}
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-400 w-48">
            <Search size={13} />
            <span>Search</span>
          </div>

          {/* Actions */}
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors">
            <LayoutGrid size={13} />
            Manage
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors">
            <Share2 size={13} />
            Share
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors shadow-sm">
            <Plus size={13} />
            Add product
          </button>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 p-5 overflow-auto">
          {/* Page Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Dashboard</h2>
              <p className="text-sm text-gray-500 mt-0.5 max-w-lg">
                Monitor sales, track orders, and manage your business.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Time filter */}
              <div className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 cursor-pointer hover:bg-gray-50">
                <Clock size={12} className="text-gray-400" />
                <span>Last 30 days</span>
                <ChevronDown size={11} className="text-gray-400" />
              </div>
              {/* Team Avatars */}
              <div className="flex -space-x-2 ml-2">
                {[
                  { color: "bg-orange-200", initials: "AO" },
                  { color: "bg-blue-200", initials: "MK" },
                  { color: "bg-green-200", initials: "CN" },
                ].map((m, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full ${m.color} border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600`}
                  >
                    {m.initials}
                  </div>
                ))}
              </div>
              <button className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors">
                <Plus size={12} className="text-gray-400" />
              </button>
            </div>
          </div>

          {/* ============================================================ */}
          {/* 4 KPI CARDS — Revenue, Orders, Customers, Conversion         */}
          {/* ============================================================ */}
          <div className="grid grid-cols-4 gap-4 mb-5">
            <KPICard
              icon={DollarSign}
              label="Total Revenue"
              value="₦2.4M"
              change="12.5%"
              positive={true}
              accent="bg-green-500"
            />
            <KPICard
              icon={ShoppingCart}
              label="Orders"
              value="384"
              change="8.2%"
              positive={true}
              accent="bg-blue-500"
            />
            <KPICard
              icon={Users}
              label="Customers"
              value="1,247"
              change="5.1%"
              positive={true}
              accent="bg-purple-500"
            />
            <KPICard
              icon={Eye}
              label="Conversion Rate"
              value="3.8%"
              change="0.4%"
              positive={false}
              accent="bg-orange-500"
            />
          </div>

          {/* ============================================================ */}
          {/* ROW 2: Revenue Chart + Order Status + AI Insights             */}
          {/* ============================================================ */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            {/* Revenue Trend Chart */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm col-span-1">
              <WidgetHeader icon={TrendingUp} title="Revenue trend" subtitle="(30d)" />
              <div className="relative h-32 mt-2">
                <svg viewBox="0 0 200 100" className="w-full h-full" preserveAspectRatio="none">
                  {[25, 50, 75].map((y) => (
                    <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="#f1f5f9" strokeWidth="0.5" />
                  ))}
                  {/* Gradient fill */}
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <polygon
                    fill="url(#revGrad)"
                    points="0,100 0,40 28,35 56,45 84,30 112,25 140,35 168,20 200,15 200,100"
                  />
                  <polyline
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    points="0,40 28,35 56,45 84,30 112,25 140,35 168,20 200,15"
                  />
                  {[[0, 40], [28, 35], [56, 45], [84, 30], [112, 25], [140, 35], [168, 20], [200, 15]].map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r="2.5" fill="#22c55e" />
                  ))}
                </svg>
              </div>
              <div className="flex items-center gap-3 mt-2 text-[10px]">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-gray-400">Revenue</span>
                </div>
                <span className="text-gray-300">|</span>
                <span className="text-gray-400">Peak: ₦320K on Mar 15</span>
              </div>
            </div>

            {/* Order Status Distribution */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <WidgetHeader icon={ShoppingCart} title="Order status" />
              <div className="space-y-2">
                <StatusPill status="Pending" count={23} />
                <StatusPill status="Processing" count={15} />
                <StatusPill status="Shipped" count={8} />
                <StatusPill status="Delivered" count={312} />
                <StatusPill status="Cancelled" count={6} />
              </div>
            </div>

            {/* AI Commerce Agent */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <WidgetHeader icon={Bot} title="AI Agent" subtitle="Active" />
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 bg-green-50 rounded-xl border border-green-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center">
                      <Zap size={13} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900">WhatsApp Orders</p>
                      <p className="text-[10px] text-gray-500">AI-processed today</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-green-600">27</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-purple-50 rounded-xl border border-purple-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-purple-500 rounded-lg flex items-center justify-center">
                      <Sparkles size={13} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900">Smart Responses</p>
                      <p className="text-[10px] text-gray-500">Auto-replied inquiries</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-purple-600">143</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-orange-50 rounded-xl border border-orange-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
                      <Star size={13} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900">Product Recs</p>
                      <p className="text-[10px] text-gray-500">AI upsell suggestions</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-orange-600">38</span>
                </div>
                {/* Credits bar */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                    <span>AI Credits Used</span>
                    <span className="font-semibold text-gray-700">7,420 / 10,000</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full" style={{ width: "74%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* ROW 3: Top Products + Recent Orders                          */}
          {/* ============================================================ */}
          <div className="grid grid-cols-2 gap-4">
            {/* Top Products */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <WidgetHeader icon={ShoppingBag} title="Top products" subtitle="(this month)" />
              <div className="space-y-2.5">
                {[
                  { name: "Ankara Print Maxi Dress", sold: 89, revenue: "₦445K", img: "👗" },
                  { name: "Handwoven Aso-Oke Set", sold: 64, revenue: "₦384K", img: "🧵" },
                  { name: "Adire Silk Headwrap", sold: 52, revenue: "₦156K", img: "🎀" },
                  { name: "Beaded Statement Necklace", sold: 41, revenue: "₦123K", img: "📿" },
                ].map((product, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-lg shrink-0">{product.img}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-[11px] text-gray-400">{product.sold} sold</p>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{product.revenue}</span>
                    <ArrowUpRight size={12} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <WidgetHeader icon={ShoppingCart} title="Recent orders" />
              <div className="space-y-2">
                {[
                  { id: "#VYV-3847", customer: "Chioma N.", amount: "₦47,500", status: "Processing", time: "2m ago", statusColor: "bg-blue-100 text-blue-700" },
                  { id: "#VYV-3846", customer: "Emeka O.", amount: "₦23,000", status: "Shipped", time: "18m ago", statusColor: "bg-purple-100 text-purple-700" },
                  { id: "#VYV-3845", customer: "Aisha M.", amount: "₦85,200", status: "Delivered", time: "1h ago", statusColor: "bg-green-100 text-green-700" },
                  { id: "#VYV-3844", customer: "Tunde A.", amount: "₦12,800", status: "Pending", time: "2h ago", statusColor: "bg-yellow-100 text-yellow-700" },
                  { id: "#VYV-3843", customer: "Folake B.", amount: "₦67,400", status: "Delivered", time: "3h ago", statusColor: "bg-green-100 text-green-700" },
                ].map((order, i) => (
                  <div key={i} className="flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                    <span className="text-[11px] font-mono text-gray-400 w-16 shrink-0">{order.id}</span>
                    <p className="text-sm text-gray-900 font-medium flex-1 truncate">{order.customer}</p>
                    <span className="text-sm font-semibold text-gray-900">{order.amount}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${order.statusColor}`}>{order.status}</span>
                    <span className="text-[10px] text-gray-400 w-14 text-right shrink-0">{order.time}</span>
                  </div>
                ))}
              </div>
              <button className="w-full mt-3 py-2 text-xs text-green-600 font-semibold hover:bg-green-50 rounded-xl transition-colors flex items-center justify-center gap-1">
                View all orders <ArrowUpRight size={11} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
