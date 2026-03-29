import { logger } from "@vayva/shared";
import React, { useEffect, useState } from "react";
import { Button, Icon, cn } from "@vayva/ui";

interface NotificationBellProps {
  onClick: () => void;
  isOpen: boolean;
}

import { apiJson } from "@/lib/api-client-shared";

interface UnreadCountResponse {
  count: number;
}

export const NotificationBell = ({
  onClick,
  isOpen,
}: NotificationBellProps) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Poll for unread count
    const fetchCount = async () => {
      try {
        const data = await apiJson<UnreadCountResponse>(
          "/notifications/unread-count",
        );
        setUnreadCount(data?.count || 0);
      } catch (err: unknown) {
        const _errMsg = err instanceof Error ? err.message : String(err);
        logger.error("[FETCH_NOTIFICATION_COUNT_ERROR]", {
          error: _errMsg,
          app: "merchant",
        });
      }
    };

    void fetchCount();

    const handleUpdate = () => void fetchCount();
    window.addEventListener("notifications:updated", handleUpdate);

    const interval = setInterval(() => void fetchCount(), 30000); // 30s poll
    return () => {
      clearInterval(interval);
      window.removeEventListener("notifications:updated", handleUpdate);
    };
  }, []);

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "relative text-gray-400 hover:text-gray-900 transition-colors",
        isOpen && "bg-white/40 text-gray-900",
      )}
      onClick={onClick}
    >
      <Icon name="Bell" size={20} />
      {unreadCount > 0 && (
        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white animate-in zoom-in duration-300" />
      )}
    </Button>
  );
};
