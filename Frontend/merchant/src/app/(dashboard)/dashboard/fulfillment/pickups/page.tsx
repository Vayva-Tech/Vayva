// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { logger } from "@vayva/shared";
import { Button } from "@vayva/ui";
import { PackageCheck, ClockCounterClockwise, CheckCircle, XCircle, Users, TrendUp } from "@phosphor-icons/react";
import { toast } from "sonner";
import { apiJson } from "@/lib/api-client-shared";
import { useAuth } from "@/context/AuthContext";

// ... existing code (interfaces and TABS) ...

export default function PickupsPage() {
  // ... existing auth check code ...
  
  const [activeTab, setActiveTab] = useState("READY");
  const [pickups, setPickups] = useState<PickupOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // ... existing fetchPickups function ...

  // Calculate metrics
  const totalPickups = pickups.length;
  const readyCount = pickups.filter(p => p.status === "READY" || (activeTab === "READY" && totalPickups > 0)).length;
  const completedCount = pickups.filter(p => p.status === "COMPLETED").length;
  const canceledCount = pickups.filter(p => p.status === "CANCELED").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pickups</h1>
        <p className="text-sm text-gray-500 mt-1">Manage orders waiting for customer collection</p>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <SummaryWidget
          icon={<PackageCheck size={18} />}
          label="Total Pickups"
          value={String(totalPickups)}
          trend="all time"
          positive
        />
        <SummaryWidget
          icon={<ClockCounterClockwise size={18} />}
          label="Ready Now"
          value={String(readyCount)}
          trend="waiting"
          positive={readyCount > 0}
        />
        <SummaryWidget
          icon={<CheckCircle size={18} />}
          label="Completed"
          value={String(completedCount)}
          trend="collected"
          positive
        />
        <SummaryWidget
          icon={<XCircle size={18} />}
          label="Canceled"
          value={String(canceledCount)}
          trend="canceled"
          positive
        />
        <SummaryWidget
          icon={<Users size={18} />}
          label="Completion Rate"
          value={totalPickups > 0 ? `${Math.round((completedCount / totalPickups) * 100)}%` : '0%'}
          trend="success"
          positive={completedCount > 0}
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Pickups Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : pickups.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <PackageCheck size={32} className="text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No pickups found</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              {activeTab === "READY"
                ? "There are no orders currently waiting for pickup. New pickup orders will appear here."
                : `No ${activeTab.toLowerCase()} pickup orders found.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pickups.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{p.orderNumber}</td>
                    <td className="px-6 py-4 text-gray-700">{p.customerName}</td>
                    <td className="px-6 py-4 text-gray-500">{p.itemCount}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                        p.status === "COMPLETED" ? 'bg-green-50 text-green-600' :
                        p.status === "CANCELED" ? 'bg-red-50 text-red-600' :
                        'bg-orange-50 text-orange-600'
                      }`}>
                        {p.status.toLowerCase().replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Summary Widget Component
function SummaryWidget({
  icon,
  label,
  value,
  trend,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  positive: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 tracking-tight mt-1">
            {value}
          </p>
          <p className={`text-xs mt-1 ${positive ? 'text-green-600' : 'text-orange-600'}`}>
            {trend}
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-gray-100 text-gray-600">
          {icon}
        </div>
      </div>
    </div>
  );
}
