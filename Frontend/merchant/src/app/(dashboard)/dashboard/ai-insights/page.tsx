"use client";

import AIInsightsDashboard from "@/components/ai-insights/AIInsightsDashboard";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Button, Icon } from "@vayva/ui";

// Normalize plan name
function normalizePlan(rawPlan: string | null | undefined): string {
  if (!rawPlan) return "FREE";
  const v = rawPlan.toLowerCase().trim();
  if (v === "pro" || v === "business" || v === "enterprise") return "PRO";
  if (v === "starter" || v === "growth") return "STARTER";
  if (v === "free" || v === "trial") return "FREE";
  return "FREE";
}

export default function AIInsightsPage() {
  const { merchant } = useAuth();
  const userPlan = normalizePlan((merchant as any)?.plan);
  const isPRO = userPlan === "PRO";
  
  // Show lock screen for non-PRO users
  if (!isPRO) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mb-6 shadow-lg">
          <Icon name="Lock" size={40} className="text-violet-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3 text-center">
          AI Insights is a Pro Feature
        </h1>
        <p className="text-lg text-gray-600 mb-8 text-center max-w-md">
          Unlock the full power of AI with advanced insights, predictive analytics, and automated recommendations
        </p>
        <div className="flex gap-3">
          <Link href="/dashboard/control-center/pro">
            <Button className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold px-8 py-3">
              Upgrade to Pro
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" className="rounded-xl border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium px-6 py-3">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white">
      <AIInsightsDashboard />
    </div>
  );
}
