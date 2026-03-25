"use client";

import React from "react";
import { useStore } from "@/context/StoreContext";
import { AffiliateReferralTracker, AffiliateWidget } from "@/components/affiliate";

const AFFILIATE_ADDON_ID = "vayva.affiliate";

function hasAddon(store: any, id: string): boolean {
  const enabled = Array.isArray(store?.enabledAddOns) ? store.enabledAddOns : [];
  return enabled.includes(id);
}

function getAffiliateConfig(store: any): {
  widgetEnabled: boolean;
  widgetVariant: "floating" | "footer" | "inline";
  widgetPosition: "bottom-right" | "bottom-left";
  trackingEnabled: boolean;
} {
  const settings = (store?.settings && typeof store.settings === "object")
    ? (store.settings as Record<string, unknown>)
    : {};
  const cfg =
    settings.affiliateAddon && typeof settings.affiliateAddon === "object"
      ? (settings.affiliateAddon as Record<string, unknown>)
      : {};

  const widgetEnabled =
    typeof cfg.widgetEnabled === "boolean" ? cfg.widgetEnabled : true;
  const trackingEnabled =
    typeof cfg.trackingEnabled === "boolean" ? cfg.trackingEnabled : true;

  const widgetVariant =
    cfg.widgetVariant === "footer" || cfg.widgetVariant === "inline"
      ? (cfg.widgetVariant as "footer" | "inline")
      : "floating";
  const widgetPosition =
    cfg.widgetPosition === "bottom-left" ? "bottom-left" : "bottom-right";

  return { widgetEnabled, widgetVariant, widgetPosition, trackingEnabled };
}

export function StorefrontAddOnMounts() {
  const { store } = useStore();
  if (!store) return null;

  const affiliateEnabled = hasAddon(store, AFFILIATE_ADDON_ID);
  if (!affiliateEnabled) return null;

  const cfg = getAffiliateConfig(store);

  return (
    <>
      {/* Enables ?ref= tracking and click attribution */}
      {cfg.trackingEnabled ? <AffiliateReferralTracker /> : null}
      {/* Promotes the affiliate program; can be moved/hidden via config later */}
      {cfg.widgetEnabled ? (
        <AffiliateWidget variant={cfg.widgetVariant} position={cfg.widgetPosition} />
      ) : null}
    </>
  );
}

