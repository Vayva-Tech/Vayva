"use client";

import { OnboardingProvider } from "@/components/onboarding/OnboardingContext";
import { Toaster } from "sonner";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnboardingProvider>
      {children}
      <Toaster position="bottom-right" />
    </OnboardingProvider>
  );
}
