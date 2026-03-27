/**
 * SaaS Industry - Usage Metrics & Analytics Page
 * Track customer product usage, engagement, and feature adoption
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, Activity, Users, Calendar } from "lucide-react";

export default function SaaSUsagePage() {
  const router = useRouter();

  const metrics = {
    totalUsers: 2847,
    activeUsers: 1956,
    dailyActiveUsers: 892,
    weeklyActiveUsers: 1654,
    monthlyActiveUsers: 2341,
    avgSessionDuration: 24.5,
    featureAdoption: 67,
    churnRate: 3.2,
  };

  const usageData = [
    { month: "Jul", users: 2145, active: 1456, dau: 645, target: 2000 },
    { month: "Aug", users: 2298, active: 1587, dau: 712, target: 2150 },
    { month: "Sep", users: 2456, active: 1698, dau: 789, target: 2300 },
    { month: "Oct", users: 2634, active: 1812, dau: 834, target: 2450 },
    { month: "Nov", users: 2847, active: 1956, dau: 892, target: 2650 },
    { month: "Dec", users: 3100, active: 2150, dau: 975, target: 2900 },
  ];

  const featureUsage = [
    { feature: "Dashboard Analytics", users: 1847, adoption: 65, growth: 12 },
    { feature: "API Integration", users: 1256, adoption: 44, growth: 28 },
    { feature: "Team Collaboration", users: 1654, adoption: 58, growth: 15 },
    { feature: "Automated Reports", users: 987, adoption: 35, growth: 22 },
    { feature: "Custom Workflows", users: 756, adoption: 27, growth: 35 },
  ];

  const topCustomers = [
    { name: "TechCorp Inc", users: 50,活跃度: 95, plan: "Enterprise" },
    { name: "Growth Hackers Ltd", users: 100,活跃度: 92, plan: "Custom" },
    { name: "Consulting Partners", users: 40,活跃度: 88, plan: "Enterprise" },
    { name: "E-commerce Solutions", users: 20,活跃度: 85, plan: "Professional" },
    { name: "StartupHub", users: 15,活跃度: 78, plan: "Professional" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard/saas")} className="h-10 w-10 p-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Usage & Engagement
              </h1>
              <p className="text-muted-foreground mt-1">Track product usage and feature adoption</p>
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Across all accounts</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Active</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{metrics.monthlyActiveUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">{((metrics.monthlyActiveUsers / metrics.totalUsers) * 100).toFixed(0)}% of total</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Daily Active</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{metrics.dailyActiveUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Avg session: {metrics.avgSessionDuration}m</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Churn Rate</CardTitle>
              <Badge className="h-6 w-6 text-xs">CHURN</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{metrics.churnRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">Industry avg: 5%</p>
            </CardContent>
          </Card>
        </div>

        {/* User Growth Trend */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle>User Growth Trend (6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {usageData.map((data) => (
                <div key={data.month} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{data.month}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">Target: {(data.target / 1000).toFixed(1)}K</span>
                      <span className="font-semibold text-blue-600">{(data.users / 1000).toFixed(2)}K users ({data.active} active)</span>
                    </div>
                  </div>
                  <div className="relative h-8 bg-muted/30 rounded-lg overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-cyan-500 opacity-30"
                      style={{ width: `${(data.target / Math.max(...usageData.map(d => d.target))) * 100}%` }}
                    />
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-cyan-600"
                      style={{ width: `${(data.users / Math.max(...usageData.map(d => d.users))) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Feature Adoption */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Feature Adoption</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {featureUsage.map((feature) => (
                  <div key={feature.feature} className="space-y-2 p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{feature.feature}</span>
                      <Badge variant="outline">{feature.adoption}%</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{feature.users.toLocaleString()} users</span>
                      <span className="text-muted-foreground">Growth: <span className="font-medium text-green-600 flex items-center"><TrendingUp className="h-3 w-3 mr-1" />+{feature.growth}%</span></span>
                    </div>
                    <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                        style={{ width: `${feature.adoption}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Customers */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Top Customers by Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCustomers.map((customer, index) => (
                  <div key={customer.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">{customer.plan} • {customer.users} users</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Engagement:</span>
                        <Badge variant="default" className="text-xs">{customer.活跃度}%</Badge>
                      </div>
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
