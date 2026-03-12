"use client";

import { logger } from "@vayva/shared";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Icon, cn } from "@vayva/ui";
import { useAuth } from "@/context/AuthContext";
import { telemetry } from "@/lib/utils";
import { INDUSTRY_CONFIG } from "@/config/industry";
import { IndustrySlug } from "@/lib/templates/types";
import styles from "./DashboardSetupChecklist.module.css";

interface ActivationProgress {
  hasProducts: boolean;
  hasPayoutMethod: boolean;
  kycStatus: "NOT_STARTED" | "PENDING" | "VERIFIED" | "FAILED";
  isStoreLive: boolean;
  hasCustomRoles: boolean;
  industrySlug?: string;
}

import { apiJson } from "@/lib/api-client-shared";

interface ActivationProgressResponse {
  data: ActivationProgress;
}

export function DashboardSetupChecklist() {
  const { merchant } = useAuth();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [isPersistedHidden, setIsPersistedHidden] = useState(false);

  // Detailed progress state
  const [activation, setActivation] = useState<ActivationProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Persistence check
    if (typeof window !== "undefined") {
      const hidden =
        localStorage.getItem("vayva_dashboard_setup_hidden") === "true";
      setIsPersistedHidden(hidden);
    }

    async function loadActivation() {
      try {
        const res = await apiJson<ActivationProgressResponse>(
          "/api/merchant/dashboard/activation-progress",
        );
        setActivation(res.data);
      } catch (e: unknown) {
        const _errMsg = e instanceof Error ? e.message : String(e);
        logger.error("[LOAD_ACTIVATION_PROGRESS_ERROR]", {
          error: _errMsg,
          app: "merchant",
        });
      } finally {
        setLoading(false);
      }
    }
    void loadActivation();
  }, []);

  if (!merchant || loading || !activation) return null;

  // Activation Checklist Logic
  // Hide if either onboarding not fully done OR all activation tasks done
  const allDone =
    activation.hasProducts &&
    activation.hasPayoutMethod &&
    activation.kycStatus === "VERIFIED" &&
    activation.isStoreLive;

  if (allDone) return null;

  const handleDismissSession = () => setIsVisible(false);

  const handleHideForever = () => {
    setIsPersistedHidden(true);
    localStorage.setItem("vayva_dashboard_setup_hidden", "true");
  };

  const handleShow = () => {
    setIsVisible(true);
    setIsPersistedHidden(false);
    localStorage.removeItem("vayva_dashboard_setup_hidden");
  };

  // 1) Get Object name from industry
  const industrySlug = (activation.industrySlug || "retail") as IndustrySlug;
  const config = INDUSTRY_CONFIG[industrySlug] || INDUSTRY_CONFIG["retail"];
  const primaryObject = config.primaryObject;
  const objectLabel =
    primaryObject.charAt(0).toUpperCase() +
    primaryObject.slice(1).replace(/_/g, " ");

  let primaryCreatePath: string | undefined;
  if (config?.moduleRoutes) {
    for (const mod of config.modules) {
      if (config.moduleRoutes[mod]?.create) {
        primaryCreatePath = config.moduleRoutes[mod].create;
        break;
      }
    }
  }

  const items = [
    {
      id: "product",
      label: `Add your first ${objectLabel}`,
      desc: `Create your initial ${primaryObject} listing`,
      isDone: activation.hasProducts,
      path:
        primaryCreatePath ||
        `/dashboard/${primaryObject}s/new`.replace("productss", "products"), // Safe plurals
    },
    {
      id: "kyc",
      label: "Verify Identity",
      desc: "Upload ID to enable payouts",
      isDone: activation.kycStatus === "VERIFIED",
      path: "/dashboard/settings/security",
    },
    {
      id: "payments",
      label: "Setup Payout Bank",
      desc: "Where we send your earnings",
      isDone: activation.hasPayoutMethod,
      path: "/dashboard/settings/payments",
    },
    {
      id: "live",
      label: "Go Live",
      desc: "Publish your storefront",
      isDone: activation.isStoreLive,
      path: "/dashboard/control-center",
    },
    {
      id: "roles",
      label: "Secure Team",
      desc: "Define custom roles & permissions",
      isDone: activation.hasCustomRoles,
      path: "/dashboard/settings/roles",
    },
  ];

  // Specific path overrides
  if (primaryObject === "menu_item")
    items[0].path = "/dashboard/menu-items/new";
  if (primaryObject === "digital_asset")
    items[0].path = "/dashboard/digital-assets/new";

  const completedCount = items.filter((i) => i.isDone).length;
  const progressPercent = Math.round((completedCount / items.length) * 100);
  const progressBucket = Math.max(
    0,
    Math.min(100, Math.round(progressPercent / 5) * 5),
  );
  const progressClass = styles[`w${progressBucket}`] || styles.w0;

  if (completedCount === items.length) return null; // All done

  // Compact Mode (if hidden or dismissed)
  if (!isVisible || isPersistedHidden) {
    return (
      <div className="mb-6 flex justify-end">
        <Button
          onClick={handleShow}
          className="group flex items-center gap-3 text-sm font-semibold text-text-secondary bg-background border border-border pl-3 pr-4 py-2 rounded-full hover:border-primary hover:text-text-primary transition-all shadow-sm"
          variant="outline"
        >
          <div className="relative w-5 h-5">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-border"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="text-primary transition-all duration-500"
                strokeDasharray={`${progressPercent}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
            </svg>
          </div>
          <span>Finish Setup ({items.length - completedCount} left)</span>
        </Button>
      </div>
    );
  }

  return (
    <Card className="p-6 mb-8 animate-in slide-in-from-top-4 fade-in duration-500">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg text-text-primary">
            Finish your setup
          </h3>
          <p className="text-text-secondary text-sm">
            Complete these steps to get the most out of Vayva.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-text-primary">
            {progressPercent}% Done
          </span>
          <Button
            onClick={handleDismissSession}
            title="Dismiss for now"
            className="text-text-tertiary hover:text-text-primary hover:bg-white/40 transition-colors p-1"
            variant="ghost"
            size="icon"
          >
            <Icon name="X" size={20} />
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "h-2 rounded-full text-primary",
          styles.progressBar,
          progressClass,
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              if (!item.isDone) {
                telemetry.track("dashboard_checklist_item_clicked", {
                  itemKey: item.id,
                });
                router.push(item.path);
              }
            }}
            className={cn(
              "flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 relative group",
              item.isDone
                ? "bg-white/40 border-border opacity-75"
                : "bg-background border-border hover:border-primary hover:shadow-elevated hover:-translate-y-1 cursor-pointer",
            )}
          >
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                item.isDone
                  ? "bg-status-success/10 text-status-success"
                  : "bg-white/40 text-text-tertiary group-hover:bg-primary group-hover:text-text-inverse transition-all",
              )}
            >
              {item.isDone ? (
                <Icon name="Check" size={20} />
              ) : (
                <Icon name="ArrowRight" size={20} />
              )}
            </div>
            <div className="flex-1">
              <h4
                className={cn(
                  "font-bold text-sm",
                  item.isDone
                    ? "text-text-tertiary line-through"
                    : "text-text-primary",
                )}
              >
                {item.label}
              </h4>
              <p className="text-xs text-text-secondary">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-2 border-t border-border">
        <Button
          onClick={handleHideForever}
          className="text-xs text-text-tertiary hover:text-text-secondary hover:underline"
          variant="link"
        >
          Don't show this again
        </Button>
      </div>
    </Card>
  );
}
