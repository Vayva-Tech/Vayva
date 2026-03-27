/**
 * Wellness - Nutrition Plans Management Page
 * Create and manage personalized nutrition and meal plans
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Apple, Plus } from "lucide-react";

interface NutritionPlan {
  id: string;
  name: string;
  type: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  mealsPerDay: number;
  activeUsers: number;
  status: "active" | "inactive";
}

export default function WellnessNutritionPage() {
  const router = useRouter();

  const plans: NutritionPlan[] = [
    { id: "1", name: "Weight Loss", type: "Low Carb", calories: 1500, protein: 120, carbs: 100, fats: 50, mealsPerDay: 4, activeUsers: 342, status: "active" },
    { id: "2", name: "Muscle Gain", type: "High Protein", calories: 2800, protein: 200, carbs: 300, fats: 80, mealsPerDay: 6, activeUsers: 287, status: "active" },
    { id: "3", name: "Maintenance", type: "Balanced", calories: 2200, protein: 150, carbs: 250, fats: 70, mealsPerDay: 5, activeUsers: 456, status: "active" },
    { id: "4", name: "Vegan Athlete", type: "Plant-Based", calories: 2500, protein: 140, carbs: 320, fats: 75, mealsPerDay: 5, activeUsers: 128, status: "active" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/wellness")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Nutrition Plans</h1>
            <p className="text-muted-foreground">Create and manage meal plans</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/wellness/nutrition/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Plan
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    <Apple className="h-3 w-3" />
                    {plan.type}
                  </p>
                </div>
                <Badge variant={plan.status === "active" ? "default" : "outline"}>{plan.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-blue-50 rounded">
                  <p className="text-xs text-blue-600">Calories</p>
                  <p className="font-semibold">{plan.calories}</p>
                </div>
                <div className="p-2 bg-red-50 rounded">
                  <p className="text-xs text-red-600">Protein</p>
                  <p className="font-semibold">{plan.protein}g</p>
                </div>
                <div className="p-2 bg-yellow-50 rounded">
                  <p className="text-xs text-yellow-600">Carbs</p>
                  <p className="font-semibold">{plan.carbs}g</p>
                </div>
                <div className="p-2 bg-purple-50 rounded">
                  <p className="text-xs text-purple-600">Fats</p>
                  <p className="font-semibold">{plan.fats}g</p>
                </div>
              </div>

              <div className="pt-3 border-t">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Meals/Day:</span>
                  <span className="font-medium">{plan.mealsPerDay}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Active Users:</span>
                  <span className="font-medium">{plan.activeUsers.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => router.push(`/dashboard/wellness/nutrition/${plan.id}`)}>
                  Edit
                </Button>
                <Button size="sm" className="flex-1" onClick={() => router.push(`/dashboard/wellness/nutrition/${plan.id}/meals`)}>
                  Meals
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
