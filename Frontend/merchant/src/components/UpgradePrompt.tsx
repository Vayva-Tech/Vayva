"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ArrowRight, Zap, TrendingUp, Shield } from "lucide-react";
import { Button } from "@vayva/ui";
import { APP_URL } from "@/lib/constants";

interface UpgradePromptProps {
  currentPlan?: "starter" | "pro" | "pro_plus";
  variant?: "toast" | "banner" | "modal";
  onDismiss?: () => void;
  dismissible?: boolean;
}

const PRO_FEATURES = [
  {
    icon: Zap,
    title: "3 Staff Seats",
    description: "Collaborate with your team",
  },
  {
    icon: TrendingUp,
    title: "300 Products",
    description: "Scale your catalog",
  },
  {
    icon: Shield,
    title: "API Access",
    description: "Custom integrations",
  },
];

const PRO_PLUS_FEATURES = [
  {
    icon: Zap,
    title: "5 Staff Seats",
    description: "Maximum team collaboration",
  },
  {
    icon: TrendingUp,
    title: "500 Products",
    description: "Largest catalog size",
  },
  {
    icon: Sparkles,
    title: "Workflow Builder",
    description: "Visual automation designer",
  },
];

export function UpgradePrompt({
  currentPlan = "starter",
  variant = "toast",
  onDismiss,
  dismissible = true,
}: UpgradePromptProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const upgradeHref = (plan: string) => `${APP_URL}/signup?plan=${plan}`;

  if (!isVisible) return null;

  if (variant === "toast") {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed bottom-4 right-4 z-50 max-w-sm w-full"
          >
            <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-200 bg-white shadow-2xl">
              {/* Gradient top bar */}
              <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-purple-500 to-pink-500" />

              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-purple-500 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-base">
                      Unlock More Power 🚀
                    </h4>
                    <p className="text-sm text-slate-600 mt-1">
                      Upgrade to Pro for {currentPlan === "starter" ? "only ₦35,000/mo" : "unlimited growth"}
                    </p>

                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-emerald-600 to-purple-600 hover:from-emerald-700 hover:to-purple-700 text-white font-semibold"
                        onClick={() => (window.location.href = upgradeHref("pro"))}
                      >
                        View Pro Plans
                        <ArrowRight className="ml-1 w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {dismissible && (
                    <button
                      onClick={handleDismiss}
                      className="flex-shrink-0 p-1 hover:bg-slate-100 rounded-full transition-colors"
                      aria-label="Dismiss"
                    >
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (variant === "banner") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative overflow-hidden rounded-b-2xl border-b-2 border-emerald-200 bg-gradient-to-r from-emerald-50 via-purple-50 to-pink-50 px-4 py-3"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="hidden sm:flex w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-purple-500 items-center justify-center flex-shrink-0 shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">
                Ready to level up? Upgrade to Pro and unlock powerful features
              </p>
              <p className="text-xs text-slate-600 hidden sm:block">
                Starting at ₦35,000/mo — Cancel anytime
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              className="bg-gradient-to-r from-emerald-600 to-purple-600 hover:from-emerald-700 hover:to-purple-700 text-white font-semibold shadow-lg whitespace-nowrap"
              onClick={() => (window.location.href = upgradeHref("pro"))}
            >
              Upgrade Now
              <ArrowRight className="ml-1 w-4 h-4" />
            </Button>
            {dismissible && (
              <button
                onClick={handleDismiss}
                className="p-1.5 hover:bg-white/80 rounded-full transition-colors"
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === "modal") {
    return (
      <AnimatePresence>
        {isVisible && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={dismissible ? handleDismiss : undefined}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="relative w-full max-w-2xl">
                <div className="rounded-3xl border-2 border-slate-200 bg-white shadow-2xl overflow-hidden">
                  {/* Header */}
                  <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-purple-500 to-pink-500 px-6 py-8">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4yKSIvPjwvc3ZnPg==')] opacity-30" />
                    <div className="relative text-center">
                      <div className="mx-auto w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
                        Unlock Your Full Potential
                      </h2>
                      <p className="text-white/90 text-sm sm:text-base">
                        Upgrade from Starter to access game-changing features
                      </p>
                    </div>
                    {dismissible && (
                      <button
                        onClick={handleDismiss}
                        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                        aria-label="Close modal"
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>
                    )}
                  </div>

                  {/* Content */}
                  <div className="px-6 py-8">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 text-center">
                      What you'll get with Pro:
                    </h3>

                    <div className="grid sm:grid-cols-3 gap-4 mb-8">
                      {PRO_FEATURES.map((feature, i) => (
                        <div
                          key={i}
                          className="rounded-xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-purple-50 p-4 text-center"
                        >
                          <feature.icon className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
                          <p className="font-semibold text-slate-900 text-sm">
                            {feature.title}
                          </p>
                          <p className="text-xs text-slate-600 mt-1">
                            {feature.description}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-6 text-center mb-6">
                      <p className="text-sm text-slate-600 mb-2">Special Offer</p>
                      <p className="text-3xl font-black text-slate-900">
                        ₦35,000<span className="text-base font-normal text-slate-500">/month</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        Cancel or upgrade anytime. No hidden fees.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        className="flex-1 h-14 text-lg font-bold bg-gradient-to-r from-emerald-600 to-purple-600 hover:from-emerald-700 hover:to-purple-700 text-white shadow-xl"
                        onClick={() => (window.location.href = upgradeHref("pro"))}
                      >
                        Upgrade to Pro Now
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 h-14 text-lg"
                        onClick={() => (window.location.href = upgradeHref("pro_plus"))}
                      >
                        View Pro+ Options
                      </Button>
                    </div>

                    <p className="text-xs text-center text-slate-500 mt-4">
                      Already upgraded?{" "}
                      <a href="/dashboard" className="underline hover:text-slate-900">
                        Go to Dashboard
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return null;
}
