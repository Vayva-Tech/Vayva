"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@vayva/ui";
import { Check, ChefHat, Users, Leaf } from "lucide-react";

interface PlanOption {
  id: string;
  name: string;
  servings: number;
  mealsPerWeek: number;
  pricePerServing: number;
  features: string[];
  icon: any;
}

const PLAN_OPTIONS: PlanOption[] = [
  {
    id: "couple",
    name: "Couple's Box",
    servings: 2,
    mealsPerWeek: 3,
    pricePerServing: 9.99,
    features: ["Perfect for 2 people", "60-90 min prep", "Mix & match meals"],
    icon: Users,
  },
  {
    id: "family",
    name: "Family Box",
    servings: 4,
    mealsPerWeek: 4,
    pricePerServing: 8.99,
    features: ["Feeds up to 4", "Kid-friendly options", "Quick 30-min recipes"],
    icon: ChefHat,
  },
  {
    id: "veggie",
    name: "Veggie Lover's",
    servings: 2,
    mealsPerWeek: 3,
    pricePerServing: 10.99,
    features: ["100% vegetarian", "Organic produce", "Seasonal recipes"],
    icon: Leaf,
  },
];

export default function SubscriptionBuilderPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>("couple");
  const [frequency, setFrequency] = useState<"weekly" | "biweekly">("weekly");

  const selectedOption = PLAN_OPTIONS.find(p => p.id === selectedPlan);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-4">
            Build Your Perfect Box
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Customize your meal plan based on your household size and dietary preferences
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Plan Selection */}
          <div className="lg:col-span-2 space-y-6">
            {PLAN_OPTIONS.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedPlan(plan.id)}
                className={`cursor-pointer rounded-3xl border-2 p-8 transition-all ${
                  selectedPlan === plan.id
                    ? "border-emerald-600 bg-white shadow-2xl"
                    : "border-transparent bg-white/60 hover:border-emerald-300"
                }`}
              >
                <div className="flex items-start gap-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${
                    selectedPlan === plan.id
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}>
                    <plan.icon className="w-8 h-8" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-3xl font-bold text-gray-900">{plan.name}</h3>
                      {selectedPlan === plan.id && (
                        <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Servings</p>
                        <p className="text-xl font-bold text-gray-900">{plan.servings} people</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Meals/Week</p>
                        <p className="text-xl font-bold text-gray-900">{plan.mealsPerWeek} meals</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Price</p>
                        <p className="text-xl font-bold text-emerald-600">${plan.pricePerServing}/serving</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {plan.features.map(feature => (
                        <Badge key={feature} className="bg-gray-100 text-gray-700">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-8 bg-white rounded-3xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Box</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan</span>
                  <span className="font-bold">{selectedOption?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Servings</span>
                  <span className="font-bold">{selectedOption?.servings} people</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Meals per week</span>
                  <span className="font-bold">{selectedOption?.mealsPerWeek}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Frequency</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFrequency("weekly")}
                      className={`px-3 py-1 rounded-lg text-sm font-bold ${
                        frequency === "weekly"
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      Weekly
                    </button>
                    <button
                      onClick={() => setFrequency("biweekly")}
                      className={`px-3 py-1 rounded-lg text-sm font-bold ${
                        frequency === "biweekly"
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      Bi-weekly
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Price per serving</span>
                  <span className="font-bold text-emerald-600">
                    ${selectedOption?.pricePerServing.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="font-bold text-gray-900">Total per week</span>
                  <span className="font-black text-emerald-600">
                    ${(selectedOption!.pricePerServing * selectedOption!.servings * selectedOption!.mealsPerWeek).toFixed(2)}
                  </span>
                </div>
              </div>

              <Button className="w-full h-14 text-lg font-bold rounded-2xl bg-emerald-600 hover:bg-emerald-700">
                Start Your Subscription
              </Button>

              <p className="text-xs text-gray-600 text-center mt-4">
                Free shipping on your first box!
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${className}`}>
      {children}
    </span>
  );
}
