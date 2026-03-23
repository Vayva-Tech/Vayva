"use client";

import { useState, useEffect } from "react";
import {
  Rocket,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Bot,
  Users,
  Settings,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";

interface TutorialStep {
  title: string;
  description: string;
  detail: string;
  icon: React.ElementType;
  color: string;
}

const STEPS: TutorialStep[] = [
  {
    title: "Welcome to Vayva",
    description: "Your AI-powered commerce platform",
    detail:
      "Vayva helps you sell online, manage orders, and grow your business with AI. Let us show you around — it only takes a minute.",
    icon: Rocket,
    color: "bg-green-500",
  },
  {
    title: "Your Dashboard",
    description: "Everything at a glance",
    detail:
      "Track revenue, orders, and customer growth in real time. KPI cards update live and charts show your business trends over any period.",
    icon: LayoutDashboard,
    color: "bg-blue-500",
  },
  {
    title: "Products",
    description: "Add and manage your catalog",
    detail:
      "Upload products with images, set prices in Naira, manage variants (sizes, colors), and track inventory — all from one place.",
    icon: Package,
    color: "bg-purple-500",
  },
  {
    title: "Orders",
    description: "Track every sale",
    detail:
      "See incoming orders, update fulfillment status, print receipts, and manage refunds. Filter by status, date, or customer.",
    icon: ShoppingCart,
    color: "bg-orange-500",
  },
  {
    title: "AI Autopilot",
    description: "Your AI assistant",
    detail:
      "Auto-reply to WhatsApp messages, get smart product recommendations, generate marketing copy, and let AI handle routine tasks 24/7.",
    icon: Bot,
    color: "bg-rose-500",
  },
  {
    title: "Customers",
    description: "Know your audience",
    detail:
      "View customer profiles, purchase history, and lifetime value. Segment customers for targeted campaigns and personalized offers.",
    icon: Users,
    color: "bg-cyan-500",
  },
  {
    title: "Settings",
    description: "Make it yours",
    detail:
      "Set up Paystack payments, configure delivery zones, customize your store branding, and connect WhatsApp for customer messaging.",
    icon: Settings,
    color: "bg-gray-500",
  },
  {
    title: "You're all set!",
    description: "Start selling today",
    detail:
      "Add your first product to get started. The setup checklist in the bottom-right corner will guide you through the rest.",
    icon: CheckCircle2,
    color: "bg-green-500",
  },
];

export function OnboardingTutorial() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const completed = localStorage.getItem("vayva_onboarding_complete");
    if (!completed) {
      setIsVisible(true);
    }
  }, []);

  const handleSkip = () => {
    localStorage.setItem("vayva_onboarding_complete", "true");
    setIsVisible(false);
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      handleSkip();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  if (!isVisible) return null;

  const step = STEPS[currentStep];
  const Icon = step.icon;
  const isLast = currentStep === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Close / Skip */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon header */}
        <div className={`${step.color} px-8 pt-10 pb-8 text-white`}>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
            <Icon className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold">{step.title}</h2>
          <p className="text-white/80 mt-1">{step.description}</p>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          <p className="text-gray-600 leading-relaxed">{step.detail}</p>
        </div>

        {/* Footer */}
        <div className="px-8 pb-6 flex items-center justify-between">
          {/* Progress dots */}
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentStep
                    ? "bg-green-500"
                    : i < currentStep
                      ? "bg-green-300"
                      : "bg-gray-200"
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSkip}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              Skip
            </button>
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg flex items-center gap-1 transition-colors"
            >
              {isLast ? "Get Started" : "Next"}
              {!isLast && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
