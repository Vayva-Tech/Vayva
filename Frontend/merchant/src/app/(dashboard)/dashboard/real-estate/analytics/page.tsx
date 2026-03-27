/**
 * Real Estate - Analytics & Market Insights Page
 * Performance metrics, market trends, and business intelligence
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3, TrendingUp, Home, DollarSign } from "lucide-react";

export default function RealEstateAnalyticsPage() {
  const router = useRouter();

  const metrics = {
    totalSales: 178000000,
    salesGrowth: 22.5,
    activeListings: 47,
    listingsGrowth: 15.3,
    avgSalePrice: 1850000,
    priceGrowth: 8.7,
    avgDaysOnMarket: 18,
    domChange: -12.5,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/real-estate")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Analytics & Market Insights</h1>
            <p className="text-muted-foreground">Performance metrics and market trends</p>
          </div>
        </div>
        <Button variant="outline">
          <BarChart3 className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sales Volume</p>
                <p className="text-2xl font-bold">${(metrics.totalSales / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{metrics.salesGrowth}%
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Listings</p>
                <p className="text-2xl font-bold">{metrics.activeListings}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{metrics.listingsGrowth}%
                </p>
              </div>
              <Home className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Sale Price</p>
                <p className="text-2xl font-bold">${(metrics.avgSalePrice / 1000).toFixed(0)}K</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{metrics.priceGrowth}%
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Days on Market</p>
                <p className="text-2xl font-bold">{metrics.avgDaysOnMarket}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
                  {metrics.domChange}%
                </p>
              </div>
              <Home className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Placeholder */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales Volume Trends (Last 12 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
              <BarChart3 className="h-16 w-16 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Market Price per SqFt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
              <BarChart3 className="h-16 w-16 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Areas */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Markets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { area: "Beverly Hills, CA", avgPrice: 2450000, growth: 12.5, sales: 24 },
              { area: "Miami Beach, FL", avgPrice: 1850000, growth: 18.3, sales: 32 },
              { area: "Seattle, WA", avgPrice: 1250000, growth: 9.7, sales: 28 },
              { area: "Austin, TX", avgPrice: 975000, growth: 15.2, sales: 35 },
            ].map((market, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{market.area}</p>
                  <p className="text-sm text-muted-foreground">{market.sales} sales this quarter</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${(market.avgPrice / 1000).toFixed(0)}K avg</p>
                  <p className="text-xs text-green-600">+{market.growth}% YoY</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
