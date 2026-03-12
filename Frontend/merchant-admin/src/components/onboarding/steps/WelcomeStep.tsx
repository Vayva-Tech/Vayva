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
} from "@phosphor-icons/react/ssr";

export default function WelcomeStep() {
  const { nextStep, state } = useOnboarding();
  const { user } = useAuth();

  const firstName = user?.firstName || "there";

  const steps = [
    { icon: "User", title: "Personal Identity", desc: "Verify your details" },
    {
      icon: "Store",
      title: "Business & Store URL",
      desc: "Tell us about your brand",
    },
    { icon: "MessageSquare", title: "Socials", desc: "Connect IG & WhatsApp" },
    { icon: "CreditCard", title: "Payments", desc: "Add your bank account" },
    { icon: "Shield", title: "Verification", desc: "KYC Compliance" },
  ];

  const valueProps = [
    { icon: Robot, text: "AI captures orders from WhatsApp 24/7" },
    { icon: Package, text: "Auto-tracks inventory & restocks" },
    { icon: Wallet, text: "Instant payouts to your bank" },
  ];

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-vayva-green/10 mb-2">
          <Sparkles className="w-8 h-8 text-vayva-green animate-pulse" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-text-primary tracking-tight">
          Welcome, {firstName}!
        </h1>
        <p className="text-text-secondary max-w-md mx-auto text-lg">
          Let's get your store ready for the world. We've simplified everything
          into a few quick steps.
        </p>
      </div>

      {/* Value Preview Card */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-5 shadow-sm">
        <p className="text-sm font-semibold text-emerald-800 mb-3 text-center">
          After these 5 quick steps, you'll have:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {valueProps.map((prop, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 bg-white/70 rounded-xl p-3"
            >
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <prop.icon size={16} className="text-emerald-600" />
              </div>
              <p className="text-xs font-medium text-emerald-900 leading-tight">
                {prop.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Checklist Card */}
      <div className="bg-background border border-border rounded-[32px] p-8 shadow-card space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest">
            Setup Path
          </h3>
          <div className="px-3 py-1 bg-white/40 rounded-full text-[10px] font-black text-text-tertiary">
            ~5 MINUTES
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 rounded-2xl bg-white/30 border border-border/40 transition-all hover:bg-white hover:shadow-sm"
            >
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                {step.icon === "User" && (
                  <User size={18} className="text-text-secondary" />
                )}
                {step.icon === "Store" && (
                  <Store size={18} className="text-text-secondary" />
                )}
                {step.icon === "MessageSquare" && (
                  <MessageSquare size={18} className="text-text-secondary" />
                )}
                {step.icon === "CreditCard" && (
                  <CreditCard size={18} className="text-text-secondary" />
                )}
                {step.icon === "Shield" && (
                  <Shield size={18} className="text-text-secondary" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-text-primary truncate">
                  {step.title}
                </p>
                <p className="text-[11px] text-text-tertiary truncate">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Area */}
      <div className="pt-4 space-y-4">
        <Button
          onClick={() => nextStep()}
          className="w-full h-14 bg-text-primary hover:bg-zinc-800 text-white rounded-2xl font-bold text-lg shadow-xl transition-all active:scale-[0.98]"
        >
          Start Setup <ArrowRight className="ml-2 h-5 w-5" />
        </Button>

        <p className="text-center text-xs text-text-tertiary px-8 leading-relaxed">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-text-secondary">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-text-secondary">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
