/**
 * Predictive Analytics Dashboard
 * 
 * Features:
 * - Sales forecasting (ML-powered)
 * - Demand prediction
 * - Revenue projections
 * - Trend analysis
 * - Seasonal insights
 * - What-if scenario modeling
 */

"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input as _Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  LineChart as _LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as _PieChart,
  Pie as _Pie,
  Cell as _Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign as _DollarSign,
  Package,
  ShoppingCart, // eslint-disable-line @typescript-eslint/no-unused-vars
  Users as _Users,
  Calendar,
  Zap,
  Target,
  Activity,
  ArrowUpRight as _ArrowUpRight,
  ArrowDownRight as _ArrowDownRight,
  RefreshCw,
  Download,
  Settings as _Settings,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@vayva/shared";

/** Demo analytics payload until merchant analytics services are wired to this UI. */
interface SalesAnalyticsShape {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  revenueByDay?: Array<{ revenue?: number }>;
}

interface ProductPerfRow {
  quantitySold: number;
  product?: { name?: string };
}

async function loadPredictiveDataset(): Promise<{
  analytics: SalesAnalyticsShape;
  productPerformance: ProductPerfRow[];
}> {
  return {
    analytics: {
      totalRevenue: 125000,
      totalOrders: 420,
      averageOrderValue: 297,
      revenueByDay: Array.from({ length: 30 }, (_, i) => ({ revenue: 2800 + i * 95 })),
    },
    productPerformance: [
      { quantitySold: 120, product: { name: "Widget A" } },
      { quantitySold: 98, product: { name: "Widget B" } },
      { quantitySold: 76, product: { name: "Widget C" } },
      { quantitySold: 64, product: { name: "Widget D" } },
      { quantitySold: 55, product: { name: "Widget E" } },
      { quantitySold: 44, product: { name: "Widget F" } },
      { quantitySold: 40, product: { name: "Widget G" } },
      { quantitySold: 38, product: { name: "Widget H" } },
      { quantitySold: 32, product: { name: "Widget I" } },
      { quantitySold: 28, product: { name: "Widget J" } },
    ],
  };
}

// Types
interface ForecastDataPoint {
  date: string;
  predicted: number;
  actual?: number;
  lowerBound?: number;
  upperBound?: number;
}

interface TrendInsight {
  metric: string;
  value: number;
  change: number;
  direction: "up" | "down" | "stable";
  prediction: string;
  confidence: number;
}

interface SeasonalInsight {
  period: string;
  expectedLift: number;
  recommendation: string;
  confidence: number;
}

interface ScenarioResult {
  name: string;
  assumptions: Record<string, number | string>;
  projectedRevenue: number;
  projectedOrders: number;
  growth: number;
}

interface DemandForecastRow {
  name: string;
  current: number;
  predicted: number;
  change: number;
}

