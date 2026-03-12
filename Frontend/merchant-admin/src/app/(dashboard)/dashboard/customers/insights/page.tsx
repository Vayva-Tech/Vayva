"use client";

import { useState, useEffect } from "react";
import { Badge, Button, Card } from "@vayva/ui";
import {
  Users,
  TrendUp as TrendingUp,
  WarningCircle as AlertCircle,
  Sparkle as Sparkles,
  EnvelopeSimple as Mail,
} from "@phosphor-icons/react/ssr";
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

  const segments = [
    {
      id: "vip",
      title: "VIP Customers",
      icon: Sparkles,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
    },
    {
      id: "loyal",
      title: "Loyal Regulars",
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      id: "new",
      title: "Recent & Promising",
      icon: TrendingUp,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      id: "atRisk",
      title: "At Risk",
      icon: AlertCircle,
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
  ];

  if (loading)
    return <div className="p-10 text-center">Loading Insights...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-headings font-bold">Smart Insights</h1>
          <p className="text-text-secondary">
            AI-driven segmentation to boost your retention.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-full text-xs font-bold text-purple-300">
          <Sparkles size={12} />
          PREMIUM FEATURE
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-6 space-y-2">
          <div className="text-sm text-text-secondary">
            Total Processed Revenue
          </div>
          <div className="text-3xl font-bold font-mono">
            ₺{data?.stats?.totalRevenue?.toLocaleString()}
          </div>
        </Card>
        <Card className="p-6 space-y-2">
          <div className="text-sm text-text-secondary">Total Orders</div>
          <div className="text-3xl font-bold font-mono">
            {data?.stats?.totalOrders}
          </div>
        </Card>
        <Card className="p-6 space-y-2">
          <div className="text-sm text-text-secondary">Average Order Value</div>
          <div className="text-3xl font-bold font-mono">
            ₺{Math.round(data?.stats?.averageOrderValue || 0).toLocaleString()}
          </div>
        </Card>
      </div>

      {/* Segments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {segments.map((s) => {
          const segData = data?.segments?.[s.id] || { count: 0, revenue: 0 };
          return (
            <Card
              key={s.id}
              className="p-6 flex flex-col justify-between h-48 hover:border-primary/40 transition-colors group"
            >
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-xl ${s.bg} ${s.color}`}>
                  <s.icon size={24} />
                </div>
                <Badge variant="default" className="bg-background/5">
                  {segData.count} Customers
                </Badge>
              </div>

              <div>
                <h3 className="text-lg font-bold">{s.title}</h3>
                <p className="text-sm text-text-secondary">
                  Est. Value: ₺{segData?.revenue?.toLocaleString()}
                </p>
              </div>

              <Button
                variant="ghost"
                className="w-full justify-between group-hover:bg-background/5"
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
                <Mail size={16} />
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
