"use client";

import { logger } from "@vayva/shared";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Check, Spinner as Loader2 } from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import Link from "next/link";
import { Button, cn } from "@vayva/ui";
import { EmptyState } from "@/components/ui/empty-state";

interface Notification {
  id: string;
  title: string;
  body: string;
  severity: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

import { apiJson } from "@/lib/api-client-shared";

interface NotificationsResponse {
  items: Notification[];
  next_cursor?: string | null;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "unread">("unread");
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const fetchNotifications = async (reset = false) => {
    try {
      setLoading(true);
      const cursorParam = reset
        ? ""
        : nextCursor
          ? `&cursor=${nextCursor}`
          : "";

      const res = await apiJson<NotificationsResponse>(
        `/api/merchant/notifications?status=${statusFilter}&limit=20${cursorParam}`,
      );

      if (res && res.items) {
        if (reset) {
          setNotifications(res.items);
        } else {
          setNotifications((prev) => [...prev, ...res.items]);
        }
        setNextCursor(res.next_cursor || null);
      }
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[FETCH_NOTIFICATIONS_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error(_errMsg || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchNotifications(true);
  }, [statusFilter]);

  const markAsRead = async (id: string) => {
    try {
      await apiJson<{ success: boolean }>(
        "/api/merchant/notifications/mark-read",
        {
          method: "POST",
          body: JSON.stringify({ ids: [id] }),
        },
      );
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[MARK_READ_ERROR]", {
        error: _errMsg,
        id,
        app: "merchant",
      });
      toast.error("Failed to mark notification as read");
    }
  };

  const markAllRead = async () => {
    try {
      await apiJson<{ success: boolean }>(
        "/api/merchant/notifications/mark-read",
        {
          method: "POST",
          body: JSON.stringify({ mark_all: true }),
        },
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[MARK_ALL_READ_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error("Failed to mark all as read");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            Notifications
          </h1>
          <p className="text-sm text-text-tertiary mt-1">
            Stay updated with your store activity.
          </p>
        </div>
        <Button
          onClick={markAllRead}
          variant="outline"
          className="bg-transparent hover:bg-primary/10 text-primary hover:text-primary/80 border-transparent shadow-none"
        >
          <Check className="w-4 h-4 mr-2" />
          Mark all as read
        </Button>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 border-b border-border pb-1">
        <Button
          variant="ghost"
          onClick={() => setStatusFilter("unread")}
          className={cn(
            "rounded-none border-b-2 px-4 py-2 font-medium hover:bg-transparent h-auto",
            statusFilter === "unread"
              ? "border-primary text-primary"
              : "border-transparent text-text-tertiary hover:text-text-secondary hover:border-border",
          )}
        >
          Unread
        </Button>
        <Button
          variant="ghost"
          onClick={() => setStatusFilter("all")}
          className={cn(
            "rounded-none border-b-2 px-4 py-2 font-medium hover:bg-transparent h-auto",
            statusFilter === "all"
              ? "border-primary text-primary"
              : "border-transparent text-text-tertiary hover:text-text-secondary hover:border-border",
          )}
        >
          All Notifications
        </Button>
      </div>

      {/* List */}
      <div className="bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-sm overflow-hidden min-h-[400px]">
        {loading && notifications.length === 0 ? (
          <div className="flex justify-center items-center h-64" aria-live="polite" role="status">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="sr-only">Loading notifications...</span>
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            title="No notifications"
            description="You're all caught up! New updates will appear here."
            icon="Bell"
          />
        ) : (
          <div className="divide-y divide-border/40">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 hover:bg-background/30 transition-colors flex gap-4 ${!n.isRead ? "bg-primary/5" : ""}`}
              >
                <div
                  className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    n.severity === "critical"
                      ? "bg-destructive"
                      : n.severity === "success"
                        ? "bg-success"
                        : n.severity === "warning"
                          ? "bg-warning"
                          : "bg-primary"
                  }`}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3
                      className={`text-sm ${!n.isRead ? "font-bold text-text-primary" : "font-medium text-text-secondary"}`}
                    >
                      {n.title}
                    </h3>
                    <span className="text-xs text-text-tertiary whitespace-nowrap ml-2">
                      {formatDistanceToNow(new Date(n.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary mt-1">{n.body}</p>

                  <div className="mt-3 flex items-center gap-3">
                    {n.actionUrl && (
                      <Link
                        href={n.actionUrl}
                        onClick={() => markAsRead(n.id)}
                        className="text-xs font-medium text-primary hover:text-primary/80"
                      >
                        View Details
                      </Link>
                    )}
                    {!n.isRead && (
                      <Button
                        variant="link"
                        onClick={() => markAsRead(n.id)}
                        className="text-xs text-text-tertiary hover:text-text-secondary p-0 h-auto font-normal"
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {nextCursor && (
              <div className="p-4 text-center">
                <Button
                  variant="ghost"
                  onClick={() => fetchNotifications(false)}
                  disabled={loading}
                  className="text-sm text-primary hover:text-primary/80 font-medium disabled:opacity-50 hover:bg-primary/10"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading
                    </>
                  ) : (
                    "Load More"
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
