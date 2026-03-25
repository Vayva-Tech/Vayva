"use client";

import {
  InstagramLogo as Instagram,
  ChatCircle as MessageCircle,
  Users,
  ArrowUpRight,
  CheckCircle,
} from "@phosphor-icons/react";

const kpiCards = [
  {
    label: "Instagram Sales",
    value: "\u20A6320K",
    change: "+18%",
    icon: Instagram,
    color: "bg-pink-50 text-pink-600",
  },
  {
    label: "WhatsApp Orders",
    value: "89",
    change: "+12%",
    icon: MessageCircle,
    color: "bg-green-50 text-green-600",
  },
  {
    label: "Social Reach",
    value: "12.4K",
    change: "+24%",
    icon: Users,
    color: "bg-blue-50 text-blue-600",
  },
];

const connectedPlatforms = [
  {
    id: "instagram",
    name: "Instagram",
    handle: "@amaka_fashion",
    followers: "12.4K",
    engagement: "6.8%",
    icon: Instagram,
    color: "bg-gradient-to-br from-purple-500 to-pink-500",
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    handle: "+234 812 345 6789",
    followers: "342",
    engagement: "contacts",
    icon: MessageCircle,
    color: "bg-green-500",
  },
];

const recentSocialOrders = [
  {
    id: "SO-2401",
    customer: "Chidinma Okafor",
    channel: "Instagram",
    channelColor: "bg-pink-50 text-pink-700",
    product: "Ankara Maxi Dress",
    amount: "\u20A618,500",
    date: "Mar 22, 2026",
  },
  {
    id: "SO-2402",
    customer: "Blessing Adeyemi",
    channel: "WhatsApp",
    channelColor: "bg-green-50 text-green-700",
    product: "Adire Headwrap Set",
    amount: "\u20A67,200",
    date: "Mar 22, 2026",
  },
  {
    id: "SO-2403",
    customer: "Funke Balogun",
    channel: "Instagram",
    channelColor: "bg-pink-50 text-pink-700",
    product: "Lace Blouse (Coral)",
    amount: "\u20A612,000",
    date: "Mar 21, 2026",
  },
  {
    id: "SO-2404",
    customer: "Ngozi Eze",
    channel: "WhatsApp",
    channelColor: "bg-green-50 text-green-700",
    product: "Aso-Oke Clutch Bag",
    amount: "\u20A69,800",
    date: "Mar 21, 2026",
  },
  {
    id: "SO-2405",
    customer: "Yetunde Abiola",
    channel: "Instagram",
    channelColor: "bg-pink-50 text-pink-700",
    product: "Agbada 3-Piece Set",
    amount: "\u20A645,000",
    date: "Mar 20, 2026",
  },
];

export default function SocialPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Social Commerce</h1>
        <p className="text-sm text-gray-500 mt-1">Sell across social platforms and track performance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{kpi.label}</p>
                  <p className="text-2xl font-bold text-gray-900 tracking-tight mt-1">{kpi.value}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${kpi.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>{kpi.change} vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Connected Platforms */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Connected Platforms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {connectedPlatforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <div
                key={platform.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl ${platform.color} flex items-center justify-center text-white`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 text-sm">{platform.name}</h3>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <p className="text-xs text-gray-500">{platform.handle}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-900">{platform.followers}</p>
                    <p className="text-xs text-gray-500">
                      {platform.id === "instagram" ? "Followers" : "Contacts"}
                    </p>
                  </div>
                  <div className="text-center border-l border-gray-200">
                    <p className="text-sm font-bold text-gray-900">{platform.engagement}</p>
                    <p className="text-xs text-gray-500">
                      {platform.id === "instagram" ? "Engagement" : "Total"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Social Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Social Orders</h2>
          <p className="text-xs text-gray-500 mt-0.5">Orders placed through Instagram and WhatsApp</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-5 text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="text-left py-3 px-5 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="text-left py-3 px-5 text-xs font-medium text-gray-500 uppercase tracking-wider">Channel</th>
                <th className="text-left py-3 px-5 text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="text-left py-3 px-5 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="text-left py-3 px-5 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentSocialOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-900">{order.id}</td>
                  <td className="px-5 py-4 text-gray-700">{order.customer}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${order.channelColor}`}
                    >
                      {order.channel}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{order.product}</td>
                  <td className="px-5 py-4 font-semibold text-gray-900">{order.amount}</td>
                  <td className="px-5 py-4 text-gray-500">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
