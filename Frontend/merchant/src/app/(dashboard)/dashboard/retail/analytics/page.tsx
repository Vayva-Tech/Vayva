/**
 * Retail Industry - Business Analytics & Performance Page
 * Comprehensive retail metrics, sales trends, and KPIs
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, DollarSign, ShoppingCart, Users, Calendar } from "lucide-react";

export default function RetailAnalyticsPage() {
  const router = useRouter();

  const metrics = {
    totalRevenue: 485750,
    revenueGrowth: 18.5,
    totalOrders: 1247,
    avgOrderValue: 389.50,
    conversionRate: 3.2,
    customerRetention: 68,
    inventoryTurnover: 8.5,
    grossMargin: 42.3,
  };

  const salesData = [
    { month: "Jul", revenue: 385000, orders: 985, target: 375000 },
    { month: "Aug", revenue: 412000, orders: 1056, target: 400000 },
    { month: "Sep", revenue: 445000, orders: 1134, target: 425000 },
    { month: "Oct", revenue: 468000, orders: 1198, target: 450000 },
    { month: "Nov", revenue: 485750, orders: 1247, target: 475000 },
    { month: "Dec", revenue: 520000, orders: 1356, target: 500000 },
  ];

  const categoryPerformance = [
    { category: "Electronics", revenue: 185000, growth: 22, margin: 35 },
    { category: "Accessories", revenue: 125000, growth: 15, margin: 48 },
    { category: "Home & Office", revenue: 98500, growth: 18, margin: 42 },
    { category: "Wearables", revenue: 77250, growth: 28, margin: 45 },
  ];

  const channelPerformance = [
    { channel: "Online Store", revenue: 245000, percentage: 50.4, growth: 20 },
    { channel: "In-Store", revenue: 165000, percentage: 34.0, growth: 12 },
    { channel: "Marketplace", revenue: 55750, percentage: 11.5, growth: 35 },
    { channel: "Mobile App", revenue: 20000, percentage: 4.1, growth: 45 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard/retail")} className="h-10 w-10 p-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Business Analytics
              </h1>
              <p className="text-muted-foreground mt-1">Comprehensive performance insights</p>
            </div>
          </div>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Last 6 Months
          </Button>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(metrics.totalRevenue / 1000).toFixed(0)}K</div>
              <div className="flex items-center mt-2 text-xs">
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                <span className="text-green-600 font-medium">+{metrics.revenueGrowth}%</span>
                <span className="text-muted-foreground ml-1">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">Avg ${metrics.avgOrderValue.toFixed(0)} per order</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{metrics.conversionRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">Visitor to customer</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Customer Retention</CardTitle>
              <Users className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{metrics.customerRetention}%</div>
              <p className="text-xs text-muted-foreground mt-1">Repeat customers</p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Inventory Turnover</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{metrics.inventoryTurnover}x</div>
              <p className="text-xs text-muted-foreground mt-1">Times per year</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Gross Margin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{metrics.grossMargin}%</div>
              <p className="text-xs text-muted-foreground mt-1">Average across all categories</p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Trend */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle>Revenue Trend (6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesData.map((data) => (
                <div key={data.month} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{data.month}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">Target: ${(data.target / 1000).toFixed(0)}K</span>
                      <span className="font-semibold text-green-600">${(data.revenue / 1000).toFixed(0)}K ({data.orders} orders)</span>
                    </div>
                  </div>
                  <div className="relative h-8 bg-muted/30 rounded-lg overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-30"
                      style={{ width: `${(data.target / Math.max(...salesData.map(d => d.target))) * 100}%` }}
                    />
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-600 to-purple-600"
                      style={{ width: `${(data.revenue / Math.max(...salesData.map(d => d.revenue))) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Category Performance */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryPerformance.map((category) => (
                  <div key={category.category} className="space-y-2 p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{category.category}</span>
                      <Badge variant="outline">${(category.revenue / 1000).toFixed(0)}K</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Growth: <span className="font-medium text-green-600 flex items-center"><TrendingUp className="h-3 w-3 mr-1" />+{category.growth}%</span></span>
                      <span className="text-muted-foreground">Margin: <span className="font-medium text-blue-600">{category.margin}%</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Channel Performance */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Sales by Channel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {channelPerformance.map((channel) => (
                  <div key={channel.channel} className="space-y-2 p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{channel.channel}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{channel.percentage.toFixed(1)}%</Badge>
                        <Badge variant="default" className="text-xs">+{channel.growth}%</Badge>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Revenue: <span className="font-medium text-green-600">${(channel.revenue / 1000).toFixed(1)}K</span>
                    </div>
                    <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        style={{ width: `${channel.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
