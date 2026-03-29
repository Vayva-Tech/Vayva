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

interface EnhancedDashboardSwitcherProps {
  baseIndustrySlug: IndustrySlug;
  activeView: string;
  dashboardType: 'universal' | 'industry-native';
  onSwitchView: (industrySlug: string) => void;
  onSwitchDashboardType: (type: 'universal' | 'industry-native') => void;
  hasIndustryNativeDashboard: boolean;
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

export function EnhancedDashboardSwitcher({
  baseIndustrySlug,
  activeView,
  dashboardType,
  onSwitchView,
  onSwitchDashboardType,
  hasIndustryNativeDashboard,
}: EnhancedDashboardSwitcherProps) {
  const [addOns, setAddOns] = useState<ActiveAddOn[]>([]);
  const [storedDashboardType, setStoredDashboardType] = useState<'universal-pro' | 'industry-native'>('universal-pro');

  // Load stored preference
  useEffect(() => {
    const stored = localStorage.getItem('preferredDashboardType');
    if (stored === 'universal-pro' || stored === 'industry-native') {
      setStoredDashboardType(stored);
      onSwitchDashboardType(stored === 'universal-pro' ? 'universal' : 'industry-native');
    }
  }, [onSwitchDashboardType]);

  // Save preference when it changes
  useEffect(() => {
    localStorage.setItem('preferredDashboardType', dashboardType);
  }, [dashboardType]);

  useEffect(() => {
    const fetchAddOns = async () => {
      try {
        const data = await apiJson<AddOnsResponse>("/merchant/addons");
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

  const baseConfig = INDUSTRY_CONFIG[baseIndustrySlug];
  const baseName = baseConfig?.displayName || "My Store";

  // Dashboard type options
  const dashboardOptions = [
    {
      id: 'universal-pro',
      label: 'Universal Pro',
      description: 'Multi-industry dashboard with all features',
      icon: 'LayoutDashboard' as IconName,
    },
    ...(hasIndustryNativeDashboard ? [{
      id: 'industry-native',
      label: `${baseConfig?.displayName || 'Industry'} Native`,
      description: `Specialized ${baseConfig?.displayName?.toLowerCase() || 'industry'} dashboard`,
      icon: (baseConfig?.icon || 'Building') as IconName,
    }] : []),
  ];

  // Industry view options
  const industryTabs = [
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
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      {/* Dashboard Type Selector */}
      <div className="flex items-center gap-1 p-1 rounded-2xl bg-white-2/50 border border-gray-100 ">
        {dashboardOptions.map((option) => {
          const isActive = dashboardType === option.id;
          return (
            <Button
              key={option.id}
              variant="ghost"
              onClick={() =>
                onSwitchDashboardType(option.id === 'universal-pro' ? 'universal' : 'industry-native')
              }
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap h-auto",
                isActive
                  ? "bg-white text-gray-900 shadow-sm border border-gray-100"
                  : "text-gray-400 hover:text-gray-500 hover:bg-white",
              )}
              title={option.description}
            >
              <Icon name={option.icon} size={14} />
              <span className="hidden sm:inline">{option.label}</span>
              <span className="sm:hidden">{option.label.split(' ')[0]}</span>
            </Button>
          );
        })}
      </div>

      {/* Industry View Selector (only show when in industry-native mode or when there are add-ons) */}
      {(dashboardType === 'industry-native' || addOns.length > 0) && (
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-white-2/50 border border-gray-100 ">
          {industryTabs.map((tab) => {
            const isActive = activeView === tab.slug;
            return (
              <Button
                key={tab.slug}
                variant="ghost"
                onClick={() => onSwitchView(tab.slug)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap h-auto",
                  isActive
                    ? "bg-white text-gray-900 shadow-sm border border-gray-100"
                    : "text-gray-400 hover:text-gray-500 hover:bg-white",
                )}
              >
                <Icon name={tab.icon as IconName} size={14} />
                <span className="hidden md:inline">{tab.label}</span>
                <span className="md:hidden">{tab.label.split(' ')[0] || tab.label.substring(0, 3)}</span>
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}