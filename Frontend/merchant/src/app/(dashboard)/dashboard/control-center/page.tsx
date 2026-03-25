"use client";

import { useState, useEffect, useCallback } from "react";
import { apiJson } from "@/lib/api-client-shared";
import { toast } from "sonner";
import {
  Settings,
  Globe,
  Search,
  MessageCircle,
  CreditCard,
  Truck,
  ArrowRight,
  Activity,
  CheckCircle2,
  Layout,
  ShieldCheck,
  Package,
  FileText,
  Clock,
} from "lucide-react";

const QUICK_ACTIONS = [
  {
    icon: Layout,
    title: "Template Gallery",
    description: "Browse and change your store template",
    href: "/dashboard/templates",
  },
  {
    icon: Globe,
    title: "Domain Settings",
    description: "Configure your custom domain",
    href: "/dashboard/domains",
  },
  {
    icon: Search,
    title: "SEO Settings",
    description: "Optimize your store for search engines",
    href: "/dashboard/settings/seo",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Integration",
    description: "Connect WhatsApp for customer messaging",
    href: "/dashboard/integrations/whatsapp",
  },
  {
    icon: CreditCard,
    title: "Payment Settings",
    description: "Manage Paystack, Flutterwave and more",
    href: "/dashboard/settings/payments",
  },
  {
    icon: Truck,
    title: "Shipping Zones",
    description: "Set delivery zones and rates",
    href: "/dashboard/settings/shipping",
  },
];

// ── Page Component ───────────────────────────────────────────────────────────

type ActivityRow = {
  id: string;
  action: string;
  timestamp: string;
  icon: typeof Layout;
};

export default function ControlCenterPage() {
  const [storeStatus, setStoreStatus] = useState<{
    name: string;
    url: string;
    status: "Live" | "Maintenance";
    uptimePercentage: number | null;
  }>({
    name: "Your store",
    url: "—",
    status: "Live",
    uptimePercentage: null,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const me = await apiJson<Record<string, unknown>>("/api/me");
      const name =
        (me.storeName as string) ||
        (me.businessName as string) ||
        (me.name as string) ||
        "Your store";
      const slug = (me.slug as string) || "";
      const isLive = me.isLive !== false && me.storefrontLive !== false;
      setStoreStatus({
        name,
        url: slug ? `${slug}.vayva.store` : "—",
        status: isLive ? "Live" : "Maintenance",
        uptimePercentage: null,
      });

      const rawActivity = await apiJson<
        Array<{
          id: string;
          type?: string;
          message?: string;
          time?: string;
        }>
      >("/api/dashboard/activity?limit=15");

      const list = Array.isArray(rawActivity) ? rawActivity : [];
      const iconFor = (t: string | undefined) => {
        if (t === "PAYOUT") return CreditCard;
        if (t === "TICKET") return MessageCircle;
        if (t === "ORDER") return Package;
        return FileText;
      };
      setRecentActivity(
        list.map((a) => ({
          id: a.id,
          action: a.message ?? "Activity",
          timestamp: a.time ?? "",
          icon: iconFor(a.type),
        })),
      );
    } catch {
      toast.error("Could not load control center data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const STORE_STATUS = storeStatus;

  return (
    <div className="space-y-6 pb-10">
      {/* Store Status Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-green-100 text-green-600">
              <Activity className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Store Status</h2>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              STORE_STATUS.status === "Live"
                ? "bg-green-50 text-green-600"
                : "bg-orange-50 text-orange-600"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                STORE_STATUS.status === "Live"
                  ? "bg-green-500 animate-pulse"
                  : "bg-orange-500"
              }`}
            />
            {STORE_STATUS.status}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Store Name</p>
            <p className="text-sm font-semibold text-gray-900">{STORE_STATUS.name}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Store URL</p>
            <p className="text-sm font-semibold text-green-600">{STORE_STATUS.url}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Uptime</p>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-900">
                {STORE_STATUS.uptimePercentage != null
                  ? `${STORE_STATUS.uptimePercentage}%`
                  : "—"}
              </p>
              {STORE_STATUS.uptimePercentage != null ? (
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${STORE_STATUS.uptimePercentage}%` }}
                  />
                </div>
              ) : (
                <p className="text-xs text-gray-400">Not tracked</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <a
                key={action.title}
                href={action.href}
                className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-start gap-4 hover:border-green-200 hover:shadow-md transition-all"
              >
                <div className="flex-shrink-0 p-2.5 rounded-xl bg-gray-100 text-gray-600 group-hover:bg-green-100 group-hover:text-green-600 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 mb-0.5">
                    {action.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {action.description}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-green-500 flex-shrink-0 mt-1 transition-colors" />
              </a>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-xl bg-gray-100 text-gray-600">
            <Clock className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>

        <div className="space-y-1">
          {loading ? (
            <p className="text-sm text-gray-500 py-4">Loading activity…</p>
          ) : null}
          {!loading && recentActivity.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">No recent activity yet.</p>
          ) : null}
          {recentActivity.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 p-2 rounded-lg bg-green-50 text-green-600">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 font-medium truncate">
                    {item.action}
                  </p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {item.timestamp}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
