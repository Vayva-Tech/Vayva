"use client";

import { motion } from "framer-motion";
import { Input } from "@vayva/ui";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Bell,
  Envelope as Mail,
  Warning as AlertTriangle,
  ShoppingBag,
  Wallet,
  WarningOctagon as ShieldAlert,
} from "@phosphor-icons/react/ssr";
import { logger } from "@vayva/shared";
import { BackButton } from "@/components/ui/BackButton";

import { apiJson } from "@/lib/api-client-shared";
import { PageHeader } from "@/components/layout/PageHeader";

interface NotificationPrefs {
  channels: {
    in_app: boolean;
    banner: boolean;
    email: boolean;
  };
  categories: {
    orders: boolean;
    payments: boolean;
    account: boolean;
    system: boolean;
  };
  quietHours: { enabled: boolean; start: string; end: string };
}

export default function NotificationsPage() {
  const [preferences, setPreferences] = useState<NotificationPrefs>({
    channels: { in_app: true, banner: true, email: true },
    categories: { orders: true, payments: true, account: true, system: true },
    quietHours: { enabled: false, start: "22:00", end: "08:00" },
  });
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const data = await apiJson<NotificationPrefs>(
          "/api/merchant/notifications/preferences",
        );
        if (data) {
          setPreferences({
            channels: data.channels || {
              in_app: true,
              banner: true,
              email: true,
            },
            categories: data.categories || {
              orders: true,
              payments: true,
              account: true,
              system: true,
            },
            quietHours: data.quietHours || {
              enabled: false,
              start: "22:00",
              end: "08:00",
            },
          });
        }
      } catch (error: unknown) {
        const _errMsg = error instanceof Error ? error.message : String(error);
        logger.warn("[FETCH_NOTIFICATIONS_PREFS_ERROR]", {
          error: _errMsg,
          app: "merchant",
        });
      } finally {
        setLoading(false);
      }
    };
    void fetchPrefs();
  }, []);

  const toggleChannel = async (channel: string) => {
    const next = {
      ...preferences,
      channels: {
        ...preferences.channels,
        [channel as keyof typeof preferences.channels]:
          !preferences.channels[channel as keyof typeof preferences.channels],
      },
    };
    setPreferences(next);

    try {
      await apiJson<{ success: boolean }>(
        "/api/merchant/notifications/preferences",
        {
          method: "POST",
          body: JSON.stringify(next),
        },
      );
      toast.success("Preferences saved");
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[TOGGLE_CHANNEL_ERROR]", {
        error: _errMsg,
        channel,
        app: "merchant",
      });
      toast.error("Failed to update notification settings");
      setPreferences(preferences);
    }
  };

  const toggleCategory = async (category: string) => {
    const next = {
      ...preferences,
      categories: {
        ...preferences.categories,
        [category as keyof typeof preferences.categories]:
          !preferences.categories[
            category as keyof typeof preferences.categories
          ],
      },
    };
    setPreferences(next);

    try {
      await apiJson<{ success: boolean }>(
        "/api/merchant/notifications/preferences",
        {
          method: "POST",
          body: JSON.stringify(next),
        },
      );
      toast.success("Preferences saved");
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[TOGGLE_CATEGORY_ERROR]", {
        error: _errMsg,
        category,
        app: "merchant",
      });
      toast.error("Failed to update notification settings");
      setPreferences(preferences);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 md:p-8"
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <BackButton
              href="/dashboard/settings/overview"
              label="Back to Settings"
            />
            <PageHeader
              title="Notifications"
              subtitle="Manage how you receive alerts and updates."
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100"
        >
        {/* Orders */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 flex items-start gap-4 hover:bg-green-50/30 transition-colors"
        >
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="p-2 bg-gradient-to-br from-blue-400 to-cyan-500 text-white rounded-xl shadow-lg mt-1"
          >
            <ShoppingBag className="h-5 w-5" />
          </motion.div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">New Orders</h3>
            <p className="text-sm text-gray-500 mb-4">
              Get notified when a customer places an order.
            </p>
            <div className="flex gap-6">
              <Toggle
                label="Email"
                icon={Mail}
                checked={preferences?.channels?.email}
                onChange={() => toggleChannel("email")}
              />
              <Toggle
                label="In-App"
                icon={Bell}
                checked={preferences?.categories?.orders}
                onChange={() => toggleCategory("orders")}
              />
            </div>
          </div>
        </motion.div>

        {/* Payouts */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 flex items-start gap-4 hover:bg-green-50/30 transition-colors"
        >
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="p-2 bg-gradient-to-br from-green-400 to-teal-500 text-white rounded-xl shadow-lg mt-1"
          >
            <Wallet className="h-5 w-5" />
          </motion.div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">Payments</h3>
            <p className="text-sm text-gray-500 mb-4">
              Updates on payments and payouts.
            </p>
            <div className="flex gap-6">
              <Toggle
                label="Email"
                icon={Mail}
                checked={preferences?.channels?.email}
                onChange={() => toggleChannel("email")}
              />
              <Toggle
                label="Enabled"
                icon={Bell}
                checked={preferences?.categories?.payments}
                onChange={() => toggleCategory("payments")}
              />
            </div>
          </div>
        </motion.div>

        {/* Security */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 flex items-start gap-4 hover:bg-green-50/30 transition-colors"
        >
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="p-2 bg-gradient-to-br from-red-400 to-red-500 text-white rounded-xl shadow-lg mt-1"
          >
            <ShieldAlert className="h-5 w-5" />
          </motion.div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">System & Account</h3>
            <p className="text-sm text-gray-500 mb-4">
              Important system updates and account notifications.
            </p>
            <div className="flex gap-6">
              <Toggle
                label="System"
                icon={AlertTriangle}
                checked={preferences?.categories?.system}
                onChange={() => toggleCategory("system")}
                disabled
              />
              <Toggle
                label="Account"
                icon={Bell}
                checked={preferences?.categories?.account}
                onChange={() => toggleCategory("account")}
                disabled
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              System and account notifications cannot be disabled.
            </p>
          </div>
        </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

interface ToggleProps {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

function Toggle({
  label,
  icon: Icon,
  checked,
  onChange,
  disabled,
}: ToggleProps) {
  return (
    <label
      className={`flex items-center gap-2 cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <div
        className={`w-10 h-6 rounded-full p-1 transition-colors ${checked ? "bg-green-500" : "bg-gray-200"}`}
      >
        <div
          className={`bg-white  w-4 h-4 rounded-full shadow-sm transform transition-transform ${checked ? "translate-x-4" : ""}`}
        />
      </div>
      <Input type="checkbox"
        className="hidden"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
    </label>
  );
}
