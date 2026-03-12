import { TrackingInfo } from "@/types/tracking";
import { reportError } from "@vayva/templates/lib/error";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

export const TrackingService = {
  /**
   * Get delivery tracking information by tracking code
   */
  getTrackingInfo: async (code: string): Promise<TrackingInfo | null> => {
    try {
      const response = await fetch(
        `${API_BASE}/public/tracking?code=${encodeURIComponent(code)}`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.tracking) {
        return data.tracking;
      }
      return null;
    } catch (e) {
      reportError(e, { method: "getTrackingInfo", code });
      return null;
    }
  },

  /**
   * Generate a shareable tracking URL using merchant's custom domain
   * Falls back to store subdomain or current origin if no custom domain
   */
  generateTrackingUrl: (
    trackingCode: string, 
    options?: { 
      customDomain?: string; 
      storeSlug?: string;
      useMerchantDomain?: boolean;
    }
  ): string => {
    const { customDomain, storeSlug, useMerchantDomain = true } = options || {};
    
    // Priority: custom domain > store subdomain > current origin
    let baseUrl: string;
    
    if (useMerchantDomain && customDomain) {
      baseUrl = customDomain.startsWith("http") ? customDomain : `https://${customDomain}`;
    } else if (useMerchantDomain && storeSlug) {
      baseUrl = `https://${storeSlug}.vayva.co`;
    } else {
      baseUrl = typeof window !== "undefined" 
        ? window.location.origin 
        : process.env.NEXT_PUBLIC_APP_URL || "";
    }
    
    const params = new URLSearchParams();
    params.set("code", trackingCode);
    
    return `${baseUrl}/tracking?${params.toString()}`;
  },

  /**
   * Generate a white-label tracking URL for the merchant's own domain
   * This creates a URL that appears to come from the merchant's website
   */
  generateWhiteLabelUrl: (
    trackingCode: string,
    merchantDomain: string,
    path: string = "/track"
  ): string => {
    const domain = merchantDomain.startsWith("http") 
      ? merchantDomain 
      : `https://${merchantDomain}`;
    return `${domain}${path}?code=${encodeURIComponent(trackingCode)}`;
  },

  /**
   * Share tracking link via WhatsApp using merchant's domain
   */
  shareViaWhatsApp: (
    trackingCode: string, 
    phone: string, 
    options?: { storeName?: string; customDomain?: string; storeSlug?: string }
  ): void => {
    const { storeName, customDomain, storeSlug } = options || {};
    const trackingUrl = TrackingService.generateTrackingUrl(trackingCode, { 
      customDomain, 
      storeSlug 
    });
    const message = encodeURIComponent(
      `Hi! Your delivery from ${storeName || "our store"} is on its way. ` +
      `Track your order here: ${trackingUrl}`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  },

  /**
   * Share tracking link via SMS using merchant's domain
   */
  shareViaSMS: (
    trackingCode: string, 
    phone: string, 
    options?: { storeName?: string; customDomain?: string; storeSlug?: string }
  ): void => {
    const { storeName, customDomain, storeSlug } = options || {};
    const trackingUrl = TrackingService.generateTrackingUrl(trackingCode, { 
      customDomain, 
      storeSlug 
    });
    const message = encodeURIComponent(
      `Your delivery from ${storeName || "our store"} is on its way. ` +
      `Track here: ${trackingUrl}`
    );
    window.open(`sms:${phone}?body=${message}`, "_blank");
  },

  /**
   * Copy tracking link to clipboard
   */
  copyTrackingLink: async (
    trackingCode: string,
    options?: { customDomain?: string; storeSlug?: string }
  ): Promise<boolean> => {
    try {
      const trackingUrl = TrackingService.generateTrackingUrl(trackingCode, options);
      await navigator.clipboard.writeText(trackingUrl);
      return true;
    } catch {
      return false;
    }
  },
};
