"use client";

import { logger } from "@vayva/shared";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon, IconName } from "@vayva/ui";
import { INDUSTRY_CONFIG } from "@/config/industry";
import { IndustrySlug } from "@/lib/templates/types";

type Action = {
  label: string;
  icon: IconName;
  href: string;
  available: boolean;
};

import { apiJson } from "@/lib/api-client-shared";

interface ActivationProgressResponse {
  data: {
    industrySlug?: IndustrySlug;
  };
}

export const QuickActions = () => {
  const [industrySlug, setIndustrySlug] = useState<IndustrySlug>("retail");

  useEffect(() => {
    async function load() {
      try {
        const res = await apiJson<ActivationProgressResponse>(
          "/api/merchant/dashboard/activation-progress",
        );
        setIndustrySlug(res.data?.industrySlug || "retail");
      } catch (e: unknown) {
        const _errMsg = e instanceof Error ? e.message : String(e);
        logger.warn("[QUICK_ACTIONS_LOAD_ERROR]", {
          error: _errMsg,
          app: "merchant",
        });
      }
    }
    void load();
  }, []);

  const config = useMemo(() => {
    return INDUSTRY_CONFIG[industrySlug] || INDUSTRY_CONFIG.retail;
  }, [industrySlug]);

  const primaryLabelMap: Record<string, string> = {
    menu_item: "Menu Item",
    digital_asset: "Digital Asset",
    service: "Service",
    listing: "Listing",
    course: "Course",
    event: "Event",
    project: "Project",
    campaign: "Campaign",
    vehicle: "Vehicle",
    stay: "Stay",
    post: "Post",
  };
  const primaryLabel = primaryLabelMap[config?.primaryObject] || "Product";

  // Smart create path lookup
  let createPath = "/dashboard/products/new"; // Fallback
  if (config?.moduleRoutes) {
    for (const mod of config.modules) {
      if (config.moduleRoutes[mod]?.create) {
        createPath = config.moduleRoutes[mod].create!;
        break;
      }
    }
  }

  if (createPath === "/dashboard/products/new") {
    const fallbackMap: Record<string, string> = {
      menu_item: "/dashboard/menu-items/new",
      digital_asset: "/dashboard/digital-assets/new",
      service: "/dashboard/services/new",
      listing: "/dashboard/listings/new",
      event: "/dashboard/events/new",
      project: "/dashboard/projects/new",
      campaign: "/dashboard/campaigns/new",
      vehicle: "/dashboard/vehicles/new",
      stay: "/dashboard/stays/new",
      post: "/dashboard/posts/new",
    };
    if (fallbackMap[config?.primaryObject]) {
      createPath = fallbackMap[config.primaryObject];
    }
  }

  const hasFulfillment = (config?.modules || []).includes("fulfillment");

  const actions: Action[] = [
    {
      label: `New ${primaryLabel}`,
      icon: "Plus",
      href: createPath,
      available: true,
    },
    { label: "Create Discount", icon: "Tag", href: "#", available: false },
    {
      label: "Create Invoice",
      icon: "FileText",
      href: "/dashboard/finance",
      available: true,
    },
    { label: "Send Broadcast", icon: "Send", href: "#", available: false },
    {
      label: "Delivery Task",
      icon: "Truck",
      href: "/dashboard/orders",
      available: hasFulfillment,
    },
    {
      label: "View Reports",
      icon: "BarChart2",
      href: "/dashboard/analytics",
      available: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {actions.map((action) => (
        <Link
          key={action.label}
          href={action.available ? action.href : "#"}
          className={`block group ${!action.available ? "cursor-not-allowed opacity-50" : ""}`}
          onClick={(e) => !action.available && e.preventDefault()}
        >
          <div className="bg-[#0A0F0D] border border-white/5 rounded-xl p-4 flex flex-col items-center gap-3 hover:border-primary/30 hover:bg-background/5 transition-all text-center h-full">
            <div className="w-10 h-10 rounded-full bg-background/5 flex items-center justify-center text-white group-hover:scale-110 transition-transform group-hover:bg-primary group-hover:text-black">
              <Icon name={action.icon} size={20} />
            </div>
            <span className="text-xs font-medium text-text-secondary group-hover:text-white transition-colors">
              {action.label}
            </span>
            {!action.available && (
              <span className="text-[10px] text-primary/50 uppercase tracking-wider font-bold">
                Soon
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
};
