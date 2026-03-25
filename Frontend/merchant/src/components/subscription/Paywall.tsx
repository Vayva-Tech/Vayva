import React from "react";
import { Lock, Sparkle, Check, X } from "@phosphor-icons/react";
import { Button } from "@vayva/ui";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface PaywallOverlayProps {
  feature: string;
  requiredTier: string;
  currentTier: string;
  onUpgrade?: () => void;
  onDismiss?: () => void;
}

/**
 * Paywall Overlay Component
 * 
 * Shown when user tries to access a feature above their subscription tier.
 * Provides clear upgrade path and tier comparison.
 */
export function PaywallOverlay({
  feature,
  requiredTier,
  currentTier,
  onUpgrade,
  onDismiss,
}: PaywallOverlayProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      router.push("/dashboard/settings/subscription");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60  p-4">
      <Card className="relative max-w-md w-full p-6 text-center">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2">
          <div className="rounded-full bg-green-500/20 p-4">
            <Lock className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-2">Upgrade Required</h2>
          <p className="text-gray-500 mb-6">
            <span className="font-semibold text-gray-900">{feature}</span> is available on the{" "}
            <span className="font-semibold text-green-500">{requiredTier}</span> plan and above.
          </p>

          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Current plan:</span>
              <span className="font-medium capitalize">{currentTier}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-500">Required plan:</span>
              <span className="font-medium text-green-500 capitalize">{requiredTier}</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button onClick={handleUpgrade} className="w-full">
              <Sparkle className="h-4 w-4 mr-2" />
              Upgrade Now
            </Button>
            {onDismiss && (
              <Button variant="ghost" onClick={onDismiss} className="w-full">
                Maybe Later
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

interface TierComparisonTableProps {
  currentTier: string;
}

/**
 * Tier Comparison Table
 * 
 * Shows all subscription tiers with their features and limits.
 */
export function TierComparisonTable({ currentTier }: TierComparisonTableProps) {
  const tiers = [
    {
      name: "Free",
      price: "₦0",
      period: "forever",
      features: [
        "Up to 20 products",
        "50 orders/month",
        "Basic dashboard",
        "Paystack payments",
      ],
      cta: "Current Plan",
    },
    {
      name: "Starter",
      price: "₦25,000",
      period: "/month",
      features: [
        "Up to 100 products",
        "500 orders/month",
        "CSV import/export",
        "Basic analytics",
        "Email support",
      ],
      cta: "Upgrade",
      popular: true,
    },
    {
      name: "Pro",
      price: "₦35,000",
      period: "/month",
      features: [
        "Up to 300 products",
        "10,000 orders/month",
        "Advanced analytics",
        "Multi-store support",
        "Accounting features",
        "API access",
        "AI Autopilot",
      ],
      cta: "Upgrade",
    },
    {
      name: "Pro+",
      price: "₦50,000",
      period: "/month",
      features: [
        "Up to 500 products",
        "Unlimited orders/month",
        "Everything in Pro",
        "Visual workflow builder",
        "Merged industry view",
        "Priority support",
      ],
      cta: "Upgrade",
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      features: [
        "Custom product and order limits",
        "Custom integrations",
        "Dedicated support",
        "SLA guarantee",
      ],
      cta: "Contact Sales",
    },
  ];

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {tiers.map((tier) => (
        <Card
          key={tier.name}
          className={`p-6 flex flex-col ${
            tier.name.toLowerCase() === currentTier.toLowerCase()
              ? "border-green-500"
              : ""
          } ${tier.popular ? "ring-2 ring-green-500 relative" : ""}`}
        >
          {tier.popular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                Most Popular
              </span>
            </div>
          )}

          <div className="mb-4">
            <h3 className="font-semibold text-lg">{tier.name}</h3>
            <div className="mt-2">
              <span className="text-3xl font-bold">{tier.price}</span>
              <span className="text-gray-500">{tier.period}</span>
            </div>
          </div>

          <ul className="space-y-2 mb-6 flex-1">
            {tier.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <Button
            variant={
              tier.name.toLowerCase() === currentTier.toLowerCase()
                ? "outline"
                : "primary"
            }
            className="w-full"
            disabled={tier.name.toLowerCase() === currentTier.toLowerCase()}
          >
            {tier.name.toLowerCase() === currentTier.toLowerCase()
              ? "Current Plan"
              : tier.cta}
          </Button>
        </Card>
      ))}
    </div>
  );
}

interface TrialBannerProps {
  daysLeft: number;
  tier: string;
  onUpgrade: () => void;
}

/**
 * Trial Banner
 * 
 * Shows countdown during trial period with upgrade prompt.
 */
export function TrialBanner({ daysLeft, tier, onUpgrade }: TrialBannerProps) {
  const isExpiring = daysLeft <= 3;

  return (
    <div
      className={`rounded-lg p-4 flex items-center justify-between ${
        isExpiring
          ? "bg-orange-50 border border-amber-200 dark:bg-amber-950/30"
          : "bg-green-500/10 border border-green-500/20"
      }`}
    >
      <div className="flex items-center gap-3">
        <Sparkle
          className={`h-5 w-5 ${isExpiring ? "text-orange-600" : "text-green-500"}`}
        />
        <div>
          <p className="font-medium text-sm">
            You&apos;re on the {tier} plan trial
          </p>
          <p
            className={`text-sm ${
              isExpiring ? "text-orange-700" : "text-gray-500"
            }`}
          >
            {daysLeft} {daysLeft === 1 ? "day" : "days"} left in your trial.
            {isExpiring && " Upgrade now to keep access."}
          </p>
        </div>
      </div>
      <Button
        size="sm"
        onClick={onUpgrade}
        variant={isExpiring ? "primary" : "outline"}
      >
        Upgrade
      </Button>
    </div>
  );
}
