/**
 * Real Estate Analytics Page - Market Insights & Business Intelligence
 */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiJson } from "@/lib/api-client-shared";
import { logger, formatCurrency } from "@vayva/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp } from "lucide-react";
import { ChevronLeft } from "lucide-react";

interface AnalyticsMetrics {
  marketTrends: Array<{ area: string; trend: string; change: number }>;
  averageDaysOnMarket: number;
  saleToListRatio: number;
  inventoryLevel: number;
  medianSalePrice: number;
}

export default function RealEstateAnalyticsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsMetrics | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await apiJson<{ data: AnalyticsMetrics }>("/realestate/analytics");
      setAnalytics(response.data || null);
    } catch (error) {
      logger.warn("Failed to fetch real estate analytics", error);
      setAnalytics(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard/realestate")}>
              <ChevronLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Market Analytics
              </h1>
            </div>
          </div>
          <Button size="sm" variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 md:px-6 py-6 space-y-6">
        {!analytics ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Analytics Data Yet</h3>
                <p className="text-muted-foreground">Start closing deals to generate market insights</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Avg Days on Market</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{analytics.averageDaysOnMarket}</p>
                <p className="text-sm text-muted-foreground">days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sale to List Ratio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{(analytics.saleToListRatio * 100).toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">of asking price</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Median Sale Price</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{formatCurrency(analytics.medianSalePrice)}</p>
                <p className="text-sm text-muted-foreground">market median</p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Market Trends by Area</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.marketTrends.length === 0 ? (
                  <p className="text-muted-foreground">No trends data yet</p>
                ) : (
                  <div className="space-y-3">
                    {analytics.marketTrends.map((trend, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{trend.area}</p>
                          <p className="text-xs text-muted-foreground">{trend.trend}</p>
                        </div>
                        <Badge variant={trend.change > 0 ? "default" : "destructive"}>
                          {trend.change > 0 ? "+" : ""}{trend.change}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

// No mock data - requires real estate API integration
