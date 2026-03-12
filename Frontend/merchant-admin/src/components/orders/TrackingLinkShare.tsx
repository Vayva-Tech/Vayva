import React, { useState } from "react";
import { Button, Icon } from "@vayva/ui";
import { cn } from "@/lib/utils";

interface TrackingLinkShareProps {
  trackingCode: string | null | undefined;
  trackingUrl: string | null | undefined;
  recipientPhone?: string | null;
  storeName?: string;
  storeSlug?: string;
  customDomain?: string | null;
  orderId?: string;
  className?: string;
}

export const TrackingLinkShare: React.FC<TrackingLinkShareProps> = ({
  trackingCode,
  trackingUrl,
  recipientPhone,
  storeName,
  storeSlug,
  customDomain,
  orderId,
  className,
}) => {
  const [copied, setCopied] = useState(false);

  if (!trackingCode && !trackingUrl) {
    return null;
  }

  // Generate tracking link - uses merchant's custom domain if available
  const generateTrackingLink = (): string => {
    // Priority: custom domain > store subdomain > current origin
    let baseUrl: string;
    
    if (customDomain) {
      baseUrl = customDomain.startsWith("http") ? customDomain : `https://${customDomain}`;
    } else if (storeSlug) {
      baseUrl = `https://${storeSlug}.vayva.co`;
    } else {
      baseUrl = typeof window !== "undefined"
        ? window.location.origin.replace(/\/admin|\/merchant/, "")
        : process.env.NEXT_PUBLIC_STOREFRONT_URL || "";
    }
    
    const params = new URLSearchParams();
    if (trackingCode) params.set("code", trackingCode);
    if (storeSlug) params.set("store", storeSlug);
    
    return `${baseUrl}/tracking?${params.toString()}`;
  };

  // Generate live tracking link for merchant dashboard
  const generateLiveTrackingLink = (): string => {
    if (orderId) {
      return `/orders/live-tracking?order=${orderId}`;
    }
    return generateTrackingLink();
  };

  const trackingLink = generateTrackingLink();
  const liveTrackingLink = generateLiveTrackingLink();

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(trackingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: show the link for manual copying
    }
  };

  // Share via WhatsApp
  const handleWhatsAppShare = () => {
    if (!recipientPhone) return;
    
    const message = encodeURIComponent(
      `Hi! Your delivery from ${storeName || "our store"} is on its way! 🚚\n\n` +
      `Track your order in real-time: ${trackingLink}\n\n` +
      `Thank you for shopping with us!`
    );
    
    // Clean phone number (remove non-numeric chars)
    const cleanPhone = recipientPhone.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
  };

  // Share via SMS
  const handleSMSShare = () => {
    if (!recipientPhone) return;
    
    const message = encodeURIComponent(
      `Your delivery is on its way! Track here: ${trackingLink}`
    );
    
    window.open(`sms:${recipientPhone}?body=${message}`, "_blank");
  };

  return (
    <div className={cn("bg-blue-50/50 rounded-2xl p-4 border border-blue-100", className)}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <Icon name="Truck" size={16} className="text-blue-600" />
        </div>
        <div>
          <h4 className="font-bold text-sm text-blue-900">Delivery Tracking</h4>
          <p className="text-xs text-blue-600">Share tracking link with customer</p>
        </div>
      </div>

      {/* Live Tracking Link for Merchant */}
      {orderId && (
        <div className="bg-emerald-50 rounded-xl p-3 mb-3 border border-emerald-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-600 font-medium">Live Tracking Dashboard</p>
              <p className="text-xs text-emerald-500">View real-time rider location</p>
            </div>
            <a
              href={liveTrackingLink}
              className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-medium flex items-center gap-1"
            >
              <Icon name="MapPin" size={12} />
              View Live Map
            </a>
          </div>
        </div>
      )}
      {trackingCode && (
        <div className="flex items-center justify-between bg-white rounded-xl p-3 mb-3 border border-blue-100">
          <div>
            <p className="text-xs text-gray-500">Tracking Code</p>
            <p className="font-mono font-bold text-blue-900">{trackingCode}</p>
          </div>
          {trackingUrl && (
            <a
              href={trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Icon name="ExternalLink" size={12} />
              View Map
            </a>
          )}
        </div>
      )}

      {/* Tracking Link Display */}
      <div className="bg-white rounded-xl p-3 mb-3 border border-blue-100">
        <p className="text-xs text-gray-500 mb-1">Customer Tracking URL</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={trackingLink}
            readOnly
            className="flex-1 text-xs font-mono bg-gray-50 rounded-lg px-2 py-1.5 border border-gray-200 truncate"
          />
          <Button
            onClick={handleCopy}
            variant="outline"
            size="sm"
            className={cn(
              "px-3 h-auto text-xs font-bold rounded-lg",
              copied && "bg-green-50 text-green-600 border-green-200"
            )}
          >
            <Icon name={copied ? "Check" : "Copy"} size={14} className="mr-1" />
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>

      {/* Share Buttons */}
      {recipientPhone && (
        <div className="flex gap-2">
          <Button
            onClick={handleWhatsAppShare}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-xs gap-1.5"
            size="sm"
          >
            <Icon name="MessageCircle" size={14} />
            WhatsApp
          </Button>
          <Button
            onClick={handleSMSShare}
            variant="outline"
            className="flex-1 rounded-xl font-bold text-xs gap-1.5"
            size="sm"
          >
            <Icon name="MessageSquare" size={14} />
            SMS
          </Button>
        </div>
      )}
    </div>
  );
};
