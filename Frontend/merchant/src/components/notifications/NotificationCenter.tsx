"use client";
import React, { useEffect, useState } from "react";
import { Notification, NotificationType, logger } from "@vayva/shared";
import { Button, Icon, cn } from "@vayva/ui";
import Link from "next/link";
import { NotificationItem } from "./NotificationItem";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

import { apiJson } from "@/lib/api-client-shared";

interface NotificationsResponse {
  items: Notification[];
}

export const NotificationCenter = ({
  isOpen,
  onClose,
}: NotificationCenterProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread" | "critical">("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      void fetchNotifications();
    }
  }, [isOpen, filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      let url = "/notifications?limit=50";

      if (filter === "unread") {
        url += "&unread=true";
      }

      const res = await apiJson<NotificationsResponse>(url);
      setNotifications(res.items || []);
    } catch (err: unknown) {
      const _errMsg = err instanceof Error ? err.message : String(err);
      logger.error("[FETCH_NOTIFICATION_CENTER_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await apiJson<{ success: boolean }>("/notifications/mark-read", {
        method: "POST",
        body: JSON.stringify({ notificationId: id }),
      });
      // Improve UI update: mark local state as read immediately
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, isRead: true, readAt: new Date().toISOString() }
            : n,
        ),
      );
      // Trigger count refetch if NotificationBell is listening to a shared state or just refetch globally
      // For now, local state update is enough, the bell will poll or we could use a custom event.
      window.dispatchEvent(new CustomEvent("notifications:updated"));
    } catch (err: unknown) {
      const _errMsg = err instanceof Error ? err.message : String(err);
      logger.error("[MARK_READ_ERROR]", { error: _errMsg, app: "merchant" });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiJson<{ success: boolean }>("/notifications/mark-all-read", {
        method: "POST",
      });
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          isRead: true,
          readAt: new Date().toISOString(),
        })),
      );
      window.dispatchEvent(new CustomEvent("notifications:updated"));
    } catch (err: unknown) {
      const _errMsg = err instanceof Error ? err.message : String(err);
      logger.error("[MARK_ALL_READ_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-16 right-4 bottom-4 w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-300">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h3 className="font-bold text-gray-900">Notifications</h3>
            <div className="flex gap-2 mt-2">
              {(["all", "unread", "critical"] as const).map((f) => (
                <Button
                  key={f}
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilter(f)}
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full transition-colors h-auto min-h-0",
                    filter === f
                      ? "bg-black text-white hover:bg-black/90 hover:text-white"
                      : "bg-white/40 text-gray-400 hover:bg-border",
                  )}
                >
                  {f}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleMarkAllRead}
              title="Mark all as read"
            >
              <Icon
                name="CheckCheck"
                size={16}
                className="text-gray-400"
              />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Icon name="X" size={16} className="text-gray-400" />
            </Button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto min-h-0 bg-white">
          {loading ? (
            <div className="p-8 text-center text-gray-400 flex flex-col items-center">
              <Icon name="Loader" size={24} className="animate-spin mb-2" />
              <p className="text-xs">Loading updates...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-400 flex flex-col items-center justify-center h-full">
              <div className="w-12 h-12 bg-white/40 rounded-full flex items-center justify-center mb-3">
                <Icon name="BellOff" size={20} className="opacity-50" />
              </div>
              <p className="text-sm font-medium text-gray-900">
                All caught up
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Check back later for updates.
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={handleMarkRead}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-white/40 border-t border-gray-100 text-center">
          <Link
            href="/dashboard/settings/notifications"
            className="text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors"
          >
            Manage Preferences
          </Link>
        </div>
      </div>
    </>
  );
};
