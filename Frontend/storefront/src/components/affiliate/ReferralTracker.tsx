"use client";
import { Button } from "@vayva/ui";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/context/StoreContext";

const REFERRAL_COOKIE_NAME = "vayva_referral_code";
const REFERRAL_COOKIE_DURATION_DAYS = 30;

/**
 * AffiliateReferralTracker
 * 
 * This component tracks affiliate referrals by:
 * 1. Detecting ?ref=CODE in the URL
 * 2. Setting a cookie to remember the referral
 * 3. Sending the referral info to the backend when a purchase is made
 * 
 * Usage: Include this component in your layout or main page to enable tracking
 */
export function AffiliateReferralTracker() {
  const { store } = useStore();
  const searchParams = useSearchParams();
  const [tracked, setTracked] = useState(false);

  useEffect(() => {
    if (!store?.id || tracked) return;

    const refCode = searchParams.get("ref");
    if (!refCode) return;

    // Validate referral code format (alphanumeric, 6-20 chars)
    if (!/^[a-zA-Z0-9_-]{6,20}$/.test(refCode)) {
      console.warn("[Affiliate] Invalid referral code format:", refCode);
      return;
    }

    // Check if we already have a different referral code
    const existingCode = getReferralCookie();
    
    // Don't override an existing referral unless it's a new session with explicit ref param
    if (existingCode && existingCode !== refCode) {
      console.warn("[Affiliate] Existing referral exists:", existingCode);
      // Still update if user explicitly clicked a new referral link
    }

    // Set the referral cookie
    setReferralCookie(refCode);
    
    // Track the click in backend
    trackReferralClick(refCode, store.id);
    
    queueMicrotask(() => setTracked(true));
  }, [store?.id, searchParams, tracked]);

  // This component doesn't render anything visible
  return null;
}

/**
 * Get the current referral code from cookie
 */
export function getReferralCookie(): string | null {
  if (typeof document === "undefined") return null;
  
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === REFERRAL_COOKIE_NAME) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

/**
 * Set referral cookie with expiration
 */
function setReferralCookie(code: string): void {
  if (typeof document === "undefined") return;
  
  const expires = new Date();
  expires.setDate(expires.getDate() + REFERRAL_COOKIE_DURATION_DAYS);
  
  const secure = window.location.protocol === "https:" ? "; secure" : "";
  const sameSite = "; samesite=lax";
  
  document.cookie = `${REFERRAL_COOKIE_NAME}=${encodeURIComponent(code)}; expires=${expires.toUTCString()}; path=/${secure}${sameSite}`;
  
  console.warn("[Affiliate] Referral cookie set:", code);
}

/**
 * Clear referral cookie (called after successful purchase attribution)
 */
export function clearReferralCookie(): void {
  if (typeof document === "undefined") return;
  
  document.cookie = `${REFERRAL_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

/**
 * Track referral click in backend via storefront API
 */
async function trackReferralClick(code: string, storeId: string): Promise<void> {
  try {
    await fetch("/api/affiliate/track-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        referralCode: code,
        storeId,
        source: getTrafficSource(),
        landingPage: window.location.pathname,
      }),
    });
  } catch (error) {
    // Silent fail - don't break user experience
    console.error("[Affiliate] Failed to track click:", error);
  }
}

/**
 * Get traffic source information
 */
function getTrafficSource(): string {
  const referrer = document.referrer;
  if (!referrer) return "direct";
  
  try {
    const url = new URL(referrer);
    const hostname = url.hostname.toLowerCase();
    
    if (hostname.includes("facebook.com")) return "facebook";
    if (hostname.includes("instagram.com")) return "instagram";
    if (hostname.includes("twitter.com") || hostname.includes("x.com")) return "twitter";
    if (hostname.includes("whatsapp.com")) return "whatsapp";
    if (hostname.includes("google.com")) return "google";
    if (hostname.includes("youtube.com")) return "youtube";
    if (hostname.includes("tiktok.com")) return "tiktok";
    
    return "other";
  } catch {
    return "unknown";
  }
}

/**
 * AffiliateLinkGenerator
 * Component for affiliates to generate their referral links
 */
interface AffiliateLinkGeneratorProps {
  baseUrl: string;
  referralCode: string;
  productId?: string;
}

export function AffiliateLinkGenerator({ 
  baseUrl, 
  referralCode, 
  productId 
}: AffiliateLinkGeneratorProps) {
  const [copied, setCopied] = useState(false);
  
  const link = productId 
    ? `${baseUrl}/products/${productId}?ref=${referralCode}`
    : `${baseUrl}?ref=${referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={link}
        readOnly
        className="flex-1 px-3 py-2 bg-gray-50 border rounded-md text-sm"
      />
      <Button
        onClick={copyLink}
        className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors"
      >
        {copied ? "Copied!" : "Copy"}
      </Button>
    </div>
  );
}

