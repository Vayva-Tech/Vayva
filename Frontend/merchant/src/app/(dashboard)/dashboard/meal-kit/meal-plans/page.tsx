/**
 * Meal Kit Industry - Meal Plans Management Page
 * Manage weekly meal plans, customer preferences, and menu curation
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Calendar, Search, Plus, Users, TrendingUp } from "lucide-react";
import { useState } from "react";

interface MealPlan {
  id: string;
  name: string;
  planType: "classic" | "vegetarian" | "vegan" | "keto" | "paleo" | "family";
  duration: "1-week" | "2-week" | "4-week";
  mealsPerWeek: number;
  servingsPerMeal: number;
  pricePerServing: number;
  subscribers: number;
  rating: number;
  status: "active" | "seasonal" | "paused";
  startDate: string;
  endDate?: string;
}

export default function MealKitPlansPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const plans: MealPlan[] = [
    { id: "1", name: "Classic Family Plan", planType: "family", duration: "4-week", mealsPerWeek: 3, servingsPerMeal: 4, pricePerServing: 8.99, subscribers: 245, rating: 4.7, status: "active", startDate: "2024-01-01" },
    { id: "2", name: "Keto Weight Loss", planType: "keto", duration: "2-week", mealsPerWeek: 5, servingsPerMeal: 2, pricePerServing: 11.99, subscribers: 189, rating: 4.8, status: "active", startDate: "2024-01-08" },
    { id: "3", name: "Vegetarian Wellness", planType: "vegetarian", duration: "4-week", mealsPerWeek: 4, servingsPerMeal: 2, pricePerServing: 9.99, subscribers: 312, rating: 4.6, status: "active", startDate: "2023-12-15" },
    { id: "4", name: "Vegan Starter", planType: "vegan", duration: "1-week", mealsPerWeek: 3, servingsPerMeal: 2, pricePerServing: 10.99, subscribers: 156, rating: 4.5, status: "active", startDate: "2024-01-15" },
    { id: "5", name: "Paleo Performance", planType: "paleo", duration: "2-week", mealsPerWeek: 5, servingsPerMeal: 2, pricePerServing: 12.99, subscribers: 98, rating: 4.9, status: "active", startDate: "2024-01-10" },
    { id: "6", name: "Quick & Easy Classic", planType: "classic", duration: "1-week", mealsPerWeek: 3, servingsPerMeal: 3, pricePerServing: 7.99, subscribers: 423, rating: 4.4, status: "active", startDate: "2023-11-20" },
    { id: "7", name: "Summer Fresh Vegan", planType: "vegan", duration: "2-week", mealsPerWeek: 4, servingsPerMeal: 2, pricePerServing: 10.99, subscribers: 87, rating: 4.7, status: "seasonal", startDate: "2024-01-05", endDate: "2024-03-31" },
    { id: "8", name: "Family Favorites", planType: "family", duration: "4-week", mealsPerWeek: 4, servingsPerMeal: 5, pricePerServing: 8.49, subscribers: 276, rating: 4.6, status: "paused", startDate: "2023-12-01" },
  ];

  const filteredPlans = plans.filter(plan =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.planType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: plans.length,
    active: plans.filter(p => p.status === "active").length,
    seasonal: plans.filter(p => p.status === "seasonal").length,
    totalSubscribers: plans.reduce((sum, p) => sum + p.subscribers, 0),
    avgRating: (plans.reduce((sum, p) => sum + p.rating, 0) / plans.length).toFixed(1),
    avgPrice: (plans.reduce((sum, p) => sum + p.pricePerServing, 0) / plans.length).toFixed(2),
  };

  const planTypeDistribution = [
    { type: "Classic", count: plans.filter(p => p.planType === "classic").length, subscribers: plans.filter(p => p.planType === "classic").reduce((sum, p) => sum + p.subscribers, 0), color: "from-blue-500 to-cyan-500" },
    { type: "Vegetarian", count: plans.filter(p => p.planType === "vegetarian").length, subscribers: plans.filter(p => p.planType === "vegetarian").reduce((sum, p) => sum + p.subscribers, 0), color: "from-green-500 to-emerald-500" },
    { type: "Vegan", count: plans.filter(p => p.planType === "vegan").length, subscribers: plans.filter(p => p.planType === "vegan").reduce((sum, p) => sum + p.subscribers, 0), color: "from-emerald-500 to-teal-500" },
    { type: "Keto", count: plans.filter(p => p.planType === "keto").length, subscribers: plans.filter(p => p.planType === "keto").reduce((sum, p) => sum + p.subscribers, 0), color: "from-purple-500 to-pink-500" },
    { type: "Paleo", count: plans.filter(p => p.planType === "paleo").length, subscribers: plans.filter(p => p.planType === "paleo").reduce((sum, p) => sum + p.subscribers, 0), color: "from-orange-500 to-amber-500" },
    { type: "Family", count: plans.filter(p => p.planType === "family").length, subscribers: plans.filter(p => p.planType === "family").reduce((sum, p) => sum + p.subscribers, 0), color: "from-red-500 to-pink-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard/meal-kit")} className="h-10 w-10 p-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Meal Plans
              </h1>
              <p className="text-muted-foreground mt-1">Curated weekly meal subscriptions</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
            <Plus className="h-4 w-4 mr-2" />
            New Plan
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Plans</CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.active} active, {stats.seasonal} seasonal</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Subscribers</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalSubscribers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Across all plans</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Rating</CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.avgRating}</div>
              <p className="text-xs text-muted-foreground mt-1">Customer satisfaction</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Price/Serving</CardTitle>
              <Badge className="h-6 w-6 text-xs">$</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">${stats.avgPrice}</div>
              <p className="text-xs text-muted-foreground mt-1">Per serving average</p>
            </CardContent>
          </Card>
        </div>

        {/* Plan Type Distribution */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle>Plan Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {planTypeDistribution.map((type) => (
                <div key={type.type} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{type.type}</span>
                    <span className="text-muted-foreground">{type.count} plans • {type.subscribers} subscribers</span>
                  </div>
                  <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`absolute top-0 left-0 h-full bg-gradient-to-r ${type.color}`}
                      style={{ width: `${(type.subscribers / stats.totalSubscribers) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search Bar */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by plan name or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Plans Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Meal Plans ({filteredPlans.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead scope="col">
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Plan Name</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Type</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Duration</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Meals/Week</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Servings</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Price/Serving</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Subscribers</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Rating</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Status</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlans.map((plan) => (
                    <tr key={plan.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-semibold">{plan.name}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="capitalize">
                          {plan.planType}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 capitalize">{plan.duration}</td>
                      <td className="py-3 px-4 text-sm">{plan.mealsPerWeek} meals</td>
                      <td className="py-3 px-4 text-sm">{plan.servingsPerMeal} servings</td>
                      <td className="py-3 px-4 font-mono font-semibold text-green-600">${plan.pricePerServing.toFixed(2)}</td>
                      <td className="py-3 px-4 font-semibold">{plan.subscribers.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-yellow-600">{plan.rating}</span>
                          <span className="text-yellow-600">★</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={plan.status === "active" ? "default" : plan.status === "seasonal" ? "secondary" : "outline"}>
                          {plan.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/meal-kit/plans/${plan.id}`)}>
                            View
                          </Button>
                          {plan.status === "paused" && (
                            <Button variant="outline" size="sm" className="text-green-600">
                              Resume
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
