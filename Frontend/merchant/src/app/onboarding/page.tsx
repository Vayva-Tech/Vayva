"use client";

import { useOnboarding } from "@/components/onboarding/OnboardingContext";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import { OnboardingProgressIndicator } from "@/components/onboarding/OnboardingProgressIndicator";
import { ValueDemonstrationBanner } from "@/components/onboarding/ValueDemonstration";
import { MidOnboardingUpgradePrompt } from "@/components/onboarding/MidOnboardingUpgradePrompt";
import { Spinner as Loader2 } from "@phosphor-icons/react/ssr";
import { OnboardingErrorBoundary } from "@/components/onboarding/OnboardingErrorBoundary";

// Step Components
import WelcomeStep from "@/components/onboarding/steps/WelcomeStep";
import { PlanSelectionStep } from "@/components/onboarding/steps/PlanSelectionStep";
import IdentityStep from "@/components/onboarding/steps/IdentityStep";
import BusinessStep from "@/components/onboarding/steps/BusinessStep";
import IndustryStep from "@/components/onboarding/steps/IndustryStep";
import ToolsStep from "@/components/onboarding/steps/ToolsStep";
import FirstItemStep from "@/components/onboarding/steps/FirstItemStep";
import SocialsStep from "@/components/onboarding/steps/SocialsStep";
import PaymentStep from "@/components/onboarding/steps/PaymentStep";
import KycStep from "@/components/onboarding/steps/KycStep";
import PoliciesStep from "@/components/onboarding/steps/PoliciesStep";
import PublishStep from "@/components/onboarding/steps/PublishStep";
import ReviewStep from "@/components/onboarding/steps/ReviewStep";

export default function OnboardingPage() {
  const { currentStep, isLoading } = useOnboarding();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <p className="mt-4 text-gray-400">Loading your progress...</p>
      </div>
    );
  }

  // Render Step with Layout
  const renderStep = () => {
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
  };

  return (
    <OnboardingErrorBoundary>
      <div className="relative">
        {/* Progress Indicator at Top */}
        <OnboardingProgressIndicator currentStepKey={currentStep} />
        
        {/* Step Content */}
        <OnboardingLayout>
          {renderStep()}
          
          {/* Mid-Onboarding Upgrade Prompts for Starter Users (strategic positions) */}
          {(currentStep === "socials" || currentStep === "finance" || currentStep === "first_item" || currentStep === "publish") && (
            <div className="mt-6 px-6 pb-6">
              <MidOnboardingUpgradePrompt stepId={currentStep} />
            </div>
          )}
        </OnboardingLayout>
        
        {/* Value Demonstration Banner (appears at key moments) */}
        <ValueDemonstrationBanner />
      </div>
    </OnboardingErrorBoundary>
  );
}
