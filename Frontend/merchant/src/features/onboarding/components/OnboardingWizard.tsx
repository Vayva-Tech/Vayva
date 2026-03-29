/**
 * OnboardingWizard Component
 * 
 * Main container for the onboarding flow.
 * Manages step rendering, navigation, and progress tracking.
 */

"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button, Progress, cn } from "@vayva/ui";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Sparkle,
} from "@phosphor-icons/react/ssr";

// Feature imports (new structure)
import { useOnboardingState } from "../hooks/useOnboardingState";
import { useOnboardingFlow } from "../hooks/useOnboardingFlow";
import {
  ONBOARDING_STEPS,
  getStepConfig,
  getStepIndex,
} from "../config/onboarding-steps";
import type { OnboardingStepId } from "../types/onboarding";

// Step components
import WelcomeStep from "./steps/WelcomeStep";
import { PlanSelectionStep } from "./steps/PlanSelectionStep";
import IdentityStep from "./steps/IdentityStep";
import BusinessStep from "./steps/BusinessStep";
import IndustryStep from "./steps/IndustryStep";
import ToolsStep from "./steps/ToolsStep";
import FirstItemStep from "./steps/FirstItemStep";
import SocialsStep from "./steps/SocialsStep";
import PaymentStep from "./steps/PaymentStep";
import KycStep from "./steps/KycStep";
import PoliciesStep from "./steps/PoliciesStep";
import PublishStep from "./steps/PublishStep";
import ReviewStep from "./steps/ReviewStep";

interface OnboardingWizardProps {
  /** Optional custom layout wrapper */
  children?: React.ReactNode;
}

export function OnboardingWizard({ children }: OnboardingWizardProps) {
  const router = useRouter();
  
  // State management
  const {
    state,
    currentStep,
    isLoading,
    isSaving,
    steps,
    status,
    updateState,
    setCurrentStep,
    refresh,
  } = useOnboardingState();

  // Flow management
  const {
    goToStep,
    nextStep,
    prevStep,
    completeStep,
    skipStep,
    currentStepConfig,
    progressPercentage,
    isCurrentStepRequired,
  } = useOnboardingFlow({
    currentStep,
    state,
    setCurrentStep,
    setState: (newState) => updateState(newState, false),
    refresh,
  });

  // Render current step component
  const renderStep = useMemo(() => {
    switch (currentStep) {
      case "welcome":
        return <WelcomeStep />;
      case "plan_selection":
        return <PlanSelectionStep />;
      case "identity":
        return <IdentityStep />;
      case "business":
        return <BusinessStep />;
      case "industry":
        return <IndustryStep />;
      case "tools":
        return <ToolsStep />;
      case "first_item":
        return <FirstItemStep />;
      case "socials":
        return <SocialsStep />;
      case "finance":
        return <PaymentStep />;
      case "kyc":
        return <KycStep />;
      case "policies":
        return <PoliciesStep />;
      case "publish":
        return <PublishStep />;
      case "review":
        return <ReviewStep />;
      default:
        return <WelcomeStep />;
    }
  }, [currentStep]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin">
            <Sparkle className="w-8 h-8 text-vayva-green" />
          </div>
          <p className="text-gray-500 font-medium">Loading your progress...</p>
        </div>
      </div>
    );
  }

  // Complete state - redirect to dashboard
  if (status === "COMPLETE") {
    router.push("/dashboard");
    return null;
  }

  const stepConfig = currentStepConfig();
  const currentIndex = getStepIndex(currentStep);
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentStep === "review";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Progress Bar at Top */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-vayva-green/10 rounded-lg flex items-center justify-center">
                <Sparkle className="w-4 h-4 text-vayva-green" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {stepConfig?.title || "Setup"}
                </p>
                <p className="text-xs text-gray-500">
                  Step {currentIndex + 1} of {steps.length}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-vayva-green">
                {progressPercentage()}% Complete
              </p>
            </div>
          </div>
          <Progress
            value={progressPercentage()}
            className="h-2 bg-gray-200"
            indicatorClassName="bg-vayva-green transition-all duration-500"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-20 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Step Content */}
          <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 p-6 md:p-12">
            {renderStep}
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      {!isLastStep && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Back Button */}
              <Button
                onClick={prevStep}
                disabled={isFirstStep || isSaving}
                variant="outline"
                className={cn(
                  "h-12 px-6 rounded-2xl font-semibold transition-all",
                  isFirstStep
                    ? "opacity-0 pointer-events-none"
                    : "hover:bg-gray-100"
                )}
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>

              {/* Next Button */}
              <Button
                onClick={() => nextStep()}
                disabled={isSaving}
                className="h-12 px-8 bg-vayva-green hover:bg-vayva-green/90 text-white rounded-2xl font-bold text-lg shadow-lg transition-all active:scale-[0.98]"
              >
                {currentIndex === steps.length - 2 ? "Review & Finish" : "Continue"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Optional: Children for additional UI layers */}
      {children}
    </div>
  );
}
