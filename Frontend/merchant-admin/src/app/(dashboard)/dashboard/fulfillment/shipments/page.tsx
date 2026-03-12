"use client";

import { useState, useEffect, useMemo } from "react";
import { logger, formatDate } from "@vayva/shared";
import { Button } from "@vayva/ui";
import { toast } from "sonner";
import {
  NavigationArrow,
  ClockCountdown,
  Gauge,
  Truck,
  Package,
  ArrowsClockwise,
  Spinner,
  CaretRight,
  Clock,
  MapPin,
  X,
  ArrowSquareOut,
  XCircle,
} from "@phosphor-icons/react/ssr";
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
    DELIVERED: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      label: "Delivered",
    },
    IN_TRANSIT: {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      label: "In-transit",
    },
    PICKED_UP: {
      bg: "bg-violet-500/10",
      text: "text-violet-400",
      label: "Picked up",
    },
    ACCEPTED: { bg: "bg-sky-500/10", text: "text-sky-400", label: "Accepted" },
    REQUESTED: {
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      label: "Requested",
    },
    FAILED: { bg: "bg-rose-500/10", text: "text-rose-400", label: "Failed" },
  };
  const s = map[status] || {
    bg: "bg-muted",
    text: "text-muted-foreground",
    label: status.replace("_", " "),
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${s.bg} ${s.text} border border-current/10`}
    >
      {s.label}
    </span>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="crm-card p-4 flex items-center gap-4">
      <div
        className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-black text-foreground leading-none">
          {value}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </div>
      <CaretRight className="w-4 h-4 text-muted-foreground ml-auto" />
    </div>
  );
}

function WeekOverview({ shipments }: { shipments: Shipment[] }) {
  const delivered = shipments.filter((s) => (s as any).status === "DELIVERED").length;
  const delayed = shipments.filter((s) => (s as any).status === "FAILED").length;
  const total = delivered + delayed || 1;
  const onTimePercent = Math.round((delivered / total) * 100);
  const delayedPercent = 100 - onTimePercent;

  const circumference = 2 * Math.PI * 54;
  const onTimeArc = (onTimePercent / 100) * circumference;
  const delayedArc = (delayedPercent / 100) * circumference;

  return (
    <div className="crm-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-foreground">Week Overview</h3>
        <span className="text-xs text-muted-foreground">This week</span>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative w-[130px] h-[130px] shrink-0">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="10"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="hsl(142, 76%, 45%)"
              strokeWidth="10"
              strokeDasharray={`${onTimeArc} ${circumference}`}
              strokeLinecap="round"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="hsl(0, 72%, 55%)"
              strokeWidth="10"
              strokeDasharray={`${delayedArc} ${circumference}`}
              strokeDashoffset={`-${onTimeArc}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] text-muted-foreground">On Time</span>
            <span className="text-xl font-black text-foreground">
              {delivered}
            </span>
          </div>
        </div>
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground flex-1">
              On Time
            </span>
            <span className="text-xs font-bold text-foreground">
              {delivered}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-destructive" />
            <span className="text-xs text-muted-foreground flex-1">
              Delayed / Failed
            </span>
            <span className="text-xs font-bold text-foreground">{delayed}</span>
          </div>
          <div className="border-t border-border/40 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                On-time rate
              </span>
              <span className="text-sm font-black text-primary">
                {onTimePercent}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShipmentDetail({
  shipment,
  onClose,
}: {
  shipment: Shipment;
  onClose: () => void;
}) {
  const steps = [
    { label: "Requested", key: "REQUESTED" },
    { label: "Accepted", key: "ACCEPTED" },
    { label: "Picked Up", key: "PICKED_UP" },
    { label: "In Transit", key: "IN_TRANSIT" },
    { label: "Delivered", key: "DELIVERED" },
  ];
  const statusOrder = [
    "REQUESTED",
    "ACCEPTED",
    "PICKED_UP",
    "IN_TRANSIT",
    "DELIVERED",
  ];
  const currentIdx = statusOrder.indexOf((shipment as any).status);
  const isFailed = (shipment as any).status === "FAILED";

  return (
    <div className="crm-card p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">
            Load #{shipment.trackingCode || shipment.orderNumber}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Order #{shipment.orderNumber}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="w-7 h-7 rounded-lg bg-muted/50 text-muted-foreground hover:text-foreground"
          aria-label="Close detail"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-1">
        {steps.map((step, i) => {
          const isComplete = !isFailed && i <= currentIdx;
          const isCurrent = !isFailed && i === currentIdx;
          return (
            <div
              key={step.key}
              className="flex-1 flex flex-col items-center gap-1.5"
            >
              <div
                className={`w-full h-1.5 rounded-full ${isComplete ? "bg-primary" : isFailed && i === 0 ? "bg-destructive" : "bg-border/40"}`}
              />
              <span
                className={`text-[9px] font-bold ${isCurrent ? "text-primary" : isComplete ? "text-foreground" : "text-muted-foreground"}`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {isFailed && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <p className="text-xs text-rose-400 font-medium">
            This delivery has failed. Contact support or retry.
          </p>
        </div>
      )}

      {/* Details Grid */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border/40 bg-background/[0.03] p-3">
            <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">
              Created
            </p>
            <p className="text-xs font-medium text-foreground">
              {formatDate(shipment.createdAt || shipment.updatedAt)}
            </p>
          </div>
          <div className="rounded-xl border border-border/40 bg-background/[0.03] p-3">
            <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">
              Last Update
            </p>
            <p className="text-xs font-medium text-foreground">
              {formatDate(shipment.updatedAt)}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border/40 bg-background/[0.03] p-3 space-y-2.5">
          <div className="flex items-start gap-2.5">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase">
                Pickup
              </p>
              <p className="text-xs text-foreground">
                {shipment.pickupAddress || "Store location"}
              </p>
            </div>
          </div>
          <div className="ml-[3px] w-px h-4 bg-border/60" />
          <div className="flex items-start gap-2.5">
            <div className="w-2 h-2 rounded-full bg-primary mt-1 shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase">
                Delivery
              </p>
              <p className="text-xs text-foreground">
                {shipment.recipientAddress ||
                  shipment.recipientName ||
                  "Customer address"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border/40 bg-background/[0.03] p-3">
            <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">
              Carrier
            </p>
            <p className="text-xs font-medium text-foreground">
              {shipment.courierName || shipment.provider}
            </p>
          </div>
          <div className="rounded-xl border border-border/40 bg-background/[0.03] p-3">
            <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">
              Recipient
            </p>
            <p className="text-xs font-medium text-foreground">
              {shipment.recipientName || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <Link href={`/dashboard/orders/${shipment.orderId}`} className="flex-1">
          <Button variant="outline" className="w-full gap-2 text-xs">
            <Package className="w-3.5 h-3.5" />
            View Order
          </Button>
        </Link>
        {shipment.trackingUrl && (
          <a
            href={shipment.trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button className="w-full gap-2 text-xs">
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
    return () => {
      controller.abort();
    };
  }, [activeTab]);

  useEffect(() => {
    const controller = new AbortController();
    const id = window.setInterval(() => {
      void fetchShipments({ showLoader: false, signal: controller.signal });
    }, 20000);
    return () => {
      controller.abort();
      window.clearInterval(id);
    };
  }, [activeTab]);

  const fetchShipments = async ({
    showLoader,
    signal,
  }: {
    showLoader: boolean;
    signal?: AbortSignal;
  }) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);
    try {
      const url =
        activeTab === "ALL"
          ? "/api/fulfillment/shipments"
          : `/api/fulfillment/shipments?status=${activeTab}`;
      const result = await apiJson<ShipmentsResponse>(url, { signal });
      setForbidden(false);
      setShipments(Array.isArray(result?.data) ? result.data : []);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      if (
        (error instanceof DOMException && error.name === "AbortError") ||
        signal?.aborted
      )
        return;
      if ((error as { status?: number }).status === 403) {
        setForbidden(true);
        setShipments([]);
      } else {
        logger.error("[FETCH_SHIPMENTS_ERROR]", {
          error: _errMsg,
          app: "merchant",
        });
        toast.error(_errMsg || "Could not load shipments");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const kpis = useMemo(() => {
    const inTransit = shipments.filter((s) => (s as any).status === "IN_TRANSIT").length;
    const delivered = shipments.filter((s) => (s as any).status === "DELIVERED").length;
    const total = shipments.length;
    const failed = shipments.filter((s) => (s as any).status === "FAILED").length;
    const onTimeRate =
      total > 0 ? Math.round((delivered / (delivered + failed || 1)) * 100) : 0;
    return { inTransit, delivered, total, onTimeRate };
  }, [shipments]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: shipments.length };
    for (const s of shipments) {
      counts[(s as any).status] = (counts[(s as any).status] || 0) + 1;
    }
    return counts;
  }, [shipments]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Fulfillment
          </h1>
          <p className="text-muted-foreground text-sm">
            Track and manage all deliveries.
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => fetchShipments({ showLoader: false })}
          disabled={loading || refreshing}
        >
          {refreshing ? (
            <Spinner className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowsClockwise className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          icon={NavigationArrow}
          label="In Transit"
          value={kpis.inTransit}
          color="bg-blue-500/10 text-blue-400"
        />
        <KpiCard
          icon={Truck}
          label="Total Deliveries"
          value={kpis.total}
          color="bg-violet-500/10 text-violet-400"
        />
        <KpiCard
          icon={ClockCountdown}
          label="On-Time Rate"
          value={`${kpis.onTimeRate}%`}
          color="bg-emerald-500/10 text-emerald-400"
        />
        <KpiCard
          icon={Gauge}
          label="Delivered"
          value={kpis.delivered}
          color="bg-primary/10 text-primary"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-background/[0.04] border border-white/[0.08] w-fit">
        {TABS.map((tab) => (
          <Button
            key={tab.key}
            variant="ghost"
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 h-auto ${
              activeTab === tab.key
                ? "bg-background/[0.1] text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {(tabCounts[tab.key] ?? 0) > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-background/[0.06] text-muted-foreground"
                }`}
              >
                {tabCounts[tab.key]}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="crm-card p-16 flex justify-center">
          <Spinner className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : forbidden ? (
        <div className="crm-card p-16 text-center flex flex-col items-center">
          <div className="h-12 w-12 bg-muted/50 text-muted-foreground rounded-xl flex items-center justify-center mb-4">
            <Package className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">
            No access to Shipments
          </h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            Ask the store owner or admin to grant you Fulfillment access.
          </p>
        </div>
      ) : shipments.length === 0 ? (
        <div className="crm-card p-16 text-center flex flex-col items-center">
          <div className="h-12 w-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
            <Truck className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">
            No shipments found
          </h3>
          <p className="text-muted-foreground text-sm max-w-sm">
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
              <Button
                key={shipment.id}
                variant="ghost"
                onClick={() =>
                  setSelectedId(shipment.id === selectedId ? null : shipment.id)
                }
                className={`w-full text-left crm-card p-4 h-auto hover:border-primary/30 block ${
                  selectedId === shipment.id
                    ? "border-primary/40 ring-1 ring-primary/20"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">
                      {shipment.recipientName || "Unknown"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      #{shipment.orderNumber}
                    </span>
                  </div>
                  {statusBadge((shipment as any).status)}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Store
                  </div>
                  <div className="flex-1 h-px bg-border/40 relative">
                    <Truck
                      className={`w-3 h-3 absolute top-1/2 -translate-y-1/2 ${shipment.status === "DELIVERED"
                          ? "right-0 text-emerald-400"
                          : (shipment as any).status === "IN_TRANSIT"
                            ? "left-1/2 -translate-x-1/2 text-blue-400"
                            : "left-0 text-muted-foreground"
                      }`}
                    />
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Customer
                  </div>
                </div>
              </Button>
            ))}
          </div>

          {/* Right Panel */}
          <div className="space-y-4">
            {selectedShipment ? (
              <ShipmentDetail
                shipment={selectedShipment}
                onClose={() => setSelectedId(null)}
              />
            ) : (
              <div className="crm-card p-8 text-center">
                <Truck className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Select a shipment to view details
                </p>
              </div>
            )}
            <WeekOverview shipments={shipments} />
          </div>
        </div>
      )}
    </div>
  );
}
