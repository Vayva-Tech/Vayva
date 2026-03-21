"use client";

import { useState, useEffect, useMemo } from "react";
import { logger, formatDate } from "@vayva/shared";
import { Button } from "@vayva/ui";
import { toast } from "sonner";
import {
  Truck,
  Package,
  CheckCircle,
  ClockCounterClockwise,
  TrendUp,
  MapPin,
  ArrowSquareOut,
  X,
  XCircle,
  Clock,
} from "@phosphor-icons/react";
import Link from "next/link";
import { apiJson } from "@/lib/api-client-shared";

interface Shipment {
  id: string;
  orderId: string;
  orderNumber: string;
  status: string;
  provider: string;
  trackingCode: string | null;
  trackingUrl: string | null;
  courierName: string | null;
  recipientName: string | null;
  recipientAddress?: string | null;
  pickupAddress?: string | null;
  createdAt?: string;
  updatedAt: string;
}

const TABS = [
  { key: "ALL", label: "All Loads" },
  { key: "IN_TRANSIT", label: "In-transit" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "REQUESTED", label: "Requested" },
  { key: "FAILED", label: "Failed" },
] as const;

function statusBadge(status: string) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    DELIVERED: { bg: "bg-green-50", text: "text-green-600", label: "Delivered" },
    IN_TRANSIT: { bg: "bg-blue-50", text: "text-blue-600", label: "In-transit" },
    PICKED_UP: { bg: "bg-violet-50", text: "text-violet-600", label: "Picked up" },
    ACCEPTED: { bg: "bg-sky-50", text: "text-sky-600", label: "Accepted" },
    REQUESTED: { bg: "bg-orange-50", text: "text-orange-600", label: "Requested" },
    FAILED: { bg: "bg-red-50", text: "text-red-600", label: "Failed" },
  };
  const s = map[status] || {
    bg: "bg-gray-100",
    text: "text-gray-600",
    label: status.replace("_", " "),
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

function WeekOverview({ shipments }: { shipments: Shipment[] }) {
  const delivered = shipments.filter((s) => s.status === "DELIVERED").length;
  const delayed = shipments.filter((s) => s.status === "FAILED").length;
  const total = delivered + delayed || 1;
  const onTimePercent = Math.round((delivered / total) * 100);
  const delayedPercent = 100 - onTimePercent;

  const circumference = 2 * Math.PI * 54;
  const onTimeArc = (onTimePercent / 100) * circumference;
  const delayedArc = (delayedPercent / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-900">Week Overview</h3>
        <span className="text-xs text-gray-500">This week</span>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative w-[130px] h-[130px] shrink-0">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#f3f4f6" strokeWidth="10" />
            <circle
              cx="60" cy="60" r="54" fill="none"
              stroke="hsl(142, 76%, 45%)" strokeWidth="10"
              strokeDasharray={`${onTimeArc} ${circumference}`}
              strokeLinecap="round"
            />
            <circle
              cx="60" cy="60" r="54" fill="none"
              stroke="hsl(0, 72%, 55%)" strokeWidth="10"
              strokeDasharray={`${delayedArc} ${circumference}`}
              strokeDashoffset={`-${onTimeArc}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] text-gray-500">On Time</span>
            <span className="text-xl font-black text-gray-900">{delivered}</span>
          </div>
        </div>
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="text-xs text-gray-500 flex-1">On Time</span>
            <span className="text-xs font-bold text-gray-900">{delivered}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-xs text-gray-500 flex-1">Delayed / Failed</span>
            <span className="text-xs font-bold text-gray-900">{delayed}</span>
          </div>
          <div className="border-t border-gray-100 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">On-time rate</span>
              <span className="text-sm font-black text-green-600">{onTimePercent}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShipmentDetail({ shipment, onClose }: { shipment: Shipment; onClose: () => void }) {
  const steps = [
    { label: "Requested", key: "REQUESTED" },
    { label: "Accepted", key: "ACCEPTED" },
    { label: "Picked Up", key: "PICKED_UP" },
    { label: "In Transit", key: "IN_TRANSIT" },
    { label: "Delivered", key: "DELIVERED" },
  ];
  const statusOrder = ["REQUESTED", "ACCEPTED", "PICKED_UP", "IN_TRANSIT", "DELIVERED"];
  const currentIdx = statusOrder.indexOf(shipment.status);
  const isFailed = shipment.status === "FAILED";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900">
            Load #{shipment.trackingCode || shipment.orderNumber}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Order #{shipment.orderNumber}</p>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg bg-gray-100 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors"
          aria-label="Close detail"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-1">
        {steps.map((step, i) => {
          const isComplete = !isFailed && i <= currentIdx;
          const isCurrent = !isFailed && i === currentIdx;
          return (
            <div key={step.key} className="flex-1 flex flex-col items-center gap-1.5">
              <div
                className={`w-full h-1.5 rounded-full ${
                  isComplete ? "bg-green-500" : isFailed && i === 0 ? "bg-red-500" : "bg-gray-200"
                }`}
              />
              <span className={`text-[9px] font-bold ${isCurrent ? "text-green-600" : isComplete ? "text-gray-900" : "text-gray-400"}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {isFailed && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100">
          <XCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-xs text-red-600 font-medium">
            This delivery has failed. Contact support or retry.
          </p>
        </div>
      )}

      {/* Details Grid */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Created</p>
            <p className="text-xs font-medium text-gray-900">
              {formatDate(shipment.createdAt || shipment.updatedAt)}
            </p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Last Update</p>
            <p className="text-xs font-medium text-gray-900">{formatDate(shipment.updatedAt)}</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-2.5">
          <div className="flex items-start gap-2.5">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0" />
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase">Pickup</p>
              <p className="text-xs text-gray-900">{shipment.pickupAddress || "Store location"}</p>
            </div>
          </div>
          <div className="ml-[3px] w-px h-4 bg-gray-200" />
          <div className="flex items-start gap-2.5">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-1 shrink-0" />
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase">Delivery</p>
              <p className="text-xs text-gray-900">
                {shipment.recipientAddress || shipment.recipientName || "Customer address"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Carrier</p>
            <p className="text-xs font-medium text-gray-900">{shipment.courierName || shipment.provider}</p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Recipient</p>
            <p className="text-xs font-medium text-gray-900">{shipment.recipientName || "—"}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <Link href={`/dashboard/orders/${shipment.orderId}`} className="flex-1">
          <Button variant="outline" className="w-full gap-2 text-xs rounded-xl">
            <Package className="w-3.5 h-3.5" />
            View Order
          </Button>
        </Link>
        {shipment.trackingUrl && (
          <a href={shipment.trackingUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button className="w-full gap-2 text-xs rounded-xl bg-green-500 hover:bg-green-600 text-white">
              <ArrowSquareOut className="w-3.5 h-3.5" />
              Track Live
            </Button>
          </a>
        )}
      </div>
    </div>
  );
}

interface ShipmentsResponse {
  data: Shipment[];
}

export default function ShipmentsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [activeTab, setActiveTab] = useState("ALL");
  const [forbidden, setForbidden] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedShipment = useMemo(
    () => shipments.find((s) => s.id === selectedId) || null,
    [shipments, selectedId],
  );

  useEffect(() => {
    const controller = new AbortController();
    void fetchShipments({ showLoader: true, signal: controller.signal });
    return () => { controller.abort(); };
  }, [activeTab]);

  useEffect(() => {
    const controller = new AbortController();
    const id = window.setInterval(() => {
      void fetchShipments({ showLoader: false, signal: controller.signal });
    }, 20000);
    return () => { controller.abort(); window.clearInterval(id); };
  }, [activeTab]);

  const fetchShipments = async ({ showLoader, signal }: { showLoader: boolean; signal?: AbortSignal }) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);
    try {
      const url = activeTab === "ALL" ? "/api/fulfillment/shipments" : `/api/fulfillment/shipments?status=${activeTab}`;
      const result = await apiJson<ShipmentsResponse>(url, { signal });
      setForbidden(false);
      setShipments(Array.isArray(result?.data) ? result.data : []);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      if ((error instanceof DOMException && error.name === "AbortError") || signal?.aborted) return;
      if ((error as { status?: number }).status === 403) {
        setForbidden(true);
        setShipments([]);
      } else {
        logger.error("[FETCH_SHIPMENTS_ERROR]", { error: _errMsg, app: "merchant" });
        toast.error(_errMsg || "Could not load shipments");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const kpis = useMemo(() => {
    const inTransit = shipments.filter((s) => s.status === "IN_TRANSIT").length;
    const delivered = shipments.filter((s) => s.status === "DELIVERED").length;
    const total = shipments.length;
    const failed = shipments.filter((s) => s.status === "FAILED").length;
    const onTimeRate = total > 0 ? Math.round((delivered / (delivered + failed || 1)) * 100) : 0;
    return { inTransit, delivered, total, onTimeRate };
  }, [shipments]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: shipments.length };
    for (const s of shipments) {
      counts[s.status] = (counts[s.status] || 0) + 1;
    }
    return counts;
  }, [shipments]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Shipments</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage all deliveries</p>
        </div>
        <Button
          onClick={() => fetchShipments({ showLoader: false })}
          disabled={loading || refreshing}
          className="bg-green-500 hover:bg-green-600 text-white px-4 h-10 rounded-xl font-semibold disabled:opacity-50"
        >
          <Package size={18} className={`mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryWidget icon={<Truck size={18} />} label="Total Shipments" value={String(kpis.total)} trend="all time" positive />
        <SummaryWidget icon={<ClockCounterClockwise size={18} />} label="In Transit" value={String(kpis.inTransit)} trend="active" positive={kpis.inTransit > 0} />
        <SummaryWidget icon={<CheckCircle size={18} />} label="Delivered" value={String(kpis.delivered)} trend="completed" positive />
        <SummaryWidget icon={<TrendUp size={18} />} label="On-Time Rate" value={`${kpis.onTimeRate}%`} trend="performance" positive={kpis.onTimeRate >= 90} />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-white border border-gray-100 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === tab.key ? "bg-green-500 text-white" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            {tab.label}
            {(tabCounts[tab.key] ?? 0) > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${activeTab === tab.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                {tabCounts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 flex justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
        </div>
      ) : forbidden ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center flex flex-col items-center">
          <div className="h-12 w-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
            <Package className="h-6 w-6 text-gray-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No access to Shipments</h3>
          <p className="text-gray-500 text-sm max-w-sm">
            Ask the store owner or admin to grant you Fulfillment access.
          </p>
        </div>
      ) : shipments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center flex flex-col items-center">
          <div className="h-12 w-12 bg-green-50 rounded-xl flex items-center justify-center mb-4">
            <Truck className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No shipments found</h3>
          <p className="text-gray-500 text-sm max-w-sm">
            {activeTab === "ALL"
              ? "Once you fulfill orders, their shipment status will appear here."
              : `No shipments matching "${TABS.find((t) => t.key === activeTab)?.label}".`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
          {/* Load List */}
          <div className="space-y-2">
            {shipments.map((shipment) => (
              <button
                key={shipment.id}
                onClick={() => setSelectedId(shipment.id === selectedId ? null : shipment.id)}
                className={`w-full text-left bg-white rounded-2xl border p-4 hover:border-green-200 transition-colors block ${
                  selectedId === shipment.id ? "border-green-300 ring-1 ring-green-200" : "border-gray-100"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">
                      {shipment.recipientName || "Unknown"}
                    </span>
                    <span className="text-xs text-gray-500">#{shipment.orderNumber}</span>
                  </div>
                  {statusBadge(shipment.status)}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {formatDate(shipment.updatedAt)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3 h-3" />
                    {shipment.courierName || shipment.provider}
                  </div>
                  {shipment.trackingCode && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" />
                      {shipment.trackingCode}
                    </div>
                  )}
                </div>
                {/* Route visualization */}
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-1 text-[10px] text-gray-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Store
                  </div>
                  <div className="flex-1 h-px bg-gray-200 relative">
                    <Truck
                      className={`w-3 h-3 absolute top-1/2 -translate-y-1/2 ${
                        shipment.status === "DELIVERED"
                          ? "right-0 text-green-500"
                          : shipment.status === "IN_TRANSIT"
                            ? "left-1/2 -translate-x-1/2 text-blue-500"
                            : "left-0 text-gray-400"
                      }`}
                    />
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-gray-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Customer
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Right Panel */}
          <div className="space-y-4">
            {selectedShipment ? (
              <ShipmentDetail shipment={selectedShipment} onClose={() => setSelectedId(null)} />
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <Truck className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Select a shipment to view details</p>
              </div>
            )}
            <WeekOverview shipments={shipments} />
          </div>
        </div>
      )}
    </div>
  );
}

// Summary Widget Component
function SummaryWidget({
  icon, label, value, trend, positive,
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
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-gray-900 tracking-tight mt-1">{value}</p>
          <p className={`text-xs mt-1 ${positive ? "text-green-600" : "text-orange-600"}`}>{trend}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-gray-100 text-gray-600">{icon}</div>
      </div>
    </div>
  );
}
