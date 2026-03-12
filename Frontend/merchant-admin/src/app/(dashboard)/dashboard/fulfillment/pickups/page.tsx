"use client";

import { useEffect, useState } from "react";
import { logger } from "@vayva/shared";
import { Button, EmptyState, cn } from "@vayva/ui";
import { Spinner as Loader2 } from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { apiJson } from "@/lib/api-client-shared";
import { useAuth } from "@/context/AuthContext";

interface PickupOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  status: string;
  createdAt: string;
  itemCount: number;
}

const TABS = [
  { key: "READY", label: "Ready for Pickup" },
  { key: "COMPLETED", label: "Completed" },
  { key: "CANCELED", label: "Canceled" },
] as const;

interface RawOrder {
  id: string;
  orderNumber?: string;
  customer?: { name?: string };
  customerName?: string;
  fulfillmentStatus?: string;
  status?: string;
  createdAt?: string;
  items?: any[];
  lineItems?: any[];
}

interface PickupsResponse {
  orders?: RawOrder[];
  data?: RawOrder[];
}

export default function PickupsPage() {
  const { merchant } = useAuth();
  const isPaidPlan = (() => {
    const v = String((merchant as any)?.plan || "")
      .trim()
      .toLowerCase();

    return (
      v === "starter" ||
      v === "pro" ||
      v === "growth" ||
      v === "business" ||
      v === "enterprise" ||
      v === "professional" ||
      v === "premium"
    );
  })();
  const [activeTab, setActiveTab] = useState("READY");
  const [pickups, setPickups] = useState<PickupOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPickups() {
      try {
        setLoading(true);
        const data = await apiJson<PickupsResponse>(
          `/api/orders?fulfillment=PICKUP&status=${activeTab}&limit=50`,
        );
        const orders = Array.isArray(data)
          ? data
          : (data?.orders ?? data?.data ?? []);

        setPickups(
          (orders as RawOrder[]).map((o) => ({
            id: o.id,
            orderNumber: o.orderNumber || o.id,
            customerName: o.customer?.name || o.customerName || "Guest",
            status: o.fulfillmentStatus || (o as any).status || activeTab,
            createdAt: o.createdAt ?? "",
            itemCount: o.items?.length || o.lineItems?.length || 0,
          })),
        );
      } catch (error: unknown) {
        const _errMsg = error instanceof Error ? error.message : String(error);
        logger.error("[PICKUPS_FETCH_ERROR]", {
          error: _errMsg,
          status: activeTab,
          app: "merchant",
        });
        toast.error(_errMsg || "Failed to load pickups");
      } finally {
        setLoading(false);
      }
    }
    void fetchPickups();
  }, [activeTab]);

  return (
    <div className="relative max-w-5xl mx-auto space-y-8 pb-20">
      {isPaidPlan && (
        <div className="fixed inset-0 pointer-events-none -z-10">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/[0.04] rounded-full blur-[120px]" />
        </div>
      )}

      <div>
        <div className="text-sm text-text-secondary">Fulfillment</div>
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-text-primary tracking-tight">
          Pickups
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Manage orders waiting for customer collection.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border/40">
        {TABS.map((tab) => (
          <Button
            key={tab.key}
            variant="ghost"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "pb-3 px-4 text-sm font-bold border-b-2 rounded-none h-auto",
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-text-tertiary hover:text-text-secondary",
            )}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin w-8 h-8 text-text-tertiary" />
        </div>
      ) : pickups.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[24px] border border-border/60 bg-background/70 backdrop-blur-xl shadow-card p-12"
        >
          <EmptyState
            title="No pickups found"
            icon="PackageCheck"
            description={
              activeTab === "READY"
                ? "There are no orders currently waiting for pickup. New pickup orders will appear here."
                : `No ${activeTab.toLowerCase()} pickup orders found.`
            }
          />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[20px] border border-border/60 bg-background/70 backdrop-blur-xl overflow-hidden"
        >
          <table className="w-full text-sm text-left">
            <thead className="border-b border-border/40">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {pickups.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-background/20 transition-colors"
                >
                  <td className="px-6 py-4 text-text-primary font-medium">
                    {p.orderNumber}
                  </td>
                  <td className="px-6 py-4 text-text-secondary">
                    {p.customerName}
                  </td>
                  <td className="px-6 py-4 text-text-tertiary">
                    {p.itemCount}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md",
                        (p as any).status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-700"
                          : (p as any).status === "CANCELED"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700",
                      )}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-text-tertiary text-xs">
                    {p.createdAt
                      ? new Date(p.createdAt).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}
