// @ts-nocheck
"use client";

import { logger, formatCurrency } from "@vayva/shared";
import { useEffect, useState } from "react";
import { Button, Icon, Link } from "@vayva/ui";
import { toast } from "sonner";
import {
  BarChart, TrendUp, Users, ShoppingBag, Eye, MousePointerClick, Package, Wallet, Lock,
} from "@phosphor-icons/react";
import { apiJson } from "@/lib/api-client-shared";
import {
  AnalyticsData,
  Insight,
  AnalyticsInsightsResponse,
} from "@/types/analytics";
import { useAuth } from "@/context/AuthContext";

// Normalize plan name
function normalizePlan(rawPlan: string | null | undefined): string {
  if (!rawPlan) return "FREE";
  const v = rawPlan.toLowerCase().trim();
  if (v === "pro" || v === "business" || v === "enterprise") return "PRO";
  if (v === "starter" || v === "growth") return "STARTER";
  if (v === "free" || v === "trial") return "FREE";
  return "FREE";
}

export default function AnalyticsPage() {
  const { merchant } = useAuth();
  const userPlan = normalizePlan((merchant as any)?.plan);
  const isPRO = userPlan === "PRO";
  
  // Show lock screen for non-PRO users
  if (!isPRO) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-6">
          <Lock size={40} className="text-gray-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3 text-center">
          Advanced Analytics is a Pro Feature
        </h1>
        <p className="text-lg text-gray-600 mb-8 text-center max-w-md">
          Upgrade to Pro to unlock AI-powered insights, predictive analytics, and advanced reporting
        </p>
        <div className="flex gap-3">
          <Link href="/dashboard/control-center/pro">
            <Button className="rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3">
              Upgrade to Pro
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" className="rounded-xl border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium px-6 py-3">
              Back to Dashboard
            </Button>
          </Link>
        </div>
        
        {/* Features preview */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full">
          {[
            { icon: TrendUp, label: "Predictive Analytics", desc: "AI-powered forecasting" },
            { icon: Eye, label: "Advanced Reports", desc: "Deep dive insights" },
            { icon: Wallet, label: "Revenue Trends", desc: "Historical analysis" },
          ].map((feature, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 text-center opacity-50">
              <feature.icon size={24} className="mx-auto mb-2 text-gray-400" />
              <p className="text-sm font-semibold text-gray-700">{feature.label}</p>
              <p className="text-xs text-gray-500 mt-1">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const [range, setRange] = useState("7d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchData();
    void fetchInsights();
  }, [range]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const json = await apiJson<AnalyticsData>(
        `/api/analytics/overview?range=${range}`,
      );
      setData(json);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[FETCH_ANALYTICS_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      const errorMsg = _errMsg || "Failed to load analytics";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInsights = async () => {
    try {
      const json = await apiJson<AnalyticsInsightsResponse>(
        "/api/analytics/insights",
      );
      if (json) {
        setInsights(json.insights || []);
      }
    } catch (e: any) {
      const _errMsg = e instanceof Error ? e.message : String(e);
      logger.error("[FETCH_INSIGHTS_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Track your store performance</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <Button
            onClick={fetchData}
            variant="outline"
            className="rounded-xl border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium"
          >
            <Icon name="Refresh" size={16} className="mr-2 text-gray-400" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Icon name="Warning" size={32} className="text-red-500" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">Failed to load analytics</h3>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <Button onClick={fetchData} className="rounded-xl bg-green-500 hover:bg-green-600 text-white font-medium px-6">
            Try Again
          </Button>
        </div>
      )}

      {/* Summary Widgets */}
      {!isLoading && data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryWidget
            icon={<Wallet size={18} />}
            label="Total Revenue"
            value={formatCurrency(data.totalSales || 0, "NGN")}
            trend="+12%"
            positive
          />
          <SummaryWidget
            icon={<ShoppingBag size={18} />}
            label="Total Orders"
            value={String(data.totalOrders || 0)}
            trend="+8%"
            positive
          />
          <SummaryWidget
            icon={<Users size={18} />}
            label="Visitors"
            value={String(data.visitors || 0)}
            trend="+15%"
            positive
          />
          <SummaryWidget
            icon={<MousePointerClick size={18} />}
            label="Conversion Rate"
            value={`${((data.conversionRate || 0) * 100).toFixed(2)}%`}
            trend="+0.5%"
            positive
          />
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="bg-gray-100 rounded-2xl h-96 animate-pulse" />
        </div>
      )}

      {/* Main Content */}
      {!isLoading && data && (
        <>
          {/* Performance Chart Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Performance Overview</h3>
                <p className="text-xs text-gray-500 mt-0.5">Revenue and orders over time</p>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Icon name="DotsThreeOutline" size={20} className="text-gray-400" />
              </button>
            </div>
            
            <div className="h-80 flex items-end gap-2">
              {data.salesByDay?.slice(0, 7).map((day: any, i: number) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-green-500 rounded-t-lg transition-all duration-500"
                    style={{ height: `${Math.max(8, (day / Math.max(...data.salesByDay.slice(0, 7))) * 280)}px` }}
                  />
                  <span className="text-xs text-gray-500">
                    {new Date(day).toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                </div>
              ))}
              {(!data.salesByDay || data.salesByDay.length === 0) && (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <p className="text-sm">No data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Insights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Products */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Top Products</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Best performers this period</p>
                </div>
                <button className="text-sm font-medium text-green-600 hover:text-green-700">
                  View All
                </button>
              </div>
              
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center">
                        <Package size={20} className="text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Product {i}</p>
                        <p className="text-xs text-gray-500">{Math.floor(Math.random() * 100) + 20} sales</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">₦{Math.floor(Math.random() * 500) + 100}K</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Insights */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Key Insights</h3>
                  <p className="text-xs text-gray-500 mt-0.5">AI-powered recommendations</p>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Icon name="Lightbulb" size={20} className="text-gray-400" />
                </button>
              </div>
              
              <div className="space-y-3">
                {insights.slice(0, 3).map((insight: Insight, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <Icon name="Lightbulb" size={18} className="text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{insight.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                    </div>
                  </div>
                ))}
                {insights.length === 0 && (
                  <div className="text-center py-8">
                    <Icon name="Lightbulb" size={32} className="mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">No insights available yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
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
        </div>
        <div className="p-2.5 rounded-xl bg-gray-100 text-gray-600">
          {icon}
        </div>
      </div>
      <div className={`flex items-center text-sm font-medium ${positive ? 'text-green-600' : 'text-red-500'}`}>
        <span>{trend}</span>
        <span className="ml-1">{positive ? '↗' : '↘'}</span>
      </div>
    </div>
  );
}


