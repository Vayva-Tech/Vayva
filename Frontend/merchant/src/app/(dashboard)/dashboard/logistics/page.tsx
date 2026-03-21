"use client";

import { logger } from "@vayva/shared";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@vayva/ui";
import { Truck, Package, MapPin, CheckCircle, ClockCounterClockwise } from "@phosphor-icons/react";
import { toast } from "sonner";
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

  // Calculate metrics
  const totalShipments = shipments.length;
  const shipped = shipments.filter(s => s.status === 'SHIPPED').length;
  const inTransit = shipments.filter(s => s.status === 'IN_TRANSIT').length;
  const delivered = shipments.filter(s => s.status === 'DELIVERED').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Deliveries</h1>
          <p className="text-sm text-gray-500 mt-1">Track shipments and manage delivery logistics</p>
        </div>
        <Link href="/dashboard/settings/shipping">
          <Button className="bg-green-600 hover:bg-green-700 text-white px-4 h-10 rounded-xl font-semibold">
            <Truck size={18} className="mr-2" />
            Shipping Settings
          </Button>
        </Link>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <SummaryWidget
          icon={<Truck size={18} />}
          label="Total Shipments"
          value={String(totalShipments)}
          trend="all time"
          positive
        />
        <SummaryWidget
          icon={<Package size={18} />}
          label="Shipped"
          value={String(shipped)}
          trend="dispatched"
          positive
        />
        <SummaryWidget
          icon={<MapPin size={18} />}
          label="In Transit"
          value={String(inTransit)}
          trend="on the way"
          positive
        />
        <SummaryWidget
          icon={<CheckCircle size={18} />}
          label="Delivered"
          value={String(delivered)}
          trend="completed"
          positive
        />
        <SummaryWidget
          icon={<ClockCounterClockwise size={18} />}
          label="Pending"
          value={String(totalShipments - delivered)}
          trend="outstanding"
          positive={totalShipments === delivered}
        />
      </div>

      {/* Shipments Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : shipments.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Truck size={32} className="text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No shipments</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              When you ship orders, tracking information will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Carrier</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {shipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{shipment.orderId}</code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{shipment.customerName || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {shipment.carrier || '—'}
                    </td>
                    <td className="px-6 py-4">
                      {shipment.trackingNumber ? (
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{shipment.trackingNumber}</code>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          shipment.status === 'DELIVERED'
                            ? "bg-green-50 text-green-600"
                            : shipment.status === 'IN_TRANSIT'
                            ? "bg-blue-50 text-blue-600"
                            : shipment.status === 'SHIPPED'
                            ? "bg-purple-50 text-purple-600"
                            : "bg-gray-50 text-gray-600"
                        }`}
                      >
                        {shipment.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {new Date(shipment.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
