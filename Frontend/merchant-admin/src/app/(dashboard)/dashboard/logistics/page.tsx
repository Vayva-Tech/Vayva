"use client";

import { logger } from "@vayva/shared";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, EmptyState, cn } from "@vayva/ui";
import { Spinner as Loader2, Truck } from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { apiJson } from "@/lib/api-client-shared";
import { OrdersApiResponse } from "@/types/orders";
import { useAuth } from "@/context/AuthContext";

interface Shipment {
  id: string;
  orderId: string;
  status: string;
  trackingNumber?: string;
  carrier?: string;
  createdAt: string;
  customerName?: string;
}

export default function LogisticsPage() {
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
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchShipments() {
      try {
        setLoading(true);
        // Now returns standard { success: boolean, data: OrderRow[], meta: ... }
        const response = await apiJson<OrdersApiResponse>(
          "/api/orders?fulfillment=SHIPPED,IN_TRANSIT,DELIVERED&limit=50",
        );

        const orders = Array.isArray(response)
          ? response
          : response.items || response.data || [];

        setShipments(
          orders.map((o: any) => ({
            id: o.id,
            orderId: o.refCode || o.id, // standardized from OrderRow
            status: o.shipment?.status || (o as any).status || "UNKNOWN",
            trackingNumber: o.shipment?.trackingId,
            carrier: o.shipment?.carrier,
            createdAt: o.createdAt,
            customerName: o.customer?.name,
          })),
        );
      } catch (error: unknown) {
        const _errMsg = error instanceof Error ? error.message : String(error);
        logger.error("[LOGISTICS_FETCH_ERROR]", {
          error: _errMsg,
          app: "merchant",
        });
        toast.error(_errMsg || "Failed to load deliveries");
      } finally {
        setLoading(false);
      }
    }
    void fetchShipments();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin w-8 h-8 text-text-tertiary" />
      </div>
    );
  }

  return (
    <div className="relative max-w-5xl mx-auto space-y-8 pb-20">
      {isPaidPlan && (
        <div className="fixed inset-0 pointer-events-none -z-10">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/[0.04] rounded-full blur-[120px]" />
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="text-sm text-text-secondary">Operations</div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-text-primary tracking-tight">
            Deliveries
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Track shipments and manage delivery logistics.
          </p>
        </div>
        <Link href="/dashboard/settings/shipping">
          <Button
            variant="outline"
            className="rounded-xl h-11 px-5 font-bold border-border/60"
          >
            <Truck className="mr-2 h-4 w-4" />
            Shipping Settings
          </Button>
        </Link>
      </div>

      {shipments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[24px] border border-border/60 bg-background/70 backdrop-blur-xl shadow-card p-12"
        >
          <EmptyState
            title="No deliveries yet"
            icon="Truck"
            description="When you start shipping orders to customers, you can track them here."
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
                  Status
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
                  Tracking
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {shipments.map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-background/20 transition-colors"
                >
                  <td className="px-6 py-4 text-text-primary font-medium">
                    {s.orderId}
                  </td>
                  <td className="px-6 py-4 text-text-secondary">
                    {s.customerName || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md",
                        (s as any).status === "DELIVERED"
                          ? "bg-emerald-100 text-emerald-700"
                          : (s as any).status === "IN_TRANSIT"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-100 text-amber-700",
                      )}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-text-tertiary font-mono text-xs">
                    {s.trackingNumber || "—"}
                  </td>
                  <td className="px-6 py-4 text-text-tertiary text-xs">
                    {s.createdAt
                      ? new Date(s.createdAt).toLocaleDateString()
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
