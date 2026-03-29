"use client";

import { useOnboarding } from "../OnboardingContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@vayva/ui";
import Link from "next/link";
import {
  ArrowRight,
  Sparkle as Sparkles,
  User,
  Storefront as Store,
  ChatCircleText as MessageSquare,
  CreditCard,
  Shield,
  Robot,
  Package,
  Wallet,
  Wrench,
  FileText,
  Rocket,
  CheckCircle,
} from "@phosphor-icons/react/ssr";

export default function WelcomeStep() {
  const { nextStep, state } = useOnboarding();
  const { user } = useAuth();

  const firstName = user?.firstName || "there";

  // OPTIMIZED ORDER: First Item moved after KYC/Finance for better flow
  // Users setup payment FIRST, then add products
  const steps = [
    { icon: "User", title: "Personal Identity", desc: "Verify your details" },
    {
      icon: "Store",
      title: "Business & Store URL",
      desc: "Tell us about your brand",
    },
    { icon: "Wrench", title: "Select Tools", desc: "Customize dashboard" },
    { icon: "MessageSquare", title: "Connect Socials", desc: "Link IG & WhatsApp" },
    { icon: "CreditCard", title: "Payment Setup", desc: "Add bank account" },
    { icon: "Shield", title: "KYC Verification", desc: "Identity verification" },
    { icon: "Package", title: "Add First Item", desc: "Create product listing" },
    { icon: "FileText", title: "Store Policies", desc: "Set terms & conditions" },
    { icon: "Rocket", title: "Publish Storefront", desc: "Make it live" },
    { icon: "CheckCircle", title: "Review & Finish", desc: "Final checks" },
  ];

  const valueProps = [
    { 
      icon: Robot, 
      text: "AI Virtual Employee captures orders 24/7",
      unlock: "Unlocks after Step 5 (Socials)"
    },
    { 
      icon: Package, 
      text: "Auto-tracks inventory & stock levels",
      unlock: "Available after Step 7 (First Item)"
    },
    { 
      icon: Wallet, 
      text: "Instant payouts to your bank account",
      unlock: "Activates after Steps 6-7 (Finance + KYC)"
    },
  ];

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-vayva-green/10 mb-2">
          <Sparkles className="w-8 h-8 text-vayva-green animate-pulse" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
          Welcome, {firstName}!
        </h1>
        <p className="text-gray-500 max-w-md mx-auto text-lg">
          Let's build your complete merchant platform. We've streamlined setup into 10 quick steps.
        </p>
      </div>

      {/* Value Preview Card - Now with unlock info */}
      <div className="bg-gradient-to-br from-green-50 to-teal-50 border border-green-100 rounded-2xl p-5 shadow-sm">
        <p className="text-sm font-semibold text-green-800 mb-3 text-center">
          What you'll unlock:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {valueProps.map((prop, idx) => (
            <div
              key={idx}
              className="flex flex-col gap-1 bg-white/70 rounded-xl p-3"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <prop.icon size={16} className="text-green-600" />
                </div>
                <p className="text-xs font-medium text-green-900 leading-tight">
                  {prop.text}
                </p>
              </div>
              <p className="text-[10px] text-green-700/70 mt-1 pl-10">
                {prop.unlock}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* One-Time Setup Notice */}
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 border-2 border-purple-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Shield size={24} className="text-purple-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-purple-900 mb-2">
              🎯 One-Time Business Setup - Extremely Important
            </h3>
            <p className="text-sm text-purple-800 mb-3">
              This comprehensive setup ensures your store is configured perfectly for your specific business needs. 
              Getting this right means:
            </p>
            <ul className="space-y-2 mb-3">
              <li className="flex items-start gap-2 text-sm text-purple-700">
                <CheckCircle size={16} className="text-purple-600 mt-0.5 flex-shrink-0" />
                <span>✅ AI captures orders correctly for your industry</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-purple-700">
                <CheckCircle size={16} className="text-purple-600 mt-0.5 flex-shrink-0" />
                <span>✅ Payment processing works flawlessly</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-purple-700">
                <CheckCircle size={16} className="text-purple-600 mt-0.5 flex-shrink-0" />
                <span>✅ Customer experience is personalized</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-purple-700">
                <CheckCircle size={16} className="text-purple-600 mt-0.5 flex-shrink-0" />
                <span>✅ Analytics and insights are relevant</span>
              </li>
            </ul>
            <div className="bg-white/60 rounded-lg p-3">
              <p className="text-xs font-semibold text-purple-900">
                ⏱️ Time Required: 15-20 minutes total
              </p>
              <p className="text-xs text-purple-700 mt-1">
                Most merchants complete this once and never need to revisit. The accuracy of your responses here directly impacts your success on Vayva.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Checklist Card - All 10 steps in OPTIMIZED order */}
      <div className="bg-white border border-gray-100 rounded-[32px] p-8  space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">
            Your Setup Journey
          </h3>
          <div className="px-3 py-1 bg-white/40 rounded-full text-[10px] font-black text-gray-400">
            ~10 MINUTES
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 rounded-2xl bg-white/30 border border-gray-100 transition-all hover:bg-white hover:shadow-sm"
            >
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                {step.icon === "User" && (
                  <User size={18} className="text-gray-500" />
                )}
                {step.icon === "Store" && (
                  <Store size={18} className="text-gray-500" />
                )}
                {step.icon === "Wrench" && (
                  <Wrench size={18} className="text-gray-500" />
                )}
                {step.icon === "MessageSquare" && (
                  <MessageSquare size={18} className="text-gray-500" />
                )}
                {step.icon === "CreditCard" && (
                  <CreditCard size={18} className="text-gray-500" />
                )}
                {step.icon === "Shield" && (
                  <Shield size={18} className="text-gray-500" />
                )}
                {step.icon === "Package" && (
                  <Package size={18} className="text-gray-500" />
                )}
                {step.icon === "FileText" && (
                  <FileText size={18} className="text-gray-500" />
                )}
                {step.icon === "Rocket" && (
                  <Rocket size={18} className="text-gray-500" />
                )}
                {step.icon === "CheckCircle" && (
                  <CheckCircle size={18} className="text-gray-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {step.title}
                </p>
                <p className="text-[11px] text-gray-400 truncate">
                  {step.desc}
                </p>
              </div>
              <div className="text-[10px] font-bold text-gray-400 bg-white/50 px-2 py-1 rounded-full">
                {idx + 1}
              </div>
            </div>
          ))}
        </div>

        {/* Conditional Steps Note */}
        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            💡 <strong>Note:</strong> Additional industry-specific steps may be added based on your business type.
          </p>
        </div>
      </div>

      {/* Action Area */}
      <div className="pt-4 space-y-4">
        <Button
          onClick={() => nextStep()}
          className="w-full h-14 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold text-lg shadow-xl transition-all active:scale-[0.98]"
        >
          Start Setup <ArrowRight className="ml-2 h-5 w-5" />
        </Button>

        <p className="text-center text-xs text-gray-400 px-8 leading-relaxed">
          By continuing, you agree to our{" "}
          <a
            href="https://vayva.com/legal/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-500"
          >
            Terms
          </a>{" "}
          and{" "}
          <a
            href="https://vayva.com/legal/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-500"
          >
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
