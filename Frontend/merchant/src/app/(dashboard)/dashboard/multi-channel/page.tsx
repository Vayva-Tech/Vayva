"use client";
// @ts-nocheck

import {
  Globe,
  MessageCircle,
  Instagram,
  Monitor,
  ShoppingBag,
  CheckCircle,
  RefreshCw,
  Wifi,
  AlertCircle,
} from "lucide-react";

const channels = [
  {
    id: "online-store",
    name: "Online Store",
    icon: Globe,
    status: "Active" as const,
    orders: 156,
    revenue: 2340000,
    syncStatus: "Synced" as const,
    color: "bg-green-50 text-green-600",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: MessageCircle,
    status: "Active" as const,
    orders: 89,
    revenue: 987500,
    syncStatus: "Synced" as const,
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    status: "Active" as const,
    orders: 45,
    revenue: 567000,
    syncStatus: "Syncing" as const,
    color: "bg-pink-50 text-pink-600",
  },
  {
    id: "pos",
    name: "POS",
    icon: Monitor,
    status: "Inactive" as const,
    orders: 23,
    revenue: 187000,
    syncStatus: "Synced" as const,
    color: "bg-blue-50 text-blue-600",
  },
  {
    id: "walkin",
    name: "Walk-in",
    icon: ShoppingBag,
    status: "Active" as const,
    orders: 12,
    revenue: 134500,
    syncStatus: "Synced" as const,
    color: "bg-amber-50 text-amber-600",
  },
];

const totalRevenue = channels.reduce((sum, c) => sum + c.revenue, 0);

function formatNaira(amount: number) {
  if (amount >= 1000000) return `\u20A6${(amount / 1000000).toFixed(2)}M`;
  if (amount >= 1000) return `\u20A6${(amount / 1000).toFixed(0)}K`;
  return `\u20A6${amount.toLocaleString()}`;
}

export default function MultiChannelPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Multi-Channel</h1>
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-bold text-green-700 bg-green-100 rounded-full">PRO</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Manage all your sales channels from one place</p>
        </div>
      </div>

      {/* Channel Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {channels.map((channel) => {
          const Icon = channel.icon;
          return (
            <div key={channel.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2.5 rounded-xl ${channel.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{channel.name}</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${channel.status === "Active" ? "bg-green-500" : "bg-gray-400"}`} />
                    <span className={`text-xs font-medium ${channel.status === "Active" ? "text-green-600" : "text-gray-400"}`}>
                      {channel.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Orders this month</span>
                  <span className="font-semibold text-gray-900">{channel.orders}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Revenue</span>
                  <span className="font-semibold text-gray-900">{formatNaira(channel.revenue)}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5">
                  {channel.syncStatus === "Synced" ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-xs font-medium text-green-600">Synced</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                      <span className="text-xs font-medium text-blue-600">Syncing...</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Unified Inventory Sync */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-green-50 text-green-600">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Unified Inventory Sync</h2>
              <p className="text-xs text-gray-500 mt-0.5">Stock levels synchronized across all channels</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-xl hover:bg-green-600 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Sync Now
          </button>
        </div>

        <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-gray-700">Sync Status:</span>
            <span className="text-sm font-semibold text-green-600">All channels connected</span>
          </div>
          <div className="h-4 w-px bg-gray-300" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Last synced:</span>
            <span className="text-sm font-medium text-gray-700">2 minutes ago</span>
          </div>
        </div>
      </div>

      {/* Channel Performance Comparison */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-1">Channel Performance</h2>
        <p className="text-xs text-gray-500 mb-5">Revenue comparison across all channels</p>

        <div className="space-y-4">
          {channels
            .sort((a, b) => b.revenue - a.revenue)
            .map((channel) => {
              const Icon = channel.icon;
              const pct = (channel.revenue / totalRevenue) * 100;
              return (
                <div key={channel.id} className="flex items-center gap-4">
                  <div className="flex items-center gap-2 w-32 shrink-0">
                    <Icon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 truncate">{channel.name}</span>
                  </div>
                  <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full flex items-center justify-end pr-2 transition-all"
                      style={{ width: `${Math.max(pct, 8)}%` }}
                    >
                      {pct >= 15 && (
                        <span className="text-[10px] font-semibold text-white">{pct.toFixed(0)}%</span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-24 text-right">{formatNaira(channel.revenue)}</span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
