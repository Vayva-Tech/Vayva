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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await apiJson<ActivationProgressResponse>(
          "/api/merchant/dashboard/activation-progress",
        );
        setIndustrySlug(res.data?.industrySlug || "retail");
      } catch (e: any) {
        const _errMsg = e instanceof Error ? e.message : String(e);
        setError("Failed to load quick actions");
        logger.warn("[QUICK_ACTIONS_LOAD_ERROR]", {
          error: _errMsg,
          app: "merchant",
        });
      } finally {
        setLoading(false);
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
    { label: "Create Discount", icon: "Tag", href: "/dashboard/promotions", available: true },
    {
      label: "Create Invoice",
      icon: "FileText",
      href: "/dashboard/finance",
      available: true,
    },
    { label: "Send Broadcast", icon: "Send", href: "/dashboard/campaigns", available: true },
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

  // Loading state
  if (loading) {
    return (
      <div 
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
        role="region"
        aria-label="Quick actions loading"
      >
        {[...Array(6)].map((_, i) => (
          <div 
            key={i}
            className="bg-white-1 border border-gray-100 rounded-xl p-4 flex flex-col items-center gap-3 h-full animate-pulse"
          >
            <div className="w-10 h-10 rounded-full bg-white" />
            <div className="h-4 w-20 bg-white rounded" />
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div 
        className="mb-8 p-4 rounded-xl border border-status-danger/20 bg-status-danger/5 text-center"
        role="alert"
        aria-live="polite"
      >
        <Icon name="AlertCircle" className="h-8 w-8 text-status-danger mx-auto mb-2" />
        <p className="text-sm text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div 
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
      role="region"
      aria-label="Quick actions"
    >
      {actions.map((action) => (
        <Link
          key={action.label}
          href={action.available ? action.href : "#"}
          className={`block group ${!action.available ? "cursor-not-allowed opacity-50" : ""}`}
          onClick={(e: React.MouseEvent<HTMLAnchorElement>) => !action.available && e.preventDefault()}
          aria-label={action.label}
        >
          <div className="bg-white-1 border border-gray-100 rounded-xl p-4 flex flex-col items-center gap-3 hover:border-green-500/30 hover:bg-white-2 transition-all text-center h-full focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2">
            <div className="w-10 h-10 rounded-full bg-white-2 flex items-center justify-center text-gray-900 group-hover:scale-110 transition-transform group-hover:bg-green-500 group-hover:text-white">
              <Icon name={action.icon} size={20} />
            </div>
            <span className="text-xs font-medium text-gray-500 group-hover:text-gray-900 transition-colors">
              {action.label}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
};
