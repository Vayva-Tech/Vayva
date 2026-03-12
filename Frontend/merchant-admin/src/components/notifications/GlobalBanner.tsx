import { logger, Notification } from "@vayva/shared";
import React, { useState, useEffect } from "react";
import { Button, Icon, cn } from "@vayva/ui";

import { apiJson } from "@/lib/api-client-shared";

interface NotificationsResponse {
  items: Notification[];
}

export const GlobalBanner = () => {
  const [banners, setBanners] = useState<Notification[]>([]);

  useEffect(() => {
    // Fetch only critical or action_required notifications that should be banners
    // For simplicity, reusing the search endpoint, but filtering client side for demo
    const fetchBanners = async () => {
      try {
        // Fetch unread critical/action_required items
        const res = await apiJson<NotificationsResponse>(
          "/api/merchant/notifications?status=unread&limit=5",
        );
        const items = res.items || [];

        const activeBanners = items.filter(
          (n: any) =>
            (n.type === "critical" || n.type === "action_required") &&
            n.channels.includes("banner"),
        );

        setBanners(activeBanners);
      } catch (err: unknown) {
        const _errMsg = err instanceof Error ? err.message : String(err);
        logger.warn("[LOAD_BANNERS_ERROR]", {
          error: _errMsg,
          app: "merchant",
        });
      }
    };

    void fetchBanners();
  }, []);

  if (banners.length === 0) return null;

  // Show only the most critical one at a time to avoid stacking too much
  const banner = banners[0];

  const isCritical = banner.type === "critical";

  return (
    <div
      className={cn(
        "w-full px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm animate-in slide-in-from-top duration-300",
        isCritical ? "bg-red-600 text-white" : "bg-amber-100 text-amber-900",
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "p-1.5 rounded-full shrink-0",
            isCritical ? "bg-background/20" : "bg-amber-200",
          )}
        >
          <Icon name={isCritical ? "TriangleAlert" : "CircleAlert"} size={16} />
        </div>
        <div>
          <span className="font-bold mr-2">{banner.title}:</span>
          <span className={isCritical ? "text-red-100" : "text-amber-800"}>
            {banner.message}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
        {banner.actionUrl && (
          <a
            href={banner.actionUrl}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap text-center flex-1 sm:flex-none",
              isCritical
                ? "bg-background text-red-600 hover:bg-white/40"
                : "bg-amber-900 text-white hover:bg-amber-800",
            )}
          >
            {banner.actionLabel || "Fix Issue"}
          </a>
        )}
        {!isCritical && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-black/5 rounded-lg transition-colors p-0"
          >
            <Icon name="X" size={16} />
          </Button>
        )}
      </div>
    </div>
  );
};
