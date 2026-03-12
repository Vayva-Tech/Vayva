"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, TrendingUp, DollarSign, Package, Calendar, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SalesForecastChart } from "./SalesForecastChart";
import { CashFlowForecastChart } from "./CashFlowForecastChart";
import { InventoryForecastTable } from "./InventoryForecastTable";
import { ForecastingOverview, PeriodType } from "@/types/intelligence";
import { useToast } from "@/hooks/use-toast";

export function ForecastingDashboard() {
  const [activeTab, setActiveTab] = useState("sales");
  const [periodType, setPeriodType] = useState<PeriodType>("daily");
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ForecastingOverview | null>(null);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const fetchForecastingData = async () => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams({
        periodType,
        days: days.toString(),
      });

      const response = await fetch(`/api/forecasting?${searchParams}`);

      if (!response.ok) {
        throw new Error("Failed to fetch forecasting data");
      }

      const result = await response.json();
      setData(result.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const generateForecasts = async () => {
    try {
      setGenerating(true);

      const response = await fetch("/api/forecasting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: activeTab,
          periodType,
          periods: days,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate forecasts");
      }

      toast({
        title: "Forecasts Generated",
        description: `New ${activeTab} forecasts have been generated successfully.`,
      });

      await fetchForecastingData();
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to generate forecasts",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchForecastingData();
  }, [periodType, days]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Forecasting</h1>
          <p className="text-muted-foreground">
            Predictive analytics for sales, cash flow, and inventory
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={periodType} onValueChange={(v: any) => setPeriodType(v as PeriodType)}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Select value={days.toString()} onValueChange={(v: any) => setDays(parseInt(v))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="14">14 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="60">60 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={generateForecasts}
            disabled={generating}
            variant="outline"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${generating ? "animate-spin" : ""}`} />
            {generating ? "Generating..." : "Generate"}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Predicted Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₦{data?.sales
                  .reduce((sum: any, s: any) => sum + s.predictedRevenue, 0)
                  .toLocaleString("en-NG", { maximumFractionDigits: 0 })}
              </div>
              <p className="text-xs text-muted-foreground">
                Next {days} days forecast
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₦{data?.cashFlow
                  .reduce((sum: any, c: any) => sum + c.netFlow, 0)
                  .toLocaleString("en-NG", { maximumFractionDigits: 0 })}
              </div>
              <p className="text-xs text-muted-foreground">
                Predicted inflow minus outflow
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stockout Risk</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data?.inventory.filter((i: any) => i.stockoutRisk > 0.5).length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Products at high risk
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="sales">
            <TrendingUp className="mr-2 h-4 w-4" />
            Sales
          </TabsTrigger>
          <TabsTrigger value="cashflow">
            <DollarSign className="mr-2 h-4 w-4" />
            Cash Flow
          </TabsTrigger>
          <TabsTrigger value="inventory">
            <Package className="mr-2 h-4 w-4" />
            Inventory
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Forecast</CardTitle>
              <CardDescription>
                AI-powered revenue predictions with confidence intervals
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[400px]" />
              ) : data?.sales && data.sales.length > 0 ? (
                <SalesForecastChart data={data.sales} />
              ) : (
                <div className="flex h-[400px] items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">
                      No sales forecast data available
                    </p>
                    <Button
                      className="mt-4"
                      onClick={generateForecasts}
                      disabled={generating}
                    >
                      Generate Forecast
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Forecast</CardTitle>
              <CardDescription>
                Predicted inflows, outflows, and runway analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[400px]" />
              ) : data?.cashFlow && data.cashFlow.length > 0 ? (
                <CashFlowForecastChart data={data.cashFlow} />
              ) : (
                <div className="flex h-[400px] items-center justify-center">
                  <div className="text-center">
                    <DollarSign className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">
                      No cash flow forecast data available
                    </p>
                    <Button
                      className="mt-4"
                      onClick={generateForecasts}
                      disabled={generating}
                    >
                      Generate Forecast
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Forecast</CardTitle>
              <CardDescription>
                Demand predictions and reorder recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[400px]" />
              ) : data?.inventory && data.inventory.length > 0 ? (
                <InventoryForecastTable data={data.inventory} />
              ) : (
                <div className="flex h-[400px] items-center justify-center">
                  <div className="text-center">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">
                      No inventory forecast data available
                    </p>
                    <Button
                      className="mt-4"
                      onClick={generateForecasts}
                      disabled={generating}
                    >
                      Generate Forecast
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
