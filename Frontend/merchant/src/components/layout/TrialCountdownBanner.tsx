"use client";

import { useEffect, useState } from "react";
import { Button, Icon, cn } from "@vayva/ui";
import Link from "next/link";
import { apiJson } from "@/lib/api-client-shared";
import { logger } from "@vayva/shared";

interface SubscriptionStatus {
  status: "TRIAL_ACTIVE" | "TRIAL_EXPIRED_GRACE" | "ACTIVE" | "PAST_DUE" | "GRACE_PERIOD";
  trialEndsAt?: string;
  gracePeriodEndsAt?: string;
  currentPeriodEnd?: string;
  planKey?: string;
}

interface UrgencyConfig {
  color: string;
  icon: string;
  message: string;
  ctaText: string;
}

function getUrgencyConfig(daysRemaining: number): UrgencyConfig {
  if (daysRemaining <= 1) {
    return {
      color: "from-red-500 to-orange-600",
      icon: "AlertTriangle",
      message: "Last day!",
      ctaText: "Upgrade Now",
    };
  }
  if (daysRemaining <= 3) {
    return {
      color: "from-orange-500 to-red-600",
      icon: "Clock",
      message: `${daysRemaining} days left`,
      ctaText: "Don't Lose Access",
    };
  }
  if (daysRemaining <= 5) {
    return {
      color: "from-amber-500 to-orange-600",
      icon: "Hourglass",
      message: `${daysRemaining} days remaining`,
      ctaText: "Upgrade Soon",
    };
  }
  return {
    color: "from-emerald-500 to-teal-600",
    icon: "Sparkles",
    message: `${daysRemaining} days left`,
    ctaText: "Explore Features",
  };
}

export function TrialCountdownBanner() {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [daysRemaining, setDaysRemaining] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        setIsLoading(true);
        const data = await apiJson<SubscriptionStatus>("/api/merchant/billing/status");
        
        if (data?.subscription) {
          setSubscription(data.subscription);
          
          // Calculate days remaining
          const now = new Date();
          let endDate: Date | null = null;
          
          if (data.subscription.trialEndsAt) {
            endDate = new Date(data.subscription.trialEndsAt);
          } else if (data.subscription.gracePeriodEndsAt) {
            endDate = new Date(data.subscription.gracePeriodEndsAt);
          } else if (data.subscription.currentPeriodEnd) {
            endDate = new Date(data.subscription.currentPeriodEnd);
          }
          
          if (endDate) {
            const diffMs = endDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            setDaysRemaining(Math.max(0, diffDays));
          }
        }
      } catch (error: unknown) {
        const _errMsg = error instanceof Error ? error.message : String(error);
        logger.warn("[TRIAL_COUNTDOWN_FETCH_ERROR]", {
          error: _errMsg,
          app: "merchant",
        });
      } finally {
        setIsLoading(false);
      }
    };

    void fetchSubscriptionStatus();
  }, []);

  // Don't show if not in trial or loading
  if (isLoading) return null;
  if (!subscription) return null;
  
  // Only show for TRIAL_ACTIVE status
  if (subscription.status !== "TRIAL_ACTIVE") return null;
  if (daysRemaining <= 0) return null;
  if (!isVisible) return null;

  const urgency = getUrgencyConfig(daysRemaining);

  return (
    <div 
      className={cn(
        "bg-gradient-to-r text-white px-4 py-3 shadow-md relative z-50 transition-all duration-300",
        urgency.color
      )}
      role="banner"
      aria-label="Trial countdown notification"
    >
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="bg-white/20 p-1.5 rounded-full">
            <Icon name={urgency.icon as any} className="w-4 h-4 text-white" />
          </span>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm">
              {urgency.message} Your trial ends in <strong className="font-bold">{daysRemaining}</strong> day{daysRemaining !== 1 ? "s" : ""}
            </p>
            <button
              onClick={() => setIsVisible(false)}
              className="ml-2 hover:bg-white/20 rounded-full p-1 transition-colors"
              aria-label="Dismiss banner"
            >
              <Icon name="X" className="w-3 h-3 text-white" />
            </button>
          </div>
        </div>

        <Link href="/dashboard/settings/billing">
          <Button
            size="sm"
            variant="secondary"
            className="whitespace-nowrap font-medium text-xs h-8 bg-white text-green-600 hover:bg-white/90 shadow-sm"
          >
            {urgency.ctaText} <Icon name="ArrowRight" className="ml-2 w-3 h-3" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
