/**
 * Wellness - Analytics & Reporting Page
 * Fitness center performance, member insights, and business metrics
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3, TrendingUp, Users, DollarSign, Activity } from "lucide-react";

export default function WellnessAnalyticsPage() {
  const router = useRouter();

  const metrics = {
    totalMembers: 2847,
    memberGrowth: 15.3,
    monthlyRevenue: 284500,
    revenueGrowth: 12.8,
    averageRetention: 87.5,
    retentionGrowth: 3.2,
    classAttendance: 78.3,
    attendanceGrowth: 5.7,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/wellness")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Analytics & Insights</h1>
            <p className="text-muted-foreground">Fitness center performance and member metrics</p>
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
                <p className="text-sm text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold">{metrics.totalMembers.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{metrics.memberGrowth}%
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold">${(metrics.monthlyRevenue / 1000).toFixed(0)}K</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{metrics.revenueGrowth}%
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
                <p className="text-sm text-muted-foreground">Retention Rate</p>
                <p className="text-2xl font-bold">{metrics.averageRetention}%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{metrics.retentionGrowth}%
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Class Attendance</p>
                <p className="text-2xl font-bold">{metrics.classAttendance}%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{metrics.attendanceGrowth}%
                </p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Placeholder */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Membership Growth (Last 12 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
              <BarChart3 className="h-16 w-16 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
              <BarChart3 className="h-16 w-16 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Classes */}
      <Card>
        <CardHeader>
          <CardTitle>Most Popular Classes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: "CrossFit WOD", instructor: "Mike Johnson", avgAttendance: 45, rating: 4.9 },
              { name: "Yoga Flow", instructor: "Sarah Chen", avgAttendance: 38, rating: 4.8 },
              { name: "HIIT Training", instructor: "Alex Brown", avgAttendance: 42, rating: 4.7 },
              { name: "Spin Class", instructor: "Emma Wilson", avgAttendance: 35, rating: 4.8 },
            ].map((classItem, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{classItem.name}</p>
                  <p className="text-sm text-muted-foreground">{classItem.instructor}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{classItem.avgAttendance} avg</p>
                  <p className="text-xs text-yellow-600">★ {classItem.rating}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
