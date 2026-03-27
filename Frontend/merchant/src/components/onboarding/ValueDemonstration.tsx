"use client";

import { useOnboarding } from "@/components/onboarding/OnboardingContext";
import { Sparkle, Robot, Package, Wallet, CheckCircle, ArrowRight } from "@phosphor-icons/react/ssr";
import { Button } from "@vayva/ui";
import { useState } from "react";

interface ValueMoment {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  triggerStep: string;
  benefit: string;
}

const VALUE_MOMENTS: ValueMoment[] = [
  {
    id: "ai_unlocked",
    title: "Your AI Assistant is Ready!",
    description: "Your AI employee is now configured and ready to capture orders 24/7 for your business.",
    icon: Robot,
    color: "from-purple-500 to-indigo-500",
    triggerStep: "socials",
    benefit: "Starts capturing orders automatically once connected",
  },
  {
    id: "payment_ready",
    title: "Payment Processing Activated",
    description: "You can now accept payments instantly. Funds will be deposited directly to your bank account.",
    icon: Wallet,
    color: "from-green-500 to-emerald-500",
    triggerStep: "finance",
    benefit: "Ready to receive payments immediately",
  },
  {
    id: "kyc_verified",
    title: "Identity Verified ✓",
    description: "Your business is verified and compliant. You now have full access to all platform features.",
    icon: CheckCircle,
    color: "from-blue-500 to-cyan-500",
    triggerStep: "kyc",
    benefit: "Unlocks higher transaction limits and priority support",
  },
  {
    id: "first_product",
    title: "First Product Created!",
    description: "Your store now has its first product. Customers can browse and purchase immediately.",
    icon: Package,
    color: "from-orange-500 to-amber-500",
    triggerStep: "first_item",
    benefit: "Store is now live and ready for customers",
  },
];

export function ValueDemonstrationModal() {
  const { state, currentStep } = useOnboarding();
  const [dismissedMoments, setDismissedMoments] = useState<string[]>([]);
  
  // Find if current step triggers a value moment
  const triggeredMoment = VALUE_MOMENTS.find(
    moment => moment.triggerStep === currentStep && !dismissedMoments.includes(moment.id)
  );
  
  if (!triggeredMoment) return null;
  
  const IconComponent = triggeredMoment.icon;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Gradient Header */}
        <div className={`bg-gradient-to-r ${triggeredMoment.color} p-8 text-white`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <IconComponent size={40} weight="fill" className="text-white" />
            </div>
            <Sparkle size={32} className="text-yellow-300 animate-pulse" />
          </div>
          <h2 className="text-3xl font-black mb-2">
            {triggeredMoment.title}
          </h2>
          <p className="text-white/90 text-sm leading-relaxed">
            {triggeredMoment.description}
          </p>
        </div>
        
        {/* Benefit Box */}
        <div className="mx-8 -mt-6 bg-white rounded-2xl shadow-lg p-4 border-2 border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle size={20} className="text-green-600" weight="fill" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm mb-1">
                What This Means for You
              </h4>
              <p className="text-sm text-gray-600">
                {triggeredMoment.benefit}
              </p>
            </div>
          </div>
        </div>
        
        {/* Action Area */}
        <div className="p-8 pt-6 space-y-3">
          <Button
            onClick={() => {
              setDismissedMoments(prev => [...prev, triggeredMoment.id]);
            }}
            className="w-full h-14 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-2xl font-bold text-lg shadow-xl transition-all active:scale-[0.98]"
          >
            Continue Setup →
          </Button>
          
          <p className="text-center text-xs text-gray-400">
            This milestone has been saved to your progress
          </p>
        </div>
      </div>
    </div>
  );
}

// Alternative: Inline banner version for less intrusive display
export function ValueDemonstrationBanner() {
  const { currentStep } = useOnboarding();
  const [dismissedMoments, setDismissedMoments] = useState<string[]>([]);
  
  const triggeredMoment = VALUE_MOMENTS.find(
    moment => moment.triggerStep === currentStep && !dismissedMoments.includes(moment.id)
  );
  
  if (!triggeredMoment) return null;
  
  const IconComponent = triggeredMoment.icon;
  
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${triggeredMoment.color} p-6 text-white shadow-xl`}>
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
          <IconComponent size={28} weight="fill" className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-1">
            {triggeredMoment.title}
          </h3>
          <p className="text-sm text-white/90 mb-3">
            {triggeredMoment.description}
          </p>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-sm">
              <CheckCircle size={14} weight="fill" />
              {triggeredMoment.benefit}
            </div>
          </div>
        </div>
        <button
          onClick={() => setDismissedMoments(prev => [...prev, triggeredMoment.id])}
          className="text-white/60 hover:text-white transition-colors"
        >
          <span className="sr-only">Dismiss</span>
          ✕
        </button>
      </div>
    </div>
  );
}
