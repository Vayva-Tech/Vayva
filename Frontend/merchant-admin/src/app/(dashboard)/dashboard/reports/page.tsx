"use client";

import { logger, formatCurrency } from "@vayva/shared";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { toast } from "sonner";
import { Button } from "@vayva/ui";
import {
  Spinner as Loader2,
  ChartLineUp as TrendingUp,
  CurrencyDollar as DollarSign,
  ShoppingBag,
} from "@phosphor-icons/react/ssr";

interface ReportData {
  totalSales: number;
  totalOrders: number;
  aov: number;
  activeCustomers: number;
  chartData: Array<{ date: string; sales: number; orders: number }>;
  // Optional trend fields from API
  salesTrend?: number;
  ordersTrend?: number;
  aovTrend?: number;
}

import { apiJson } from "@/lib/api-client-shared";

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [prevData, setPrevData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [range, setRange] = useState("30d");

  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true);
      try {
        const [current, previous] = await Promise.all([
          apiJson<ReportData>(`/api/analytics/overview?range=${range}`),
          apiJson<ReportData>(
            `/api/analytics/overview?range=${range}&compare=previous`,
          ).catch(() => null),
        ]);
        setData(current);
        setPrevData(previous);
      } catch (e: any) {
        const _errMsg = e instanceof Error ? e.message : String(e);
        logger.error("[FETCH_REPORT_ERROR]", {
          error: _errMsg,
          app: "merchant",
        });
        toast.error(_errMsg || "Failed to load report data");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchReport();
  }, [range]);

  const computeTrend = (
    current: number | undefined,
    previous: number | undefined,
    apiTrend?: number,
  ): string | undefined => {
    if (apiTrend !== undefined)
      return `${apiTrend >= 0 ? "+" : ""}${apiTrend}%`;
    if (!current || !previous || previous === 0) return undefined;
    const pct = Math.round(((current - previous) / previous) * 100);
    return `${pct >= 0 ? "+" : ""}${pct}%`;
  };

  if (isLoading)
    return (
      <div className="p-12 text-center text-text-secondary flex items-center justify-center gap-2" aria-live="polite" role="status">
        <Loader2 className="animate-spin h-5 w-5" /> Loading...
        <span className="sr-only">Loading reports...</span>
      </div>
    );

  return (
    <div className="flex-1 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-text-primary">
            Sales Reports
          </h1>
          <p className="text-text-secondary mt-1">
            Deep dive into your store's performance metrics.
          </p>
        </div>
        <div className="inline-flex bg-background/60 border border-border/60 p-1 rounded-full">
          {["7d", "30d", "90d"].map((r) => (
            <Button
              key={r}
              variant="ghost"
              onClick={() => setRange(r)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold transition-all h-auto",
                range === r
                  ? "bg-text-primary text-text-inverse shadow-sm"
                  : "text-text-secondary hover:text-text-primary hover:bg-transparent",
              )}
            >
              {r.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Gross Revenue"
          value={data ? formatCurrency(data.totalSales) : "₦0.00"}
          trend={computeTrend(
            data?.totalSales,
            prevData?.totalSales,
            data?.salesTrend,
          )}
          icon={DollarSign}
          loading={isLoading}
        />
        <MetricCard
          title="Total Orders"
          value={data ? data.totalOrders : "0"}
          trend={computeTrend(
            data?.totalOrders,
            prevData?.totalOrders,
            data?.ordersTrend,
          )}
          icon={ShoppingBag}
          loading={isLoading}
        />
        <MetricCard
          title="Avg. Ticket"
          value={data ? formatCurrency(data.aov) : "₦0.00"}
          trend={computeTrend(data?.aov, prevData?.aov, data?.aovTrend)}
          icon={TrendingUp}
          loading={isLoading}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 rounded-[28px] border border-border/60 bg-background/70 backdrop-blur-xl shadow-card overflow-hidden">
          <CardHeader className="bg-background/60 p-6 border-b border-border/60">
            <CardTitle className="text-lg font-bold">
              Revenue Timeline
            </CardTitle>
            <CardDescription>
              Daily gross sales across the selected period.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[350px] w-full">
              {isLoading ? (
                <div className="h-full w-full bg-background/30 animate-pulse rounded-2xl flex items-center justify-center">
                  <Loader2 className="animate-spin text-text-tertiary" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.chartData || []}>
                    <defs>
                      <linearGradient
                        id="colorSales"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="hsl(var(--primary))"
                          stopOpacity={0.16}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(var(--primary))"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="rgba(0,0,0,0.06)"
                    />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "rgba(100,116,139,0.9)", fontSize: 10 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "rgba(100,116,139,0.9)", fontSize: 10 }}
                      tickFormatter={(val) => `₦${val}`}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "16px",
                        border: "1px solid rgba(0,0,0,0.06)",
                        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                        backgroundColor: "rgba(255,255,255,0.92)",
                      }}
                      labelStyle={{ fontWeight: "bold", marginBottom: "4px" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorSales)"
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 rounded-[28px] border border-border/60 bg-background/70 backdrop-blur-xl shadow-card overflow-hidden">
          <CardHeader className="bg-background/60 p-6 border-b border-border/60">
            <CardTitle className="text-lg font-bold">Order Volume</CardTitle>
            <CardDescription>Number of transactions per day.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[350px] w-full">
              {isLoading ? (
                <div className="h-full w-full bg-background/30 animate-pulse rounded-2xl flex items-center justify-center">
                  <Loader2 className="animate-spin text-text-tertiary" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data?.chartData || []}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="rgba(0,0,0,0.06)"
                    />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "rgba(100,116,139,0.9)", fontSize: 10 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "rgba(100,116,139,0.9)", fontSize: 10 }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "16px",
                        border: "1px solid rgba(0,0,0,0.06)",
                        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                        backgroundColor: "rgba(255,255,255,0.92)",
                      }}
                    />
                    <Line
                      type="stepAfter"
                      dataKey="orders"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{
                        r: 4,
                        fill: "hsl(var(--primary))",
                        strokeWidth: 2,
                        stroke: "rgba(255,255,255,0.9)",
                      }}
                      activeDot={{ r: 6 }}
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  trend,
  icon: Icon,
  loading,
}: {
  title: string;
  value: string | number;
  trend?: string;
  icon: React.ElementType;
  loading: boolean;
}) {
  return (
    <Card className="rounded-[28px] border border-border/60 bg-background/70 backdrop-blur-xl shadow-card overflow-hidden p-6 hover:shadow-elevated transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-background/30 rounded-2xl text-text-secondary border border-border/60">
          <Icon size={20} />
        </div>
        {trend && (
          <span
            className={cn(
              "text-xs font-bold px-2 py-1 rounded-full border",
              trend.startsWith("-")
                ? "bg-destructive/10 text-destructive border-destructive/20"
                : "bg-success/10 text-success border-success/20",
            )}
          >
            {trend}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-xs font-bold text-text-tertiary uppercase tracking-widest">
          {title}
        </p>
        {loading ? (
          <div className="h-8 w-24 bg-background/30 animate-pulse rounded-lg" />
        ) : (
          <h3 className="text-2xl font-black text-text-primary">{value}</h3>
        )}
      </div>
    </Card>
  );
}
