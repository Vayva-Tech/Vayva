/**
 * Services Industry - Analytics & Business Intelligence Page
 * Track KPIs, revenue, client metrics, and business performance
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, DollarSign, Users, Briefcase, Calendar, Star, Clock } from "lucide-react";

export default function ServicesAnalyticsPage() {
  const router = useRouter();

  const metrics = {
    revenue: 285000,
    revenueGrowth: 18.5,
    activeClients: 47,
    newClients: 12,
    activeProjects: 23,
    completedProjects: 68,
    avgProjectValue: 12500,
    clientRetention: 92,
    utilizationRate: 82,
    avgRating: 4.8,
    totalBookings: 156,
    upcomingBookings: 34,
  };

  const revenueData = [
    { month: "Jul", revenue: 185000, target: 175000 },
    { month: "Aug", revenue: 210000, target: 190000 },
    { month: "Sep", revenue: 245000, target: 210000 },
    { month: "Oct", revenue: 265000, target: 230000 },
    { month: "Nov", revenue: 285000, target: 250000 },
    { month: "Dec", revenue: 320000, target: 280000 },
  ];

  const topServices = [
    { name: "Business Consulting", bookings: 45, revenue: 85000, growth: 22 },
    { name: "Marketing Strategy", bookings: 38, revenue: 72000, growth: 18 },
    { name: "IT Support", bookings: 52, revenue: 65000, growth: 15 },
    { name: "Legal Advisory", bookings: 28, revenue: 58000, growth: 25 },
    { name: "Financial Planning", bookings: 31, revenue: 54000, growth: 12 },
  ];

  const clientMetrics = [
    { segment: "Enterprise", count: 12, revenue: 145000, retention: 96 },
    { segment: "SMB", count: 23, revenue: 98000, retention: 91 },
    { segment: "Startup", count: 18, revenue: 52000, retention: 88 },
    { segment: "Nonprofit", count: 8, revenue: 28000, retention: 94 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard/services")} className="h-10 w-10 p-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Analytics & Insights
              </h1>
              <p className="text-muted-foreground mt-1">Business intelligence and performance metrics</p>
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
              <div className="text-2xl font-bold">${(metrics.revenue / 1000).toFixed(0)}K</div>
              <div className="flex items-center mt-2 text-xs">
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                <span className="text-green-600 font-medium">+{metrics.revenueGrowth}%</span>
                <span className="text-muted-foreground ml-1">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Clients</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeClients}</div>
              <p className="text-xs text-muted-foreground mt-1">+{metrics.newClients} new this month</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Projects</CardTitle>
              <Briefcase className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeProjects}</div>
              <p className="text-xs text-muted-foreground mt-1">{metrics.completedProjects} completed</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Client Retention</CardTitle>
              <Star className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.clientRetention}%</div>
              <p className="text-xs text-muted-foreground mt-1">Industry avg: 85%</p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Team Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{metrics.utilizationRate}%</div>
              <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${metrics.utilizationRate}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Billable hours rate</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Project Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">${(metrics.avgProjectValue / 1000).toFixed(1)}K</div>
              <p className="text-xs text-muted-foreground mt-1">Per project average</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Customer Satisfaction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600 flex items-center gap-2">
                {metrics.avgRating}
                <Star className="h-5 w-5 fill-yellow-600 text-yellow-600" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Based on 127 reviews</p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Trend Chart */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle>Revenue Trend (6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueData.map((data, index) => (
                <div key={data.month} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{data.month}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">Target: ${(data.target / 1000).toFixed(0)}K</span>
                      <span className="font-semibold text-green-600">${(data.revenue / 1000).toFixed(0)}K</span>
                    </div>
                  </div>
                  <div className="relative h-8 bg-muted/30 rounded-lg overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-30"
                      style={{ width: `${(data.target / Math.max(...revenueData.map(d => d.target))) * 100}%` }}
                    />
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-purple-600"
                      style={{ width: `${(data.revenue / Math.max(...revenueData.map(d => d.revenue))) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Services */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Top Performing Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topServices.map((service, index) => (
                  <div key={service.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{service.name}</p>
                        <p className="text-xs text-muted-foreground">{service.bookings} bookings</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">${(service.revenue / 1000).toFixed(0)}K</p>
                      <p className="text-xs text-green-600 flex items-center justify-end">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +{service.growth}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Client Segments */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Client Segments Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clientMetrics.map((segment) => (
                  <div key={segment.segment} className="space-y-2 p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{segment.segment}</span>
                      <Badge variant="outline">{segment.count} clients</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Revenue: <span className="font-medium text-green-600">${(segment.revenue / 1000).toFixed(0)}K</span></span>
                      <span className="text-muted-foreground">Retention: <span className="font-medium text-blue-600">{segment.retention}%</span></span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                        style={{ width: `${segment.retention}%` }}
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
