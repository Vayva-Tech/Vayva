"use client";

import { Button, Icon } from "@vayva/ui";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export function TrialBanner() {
  const { merchant } = useAuth();
  
  // Only show if merchant is in TRIAL_MODE (skipped onboarding)
  const isTrialMode = merchant?.onboardingStatus === "TRIAL_MODE";
  
  if (!isTrialMode) return null;
  
  return (
    <div 
      className="bg-gradient-to-r from-green-500 to-green-500/80 text-white px-4 py-3 shadow-md relative z-50"
      role="banner"
      aria-label="Trial mode notification"
    >
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="bg-text-inverse/20 p-1.5 rounded-full">
            <Icon name="Sparkles" className="w-4 h-4 text-white" />
          </span>
          <div>
            <p className="font-semibold text-sm">You're in Trial Mode — Explore Risk-Free</p>
            <p className="text-xs text-white/80 hidden md:block">
              Complete setup to start accepting payments and let AI handle your orders 24/7
            </p>
          </div>
        </div>

        <Link href="/onboarding">
          <Button
            size="sm"
            variant="secondary"
            className="whitespace-nowrap font-medium text-xs h-8 bg-text-inverse text-green-500 hover:bg-text-inverse/90"
          >
            Complete Setup <Icon name="ArrowRight" className="ml-2 w-3 h-3" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
