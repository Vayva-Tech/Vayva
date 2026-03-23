"use client";
// @ts-nocheck

import { useState } from "react";
import {
  Settings,
  Globe,
  Search,
  MessageCircle,
  CreditCard,
  Truck,
  ArrowRight,
  Activity,
  CheckCircle2,
  Layout,
  ShieldCheck,
  Package,
  FileText,
  Clock,
} from "lucide-react";

// ── Mock Data ────────────────────────────────────────────────────────────────

const STORE_STATUS = {
  name: "Aduke Fashion House",
  url: "adukefashion.vayva.store",
  status: "Live" as "Live" | "Maintenance",
  uptimePercentage: 99.97,
};

const QUICK_ACTIONS = [
  {
    icon: Layout,
    title: "Template Gallery",
    description: "Browse and change your store template",
    href: "/dashboard/templates",
  },
  {
    icon: Globe,
    title: "Domain Settings",
    description: "Configure your custom domain",
    href: "/dashboard/domains",
  },
  {
    icon: Search,
    title: "SEO Settings",
    description: "Optimize your store for search engines",
    href: "/dashboard/settings/seo",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Integration",
    description: "Connect WhatsApp for customer messaging",
    href: "/dashboard/integrations/whatsapp",
  },
  {
    icon: CreditCard,
    title: "Payment Settings",
    description: "Manage Paystack, Flutterwave and more",
    href: "/dashboard/settings/payments",
  },
  {
    icon: Truck,
    title: "Shipping Zones",
    description: "Set delivery zones and rates",
    href: "/dashboard/settings/shipping",
  },
];

const RECENT_ACTIVITY = [
  {
    id: "1",
    action: "Template changed to 'Lagos Modern'",
    timestamp: "2 hours ago",
    icon: Layout,
  },
  {
    id: "2",
    action: "Product 'Ankara Maxi Dress' published",
    timestamp: "4 hours ago",
    icon: Package,
  },
  {
    id: "3",
    action: "Custom domain verified: adukefashion.ng",
    timestamp: "Yesterday",
    icon: ShieldCheck,
  },
  {
    id: "4",
    action: "Shipping zone added: Lagos Mainland",
    timestamp: "Yesterday",
    icon: Truck,
  },
  {
    id: "5",
    action: "SEO meta tags updated for homepage",
    timestamp: "2 days ago",
    icon: FileText,
  },
];

// ── Page Component ───────────────────────────────────────────────────────────

export default function ControlCenterPage() {
  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Control Center</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your store settings and configurations
        </p>
      </div>

      {/* Store Status Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-green-100 text-green-600">
              <Activity className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Store Status</h2>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              STORE_STATUS.status === "Live"
                ? "bg-green-50 text-green-600"
                : "bg-orange-50 text-orange-600"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                STORE_STATUS.status === "Live"
                  ? "bg-green-500 animate-pulse"
                  : "bg-orange-500"
              }`}
            />
            {STORE_STATUS.status}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Store Name</p>
            <p className="text-sm font-semibold text-gray-900">{STORE_STATUS.name}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Store URL</p>
            <p className="text-sm font-semibold text-green-600">{STORE_STATUS.url}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Uptime</p>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-900">
                {STORE_STATUS.uptimePercentage}%
              </p>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${STORE_STATUS.uptimePercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <a
                key={action.title}
                href={action.href}
                className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-start gap-4 hover:border-green-200 hover:shadow-md transition-all"
              >
                <div className="flex-shrink-0 p-2.5 rounded-xl bg-gray-100 text-gray-600 group-hover:bg-green-100 group-hover:text-green-600 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 mb-0.5">
                    {action.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {action.description}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-green-500 flex-shrink-0 mt-1 transition-colors" />
              </a>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-xl bg-gray-100 text-gray-600">
            <Clock className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>

        <div className="space-y-1">
          {RECENT_ACTIVITY.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 p-2 rounded-lg bg-green-50 text-green-600">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 font-medium truncate">
                    {item.action}
                  </p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {item.timestamp}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
