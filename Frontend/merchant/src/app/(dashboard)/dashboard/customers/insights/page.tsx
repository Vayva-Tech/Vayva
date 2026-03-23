// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import { Badge, Button, Card } from "@vayva/ui";
import {
  Users,
  TrendUp,
  Warning,
  Sparkle as Sparkles,
  Envelope,
  CurrencyDollar,
  ShoppingCart,
  Receipt,
} from "@phosphor-icons/react";
import { logger } from "@/lib/logger";

interface InsightStats {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
}

interface SegmentData {
  count: number;
  revenue: number;
}

interface InsightsData {
  stats: InsightStats;
  segments: Record<string, SegmentData>;
}

import { apiJson } from "@/lib/api-client-shared";

const segments = [
  {
    id: "vip",
    title: "VIP Customers",
    icon: Sparkles,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  {
    id: "loyal",
    title: "Loyal Regulars",
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  {
    id: "new",
    title: "Recent & Promising",
    icon: TrendUp,
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  {
    id: "atRisk",
    title: "At Risk",
    icon: Warning,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
  },
];

export default function InsightsPage() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const json = await apiJson<InsightsData>("/api/customers/insights");
        if (json && json.stats) {
          setData(json);
        }
      } catch (e: any) {
        const _errMsg = e instanceof Error ? e.message : String(e);
        logger.error("[FETCH_INSIGHTS_ERROR]", {
          error: _errMsg,
          app: "merchant",
        });
      } finally {
        setLoading(false);
      }
    };
    void fetchInsights();
  }, []);

  // Calculate total customers for SummaryWidget
  const totalCustomers = segments.reduce((sum, s) => {
    const segData = data?.segments?.[s.id] || { count: 0, revenue: 0 };
    return sum + segData.count;
  }, 0);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 p-10">
        <div className="text-gray-600 font-semibold">Loading Insights...</div>
      </div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Smart Insights
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              AI-driven segmentation to boost your retention •{" "}
              <span className="font-semibold text-gray-900">{totalCustomers} customers analyzed</span>
            </p>
          </div>
          <Badge className="bg-purple-50 text-purple-700 border-purple-200 font-semibold">
            <Sparkles size={16} weight="fill" className="mr-2" />
            PREMIUM FEATURE
          </Badge>
        </div>

        {/* Summary Widgets */}
        <div className="grid grid-cols-4 gap-4">
          <SummaryWidget
            icon={<CurrencyDollar size={18} weight="fill" />}
            label="Total Revenue"
            value={`₺${(data?.stats?.totalRevenue || 0).toLocaleString()}`}
            trend="Processed value"
            positive={true}
          />
          <SummaryWidget
            icon={<ShoppingCart size={18} />}
            label="Total Orders"
            value={(data?.stats?.totalOrders || 0).toLocaleString()}
            trend="All-time orders"
            positive={true}
          />
          <SummaryWidget
            icon={<Receipt size={18} weight="fill" />}
            label="Avg Order Value"
            value={`₺${Math.round(data?.stats?.averageOrderValue || 0).toLocaleString()}`}
            trend="Per transaction"
            positive={true}
          />
          <SummaryWidget
            icon={<Users size={18} />}
            label="Total Customers"
            value={totalCustomers.toLocaleString()}
            trend="Analyzed by AI"
            positive={true}
          />
        </div>
      </div>

      {/* Segments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {segments.map((s) => {
          const segData = data?.segments?.[s.id] || { count: 0, revenue: 0 };
          return (
            <Card
              key={s.id}
              className="rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow flex flex-col justify-between h-52"
            >
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-xl ${s.bg} ${s.color} border ${s.border}`}>
                  <s.icon size={24} weight="fill" />
                </div>
                <Badge className={`${s.bg} ${s.color} border ${s.border} font-semibold`}>
                  {segData.count} Customers
                </Badge>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">{s.title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Est. Value: ₺{segData?.revenue?.toLocaleString()}
                </p>
              </div>

              <Button
                variant="outline"
                className="w-full justify-between rounded-xl font-semibold"
                onClick={() => {
                  const csvContent =
                    "data:text/csv;charset=utf-8," +
                    "Segment,Count,Revenue\n" +
                    `${s.title},${segData.count},${segData.revenue}`;
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", `${s.id}_segment_export.csv`);
                  document.body?.appendChild(link);
                  link.click();
                  document.body?.removeChild(link);
                }}
              >
                <span>Export List</span>
                <Envelope size={16} weight="fill" />
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// Summary Widget Component
// ============================================================
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
    <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 tracking-tight mt-0.5">
            {value}
          </p>
          <p className={`text-xs mt-1 ${positive ? 'text-green-600 font-medium' : 'text-orange-600 font-medium'}`}>
            {trend}
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-gray-50 text-gray-600">
          {icon}
        </div>
      </div>
    </div>
  );
}
