"use client";

import { logger } from "@vayva/shared";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Check, Bell, CheckCircle, Warning, Spinner as Loader2 } from "@phosphor-icons/react";
import { toast } from "sonner";
import Link from "next/link";
import { Button, Icon } from "@vayva/ui";

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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">Stay updated with your store activities</p>
        </div>
        <Button
          onClick={markAllRead}
          variant="outline"
          className="rounded-xl border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium"
        >
          <Icon name="Check" size={16} className="mr-2 text-gray-400" />
          Mark All Read
        </Button>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryWidget
          icon={<Bell size={18} />}
          label="Total Notifications"
          value={String(notifications.length)}
          trend="+5 new"
          positive
        />
        <SummaryWidget
          icon={<CheckCircle size={18} />}
          label="Read"
          value={String(notifications.filter((n) => n.isRead).length)}
          trend="This week"
          positive
        />
        <SummaryWidget
          icon={<Warning size={18} />}
          label="Unread"
          value={String(notifications.filter((n) => !n.isRead).length)}
          trend={notifications.filter((n) => !n.isRead).length > 0 ? "Action needed" : "All caught up"}
          positive={notifications.filter((n) => !n.isRead).length === 0}
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-6 border-b border-gray-200 pb-3">
        <button
          onClick={() => setStatusFilter("unread")}
          className={`text-sm font-medium border-b-2 pb-3 -mb-3.5 transition-colors ${
            statusFilter === "unread"
              ? "border-green-500 text-green-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Unread
        </button>
        <button
          onClick={() => setStatusFilter("all")}
          className={`text-sm font-medium border-b-2 pb-3 -mb-3.5 transition-colors ${
            statusFilter === "all"
              ? "border-green-500 text-green-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          All Notifications
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Recent Notifications</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {notifications.length} notification{notifications.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>
        
        {loading && notifications.length === 0 ? (
          <div className="flex justify-center items-center h-64" aria-live="polite" role="status">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
            <span className="sr-only">Loading notifications...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell size={32} className="mx-auto mb-2 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900 mb-1">No notifications</h3>
            <p className="text-sm text-gray-500">You're all caught up! New updates will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 hover:bg-gray-50 transition-colors flex gap-4 ${!n.isRead ? "bg-blue-50/50" : ""}`}
              >
                <div
                  className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    n.severity === "critical"
                      ? "bg-red-500"
                      : n.severity === "success"
                        ? "bg-green-500"
                        : n.severity === "warning"
                          ? "bg-orange-500"
                          : "bg-blue-500"
                  }`}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3
                      className={`text-sm ${!n.isRead ? "font-bold text-gray-900" : "font-medium text-gray-600"}`}
                    >
                      {n.title}
                    </h3>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                      {formatDistanceToNow(new Date(n.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{n.body}</p>

                  <div className="mt-3 flex items-center gap-3">
                    {n.actionUrl && (
                      <Link
                        href={n.actionUrl}
                        onClick={() => markAsRead(n.id)}
                        className="text-xs font-medium text-green-600 hover:text-green-700"
                      >
                        View Details →
                      </Link>
                    )}
                    {!n.isRead && (
                      <button
                        onClick={() => markAsRead(n.id)}
                        className="text-xs text-gray-500 hover:text-gray-700 font-medium p-0 h-auto"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {nextCursor && (
              <div className="p-4 border-t border-gray-100 text-center">
                <Button
                  onClick={() => fetchNotifications(false)}
                  disabled={loading}
                  variant="outline"
                  className="border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium"
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

// Summary Widget Component
function SummaryWidget({
  icon,
  label,
  value,
  trend,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  positive: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 tracking-tight mt-1">
            {value}
          </p>
          <p className={`text-xs mt-1 ${positive ? 'text-green-600' : 'text-orange-600'}`}>
            {trend}
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-gray-100 text-gray-600">
          {icon}
        </div>
      </div>
    </div>
  );
}
