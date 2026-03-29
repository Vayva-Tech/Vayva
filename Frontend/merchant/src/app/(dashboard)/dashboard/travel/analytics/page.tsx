"use client";

/**
 * Travel Dashboard - Analytics Page
 * Performance metrics and business insights
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, DollarSign, Users, MapPin, Calendar, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiJson } from "@/lib/api-client-shared";
import logger from "@/lib/logger";

interface AnalyticsData {
  revenue: {
    current: number;
    previous: number;
    growth: number;
  };
  bookings: {
    total: number;
    confirmed: number;
    pending: number;
    cancelled: number;
  };
  topDestinations: Array<{
    name: string;
    bookings: number;
    revenue: number;
  }>;
  customerMetrics: {
    totalCustomers: number;
    newCustomers: number;
    repeatRate: number;
    satisfaction: number;
  };
}

export default function TravelAnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await apiJson<{ data: AnalyticsData }>("/travel/analytics");
      setAnalytics(response.data || null);
    } catch (error) {
      logger.warn("Failed to fetch analytics", error);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-coral-50 p-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-coral-50 p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Travel Analytics</h1>
          <p className="mt-1 text-gray-600">Performance insights and business metrics</p>
        </div>
        <Button onClick={() => window.print()}>
          Export Report
        </Button>
      </div>

      {!analytics ? (
        <div className="text-center py-12">
          <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No analytics data</h3>
          <p className="text-gray-600">Analytics will populate as bookings are made</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Revenue Metrics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(analytics.revenue.current)}</div>
                <p className={`text-xs ${analytics.revenue.growth >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {analytics.revenue.growth >= 0 ? "+" : ""}{analytics.revenue.growth}% from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.bookings.total}</div>
                <p className="text-xs text-gray-600">
                  {analytics.bookings.confirmed} confirmed • {analytics.bookings.pending} pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <Users className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.customerMetrics.totalCustomers}</div>
                <p className="text-xs text-gray-600">
                  {analytics.customerMetrics.newCustomers} new this period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
                <Star className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.customerMetrics.satisfaction}/5</div>
                <p className="text-xs text-gray-600">
                  {analytics.customerMetrics.repeatRate}% repeat rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Destinations */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Destinations</CardTitle>
              <CardDescription>Most popular destinations by bookings and revenue</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.topDestinations.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-gray-600">Destination data will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {analytics.topDestinations.map((dest, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full font-bold text-blue-600">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold">{dest.name}</p>
                          <p className="text-sm text-gray-600">{dest.bookings} bookings</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">{formatCurrency(dest.revenue)}</p>
                        <p className="text-xs text-gray-600">revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// API INTEGRATION:
// Required Endpoint:
// - GET /api/travel/analytics - Comprehensive analytics data
