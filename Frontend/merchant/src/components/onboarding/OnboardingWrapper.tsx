"use client";

import { OnboardingTutorial } from "./OnboardingTutorial";
import { OnboardingChecklist } from "./OnboardingChecklist";

export function OnboardingWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <OnboardingTutorial />
      <OnboardingChecklist />
    </>
  );
}
