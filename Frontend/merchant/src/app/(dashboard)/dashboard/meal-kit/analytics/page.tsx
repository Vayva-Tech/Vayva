/**
 * Meal Kit Industry - Business Analytics Page
 * Comprehensive meal kit metrics, subscriptions, and performance tracking
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, DollarSign, Users, ChefHat, Calendar } from "lucide-react";

export default function MealKitAnalyticsPage() {
  const router = useRouter();

  const metrics = {
    totalRevenue: 285750,
    revenueGrowth: 22.5,
    activeSubscriptions: 1847,
    newSubscriptions: 234,
    churnedSubscriptions: 89,
    churnRate: 4.8,
    avgOrderValue: 67.50,
    customerLifetimeValue: 890,
    mealsDelivered: 12456,
    avgRating: 4.6,
  };

  const revenueData = [
    { month: "Jul", revenue: 225000, orders: 3245, target: 220000 },
    { month: "Aug", revenue: 242000, orders: 3567, target: 235000 },
    { month: "Sep", revenue: 258000, orders: 3789, target: 250000 },
    { month: "Oct", revenue: 271000, orders: 3956, target: 265000 },
    { month: "Nov", revenue: 285750, orders: 4123, target: 280000 },
    { month: "Dec", revenue: 305000, orders: 4456, target: 300000 },
  ];

  const planPerformance = [
    { plan: "Classic Family", subscribers: 521, revenue: 85000, growth: 18, retention: 88 },
    { plan: "Keto Weight Loss", subscribers: 189, revenue: 52000, growth: 32, retention: 92 },
    { plan: "Vegetarian Wellness", subscribers: 312, revenue: 68000, growth: 24, retention: 90 },
    { plan: "Vegan Starter", subscribers: 156, revenue: 38000, growth: 28, retention: 85 },
    { plan: "Paleo Performance", subscribers: 98, revenue: 42750, growth: 35, retention: 94 },
  ];

  const popularRecipes = [
    { name: "Pad Thai Shrimp", orders: 1247, rating: 4.9, category: "dinner" },
    { name: "Grilled Salmon with Quinoa", orders: 1156, rating: 4.8, category: "dinner" },
    { name: "Chicken Tikka Masala", orders: 1089, rating: 4.7, category: "dinner" },
    { name: "Beef Tacos al Pastor", orders: 967, rating: 4.8, category: "dinner" },
    { name: "Teriyaki Chicken Bowl", orders: 892, rating: 4.7, category: "lunch" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard/meal-kit")} className="h-10 w-10 p-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Business Analytics
              </h1>
              <p className="text-muted-foreground mt-1">Meal kit performance and growth metrics</p>
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
              <div className="text-2xl font-bold text-green-600">${(metrics.totalRevenue / 1000).toFixed(0)}K</div>
              <div className="flex items-center mt-2 text-xs">
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                <span className="text-green-600 font-medium">+{metrics.revenueGrowth}%</span>
                <span className="text-muted-foreground ml-1">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Subscriptions</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeSubscriptions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">+{metrics.newSubscriptions} new, -{metrics.churnedSubscriptions} churned</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Churn Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{metrics.churnRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">Monthly subscription churn</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Order Value</CardTitle>
              <ChefHat className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">${metrics.avgOrderValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">Per delivery</p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Customer LTV</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">${metrics.customerLifetimeValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Lifetime value per customer</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Meals Delivered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{metrics.mealsDelivered.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Total meals this month</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600 flex items-center gap-2">
                {metrics.avgRating}
                <span className="text-yellow-600">★</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Based on 2,847 reviews</p>
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
              {revenueData.map((data) => (
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
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-amber-500 opacity-30"
                      style={{ width: `${(data.target / Math.max(...revenueData.map(d => d.target))) * 100}%` }}
                    />
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-600 to-amber-600"
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
          {/* Plan Performance */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Plan Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {planPerformance.map((plan) => (
                  <div key={plan.plan} className="space-y-2 p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{plan.plan}</span>
                      <Badge variant="outline">{plan.subscribers} subs</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="text-muted-foreground">Revenue</div>
                        <div className="font-medium text-green-600">${(plan.revenue / 1000).toFixed(0)}K</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Growth</div>
                        <div className="font-medium text-green-600 flex items-center"><TrendingUp className="h-3 w-3 mr-1" />+{plan.growth}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Retention</div>
                        <div className="font-medium text-blue-600">{plan.retention}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Popular Recipes */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Top 5 Most Popular Recipes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {popularRecipes.map((recipe, index) => (
                  <div key={recipe.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{recipe.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{recipe.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">{recipe.orders.toLocaleString()} orders</div>
                      <div className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                        <span>{recipe.rating}</span>
                        <span className="text-yellow-600">★</span>
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
