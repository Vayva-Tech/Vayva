"use client";

import React, { useState } from "react";
import { Badge, Card, CardContent, CardHeader, Button } from "@vayva/ui";
interface PlanOption {
  key: string;
  name: string;
  description: string;
  basePrice: number;
  perMealPrice: number;
  features: string[];
}

interface SubscriptionPlanBuilderProps {
  storeId: string;
  onPlanSelect?: (planData: Record<string, unknown>) => void;
  existingPlan?: {
    planType?: string;
    portionsPerMeal?: number;
    mealsPerWeek?: number;
  };
}

const PLAN_OPTIONS: PlanOption[] = [
  {
    key: "BASIC",
    name: "Basic",
    description: "Perfect for individuals or couples",
    basePrice: 5000,
    perMealPrice: 2500,
    features: ["2–3 meals per week", "Standard recipes", "Email support"],
  },
  {
    key: "PREMIUM",
    name: "Premium",
    description: "Great for small families",
    basePrice: 8000,
    perMealPrice: 3500,
    features: [
      "3–4 meals per week",
      "Priority recipes",
      "Priority support",
      "Free delivery",
    ],
  },
  {
    key: "FAMILY",
    name: "Family",
    description: "Best value for larger families",
    basePrice: 12000,
    perMealPrice: 4500,
    features: [
      "4–5 meals per week",
      "All recipes",
      "24/7 support",
      "Free delivery",
    ],
  },
  {
    key: "VEGAN",
    name: "Vegan",
    description: "100% plant-based meals",
    basePrice: 7000,
    perMealPrice: 3000,
    features: ["Plant-based recipes", "Organic ingredients", "Nutrition guide"],
  },
  {
    key: "KETO",
    name: "Keto",
    description: "Low-carb, high-fat meals",
    basePrice: 9000,
    perMealPrice: 4000,
    features: ["Keto-friendly recipes", "Macro tracking", "Expert guidance"],
  },
];

export function SubscriptionPlanBuilder({
  storeId,
  onPlanSelect,
  existingPlan,
}: SubscriptionPlanBuilderProps) {
  const [selectedPlan, setSelectedPlan] = useState(
    existingPlan?.planType ?? "BASIC"
  );
  const [portionsPerMeal, setPortionsPerMeal] = useState(
    existingPlan?.portionsPerMeal ?? 4
  );
  const [mealsPerWeek, setMealsPerWeek] = useState(
    existingPlan?.mealsPerWeek ?? 3
  );
  const [billingCycle, setBillingCycle] = useState<"weekly" | "monthly">(
    "weekly"
  );

  const planDetails =
    PLAN_OPTIONS.find((p) => p.key === selectedPlan) ?? PLAN_OPTIONS[0];

  const calculatePrice = () => {
    const portionMultiplier = portionsPerMeal / 4;
    const weeklyPrice =
      (planDetails.basePrice + planDetails.perMealPrice * mealsPerWeek) *
      portionMultiplier;

    if (billingCycle === "monthly") {
      return Math.round(weeklyPrice * 4.33);
    }

    return Math.round(weeklyPrice);
  };

  const handleCreateSubscription = () => {
    onPlanSelect?.({
      storeId,
      planType: selectedPlan,
      portionsPerMeal,
      mealsPerWeek,
      billingCycle,
      price: calculatePrice(),
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <h3 className="text-lg font-semibold">Build your subscription</h3>
        <p className="text-sm text-gray-600">
          Select plan, portions, and billing
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="plan" className="text-sm font-medium">
            Plan
          </label>
          <select
            id="plan"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
          >
            {PLAN_OPTIONS.map((p) => (
              <option key={p.key} value={p.key}>
                {p.name}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-600">{planDetails.description}</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="portions" className="text-sm font-medium">
            Portions per meal
          </label>
          <input
            id="portions"
            type="number"
            min={1}
            max={12}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={portionsPerMeal}
            onChange={(e) => setPortionsPerMeal(Number(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="meals" className="text-sm font-medium">
            Meals per week
          </label>
          <input
            id="meals"
            type="number"
            min={1}
            max={7}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={mealsPerWeek}
            onChange={(e) => setMealsPerWeek(Number(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="billing" className="text-sm font-medium">
            Billing
          </label>
          <select
            id="billing"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            value={billingCycle}
            onChange={(e) =>
              setBillingCycle(e.target.value as "weekly" | "monthly")
            }
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Included</p>
          <ul className="flex flex-wrap gap-2">
            {planDetails.features.map((f) => (
              <Badge key={f} variant="outline">
                {f}
              </Badge>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
          <span className="font-semibold">Estimated price</span>
          <span className="text-lg font-bold">₦{calculatePrice()}</span>
        </div>

        <Button
          type="button"
          className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white"
          onClick={handleCreateSubscription}
        >
          Continue
        </Button>
      </CardContent>
    </Card>
  );
}
