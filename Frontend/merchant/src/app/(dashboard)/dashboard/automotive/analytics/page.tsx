/**
 * Automotive Industry - Sales Analytics & Performance Page
 * Track dealership sales, revenue, and team performance metrics
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, DollarSign, Car, Users, Star, Calendar } from "lucide-react";

export default function AutomotiveAnalyticsPage() {
  const router = useRouter();

  const metrics = {
    totalRevenue: 1285000,
    revenueGrowth: 24.5,
    vehiclesSold: 47,
    avgSalePrice: 52340,
    grossProfit: 285000,
    profitMargin: 22.2,
    conversionRate: 18.5,
    customerSatisfaction: 4.7,
  };

  const salesData = [
    { month: "Jul", revenue: 985000, units: 38, target: 950000 },
    { month: "Aug", revenue: 1050000, units: 42, target: 1000000 },
    { month: "Sep", revenue: 1180000, units: 45, target: 1100000 },
    { month: "Oct", revenue: 1220000, units: 46, target: 1150000 },
    { month: "Nov", revenue: 1285000, units: 47, target: 1200000 },
    { month: "Dec", revenue: 1450000, units: 52, target: 1350000 },
  ];

  const topSalespeople = [
    { name: "Mike Johnson", sales: 18, revenue: 485000, commission: 24250, rating: 4.9 },
    { name: "Lisa Chen", sales: 15, revenue: 425000, commission: 21250, rating: 4.8 },
    { name: "David Park", sales: 14, revenue: 375000, commission: 18750, rating: 4.7 },
  ];

  const brandPerformance = [
    { brand: "Tesla", units: 12, revenue: 515880, growth: 32 },
    { brand: "BMW", units: 8, revenue: 548000, growth: 18 },
    { brand: "Mercedes-Benz", units: 7, revenue: 342300, growth: 15 },
    { brand: "Audi", units: 5, revenue: 532500, growth: 22 },
    { brand: "Porsche", units: 3, revenue: 377700, growth: 28 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard/automotive")} className="h-10 w-10 p-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-gray-700 bg-clip-text text-transparent">
                Sales Analytics
              </h1>
              <p className="text-muted-foreground mt-1">Dealership performance and revenue tracking</p>
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Vehicles Sold</CardTitle>
              <Car className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.vehiclesSold}</div>
              <p className="text-xs text-muted-foreground mt-1">Avg ${Math.round(metrics.avgSalePrice / 1000)}K per unit</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Gross Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">${(metrics.grossProfit / 1000).toFixed(0)}K</div>
              <p className="text-xs text-muted-foreground mt-1">{metrics.profitMargin}% margin</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Customer Satisfaction</CardTitle>
              <Star className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600 flex items-center gap-1">
                {metrics.customerSatisfaction}
                <Star className="h-4 w-4 fill-yellow-600" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Based on 127 reviews</p>
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
                      <span className="font-semibold text-green-600">${(data.revenue / 1000).toFixed(0)}K ({data.units} units)</span>
                    </div>
                  </div>
                  <div className="relative h-8 bg-muted/30 rounded-lg overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-slate-500 to-gray-500 opacity-30"
                      style={{ width: `${(data.target / Math.max(...salesData.map(d => d.target))) * 100}%` }}
                    />
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-slate-600 to-gray-600"
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
          {/* Top Salespeople */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Top Performing Salespeople</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topSalespeople.map((rep, index) => (
                  <div key={rep.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-slate-500 to-gray-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{rep.name}</p>
                        <p className="text-xs text-muted-foreground">{rep.sales} sales</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">${(rep.revenue / 1000).toFixed(0)}K</p>
                      <p className="text-xs text-muted-foreground">Commission: ${(rep.commission / 1000).toFixed(1)}K</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Brand Performance */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Brand Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {brandPerformance.map((brand) => (
                  <div key={brand.brand} className="space-y-2 p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{brand.brand}</span>
                      <Badge variant="outline">{brand.units} units</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Revenue: <span className="font-medium text-green-600">${(brand.revenue / 1000).toFixed(0)}K</span></span>
                      <span className="text-muted-foreground">Growth: <span className="font-medium text-green-600 flex items-center"><TrendingUp className="h-3 w-3 mr-1" />+{brand.growth}%</span></span>
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
