"use client";

import React from "react";
import {
  CheckSquare,
  Bot,
  TrendingUp,
  MoreHorizontal,
  Plus,
  MessageSquare,
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
  Globe,
  Inbox,
  Zap,
  CheckCircle,
  XCircle,
  Calendar,
  Flag,
  Package,
} from "lucide-react";

// ============================================================================
// Types
// ============================================================================
interface NavItem {
  icon: React.ElementType;
  label: string;
  badge?: string;
  category?: string;
  active?: boolean;
}

// ============================================================================
// Dummy Data — Realistic Nigerian Merchant Store
// ============================================================================
const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", category: "General", active: true },
  { icon: ShoppingBag, label: "Products", badge: "47", category: "Commerce" },
  { icon: ShoppingCart, label: "Orders", badge: "12", category: "Commerce" },
  { icon: Users, label: "Customers", category: "Commerce" },
  { icon: Tag, label: "Categories", category: "Commerce" },
  { icon: Bot, label: "AI Hub", badge: "3", category: "Growth" },
  { icon: Megaphone, label: "Marketing", category: "Growth" },
  { icon: PieChart, label: "Analytics", category: "Insights" },
];

// Dummy users for team avatars
const teamMembers = [
  { initials: "AO", color: "bg-orange-200" },
  { initials: "MK", color: "bg-blue-200" },
  { initials: "CN", color: "bg-green-200" },
  { initials: "FN", color: "bg-purple-200" },
];

// ============================================================================
// Sub-Components — Matching Merchant Admin Design
// ============================================================================

const WidgetActions = () => (
  <div className="flex items-center gap-1">
    <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
      <Pencil size={14} className="text-gray-400" />
    </button>
    <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
      <Maximize2 size={14} className="text-gray-400" />
    </button>
    <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
      <MoreHorizontal size={14} className="text-gray-400" />
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
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <IconComponent size={18} className="text-gray-500" />
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {subtitle && <span className="text-xs text-gray-400">{subtitle}</span>}
    </div>
    <WidgetActions />
  </div>
);

const PriorityBadge = ({ priority }: { priority: "urgent" | "normal" | "low" }) => {
  const styles = {
    urgent: "bg-red-50 text-red-600",
    normal: "bg-orange-50 text-orange-600",
    low: "bg-green-50 text-green-600",
  };
  return (
    <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded ${styles[priority]}`}>
      <Flag size={10} />
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
};

const AvatarGroup = ({ count = 2, extra = 0 }: { count?: number; extra?: number }) => {
  const colors = ["bg-orange-200", "bg-blue-200", "bg-green-200"];
  return (
    <div className="flex -space-x-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-medium text-gray-600 ${colors[i % 3]}`}
        />
      ))}
      {extra > 0 && (
        <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-medium text-gray-500">
          +{extra}
        </div>
      )}
    </div>
  );
};

const KanbanCard = ({
  code,
  priority,
  title,
  tag,
  dueDate,
  avatars = 2,
  extraAvatars = 0,
  comments = 0,
  date,
}: {
  code: string;
  priority: "urgent" | "normal" | "low";
  title: string;
  tag: string;
  dueDate: string;
  avatars?: number;
  extraAvatars?: number;
  comments?: number;
  date: string;
}) => (
  <div className="bg-white rounded-xl p-3.5 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs text-gray-400">{code}</span>
      <PriorityBadge priority={priority} />
    </div>
    <h4 className="text-sm font-semibold text-gray-900 mb-1">{title}</h4>
    <p className="text-xs text-gray-500 mb-2">{tag}</p>
    <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
      <Calendar size={12} />
      <span>Due: {dueDate}</span>
    </div>
    <div className="flex items-center justify-between">
      <AvatarGroup count={avatars} extra={extraAvatars} />
      <div className="flex items-center gap-3 text-xs text-gray-400">
        {comments > 0 && (
          <span className="flex items-center gap-1">
            <MessageSquare size={12} /> {comments}
          </span>
        )}
        <span>{date}</span>
      </div>
    </div>
  </div>
);

