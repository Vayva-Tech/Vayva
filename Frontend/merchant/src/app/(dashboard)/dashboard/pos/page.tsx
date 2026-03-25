"use client";
import { Button } from "@vayva/ui";

import {
  Plus,
  Receipt,
  CurrencyDollar as DollarSign,
  TrendUp as TrendingUp,
  ArrowUpRight,
  ShoppingCart,
  Money as Banknote,
  FileText,
} from "@phosphor-icons/react";

const todayStats = [
  {
    label: "Today's Transactions",
    value: "23",
    change: "+4 from yesterday",
    icon: Receipt,
    color: "bg-green-50 text-green-600",
  },
  {
    label: "Revenue",
    value: "\u20A6187K",
    change: "+12% vs yesterday",
    icon: DollarSign,
    color: "bg-blue-50 text-blue-600",
  },
  {
    label: "Avg Transaction",
    value: "\u20A68.1K",
    change: "+\u20A6500 vs avg",
    icon: TrendingUp,
    color: "bg-purple-50 text-purple-600",
  },
];

const recentTransactions = [
  {
    id: "POS-1089",
    time: "2:45 PM",
    customer: "Walk-in Customer",
    items: 3,
    amount: "\u20A612,500",
    method: "Card",
  },
  {
    id: "POS-1088",
    time: "2:30 PM",
    customer: "Adaobi Nnamdi",
    items: 1,
    amount: "\u20A618,000",
    method: "Transfer",
  },
  {
    id: "POS-1087",
    time: "2:12 PM",
    customer: "Walk-in Customer",
    items: 2,
    amount: "\u20A67,200",
    method: "Cash",
  },
  {
    id: "POS-1086",
    time: "1:55 PM",
    customer: "Olusegun Bakare",
    items: 5,
    amount: "\u20A645,000",
    method: "Card",
  },
  {
    id: "POS-1085",
    time: "1:40 PM",
    customer: "Walk-in Customer",
    items: 1,
    amount: "\u20A63,500",
    method: "Cash",
  },
  {
    id: "POS-1084",
    time: "1:18 PM",
    customer: "Fatima Abdullahi",
    items: 4,
    amount: "\u20A628,900",
    method: "Transfer",
  },
];

const paymentMethodColors: Record<string, string> = {
  Card: "bg-blue-50 text-blue-700",
  Cash: "bg-green-50 text-green-700",
  Transfer: "bg-purple-50 text-purple-700",
};

const quickActions = [
  {
    label: "New Sale",
    icon: ShoppingCart,
    color: "bg-green-500 text-white hover:bg-green-600",
  },
  {
    label: "Cash Register",
    icon: Banknote,
    color: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
  },
  {
    label: "End of Day Report",
    icon: FileText,
    color: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
  },
];

export default function POSPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Point of Sale</h1>
          <p className="text-sm text-gray-500 mt-1">Manage in-store transactions and sales</p>
        </div>
        <Button className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-green-500 rounded-xl hover:bg-green-600 transition-colors">
          <Plus className="w-4 h-4" />
          Quick Sale
        </Button>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {todayStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 tracking-tight mt-1">{stat.value}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent POS Transactions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Transactions</h2>
          <p className="text-xs text-gray-500 mt-0.5">Today&apos;s POS sales activity</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-5 text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="text-left py-3 px-5 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="text-left py-3 px-5 text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="text-left py-3 px-5 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="text-left py-3 px-5 text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 text-gray-500">{tx.time}</td>
                  <td className="px-5 py-4 font-medium text-gray-900">{tx.customer}</td>
                  <td className="px-5 py-4 text-gray-600">{tx.items}</td>
                  <td className="px-5 py-4 font-semibold text-gray-900">{tx.amount}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${paymentMethodColors[tx.method]}`}
                    >
                      {tx.method}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-2xl transition-colors ${action.color}`}
              >
                <Icon className="w-4 h-4" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

