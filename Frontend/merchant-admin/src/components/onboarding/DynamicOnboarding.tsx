"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button, Progress } from "@vayva/ui";
import { toast } from "sonner";
import { Check, ArrowRight, ArrowLeft, Sparkle } from "@phosphor-icons/react/ssr";
import { apiJson } from "@/lib/api-client-shared";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  action: string;
  path: string;
  completed: boolean;
  required: boolean;
  estimatedTime: string;
}

interface OnboardingProgress {
  steps: OnboardingStep[];
  percentage: number;
  variant?: "A" | "B";
  nudges: {
    id: string;
    message: string;
    action: string;
    dismissible: boolean;
    shown: boolean;
  }[];
}

const DEFAULT_STEPS: OnboardingStep[] = [
  {
    id: "profile",
    title: "Set Up Your AI Assistant",
    description: "Add your business details so AI can start capturing orders",
    action: "Setup Profile",
    path: "/dashboard/settings/profile",
    completed: false,
    required: true,
    estimatedTime: "2 min",
  },
  {
    id: "kyc",
    title: "Enable Payouts",
    description: "Verify your identity to receive payments to your bank account",
    action: "Start KYC",
    path: "/dashboard/settings/kyc",
    completed: false,
    required: true,
    estimatedTime: "5 min",
  },
  {
    id: "payment",
    title: "Connect Bank Account",
    description: "Link where you want to receive your sales payouts",
    action: "Add Payout Method",
    path: "/dashboard/finance/wallet",
    completed: false,
    required: true,
    estimatedTime: "3 min",
  },
  {
    id: "product",
    title: "Start Taking Orders",
    description: "Add your first product so customers can start buying",
    action: "Create Product",
    path: "/dashboard/products/new",
    completed: false,
    required: false,
    estimatedTime: "4 min",
  },
  {
    id: "customize",
    title: "Make It Yours",
    description: "Set your store theme and policies to match your brand",
    action: "Customize",
    path: "/dashboard/settings/store",
    completed: false,
    required: false,
    estimatedTime: "3 min",
  },
];

export function DynamicOnboarding() {
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [dismissedNudges, setDismissedNudges] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchOnboardingProgress();
  }, []);

  const fetchOnboardingProgress = async () => {
    try {
      const data = await apiJson<{ progress: OnboardingProgress }>(
        "/api/onboarding/progress",
        { method: "GET" }
      );

      if (data.progress) {
        setProgress(data.progress);
        // Find first incomplete step
        const firstIncomplete = data.progress.steps.findIndex((s: any) => !s.completed);
        setCurrentStep(firstIncomplete >= 0 ? firstIncomplete : 0);
      } else {
        // Default flow
        setProgress({
          steps: DEFAULT_STEPS,
          percentage: 0,
          nudges: [],
        });
      }
    } catch {
      // Use default steps if fetch fails
      setProgress({
        steps: DEFAULT_STEPS,
        percentage: 0,
        nudges: [
          {
            id: "welcome",
            message: "Welcome! Complete your setup to start selling",
            action: "Get Started",
            dismissible: true,
            shown: false,
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const markStepComplete = async (stepId: string) => {
    try {
      await apiJson("/api/onboarding/complete", {
        method: "POST",
        body: JSON.stringify({ stepId }),
      });

      // Update local state
      setProgress((prev) => {
        if (!prev) return prev;
        const updatedSteps = prev.steps.map((s) =>
          s.id === stepId ? { ...s, completed: true } : s
        );
        const completed = updatedSteps.filter((s) => s.completed).length;
        return {
          ...prev,
          steps: updatedSteps,
          percentage: Math.round((completed / updatedSteps.length) * 100),
        };
      });

      toast.success("Step completed!");
    } catch (error: unknown) {
      toast.error("Failed to mark step complete");
    }
  };

  const dismissNudge = (nudgeId: string) => {
    setDismissedNudges((prev) => [...prev, nudgeId]);
  };

  const navigateToStep = (step: OnboardingStep) => {
    router.push(step.path);
  };

  const getStepIcon = (step: OnboardingStep, index: number) => {
    if (step.completed) {
      return (
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
          <Check className="w-4 h-4 text-green-600" />
        </div>
      );
    }
    if (index === currentStep) {
      return (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary">
          <span className="text-sm font-medium text-primary">{index + 1}</span>
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
        <span className="text-sm font-medium text-muted-foreground">
          {index + 1}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="h-2 bg-muted rounded" />
          <div className="h-20 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!progress) return null;

  const activeNudges = progress.nudges?.filter(
    (n) => !n.shown && !dismissedNudges.includes(n.id)
  ) || [];

  const completedSteps = progress.steps.filter((s) => s.completed).length;
  const isComplete = completedSteps === progress.steps.length;

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Getting Started</h2>
          <p className="text-sm text-muted-foreground">
            {isComplete
              ? "Setup complete! You're ready to sell."
              : `Complete ${progress.steps.length - completedSteps} more steps to finish setup`}
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold">{progress.percentage}%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={progress.percentage} className="h-2" />

      {/* Nudges */}
      {activeNudges.length > 0 && (
        <div className="space-y-2">
          {activeNudges.map((nudge) => (
            <div
              key={nudge.id}
              className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/10"
            >
              <div className="flex items-center gap-2">
                <Sparkle className="w-4 h-4 text-primary" />
                <p className="text-sm">{nudge.message}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    // Handle nudge action
                    toast.info(nudge.action);
                  }}
                >
                  {nudge.action}
                </Button>
                {nudge.dismissible && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissNudge(nudge.id)}
                  >
                    Dismiss
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Steps List */}
      <div className="space-y-3">
        {progress.steps.map((step: any, index: number) => (
          <div
            key={step.id}
            className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
              step.completed
                ? "bg-muted/50 border-muted"
                : index === currentStep
                ? "border-primary/50 bg-primary/5"
                : "border-border hover:border-primary/30"
            }`}
          >
            {getStepIcon(step, index)}

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4
                  className={`font-medium ${
                    step.completed ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {step.title}
                </h4>
                {step.required && (
                  <span className="text-xs text-destructive font-medium">
                    Required
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{step.description}</p>
              <p className="text-xs text-muted-foreground mt-1">
                ~{step.estimatedTime}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {!step.completed ? (
                <Button
                  size="sm"
                  onClick={() => navigateToStep(step)}
                >
                  {step.action}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateToStep(step)}
                >
                  Edit
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Completion CTA */}
      {isComplete && (
        <div className="p-6 bg-green-50 rounded-lg text-center">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-lg">Setup Complete!</h3>
          <p className="text-muted-foreground mb-4">
            Your store is ready. Start adding products and making sales.
          </p>
          <Button onClick={() => router.push("/dashboard/products/new")}>
            Add Your First Product
          </Button>
        </div>
      )}
    </div>
  );
}
