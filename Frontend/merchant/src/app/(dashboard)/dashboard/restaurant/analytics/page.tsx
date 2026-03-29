/**
 * Restaurant Analytics Page - Business Intelligence
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
  revenueGrowth: number;
  popularDishes: Array<{ name: string; orders: number }>;
  peakHours: Array<{ hour: string; orders: number }>;
  customerRetention: number;
  averageTicket: number;
}

export default function RestaurantAnalyticsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsMetrics | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await apiJson<{ data: AnalyticsMetrics }>("/restaurant/analytics");
      setAnalytics(response.data || null);
    } catch (error) {
      logger.warn("Failed to fetch restaurant analytics", error);
      setAnalytics(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard/restaurant")}>
              <ChevronLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Analytics & Insights
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
                <p className="text-muted-foreground">Start collecting data by processing orders and tracking customers</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">+{analytics.revenueGrowth}%</p>
                <p className="text-sm text-muted-foreground">vs last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Ticket</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{formatCurrency(analytics.averageTicket)}</p>
                <p className="text-sm text-muted-foreground">per order</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Retention</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{analytics.customerRetention}%</p>
                <p className="text-sm text-muted-foreground">returning customers</p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Popular Dishes</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.popularDishes.length === 0 ? (
                  <p className="text-muted-foreground">No data yet</p>
                ) : (
                  <div className="space-y-3">
                    {analytics.popularDishes.map((dish, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span>{dish.name}</span>
                        <Badge>{dish.orders} orders</Badge>
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

// No mock data - requires real restaurant API integration
