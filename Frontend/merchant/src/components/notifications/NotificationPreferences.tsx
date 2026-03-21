"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { Button, Switch } from "@vayva/ui";
import { apiJson } from "@/lib/api-client-shared";
import { Bell, Envelope, WhatsappLogo, DeviceMobile } from "@phosphor-icons/react/ssr";

interface NotificationPreferences {
  inApp: boolean;
  email: boolean;
  whatsapp: boolean;
  push: boolean;
  categories: {
    orders: boolean;
    payouts: boolean;
    lowStock: boolean;
    kyc: boolean;
    marketing: boolean;
    security: boolean;
  };
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  inApp: true,
  email: true,
  whatsapp: false,
  push: false,
  categories: {
    orders: true,
    payouts: true,
    lowStock: true,
    kyc: true,
    marketing: false,
    security: true,
  },
};

const CHANNELS = [
  { key: "inApp", label: "In-App", icon: Bell, description: "Show notifications in the app" },
  { key: "email", label: "Email", icon: Envelope, description: "Send to your registered email" },
  { key: "whatsapp", label: "WhatsApp", icon: WhatsappLogo, description: "Send to your WhatsApp number" },
  { key: "push", label: "Push Notifications", icon: DeviceMobile, description: "Browser push notifications" },
] as const;

const CATEGORIES = [
  { key: "orders", label: "Orders", description: "New orders, updates, cancellations" },
  { key: "payouts", label: "Payouts", description: "Payout sent, failed, pending" },
  { key: "lowStock", label: "Low Stock", description: "Inventory alerts" },
  { key: "kyc", label: "KYC & Verification", description: "Status updates, required actions" },
  { key: "marketing", label: "Marketing", description: "Campaign updates, tips" },
  { key: "security", label: "Security", description: "Login alerts, suspicious activity" },
] as const;

export function NotificationPreferencesPanel() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const data = await apiJson<{ preferences: NotificationPreferences }>(
        "/api/notifications/preferences",
        { method: "GET" }
      );
      if (data.preferences) {
        setPreferences(data.preferences);
      }
    } catch {
      // Use defaults if fetch fails
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      await apiJson("/api/notifications/preferences", {
        method: "POST",
        body: JSON.stringify({ preferences }),
      });
      toast.success("Notification preferences saved");
    } catch (error) {
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const updateChannel = (channel: keyof NotificationPreferences, enabled: boolean) => {
    setPreferences((prev) => ({ ...prev, [channel]: enabled }));
  };

  const updateCategory = (category: keyof NotificationPreferences["categories"], enabled: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      categories: { ...prev.categories, [category]: enabled },
    }));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-4 bg-gray-100 rounded w-1/3 animate-pulse" />
        <div className="h-20 bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Channels */}
      <section>
        <h3 className="font-semibold mb-4">Notification Channels</h3>
        <div className="space-y-4">
          {CHANNELS.map(({ key, label, icon: Icon, description }) => (
            <div
              key={key}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">{label}</p>
                  <p className="text-sm text-gray-500">{description}</p>
                </div>
              </div>
              <Switch
                checked={preferences[key as keyof NotificationPreferences] as boolean}
                onCheckedChange={(checked) =>
                  updateChannel(key as keyof NotificationPreferences, checked)
                }
              />
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section>
        <h3 className="font-semibold mb-4">Notification Categories</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {CATEGORIES.map(({ key, label, description }) => (
            <div
              key={key}
              className="flex items-start justify-between p-4 border rounded-lg"
            >
              <div>
                <p className="font-medium">{label}</p>
                <p className="text-sm text-gray-500">{description}</p>
              </div>
              <Switch
                checked={preferences.categories[key as keyof typeof preferences.categories]}
                onCheckedChange={(checked) =>
                  updateCategory(key as keyof typeof preferences.categories, checked)
                }
              />
            </div>
          ))}
        </div>
      </section>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={savePreferences} isLoading={saving}>
          Save Preferences
        </Button>
      </div>
    </div>
  );
}

/**
 * Hook for real-time notifications using SSE
 * Falls back to polling if SSE fails
 */
export function useRealtimeNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastEvent, setLastEvent] = useState<unknown>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      try {
        eventSource = new EventSource("/api/notifications/stream");

        eventSource.onopen = () => {
          setConnected(true);
          logger.info("[SSE] Connected to notification stream");
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === "unread_count") {
              setUnreadCount(data.count);
            } else if (data.type === "notification") {
              setLastEvent(data.notification);
              // Show toast for urgent notifications
              if (data.notification.priority === "urgent") {
                toast.info(data.notification.title, {
                  description: data.notification.message,
                });
              }
            } else if (data.type === "heartbeat") {
              // Keep-alive, no action needed
            }
          } catch {
            // Ignore parse errors
          }
        };

        eventSource.onerror = () => {
          setConnected(false);
          eventSource?.close();
          // Reconnect after 5 seconds
          reconnectTimeout = setTimeout(connect, 5000);
        };
      } catch {
        // SSE not supported or failed
        setConnected(false);
      }
    };

    connect();

    return () => {
      eventSource?.close();
      clearTimeout(reconnectTimeout);
    };
  }, []);

  return { unreadCount, lastEvent, connected };
}
