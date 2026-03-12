"use client";

import { AddOnMetadata } from "@vayva/extensions";
import { Lock, Eye, CheckCircle } from "lucide-react";
import { Button } from "@vayva/ui";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// Extended addon metadata with tier gating properties
interface TierGatedAddOn extends AddOnMetadata {
  functionalityLevel?: "basic" | "full";
  freeTierAccess?: "view-only" | "none";
  limitations?: string[];
}

interface AddOnGateProps {
  addon: TierGatedAddOn;
  userPlan: "free" | "starter" | "pro";
  children: React.ReactNode;
  onActivate?: () => void;
}

export function AddOnGate({ addon, userPlan, children, onActivate }: AddOnGateProps) {
  const router = useRouter();

  // Determine access level
  const getAccessLevel = () => {
    if (userPlan === "pro") return "full";
    if (userPlan === "starter") {
      // Starter users get access to free and starter plan addons
      return addon.requiredPlan === "starter" || addon.requiredPlan === "free"
        ? (addon.functionalityLevel || "basic")
        : "none";
    }
    // Free tier
    return addon.freeTierAccess === "view-only" ? "view-only" : "none";
  };

  const accessLevel = getAccessLevel();

  // If user has full access, render children
  if (accessLevel === "full" || accessLevel === "basic") {
    return (
      <div className="relative">
        {accessLevel === "basic" && userPlan !== "pro" && (
          <div className="absolute -top-2 -right-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium z-10">
            Basic
          </div>
        )}
        {children}
      </div>
    );
  }

  // View-only mode for Free users
  if (accessLevel === "view-only") {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-lg">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Eye className="w-6 h-6 text-amber-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">{addon.name}</h4>
            <p className="text-sm text-gray-600 mb-4 max-w-xs">
              {addon.description}
            </p>
            <div className="space-y-2">
              <Button
                onClick={() => router.push("/dashboard/billing")}
                size="sm"
                className="w-full"
              >
                Upgrade to {addon.requiredPlan === "pro" ? "Pro" : "Starter"}
              </Button>
              <p className="text-xs text-gray-500">
                View-only access on Free plan
              </p>
            </div>
          </div>
        </div>
        <div className="opacity-50 pointer-events-none">{children}</div>
      </div>
    );
  }

  // No access - show upgrade prompt
  return (
    <div className="bg-surface-2 border border-border rounded-xl p-6 text-center">
      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <Lock className="w-6 h-6 text-gray-500" />
      </div>
      <h4 className="font-semibold text-gray-900 mb-1">{addon.name}</h4>
      <p className="text-sm text-gray-600 mb-4">{addon.description}</p>
      
      {(addon.limitations || addon.whatItAdds) && (
        <div className="bg-white rounded-lg p-3 mb-4 text-left">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            What you get with {addon.requiredPlan === "pro" ? "Pro" : "Starter"}
          </p>
          <ul className="space-y-1">
            {addon.whatItAdds.slice(0, 3).map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button
        onClick={() => router.push("/dashboard/billing")}
        className="w-full"
      >
        Upgrade to {addon.requiredPlan === "pro" ? "Pro" : "Starter"}
      </Button>
    </div>
  );
}

interface AddOnBadgeProps {
  addon: TierGatedAddOn;
  userPlan: "free" | "starter" | "pro";
}

export function AddOnBadge({ addon, userPlan }: AddOnBadgeProps) {
  const getBadgeStyle = () => {
    if (userPlan === "pro" && addon.requiredPlan === "pro") {
      return "bg-purple-100 text-purple-700";
    }
    if (userPlan === "starter" && (addon.requiredPlan === "starter" || addon.requiredPlan === "free")) {
      return "bg-blue-100 text-blue-700";
    }
    if (userPlan === "free" && addon.freeTierAccess === "view-only") {
      return "bg-amber-100 text-amber-700";
    }
    return "bg-gray-100 text-gray-600";
  };

  const getBadgeText = () => {
    if (userPlan === "pro") return "Full Access";
    if (userPlan === "starter") {
      if (addon.requiredPlan === "pro") return "Pro Only";
      return addon.functionalityLevel === "basic" ? "Basic" : "Full";
    }
    return addon.freeTierAccess === "view-only" ? "View Only" : "Upgrade";
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full font-medium",
        getBadgeStyle()
      )}
    >
      {getBadgeText()}
    </span>
  );
}
