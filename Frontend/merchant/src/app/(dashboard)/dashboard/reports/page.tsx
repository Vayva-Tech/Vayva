// @ts-nocheck
"use client";

import { logger, formatCurrency } from "@vayva/shared";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@vayva/ui";
import { TrendingUp, CurrencyDollar as DollarSign, ShoppingBag, Users, ChartBar, ArrowUpRight, ArrowDownRight } from "@phosphor-icons/react";
import { apiJson } from "@/lib/api-client-shared";

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

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="p-12 text-center text-gray-700 flex items-center justify-center gap-2"
        aria-live="polite"
        role="status"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-green-400 to-teal-500 shadow-lg"
        >
          <Loader2 className="animate-spin h-5 w-5 text-white" />
        </motion.div>
        <span className="ml-3 font-medium">Loading reports...</span>
        <span className="sr-only">Loading reports...</span>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Sales Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Deep dive into your store's performance metrics</p>
        </div>
        <div className="inline-flex bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
          {["7d", "30d", "90d"].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                range === r
                  ? "bg-green-600 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Widgets */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SummaryWidget
            icon={<DollarSign size={18} />}
            label="Total Sales"
            value={formatCurrency(data.totalSales)}
            trend={computeTrend(data.totalSales, prevData?.totalSales, data.salesTrend) || undefined}
            positive={(data.salesTrend ?? 0) >= 0}
          />
          <SummaryWidget
            icon={<ShoppingBag size={18} />}
            label="Total Orders"
            value={String(data.totalOrders)}
            trend={computeTrend(data.totalOrders, prevData?.totalOrders, data.ordersTrend) || undefined}
            positive={(data.ordersTrend ?? 0) >= 0}
          />
          <SummaryWidget
            icon={<ChartBar size={18} />}
            label="Avg Order Value"
            value={formatCurrency(data.aov)}
            trend={computeTrend(data.aov, prevData?.aov, data.aovTrend) || undefined}
            positive={(data.aovTrend ?? 0) >= 0}
          />
          <SummaryWidget
            icon={<Users size={18} />}
            label="Active Customers"
            value={String(data.activeCustomers)}
            trend="this period"
            positive
          />
        </div>
      )}

      {/* Charts Section */}
      {data && data.chartData && data.chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Sales Trend</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.chartData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => value.slice(5)} />
                  <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `₦${(value/1000).toFixed(0)}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #f0f0f0' }}
                    formatter={(value: number) => [formatCurrency(value), 'Sales']}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#22C55E" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Orders Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Orders Trend</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.chartData}>
                  <defs>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => value.slice(5)} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #f0f0f0' }}
                    formatter={(value: number) => [String(value), 'Orders']}
                  />
                  <Area type="monotone" dataKey="orders" stroke="#3B82F6" fillOpacity={1} fill="url(#colorOrders)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Stats Table */}
      {data && data.chartData && data.chartData.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Performance Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.chartData.slice(-7).reverse().map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-900 font-medium">{row.date}</td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">{formatCurrency(row.sales)}</td>
                    <td className="px-6 py-4 text-right text-gray-700">{row.orders}</td>
                    <td className="px-6 py-4 text-right text-gray-700">{formatCurrency(row.sales / Math.max(row.orders, 1))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
  trend?: string;
  positive?: boolean;
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
          {trend && (
            <div className={`flex items-center gap-1 text-xs mt-1 ${positive ? 'text-green-600' : 'text-orange-600'}`}>
              {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              <span className="font-medium">{trend}</span>
              <span className="text-gray-500">vs last period</span>
            </div>
          )}
        </div>
        <div className="p-2.5 rounded-xl bg-gray-100 text-gray-600">
          {icon}
        </div>
      </div>
    </div>
  );
}
