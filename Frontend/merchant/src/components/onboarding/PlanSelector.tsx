"use client";

import React, { useState } from "react";
import { Button } from "@vayva/ui";
import { Check, Sparkles, TrendingUp, Users, Package, Zap } from "lucide-react";
import { PLANS, type PlanKey } from "@/lib/billing/plans";
import { cn } from "@/lib/utils";

interface RecommendationResult {
  plan: PlanKey;
  reason: string;
  matchScore: number;
}

interface QuizQuestion {
  id: number;
  question: string;
  icon: React.ReactNode;
  answers: {
    text: string;
    scores: Record<PlanKey, number>;
  }[];
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "What best describes your business stage?",
    icon: <TrendingUp className="w-6 h-6" />,
    answers: [
      {
        text: "Just starting out - testing ideas",
        scores: { starter: 3, pro: 1, pro_plus: 0 },
      },
      {
        text: "Growing - making consistent sales",
        scores: { starter: 1, pro: 3, pro_plus: 2 },
      },
      {
        text: "Established - scaling rapidly",
        scores: { starter: 0, pro: 2, pro_plus: 3 },
      },
    ],
  },
  {
    id: 2,
    question: "How many products do you plan to sell?",
    icon: <Package className="w-6 h-6" />,
    answers: [
      {
        text: "Less than 50 products",
        scores: { starter: 3, pro: 2, pro_plus: 1 },
      },
      {
        text: "50-200 products",
        scores: { starter: 2, pro: 3, pro_plus: 2 },
      },
      {
        text: "200+ products",
        scores: { starter: 0, pro: 2, pro_plus: 3 },
      },
    ],
  },
  {
    id: 3,
    question: "What's your expected monthly order volume?",
    icon: <Users className="w-6 h-6" />,
    answers: [
      {
        text: "Under 100 orders/month",
        scores: { starter: 3, pro: 1, pro_plus: 0 },
      },
      {
        text: "100-500 orders/month",
        scores: { starter: 1, pro: 3, pro_plus: 2 },
      },
      {
        text: "500+ orders/month",
        scores: { starter: 0, pro: 2, pro_plus: 3 },
      },
    ],
  },
  {
    id: 4,
    question: "Which features matter most to you?",
    icon: <Zap className="w-6 h-6" />,
    answers: [
      {
        text: "Basic selling tools and payments",
        scores: { starter: 3, pro: 2, pro_plus: 1 },
      },
      {
        text: "AI automation and advanced analytics",
        scores: { starter: 0, pro: 3, pro_plus: 2 },
      },
      {
        text: "Everything - full power platform",
        scores: { starter: 0, pro: 2, pro_plus: 3 },
      },
    ],
  },
  {
    id: 5,
    question: "What's your monthly budget for tools?",
    icon: <Sparkles className="w-6 h-6" />,
    answers: [
      {
        text: "Keep it minimal (₦25k or less)",
        scores: { starter: 3, pro: 1, pro_plus: 0 },
      },
      {
        text: "Invest in growth (₦25k-₦40k)",
        scores: { starter: 1, pro: 3, pro_plus: 2 },
      },
      {
        text: "Premium tools for premium results (₦50k+)",
        scores: { starter: 0, pro: 2, pro_plus: 3 },
      },
    ],
  },
];

export interface PlanSelectorProps {
  onSelectPlan?: (plan: PlanKey) => void;
  onComplete?: (result: RecommendationResult) => void;
}

