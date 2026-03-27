/**
 * SaaS Industry - Business Analytics & Metrics Page
 * Comprehensive SaaS KPIs, MRR tracking, and growth metrics
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, DollarSign, Users, Activity, Calendar } from "lucide-react";

export default function SaaSAnalyticsPage() {
  const router = useRouter();

  const metrics = {
    mrr: 45750,
    mrrGrowth: 12.5,
    arr: 549000,
    activeCustomers: 187,
    newCustomers: 23,
    churnedCustomers: 8,
    churnRate: 3.2,
    ltv: 18500,
    cac: 4250,
    ltvToCac: 4.35,
    quickRatio: 3.8,
  };

  const mrrData = [
    { month: "Jul", mrr: 38500, new: 4200, expansion: 1800, contraction: -800, churn: -1200 },
    { month: "Aug", mrr: 40800, new: 5100, expansion: 2200, contraction: -900, churn: -1400 },
    { month: "Sep", mrr: 42500, new: 4800, expansion: 2500, contraction: -1100, churn: -1500 },
    { month: "Oct", mrr: 44200, new: 5500, expansion: 2800, contraction: -1200, churn: -1600 },
    { month: "Nov", mrr: 45750, new: 5900, expansion: 3100, contraction: -1300, churn: -1700 },
    { month: "Dec", mrr: 48000, new: 6500, expansion: 3500, contraction: -1400, churn: -1800 },
  ];

  const revenueBreakdown = [
    { plan: "Starter", customers: 78, mrr: 7722, percentage: 16.9 },
    { plan: "Professional", customers: 67, mrr: 33433, percentage: 73.1 },
    { plan: "Enterprise", customers: 35, mrr: 74965, percentage: 163.8 },
    { plan: "Custom", customers: 7, mrr: 34993, percentage: 76.5 },
  ];

  const cohortRetention = [
    { cohort: "Jan 2023", size: 45, month1: 92, month3: 85, month6: 78, current: 73 },
    { cohort: "Feb 2023", size: 52, month1: 90, month3: 83, month6: 76, current: 71 },
    { cohort: "Mar 2023", size: 48, month1: 94, month3: 87, month6: 80, current: 75 },
    { cohort: "Apr 2023", size: 61, month1: 91, month3: 84, month6: 77, current: 72 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard/saas")} className="h-10 w-10 p-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Business Analytics
              </h1>
              <p className="text-muted-foreground mt-1">SaaS metrics and growth tracking</p>
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
              <CardTitle className="text-sm font-medium text-muted-foreground">MRR</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${(metrics.mrr / 1000).toFixed(1)}K</div>
              <div className="flex items-center mt-2 text-xs">
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                <span className="text-green-600 font-medium">+{metrics.mrrGrowth}%</span>
                <span className="text-muted-foreground ml-1">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">ARR</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">${(metrics.arr / 1000).toFixed(0)}K</div>
              <p className="text-xs text-muted-foreground mt-1">Annual recurring revenue</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Customers</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeCustomers}</div>
              <p className="text-xs text-muted-foreground mt-1">+{metrics.newCustomers} new, -{metrics.churnedCustomers} churned</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Churn Rate</CardTitle>
              <Activity className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{metrics.churnRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">Monthly customer churn</p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">LTV (Lifetime Value)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">${(metrics.ltv / 1000).toFixed(1)}K</div>
              <p className="text-xs text-muted-foreground mt-1">Average revenue per customer</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">CAC (Customer Acquisition Cost)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">${(metrics.cac / 1000).toFixed(1)}K</div>
              <p className="text-xs text-muted-foreground mt-1">Cost to acquire new customer</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">LTV:CAC Ratio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{metrics.ltvToCac.toFixed(2)}x</div>
              <p className="text-xs text-muted-foreground mt-1">Healthy ratio: 3:1+</p>
            </CardContent>
          </Card>
        </div>

        {/* MRR Movement */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle>MRR Movement (6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mrrData.map((data) => (
                <div key={data.month} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{data.month}</span>
                    <span className="font-semibold text-green-600">${(data.mrr / 1000).toFixed(1)}K</span>
                  </div>
                  <div className="flex h-8 gap-1">
                    <div 
                      className="bg-green-500 rounded-l"
                      style={{ width: `${(data.new / data.mrr) * 100}%` }}
                      title={`New: $${data.new}`}
                    />
                    <div 
                      className="bg-blue-500"
                      style={{ width: `${(data.expansion / data.mrr) * 100}%` }}
                      title={`Expansion: $${data.expansion}`}
                    />
                    <div 
                      className="bg-yellow-500"
                      style={{ width: `${(Math.abs(data.contraction) / data.mrr) * 100}%` }}
                      title={`Contraction: $${Math.abs(data.contraction)}`}
                    />
                    <div 
                      className="bg-red-500 rounded-r"
                      style={{ width: `${(Math.abs(data.churn) / data.mrr) * 100}%` }}
                      title={`Churn: $${Math.abs(data.churn)}`}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded" />
                <span>New Business</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded" />
                <span>Expansion</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-500 rounded" />
                <span>Contraction</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded" />
                <span>Churn</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Breakdown */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Revenue by Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueBreakdown.map((plan) => (
                  <div key={plan.plan} className="space-y-2 p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{plan.plan}</span>
                      <Badge variant="outline">{plan.customers} customers</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">MRR: <span className="font-medium text-green-600">${(plan.mrr / 1000).toFixed(1)}K</span></span>
                      <span className="text-muted-foreground">Share: <span className="font-medium">{plan.percentage.toFixed(1)}%</span></span>
                    </div>
                    <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        style={{ width: `${plan.percentage / 3}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cohort Retention */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Cohort Retention Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cohortRetention.map((cohort) => (
                  <div key={cohort.cohort} className="space-y-2 p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-semibold">{cohort.cohort}</span>
                      <span className="text-muted-foreground">{cohort.size} customers</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-medium">{cohort.month1}%</div>
                        <div className="text-muted-foreground">Month 1</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{cohort.month3}%</div>
                        <div className="text-muted-foreground">Month 3</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{cohort.month6}%</div>
                        <div className="text-muted-foreground">Month 6</div>
                      </div>
                      <div className="text-center col-span-2">
                        <div className="font-medium text-green-600">{cohort.current}%</div>
                        <div className="text-muted-foreground">Current</div>
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
