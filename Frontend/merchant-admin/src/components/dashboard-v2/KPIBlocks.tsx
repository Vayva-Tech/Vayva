"use client";

import { logger, formatCurrency } from "@vayva/shared";
import { useEffect, useState } from "react";
import { Button, Card, Icon, IconName } from "@vayva/ui";
import { apiJson } from "@/lib/api-client-shared";

interface KPIData {
  revenue: number;
  orders: number;
  customers: number;
  conversionRate: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  conversionChange: number;
}

interface KPIBlockProps {
  title: string;
  value: string;
  change: number;
  icon: IconName;
  iconBg: string;
  loading?: boolean;
}

function KPIBlock({
  title,
  value,
  change,
  icon,
  iconBg,
  loading,
}: KPIBlockProps) {
  const isPositive = change >= 0;
  const changeColor = isPositive ? "text-status-success" : "text-status-danger";
  const changeBg = isPositive ? "bg-status-success/10" : "bg-status-danger/10";

  return (
    <Card className="p-6 hover:shadow-elevated transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-text-secondary mb-1">
            {title}
          </p>
          {loading ? (
            <div className="h-8 w-32 bg-surface-2/50 rounded-xl animate-pulse" />
          ) : (
            <p className="text-3xl font-bold text-text-primary">{value}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${iconBg}`}>
          <Icon name={icon} className="h-6 w-6" />
        </div>
      </div>

      {!loading && (
        <div className="mt-4 flex items-center gap-2">
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full ${changeBg}`}
          >
            <Icon
              name={isPositive ? "TrendingUp" : "TrendingDown"}
              className={`h-3 w-3 ${changeColor}`}
            />
            <span className={`text-xs font-semibold ${changeColor}`}>
              {Math.abs(change)}%
            </span>
          </div>
          <span className="text-xs text-text-tertiary">vs last period</span>
        </div>
      )}
    </Card>
  );
}

interface KPIBlocksProps {
  currency?: string;
}

interface KPIResponse {
  success: boolean;
  data: KPIData;
}

export function KPIBlocks({ currency = "NGN" }: KPIBlocksProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<KPIData>({
    revenue: 0,
    orders: 0,
    customers: 0,
    conversionRate: 0,
    revenueChange: 0,
    ordersChange: 0,
    customersChange: 0,
    conversionChange: 0,
  });

  const fetchKPIData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const result = await apiJson<KPIResponse>("/api/dashboard/kpis");
      if (result.success && result.data) {
        setData(result.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[FETCH_KPI_DATA_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      setError(_errMsg || "Failed to load metrics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchKPIData();

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchKPIData(true);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchKPIData(true);
  };

  if (error && !loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">
            Key Metrics
          </h2>
        </div>
        <div className="text-center py-8">
          <Icon
            name="AlertCircle"
            className="h-8 w-8 mx-auto mb-2 text-status-danger opacity-60"
          />
          <p className="text-sm text-text-secondary mb-4">{error}</p>
          <Button
            variant="outline"
            onClick={() => fetchKPIData()}
            className="rounded-xl"
          >
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <section aria-label="Key Performance Indicators" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">Key Metrics</h2>
        <Button
          variant="ghost"
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-2/50 rounded-xl h-auto"
          aria-label="Refresh metrics"
        >
          <Icon
            name="RefreshCw"
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPIBlock
          title="Total Revenue"
          value={formatCurrency(data.revenue, currency)}
          change={data.revenueChange}
          icon="DollarSign"
          iconBg="bg-status-success/10 text-status-success"
          loading={loading}
        />
        <KPIBlock
          title="Total Orders"
          value={data.orders.toLocaleString()}
          change={data.ordersChange}
          icon="ShoppingBag"
          iconBg="bg-status-info/10 text-status-info"
          loading={loading}
        />
        <KPIBlock
          title="Customers"
          value={data.customers.toLocaleString()}
          change={data.customersChange}
          icon="Users"
          iconBg="bg-surface-2/50 text-text-secondary"
          loading={loading}
        />
        <KPIBlock
          title="Conversion Rate"
          value={`${data.conversionRate}%`}
          change={data.conversionChange}
          icon="Target"
          iconBg="bg-status-warning/10 text-status-warning"
          loading={loading}
        />
      </div>
    </section>
  );
}