export function PredictiveAnalyticsDashboard() {
  const { toast } = useToast();
  
  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<"30d" | "90d" | "180d" | "365d">("90d");
  const [forecastPeriod, setForecastPeriod] = useState<"7d" | "30d" | "90d">("30d");
  
  // Data states
  const [salesForecast, setSalesForecast] = useState<ForecastDataPoint[]>([]);
  const [demandForecast, setDemandForecast] = useState<DemandForecastRow[]>([]);
  const [revenueProjection, setRevenueProjection] = useState<number>(0);
  const [trends, setTrends] = useState<TrendInsight[]>([]);
  const [seasonalInsights, setSeasonalInsights] = useState<SeasonalInsight[]>([]);
  const [scenarios, setScenarios] = useState<ScenarioResult[]>([]);
  
  // Current metrics
  const [_currentMetrics, setCurrentMetrics] = useState({
    revenue: 0,
    orders: 0,
    averageOrderValue: 0,
    customerCount: 0,
    growthRate: 0,
  });

  // Fetch predictive analytics data
  const fetchPredictiveData = async () => {
    try {
      setRefreshing(true);
      
      // Get historical data
      const { analytics, productPerformance } = await loadPredictiveDataset();

      // Generate forecast (simulated ML predictions)
      const forecast = generateSalesForecast(analytics.revenueByDay || [], forecastPeriod);
      const demand = generateDemandForecast(productPerformance);
      const trends_data = calculateTrends(analytics);
      const seasonal = generateSeasonalInsights();
      const scenarioResults = generateScenarios(analytics);

      setSalesForecast(forecast);
      setDemandForecast(demand);
      setRevenueProjection(calculateRevenueProjection(forecast));
      setTrends(trends_data);
      setSeasonalInsights(seasonal);
      setScenarios(scenarioResults);

      // Update current metrics
      setCurrentMetrics({
        revenue: analytics.totalRevenue,
        orders: analytics.totalOrders,
        averageOrderValue: analytics.averageOrderValue,
        customerCount: 0, // Would come from customer analytics
        growthRate: calculateGrowthRate(analytics),
      });

    } catch (error) {
      logger.error("Failed to fetch predictive data", {
        message: error instanceof Error ? error.message : String(error),
      });
      toast({
        title: "Error",
        description: "Failed to load predictive analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPredictiveData();
  }, [timeRange, forecastPeriod]);

  // Generate sales forecast using simple linear regression (simulated ML)
  const generateSalesForecast = (
    historicalData: Array<{ revenue?: number }>,
    period: string
  ): ForecastDataPoint[] => {
    if (!historicalData || historicalData.length === 0) return [];

    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    const forecast: ForecastDataPoint[] = [];
    
    // Calculate trend from historical data
    const recentData = historicalData.slice(-30);
    const avgGrowth = calculateAverageGrowth(recentData);
    const lastPoint = recentData[recentData.length - 1];
    const lastValue = (lastPoint && typeof lastPoint.revenue === "number" ? lastPoint.revenue : 0) || 0;

    // Generate forecast with confidence intervals
    for (let i = 1; i <= days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const predicted = lastValue * Math.pow(1 + avgGrowth, i);
      const variance = predicted * 0.15; // 15% variance
      
      forecast.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        predicted: Math.round(predicted),
        lowerBound: Math.round(predicted - variance),
        upperBound: Math.round(predicted + variance),
      });
    }

    return forecast;
  };

  // Generate demand forecast by product
  const generateDemandForecast = (productPerformance: ProductPerfRow[]): DemandForecastRow[] => {
    if (!productPerformance || productPerformance.length === 0) return [];

    return productPerformance.slice(0, 10).map((product) => {
      const growthRate = (Math.random() * 0.4) - 0.1; // -10% to +30%
      const predictedDemand = Math.round(product.quantitySold * (1 + growthRate));
      
      return {
        name: product.product?.name || "Product",
        current: product.quantitySold,
        predicted: predictedDemand,
        change: Math.round(growthRate * 100),
      };
    });
  };

  // Calculate trends and insights
  const calculateTrends = (analyticsData: unknown): TrendInsight[] => {
    const analytics = analyticsData as Record<string, unknown>;
    const trends: TrendInsight[] = [
      {
        metric: "Revenue",
        value: (analytics?.totalRevenue as number) || 0,
        change: calculateGrowthRate(analytics),
        direction: "up",
        prediction: "Expected to increase based on current trajectory",
        confidence: 85,
      },
      {
        metric: "Orders",
        value: (analytics?.totalOrders as number) || 0,
        change: 12.5,
        direction: "up",
        prediction: "Steady growth anticipated",
        confidence: 78,
      },
      {
        metric: "Avg Order Value",
        value: (analytics?.averageOrderValue as number) || 0,
        change: -2.3,
        direction: "down",
        prediction: "Slight decrease expected",
        confidence: 72,
      },
      {
        metric: "Customer Lifetime Value",
        value: ((analytics?.totalRevenue as number) || 0) / (((analytics?.totalOrders as number) || 1) * 0.3),
        change: 18.7,
        direction: "up",
        prediction: "Strong improvement projected",
        confidence: 81,
      },
    ];

    return trends;
  };

  // Generate seasonal insights
  const generateSeasonalInsights = (): SeasonalInsight[] => {
    const _currentMonth = new Date().getMonth();
    const insights: SeasonalInsight[] = [
      {
        period: "Next 30 days",
        expectedLift: 15,
        recommendation: "Increase inventory by 20% to meet expected demand",
        confidence: 82,
      },
      {
        period: "Holiday Season",
        expectedLift: 45,
        recommendation: "Prepare marketing campaigns and stock up early",
        confidence: 75,
      },
      {
        period: "Q2 Outlook",
        expectedLift: 8,
        recommendation: "Focus on customer retention during slower period",
        confidence: 68,
      },
    ];

    return insights;
  };

  // Generate what-if scenarios
  const generateScenarios = (analyticsData: unknown): ScenarioResult[] => {
    const analytics = analyticsData as Record<string, unknown>;
    const baseRevenue = (analytics?.totalRevenue as number) || 0;

    return [
      {
        name: "Optimistic Growth",
        assumptions: { trafficIncrease: 30, conversionLift: 15, aovIncrease: 10 },
        projectedRevenue: Math.round(baseRevenue * 1.6),
        projectedOrders: Math.round(((analytics?.totalOrders as number) || 0) * 1.5),
        growth: 60,
      },
      {
        name: "Conservative",
        assumptions: { trafficIncrease: 10, conversionLift: 5, aovIncrease: 3 },
        projectedRevenue: Math.round(baseRevenue * 1.2),
        projectedOrders: Math.round(((analytics?.totalOrders as number) || 0) * 1.15),
        growth: 20,
      },
      {
        name: "Marketing Push",
        assumptions: { adSpend: "₦50,000", roas: "4x", newCustomers: 200 },
        projectedRevenue: Math.round(baseRevenue * 1.4),
        projectedOrders: Math.round(((analytics?.totalOrders as number) || 0) * 1.35),
        growth: 40,
      },
    ];
  };

  // Helper calculations
  const calculateAverageGrowth = (data: Array<{ revenue?: number }>): number => {
    if (data.length < 2) return 0.05; // Default 5% growth
    
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, d) => sum + (d.revenue ?? 0), 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => sum + (d.revenue ?? 0), 0) / secondHalf.length;
    
    return firstAvg > 0 ? (secondAvg - firstAvg) / firstAvg : 0.05;
  };

  const calculateGrowthRate = (_analytics: unknown): number => {
    // Simulated growth rate calculation
    return 15.3;
  };

  const calculateRevenueProjection = (forecast: ForecastDataPoint[]): number => {
    return forecast.reduce((sum, f) => sum + f.predicted, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Activity className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Predictive Analytics</h1>
          <p className="text-gray-500">AI-powered forecasts and insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchPredictiveData} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Time Range Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="space-y-2">
              <Label>Historical Period</Label>
              <Select
                value={timeRange}
                onValueChange={(v) => setTimeRange(v as "30d" | "90d" | "180d" | "365d")}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="180d">Last 180 days</SelectItem>
                  <SelectItem value="365d">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Forecast Period</Label>
              <Select
                value={forecastPeriod}
                onValueChange={(v) => setForecastPeriod(v as "7d" | "30d" | "90d")}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 days</SelectItem>
                  <SelectItem value="30d">30 days</SelectItem>
                  <SelectItem value="90d">90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics with Predictions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {trends.map((trend, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{trend.metric}</CardTitle>
              {trend.direction === "up" ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {trend.metric.includes("Value") || trend.metric.includes("Revenue")
                  ? `₦${trend.value.toLocaleString()}`
                  : trend.value.toLocaleString()}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={trend.change >= 0 ? "default" : "secondary"}>
                  {trend.change >= 0 ? "+" : ""}{trend.change}%
                </Badge>
                <span className="text-xs text-gray-500">vs last period</span>
              </div>
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Confidence</span>
                  <span className="font-medium">{trend.confidence}%</span>
                </div>
                <Progress value={trend.confidence} className="h-1" />
                <p className="text-xs text-gray-500 mt-1">{trend.prediction}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs for Different Views */}
      <Tabs defaultValue="forecast" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="forecast">Sales Forecast</TabsTrigger>
          <TabsTrigger value="demand">Demand Prediction</TabsTrigger>
          <TabsTrigger value="seasonal">Seasonal Insights</TabsTrigger>
          <TabsTrigger value="scenarios">What-If Scenarios</TabsTrigger>
        </TabsList>

        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Revenue Forecast - Next {forecastPeriod}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesForecast}>
                    <defs>
                      <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="predicted"
                      stroke="#8884d8"
                      fillOpacity={1}
                      fill="url(#colorPredicted)"
                      name="Predicted Revenue"
                    />
                    {salesForecast.some(f => f.lowerBound) && (
                      <>
                        <Line
                          type="monotone"
                          dataKey="upperBound"
                          stroke="#8884d8"
                          strokeDasharray="3 3"
                          name="Upper Bound"
                        />
                        <Line
                          type="monotone"
                          dataKey="lowerBound"
                          stroke="#8884d8"
                          strokeDasharray="3 3"
                          name="Lower Bound"
                        />
                      </>
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Projected Revenue:</span>
                  <span className="text-2xl font-bold text-green-500">
                    ₦{revenueProjection.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demand" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Demand Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={demandForecast}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="current" fill="#94a3b8" name="Current Sales" />
                    <Bar dataKey="predicted" fill="#6366f1" name="Predicted Demand" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {demandForecast.slice(0, 3).map((item, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">{item.name}</p>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Current:</span>
                          <span className="font-medium">{item.current} units</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Predicted:</span>
                          <span className="font-medium">{item.predicted} units</span>
                        </div>
                        <Badge variant={item.change >= 0 ? "default" : "secondary"}>
                          {item.change >= 0 ? "+" : ""}{item.change}% change
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seasonal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Seasonal Insights & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {seasonalInsights.map((insight, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-lg">{insight.period}</h3>
                        <Badge variant="default">
                          +{insight.expectedLift}% expected lift
                        </Badge>
                      </div>
                      <p className="text-gray-500">{insight.recommendation}</p>
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">Confidence: {insight.confidence}%</span>
                        <Progress value={insight.confidence} className="flex-1 h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                What-If Scenario Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {scenarios.map((scenario, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-lg">{scenario.name}</h3>
                        <Badge variant={scenario.growth > 30 ? "default" : "secondary"}>
                          +{scenario.growth}% growth
                        </Badge>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Assumptions</h4>
                          <div className="space-y-1">
                            {Object.entries(scenario.assumptions).map(([key, value]) => (
                              <div key={key} className="flex justify-between text-sm">
                                <span className="text-gray-500 capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <span className="font-medium">
                                  {typeof value === "number" ? `${value}%` : String(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="p-3 bg-green-500/10 rounded-lg">
                            <div className="flex justify-between">
                              <span className="text-sm">Projected Revenue</span>
                              <span className="font-bold text-lg">
                                ₦{scenario.projectedRevenue.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <div className="p-3 bg-gray-100 rounded-lg">
                            <div className="flex justify-between">
                              <span className="text-sm">Projected Orders</span>
                              <span className="font-semibold">
                                {scenario.projectedOrders.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900">Pro Tip</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Use these scenarios to plan your inventory, marketing budget, and resource allocation.
                      The optimistic scenario assumes strong market conditions and effective execution.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
