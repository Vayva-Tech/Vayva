"use client";

import { logger, formatCurrency } from "@vayva/shared";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  ArrowUpRight,
  CurrencyDollar as DollarSign,
  Users,
  ShoppingBag,
} from "@phosphor-icons/react/ssr";
import { Button } from "@vayva/ui";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { PERMISSIONS } from "@/lib/team/permissions";
import { cn } from "@/lib/utils";
import { apiJson } from "@/lib/api-client-shared";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  AnalyticsData,
  Insight,
  AnalyticsInsightsResponse,
} from "@/types/analytics";

export default function AnalyticsPage() {
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

  if (error && !isLoading) {
    return (
      <DashboardPageShell
        title="Analytics"
        description="Real-time performance summary of your store."
        category="Home"
      >
        <div className="bg-background/70 backdrop-blur-xl rounded-3xl border border-border/60 p-12 text-center shadow-card">
          <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-text-tertiary opacity-70" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Failed to load analytics
          </h3>
          <p className="text-sm text-text-secondary mb-4">{error}</p>
          <Button
            onClick={fetchData}
            className="px-4 py-2 bg-text-primary text-text-inverse rounded-xl hover:bg-text-primary/90 font-medium"
          >
            Try Again
          </Button>
        </div>
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell
      title="Analytics"
      description="Real-time performance summary of your store."
      category="Home"
      actions={
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-[180px] rounded-xl border border-border/60 shadow-card bg-background/70 backdrop-blur-xl font-medium">
            <SelectValue placeholder="Select Range" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      }
    >
      <Breadcrumbs />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <PermissionGate permission={PERMISSIONS.FINANCE_VIEW}>
          <MetricCard
            title="Total Revenue"
            value={data ? formatCurrency(data.totalSales) : formatCurrency(0)}
            icon={DollarSign}
            loading={isLoading}
            status="success"
          />
        </PermissionGate>
        <MetricCard
          title="Orders"
          value={data ? data.totalOrders : "0"}
          icon={ShoppingBag}
          loading={isLoading}
        />
        <MetricCard
          title="Active Customers"
          value={data ? data.activeCustomers : "0"}
          icon={Users}
          loading={isLoading}
        />
        <PermissionGate permission={PERMISSIONS.FINANCE_VIEW}>
          <MetricCard
            title="Avg Order Value"
            value={
              data ? formatCurrency(Math.round(data.aov)) : formatCurrency(0)
            }
            icon={ArrowUpRight}
            subtext="Average per transaction"
            loading={isLoading}
          />
        </PermissionGate>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 rounded-[28px] border border-border/60 bg-background/70 backdrop-blur-xl shadow-card hover:shadow-elevated transition-all overflow-hidden">
          <CardHeader className="bg-background/60 p-6 border-b border-border/60">
            <CardTitle className="text-lg font-bold">Sales Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-[350px] w-full rounded-2xl" />
              </div>
            ) : (
              <div className="h-[350px]">
                {data?.chartData?.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-text-tertiary gap-2">
                    <ShoppingBag className="h-10 w-10 text-text-tertiary/40" />
                    <p className="font-medium">
                      No sales data found for this range
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data?.chartData || []}>
                      <XAxis
                        dataKey="date"
                        stroke="rgba(100,116,139,0.9)"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                      />
                      <YAxis
                        stroke="rgba(100,116,139,0.9)"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `₦${value}`}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(0,0,0,0.03)" }}
                        contentStyle={{
                          borderRadius: "16px",
                          border: "1px solid rgba(0,0,0,0.06)",
                          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                          backgroundColor: "rgba(255,255,255,0.92)",
                        }}
                      />
                      <Bar
                        dataKey="sales"
                        fill="hsl(var(--primary))"
                        radius={[6, 6, 0, 0]}
                        animationDuration={1000}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3 rounded-[28px] border border-border/60 bg-background/70 backdrop-blur-xl shadow-card hover:shadow-elevated transition-all overflow-hidden">
          <CardHeader className="bg-background/60 p-6 border-b border-border/60">
            <CardTitle className="text-lg font-bold">AI Insights</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
              </div>
            ) : insights.length > 0 ? (
              <div className="space-y-4">
                {insights.map((insight, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-4 bg-background/60 border border-border/60 rounded-2xl text-sm transition-all hover:bg-background/30"
                  >
                    <div className="bg-background/30 p-2 rounded-lg border border-border/60">
                      ✨
                    </div>
                    <div>
                      <p className="font-medium text-text-primary leading-relaxed">
                        {insight.message}
                      </p>
                      <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-tighter mt-1">
                        Smart Suggestion
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-text-secondary text-center py-12 flex flex-col items-center gap-2">
                <div className="p-3 bg-background/30 rounded-full border border-border/60">
                  ✨
                </div>
                <p className="font-medium">
                  Collecting data for smart insights...
                </p>
                <p className="text-xs text-text-tertiary">
                  Insights appear after your first few sales.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardPageShell>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  subtext?: string;
  loading: boolean;
  status?: "success" | "warning" | "default";
}

function MetricCard({
  title,
  value,
  icon: Icon,
  subtext,
  loading,
  status = "default",
}: MetricCardProps) {
  return (
    <Card className="rounded-[28px] border border-border/60 bg-background/70 backdrop-blur-xl shadow-card hover:shadow-elevated transition-all overflow-hidden group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
        <CardTitle className="text-xs font-bold text-text-tertiary uppercase tracking-widest">
          {title}
        </CardTitle>
        <div
          className={cn(
            "p-2 rounded-lg transition-colors",
            status === "success"
              ? "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-text-inverse"
              : "bg-background/30 text-text-secondary group-hover:bg-background/30",
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {loading ? (
          <Skeleton className="h-8 w-28 rounded-lg" />
        ) : (
          <div className="text-2xl font-black text-text-primary tracking-tight">
            {value}
          </div>
        )}
        {subtext && (
          <p className="text-[10px] text-text-tertiary font-medium mt-1">
            {subtext}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
