import { Button } from "@vayva/ui";
/**
 * Simplified Socials Step using Enhanced Connection Manager
 */

import { useOnboarding } from "../OnboardingContext";
import { SocialConnectionManager as EnhancedSocialConnectionManager } from "../EnhancedSocialConnectionManager";

export default function SimplifiedSocialsStep() {
  const { nextStep, prevStep, isSaving } = useOnboarding();

  return (
    <div className="space-y-6">
      <EnhancedSocialConnectionManager
        onComplete={() => nextStep()}
        showSkipOption={true}
      />
      
      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <Button
          onClick={prevStep}
          disabled={isSaving}
          className="px-6 py-3 border-2 border-gray-100 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
        >
          Back
        </Button>
      </div>
    </div>
  );
}