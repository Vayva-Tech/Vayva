"use client";

import React, { useEffect, useState } from "react";
import { Button, Icon, IconName, cn } from "@vayva/ui";
import { apiJson } from "@/lib/api-client-shared";
import { INDUSTRY_CONFIG } from "@/config/industry";
import { logger } from "@vayva/shared";
import type { IndustrySlug } from "@/lib/templates/types";

interface ActiveAddOn {
  extensionId: string;
  name: string;
  icon: string;
  industrySlug: string | null;
}

interface DashboardSwitcherProps {
  baseIndustrySlug: IndustrySlug;
  activeView: string;
  onSwitch: (industrySlug: string) => void;
}

const EXTENSION_TO_INDUSTRY: Record<string, IndustrySlug> = {
  "vayva.retail": "retail",
  "vayva.kitchen": "food",
  "vayva.bookings": "services",
  "vayva.education": "education",
  "vayva.events": "events",
  "vayva.b2b": "b2b",
  "vayva.nonprofit": "nonprofit",
  "vayva.automotive": "automotive",
  "vayva.travel": "travel_hospitality",
  "vayva.creative": "creative_portfolio",
  "vayva.real-estate": "real_estate",
};

interface AddOnsResponse {
  addOns: Array<{
    id: string;
    name: string;
    icon?: string;
    isBaseExtension: boolean;
    purchase?: {
      status: string;
    };
  }>;
}

export function DashboardSwitcher({
  baseIndustrySlug,
  activeView,
  onSwitch,
}: DashboardSwitcherProps) {
  const [addOns, setAddOns] = useState<ActiveAddOn[]>([]);

  useEffect(() => {
    const fetchAddOns = async () => {
      try {
        const data = await apiJson<AddOnsResponse>("/api/merchant/addons");
        const active = (data.addOns || [])
          .filter(
            (a: any) => a.purchase?.status?.toUpperCase() === "ACTIVE" && !a.isBaseExtension,
          )
          .map((a: { id: string; name: string; icon?: string; purchase?: { status?: string }; isBaseExtension?: boolean }) => ({
            extensionId: a.id,
            name: a.name,
            icon: a.icon || "Blocks",
            industrySlug: EXTENSION_TO_INDUSTRY[a.id] || null,
          }))
          .filter(
            (a: ActiveAddOn): a is ActiveAddOn & { industrySlug: string } =>
              a.industrySlug !== null,
          );

        setAddOns(active);
      } catch (err: unknown) {
        const _errMsg = err instanceof Error ? err.message : String(err);
        logger.error("[DashboardSwitcher] Failed to load add-ons", {
          error: _errMsg,
          app: "merchant",
        });
      }
    };
    void fetchAddOns();
  }, []);

  // Don't render if no add-ons are active
  if (addOns.length === 0) return null;

  const baseConfig = INDUSTRY_CONFIG[baseIndustrySlug];
  const baseName = baseConfig?.displayName || "My Store";

  const tabs = [
    {
      slug: baseIndustrySlug,
      label: baseName,
      icon: "LayoutDashboard" as string,
      isBase: true,
    },
    ...addOns.map((a) => ({
      slug: a.industrySlug!,
      label: a.name.replace("Vayva ", "").replace("vayva.", ""),
      icon: a.icon,
      isBase: false,
    })),
  ];

  return (
    <div className="flex items-center gap-1 p-1 rounded-2xl bg-surface-2/50 border border-border/40 backdrop-blur-sm">
      {tabs.map((tab) => {
        const isActive = activeView === tab.slug;
        return (
          <Button
            key={tab.slug}
            variant="ghost"
            onClick={() => onSwitch(tab.slug)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap h-auto",
              isActive
                ? "bg-background text-text-primary shadow-sm border border-border/40"
                : "text-text-tertiary hover:text-text-secondary hover:bg-background/40",
            )}
          >
            <Icon name={tab.icon as IconName} size={14} />
            {tab.label}
          </Button>
        );
      })}
    </div>
  );
}