export function PlanSelector({ onSelectPlan, onComplete }: PlanSelectorProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState<Record<PlanKey, number>>({
    starter: 0,
    pro: 0,
    pro_plus: 0,
  });
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);

  const handleAnswer = (selectedScores: Record<PlanKey, number>) => {
    const newScores = {
      starter: scores.starter + selectedScores.starter,
      pro: scores.pro + selectedScores.pro,
      pro_plus: scores.pro_plus + selectedScores.pro_plus,
    };
    setScores(newScores);

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate recommendation
      calculateRecommendation(newScores);
    }
  };

  const calculateRecommendation = (finalScores: Record<PlanKey, number>) => {
    const entries = Object.entries(finalScores) as [PlanKey, number][];
    const sorted = entries.sort(([, a], [, b]) => b - a);
    const [bestPlan, bestScore] = sorted[0];
    
    const totalScore = Object.values(finalScores).reduce((sum, score) => sum + score, 0);
    const matchScore = Math.round((bestScore / totalScore) * 100);

    const reason = getRecommendationReason(bestPlan, matchScore);

    const result: RecommendationResult = {
      plan: bestPlan,
      reason,
      matchScore,
    };

    setRecommendation(result);
    setShowRecommendation(true);
    onComplete?.(result);
  };

  const getRecommendationReason = (plan: PlanKey, matchScore: number): string => {
    const reasons = {
      starter: "Based on your needs, Starter gives you the essential tools to launch and grow without overspending.",
      pro: "Pro is perfect for your growing business - you'll get AI automation and advanced features to scale efficiently.",
      pro_plus: "Pro+ unlocks maximum potential with unlimited orders and premium features for rapid scaling.",
    };
    return reasons[plan];
  };

  const handleSelectPlan = (plan: PlanKey) => {
    onSelectPlan?.(plan);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScores({ starter: 0, pro: 0, pro_plus: 0 });
    setShowRecommendation(false);
    setRecommendation(null);
  };

  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;

  if (showRecommendation && recommendation) {
    return (
      <div className="max-w-2xl mx-auto">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4 animate-bounce">
            <Sparkles className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            We Found Your Perfect Match!
          </h2>
          <p className="text-gray-600">
            Based on your answers, we recommend this plan
          </p>
        </div>

        {/* Recommended Plan Card */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-500 rounded-2xl p-8 mb-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                  RECOMMENDED
                </span>
                <span className="text-green-700 text-sm font-semibold">
                  {recommendation.matchScore}% Match
                </span>
              </div>
              <h3 className="text-3xl font-black text-gray-900">
                {PLANS[recommendation.plan].name}
              </h3>
              <p className="text-green-700 font-medium mt-1">
                {PLANS[recommendation.plan].price}
              </p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-md">
              <Sparkles className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <p className="text-gray-700 mb-6 bg-white/60 rounded-xl p-4">
            {recommendation.reason}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/80 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Monthly Price</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(PLANS[recommendation.plan].monthlyAmount)}
              </p>
            </div>
            <div className="bg-white/80 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Trial Period</p>
              <p className="text-xl font-bold text-gray-900">
                {recommendation.plan === "starter" ? "30 Days Free" : "7 Days"}
              </p>
            </div>
          </div>

          <Button
            onClick={() => handleSelectPlan(recommendation.plan)}
            className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-700"
          >
            Continue with {PLANS[recommendation.plan].name} →
          </Button>
        </div>

        {/* Alternative Plans */}
        <div className="space-y-4">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide text-center">
            Or choose another plan
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            {(Object.keys(PLANS) as PlanKey[])
              .filter((p) => p !== recommendation.plan)
              .map((planKey) => (
                <button
                  key={planKey}
                  onClick={() => handleSelectPlan(planKey)}
                  className="p-5 bg-white border-2 border-gray-200 hover:border-green-400 rounded-xl transition-all text-left group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-900 group-hover:text-green-600">
                      {PLANS[planKey].name}
                    </h4>
                    <Check className="w-5 h-5 text-gray-300 group-hover:text-green-500" />
                  </div>
                  <p className="text-sm text-gray-600">{PLANS[planKey].price}</p>
                </button>
              ))}
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={resetQuiz}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Retake quiz
          </button>
        </div>
      </div>
    );
  }

  const question = QUESTIONS[currentQuestion];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-600">
            Question {currentQuestion + 1} of {QUESTIONS.length}
          </span>
          <span className="text-sm font-semibold text-green-600">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
            {question.icon}
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {question.question}
          </h2>
        </div>

        <div className="space-y-3">
          {question.answers.map((answer, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(answer.scores)}
              className="w-full p-5 text-left border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 rounded-xl transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-green-500 flex items-center justify-center flex-shrink-0">
                  <div className="w-3 h-3 rounded-full bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="text-base font-medium text-gray-700 group-hover:text-gray-900">
                  {answer.text}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={resetQuiz}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Start over
        </button>
        
        <div className="flex items-center gap-2">
          {QUESTIONS.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                idx === currentQuestion
                  ? "bg-green-500 w-6"
                  : idx < currentQuestion
                  ? "bg-green-300"
                  : "bg-gray-200"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function formatCurrency(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}