// ============================================================================
// Main Dashboard Component — Exact Merchant Admin Replica
// ============================================================================
export function ProDashboardMarketing() {
  const tabs = ["Overview", "Orders", "Tasks", "Reports"];
  const kanbanTabs = ["All Tasks", "To Do", "In Progress", "Done", "Timeline"];

  return (
    <div className="flex min-h-[720px] bg-gray-50">
      {/* ============================================================== */}
      {/* SIDEBAR                                                        */}
      {/* ============================================================== */}
      <div className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
        {/* Logo */}
        <div className="h-16 flex items-center px-4 gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <span className="text-lg font-bold text-gray-900">Vayva</span>
          <span className="text-xs text-gray-400 ml-0.5">Merchant</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-3 py-3 px-3 overflow-auto">
          {["General", "Commerce", "Growth", "Insights"].map((category) => {
            const items = navItems.filter((item) => item.category === category);
            if (items.length === 0) return null;
            return (
              <div key={category} className="flex flex-col gap-0.5">
                <div className="px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                  {category}
                </div>
                {items.map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      item.active
                        ? "bg-green-50 text-green-700"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <item.icon
                      size={16}
                      className={item.active ? "text-green-600" : "text-gray-400"}
                    />
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className={`ml-auto px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                        item.active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="shrink-0 px-3 pb-3 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
            <Settings size={16} className="text-gray-400" />
            <span>Settings</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MAIN CONTENT                                                   */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center gap-4">
          {/* Store Info */}
          <div>
            <h1 className="text-sm font-semibold text-gray-900">Luxe Fashion Nigeria</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-50 border border-gray-200 rounded-full text-[10px] text-gray-500">
                <Globe size={9} />
                luxefashion.vayva.ng
              </span>
              <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-semibold rounded-full">
                PUBLISHED
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors relative">
              <Bell size={16} className="text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
              <HelpCircle size={16} className="text-gray-500" />
            </button>
            <div className="h-5 w-px bg-gray-200 mx-1" />
            <button className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold text-xs">
                AO
              </div>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Page Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Store Dashboard</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Stay on top of your store, monitor performance and track status.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Team Avatars */}
              <div className="flex -space-x-2">
                {teamMembers.map((m, i) => (
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
          {/* 3 SUMMARY WIDGET CARDS                                       */}
          {/* ============================================================ */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            {/* Widget 1: Task Status */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <WidgetHeader icon={CheckSquare} title="Task status" />
              <div className="flex items-end gap-5 mb-3">
                <div>
                  <p className="text-2xl font-bold text-gray-900 tracking-tight">18</p>
                  <p className="text-xs text-gray-500">Pending</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 tracking-tight">32</p>
                  <p className="text-xs text-gray-500">In progress</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 tracking-tight">98</p>
                  <p className="text-xs text-gray-500">Completed</p>
                </div>
              </div>
              <div className="h-16 flex items-end gap-1">
                {[45, 52, 38, 65, 48, 72, 55].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-green-500"
                    style={{ height: `${h}%`, opacity: 0.4 + i * 0.08 }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-1.5 text-[10px] text-gray-400">
                <span>1d</span><span>2d</span><span>3d</span><span>4d</span><span>5d</span><span>6d</span><span>7d</span>
              </div>
            </div>

            {/* Widget 2: Orders + AI Conversations */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <WidgetHeader icon={ShoppingBag} title="Orders" />
              <p className="text-2xl font-bold text-gray-900 tracking-tight mb-0.5">156</p>
              <p className="text-xs font-medium text-green-600 mb-3">↗ 8.2% (7d)</p>

              <div className="border-t border-gray-100 pt-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <Bot size={16} className="text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-900">AI Conversations</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 tracking-tight mb-0.5">847</p>
                <p className="text-xs font-medium text-green-600">↗ +24% (7d)</p>
              </div>
            </div>

            {/* Widget 3: Revenue Trend */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <WidgetHeader icon={TrendingUp} title="Revenue trend" subtitle="(7 days)" />
              <p className="text-2xl font-bold text-gray-900 tracking-tight mb-0.5">₦2,147,000</p>
              <p className="text-xs font-medium text-green-600 mb-3">↗ 12.5% (7d)</p>

              <div className="h-20 flex items-end gap-1">
                {[45, 52, 38, 65, 48, 72, 55].map((h, i) => (
                  <div key={i} className="flex-1 flex items-end gap-0.5">
                    <div
                      className="flex-1 bg-green-400 rounded-t"
                      style={{ height: `${h}%` }}
                    />
                    <div
                      className="flex-1 bg-violet-400 rounded-t"
                      style={{ height: `${h * 0.6}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 mt-2 text-[10px]">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="text-gray-400">Revenue</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                  <span className="text-gray-400">AI Orders</span>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* TAB NAVIGATION                                               */}
          {/* ============================================================ */}
          <div className="border-b border-gray-200 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                {tabs.map((tab, i) => (
                  <button
                    key={tab}
                    className={`pb-2.5 text-sm font-medium border-b-2 transition-colors ${
                      i === 0
                        ? "border-green-500 text-green-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 pb-2.5">
                <button className="flex items-center gap-1 px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                  <LayoutGrid size={12} />
                  Widgets
                </button>
                <button className="flex items-center gap-1 px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                  <Filter size={12} />
                  Filter
                </button>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* KANBAN SUB-TABS                                              */}
          {/* ============================================================ */}
          <div className="flex items-center gap-2 mb-4">
            {kanbanTabs.map((tab, i) => (
              <button
                key={tab}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  i === 0
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* ============================================================ */}
          {/* KANBAN BOARD — 4 COLUMNS                                     */}
          {/* ============================================================ */}
          <div className="grid grid-cols-4 gap-3">
            {/* Column: Pending */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Inbox size={14} className="text-gray-500" />
                <span className="text-xs font-medium text-gray-900">Pending</span>
                <span className="text-xs text-gray-400">18</span>
                <button className="ml-auto p-0.5 hover:bg-gray-100 rounded">
                  <MoreHorizontal size={12} className="text-gray-400" />
                </button>
              </div>
              <div className="space-y-2.5">
                <KanbanCard
                  code="TSK-1"
                  priority="urgent"
                  title="Review inventory alerts"
                  tag="3 items need attention"
                  dueDate="Mar 22, '26"
                  avatars={2}
                  comments={3}
                  date="Mar 21"
                />
                <KanbanCard
                  code="TSK-2"
                  priority="normal"
                  title="Process pending orders"
                  tag="5 orders awaiting shipment"
                  dueDate="Mar 23, '26"
                  avatars={1}
                  comments={1}
                  date="Mar 21"
                />
              </div>
            </div>

            {/* Column: Processing */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Zap size={14} className="text-yellow-500" />
                <span className="text-xs font-medium text-gray-900">Processing</span>
                <span className="text-xs text-gray-400">32</span>
                <button className="ml-auto p-0.5 hover:bg-gray-100 rounded">
                  <MoreHorizontal size={12} className="text-gray-400" />
                </button>
              </div>
              <div className="space-y-2.5">
                <KanbanCard
                  code="INV-1"
                  priority="urgent"
                  title="Restock: Red Floral Dress"
                  tag="Out of stock"
                  dueDate="Mar 23, '26"
                  avatars={1}
                  comments={0}
                  date="Mar 21"
                />
                <KanbanCard
                  code="INV-2"
                  priority="normal"
                  title="Restock: Silk Scarf - Blue"
                  tag="3 units remaining"
                  dueDate="Mar 24, '26"
                  avatars={1}
                  comments={2}
                  date="Mar 21"
                />
              </div>
            </div>

            {/* Column: Completed */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={14} className="text-green-500" />
                <span className="text-xs font-medium text-gray-900">Completed</span>
                <span className="text-xs text-gray-400">98</span>
                <button className="ml-auto p-0.5 hover:bg-gray-100 rounded">
                  <MoreHorizontal size={12} className="text-gray-400" />
                </button>
              </div>
              <div className="space-y-2.5">
                <KanbanCard
                  code="CUS-1"
                  priority="low"
                  title="Adaora Okonkwo — 23 orders"
                  tag="Total spent: ₦287,000"
                  dueDate="Mar 20, '26"
                  avatars={2}
                  extraAvatars={1}
                  comments={23}
                  date="Mar 21"
                />
                <KanbanCard
                  code="CUS-2"
                  priority="low"
                  title="Mohammed Kabir — 18 orders"
                  tag="Total spent: ₦215,000"
                  dueDate="Mar 19, '26"
                  avatars={2}
                  comments={18}
                  date="Mar 20"
                />
              </div>
            </div>

            {/* Column: Cancelled */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <XCircle size={14} className="text-gray-400" />
                <span className="text-xs font-medium text-gray-900">Cancelled</span>
                <span className="text-xs text-gray-400">8</span>
                <button className="ml-auto p-0.5 hover:bg-gray-100 rounded">
                  <MoreHorizontal size={12} className="text-gray-400" />
                </button>
              </div>
              <div className="space-y-2.5">
                <KanbanCard
                  code="ORD-X1"
                  priority="low"
                  title="8 cancelled order(s)"
                  tag="Review cancelled orders"
                  dueDate="Mar 21, '26"
                  avatars={1}
                  comments={0}
                  date="Mar 21"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
