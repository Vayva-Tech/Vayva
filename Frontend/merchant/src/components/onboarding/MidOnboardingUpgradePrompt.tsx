"use client";

import { useOnboarding } from "@/components/onboarding/OnboardingContext";
import { useAuth } from "@/context/AuthContext";
import { Sparkle, Crown, TrendUp, CheckCircle, ArrowRight, X } from "@phosphor-icons/react/ssr";
import { Button } from "@vayva/ui";
import { useState } from "react";
import { toast } from "sonner";
import { PLANS } from "@/config/pricing";

interface UpgradePromptProps {
  stepId: string;
}

interface UpgradeMessage {
  title: string;
  description: string;
  benefit: string;
  urgency?: string;
  cta: string;
}

const UPGRADE_MESSAGES: Record<string, UpgradeMessage> = {
  socials: {
    title: "Unlock AI-Powered Order Capture",
    description: "Pro users get advanced AI that automatically captures orders from WhatsApp, Instagram, and more - saving 10+ hours/week.",
    benefit: "Your AI assistant works 24/7 to never miss a sale",
    urgency: "Limited time: Get 2 months free when you upgrade during setup",
    cta: "Upgrade to Pro Now",
  },
  finance: {
    title: "Get Advanced Analytics & Reporting",
    description: "Pro plans include deep analytics, custom reports, and API access to understand your business performance.",
    benefit: "Make data-driven decisions with real-time insights",
    urgency: "Upgrade now and unlock premium analytics features",
    cta: "Upgrade to Pro",
  },
  first_item: {
    title: "Scale Faster with Pro Features",
    description: "Unlimited products, advanced inventory management, and priority support - everything you need to grow.",
    benefit: "No limits on your growth - add unlimited products anytime",
    urgency: "Join 1,000+ successful Pro merchants",
    cta: "See Pro Plans",
  },
  publish: {
    title: "Launch with Premium Features",
    description: "Go live with advanced marketing tools, abandoned cart recovery, and priority customer support.",
    benefit: "Start strong with professional-grade features",
    urgency: "Special launch offer: 50% off first 3 months",
    cta: "Upgrade Before Launch",
  },
};

export function MidOnboardingUpgradePrompt({ stepId }: UpgradePromptProps) {
  const { merchant } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Only show to Starter plan users
  const currentPlan = merchant?.subscription?.planKey || "STARTER";
  if (currentPlan !== "STARTER") return null;
  
  const message = UPGRADE_MESSAGES[stepId];
  if (!message) return null;
  
  const handleUpgrade = async () => {
    setLoading(true);
    try {
      // Track upgrade intent
      const response = await fetch("/billing/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetPlan: "pro",
          source: "onboarding",
          stepId,
        }),
      });
      
      const data = await response.json();
      
      if (data.checkout_url) {
        window.open(data.checkout_url, "_blank");
        toast.success("Upgrade page opened in new tab!");
      } else {
        toast.error("Failed to load upgrade page. Please try again.");
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleDismiss = () => {
    setDismissed(true);
    // Log dismissal for analytics
    console.log("[UPGRADE_DISMISSED]", { stepId, timestamp: new Date().toISOString() });
  };
  
  if (dismissed) return null;
  
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 p-6 text-white shadow-2xl">
      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors z-10"
        aria-label="Dismiss upgrade offer"
      >
        <X size={20} />
      </button>
      
      {/* Animated Background Effect */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Crown size={28} weight="fill" className="text-yellow-300" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black mb-0.5">{message.title}</h3>
            <div className="flex items-center gap-2">
              <Sparkle size={14} className="text-yellow-300 animate-pulse" />
              <p className="text-xs font-semibold text-yellow-300">
                Pro Feature Highlight
              </p>
            </div>
          </div>
        </div>
        
        {/* Description */}
        <p className="text-sm text-white/90 mb-4 leading-relaxed">
          {message.description}
        </p>
        
        {/* Benefit Box */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4 border border-white/20">
          <div className="flex items-start gap-3">
            <CheckCircle size={20} className="text-green-300 flex-shrink-0 mt-0.5" weight="fill" />
            <div>
              <h4 className="font-bold text-sm mb-1">What You Get</h4>
              <p className="text-sm text-white/90">{message.benefit}</p>
            </div>
          </div>
        </div>
        
        {/* Urgency Banner */}
        {message.urgency && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <TrendUp size={16} className="text-white" weight="bold" />
              <p className="text-xs font-bold text-white">{message.urgency}</p>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleUpgrade}
            disabled={loading}
            className="flex-1 h-12 bg-white text-purple-600 hover:bg-gray-100 rounded-xl font-bold shadow-lg transition-all active:scale-[0.98]"
          >
            {loading ? "Loading..." : message.cta}
            {!loading && <ArrowRight size={18} className="ml-2" />}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="px-6 h-12 border-white/30 text-white hover:bg-white/10 rounded-xl font-semibold"
          >
            Maybe Later
          </Button>
        </div>
        
        {/* Social Proof */}
        <div className="mt-4 pt-4 border-t border-white/20">
          <p className="text-xs text-white/70 text-center">
            ✓ Trusted by 1,000+ growing businesses • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper component to inject upgrade prompts at specific steps
export function withUpgradePrompt<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  stepId: string
) {
  return function UpgradePromptWrapper(props: P) {
    return (
      <>
        <WrappedComponent {...props} />
        <MidOnboardingUpgradePrompt stepId={stepId} />
      </>
    );
  };
}
