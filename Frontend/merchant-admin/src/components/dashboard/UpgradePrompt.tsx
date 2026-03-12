"use client";

import { Button, Icon } from "@vayva/ui";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface UpgradePromptProps {
  daysRemaining: number;
  promptType: "welcome" | "mid-trial" | "final";
  onDismiss?: () => void;
  stats?: {
    orders?: number;
    revenue?: number;
    customers?: number;
  };
}

export function UpgradePrompt({
  daysRemaining,
  promptType,
  onDismiss,
  stats,
}: UpgradePromptProps) {
  // Reset visibility when promptType changes using a key on the parent instead.
  // Initialize to visible; parent re-mounts the component when promptType changes.
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const promptContent = {
    welcome: {
      title: "Your 7-Day Free Trial Started!",
      subtitle: "You're on the Free plan. Upgrade to Pro to unlock AI-powered sales.",
      highlight: `${stats?.orders || 0} orders captured`,
      cta: "Upgrade to Pro",
      color: "from-emerald-500 to-teal-600",
      icon: "Sparkles",
    },
    "mid-trial": {
      title: "Halfway Through Your Trial",
      subtitle: "You're doing great! Upgrade now to keep all features after day 7.",
      highlight: `₦${(stats?.revenue || 0).toLocaleString()} revenue potential`,
      cta: "Upgrade Now - 20% Off",
      color: "from-violet-500 to-purple-600",
      icon: "TrendingUp",
    },
    final: {
      title: `${daysRemaining} Day${daysRemaining === 1 ? "" : "s"} Left!`,
      subtitle: "Don't lose your progress. Upgrade to keep your store live and AI active.",
      highlight: `${stats?.customers || 0} customers waiting`,
      cta: "Upgrade to Keep Access",
      color: "from-rose-500 to-orange-600",
      icon: "AlertTriangle",
    },
  };

  const content = promptContent[promptType];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${content.color} text-white shadow-xl mb-6`}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-white/30" />
            <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white/20" />
          </div>

          <div className="relative p-5 md:p-6">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="hidden md:flex w-12 h-12 rounded-xl bg-white/20 items-center justify-center shrink-0">
                <Icon name={content.icon as any} className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-lg md:text-xl text-white">
                      {content.title}
                    </h3>
                    <p className="text-white/80 text-sm mt-1">
                      {content.subtitle}
                    </p>
                  </div>

                  {/* Stats badge */}
                  <div className="hidden sm:block text-right">
                    <div className="text-2xl font-bold text-white">
                      {content.highlight}
                    </div>
                    <div className="text-xs text-white/70">
                      {promptType === "welcome" && "this week"}
                      {promptType === "mid-trial" && "projected monthly"}
                      {promptType === "final" && "in your pipeline"}
                    </div>
                  </div>
                </div>

                {/* CTA Row */}
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <Link href="/dashboard/billing">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-white text-slate-900 hover:bg-white/90 font-semibold h-10 px-5"
                    >
                      <Icon name="Crown" className="w-4 h-4 mr-2" />
                      {content.cta}
                    </Button>
                  </Link>

                  <button
                    onClick={handleDismiss}
                    className="text-white/70 hover:text-white text-sm font-medium transition-colors"
                  >
                    Maybe later
                  </button>

                  {/* Trial countdown */}
                  <div className="ml-auto flex items-center gap-2 text-white/80 text-sm">
                    <Icon name="Clock" className="w-4 h-4" />
                    <span>
                      {daysRemaining} day{daysRemaining === 1 ? "" : "s"} left
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-white/20">
            <motion.div
              className="h-full bg-white"
              initial={{ width: "100%" }}
              animate={{ width: `${(daysRemaining / 7) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook to determine which prompt to show based on trial day
export function useTrialPrompt(
  trialStartDate: Date | null,
  currentStats: { orders: number; revenue: number; customers: number }
): { show: boolean; type: UpgradePromptProps["promptType"]; daysRemaining: number } {
  if (!trialStartDate) return { show: false, type: "welcome", daysRemaining: 0 };

  const now = new Date();
  const trialStart = new Date(trialStartDate);
  const daysSinceStart = Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, 7 - daysSinceStart);

  // Show prompts on day 1, day 4, and day 6 (3 times during trial)
  const promptDays = [0, 3, 5]; // 0-indexed: day 1, day 4, day 6
  const shouldShow = promptDays.includes(daysSinceStart) && daysRemaining > 0;

  let type: UpgradePromptProps["promptType"] = "welcome";
  if (daysSinceStart >= 5) type = "final";
  else if (daysSinceStart >= 3) type = "mid-trial";

  return { show: shouldShow, type, daysRemaining };
}
