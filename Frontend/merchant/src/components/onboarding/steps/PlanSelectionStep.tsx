"use client";

import React, { useState } from "react";
import { useOnboarding } from "@/hooks/useOnboarding";
import { PlanSelector, type PlanSelectorProps } from "./PlanSelector";
import { Button } from "@vayva/ui";
import { ArrowRight, Sparkles } from "lucide-react";
import { type PlanKey } from "@/lib/billing/plans";

export function PlanSelectionStep() {
  const { updateData, state, nextStep } = useOnboarding();
  const [selectedPlan, setSelectedPlan] = useState<PlanKey | null>(null);
  const [isReadyToContinue, setIsReadyToContinue] = useState(false);

  const handlePlanSelect: PlanSelectorProps["onSelectPlan"] = (plan) => {
    setSelectedPlan(plan);
    
    // Update onboarding state with selected plan
    updateData({
      metadata: {
        ...state.metadata,
        selectedPlan: plan,
        planSelectionMethod: "guided_quiz",
      },
    });
    
    setIsReadyToContinue(true);
  };

  const handleContinue = () => {
    if (selectedPlan) {
      nextStep();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-100 mb-2">
          <Sparkles className="w-8 h-8 text-green-600 animate-pulse" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
          Find Your Perfect Plan
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto text-lg">
          Answer 5 quick questions and we'll recommend the best plan for your business needs.
        </p>
      </div>

      {/* Plan Selector Quiz */}
      <PlanSelector 
        onSelectPlan={handlePlanSelect}
        onComplete={(result) => {
          console.log("[PLAN_SELECTION] Recommendation:", result);
        }}
      />

      {/* Continue Button */}
      {isReadyToContinue && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleContinue}
            className="h-14 px-8 text-lg font-bold bg-green-600 hover:bg-green-700"
          >
            Continue to Next Step
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
