"use client";
import { Button } from "@vayva/ui";

import { useState, useMemo, useEffect, useCallback } from "react";
import { apiJson } from "@/lib/api-client-shared";
import { toast } from "sonner";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageWithInsights } from "@/components/layout/PageWithInsights";
import {
  Truck,
  Package,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  Filter,
  Eye,
  Copy,
  ExternalLink,
  Clock,
  MapPin,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Shipment {
  id: string;
  trackingId: string;
  orderId: string;
  customer: string;
  carrier: string;
  status: "Processing" | "In Transit" | "Delivered" | "Failed";
  shipDate: string;
  eta: string;
}

interface ApiShipmentRow {
  id: string;
  orderId: string;
  orderNumber?: string;
  status: string;
  provider?: string;
  trackingCode?: string | null;
  trackingUrl?: string | null;
  courierName?: string | null;
  recipientName?: string | null;
  updatedAt?: string;
}

function mapDispatchToUiStatus(raw: string): Shipment["status"] {
  const s = raw.toUpperCase();
  if (s === "IN_TRANSIT") return "In Transit";
  if (s === "DELIVERED") return "Delivered";
  if (s === "FAILED" || s === "EXCEPTION") return "Failed";
  return "Processing";
}

function mapApiShipment(row: ApiShipmentRow): Shipment {
  const updated = row.updatedAt ? new Date(row.updatedAt).toISOString().slice(0, 10) : "";
  return {
    id: row.id,
    trackingId: row.trackingCode?.trim() || "—",
    orderId: row.orderNumber || row.orderId,
    customer: row.recipientName?.trim() || "—",
    carrier: (row.courierName || row.provider || "—").toString(),
    status: mapDispatchToUiStatus(row.status),
    shipDate: updated,
    eta: "—",
  };
}

// ─── Status Config ──────────────────────────────────────────────────────────

const STATUS_STYLES: Record<Shipment["status"], { bg: string; text: string; dot: string }> = {
  Processing: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  "In Transit": { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
  Delivered: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  Failed: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
};

const FILTER_TABS = ["All", "Processing", "In Transit", "Delivered", "Failed"];

// ─── Helpers ────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Shipment["status"] }) {
  const s = STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

function formatDate(dateStr: string) {
  if (!dateStr || dateStr === "—") return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Page Component ─────────────────────────────────────────────────────────

export default function ShipmentsPage() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "error" | "ready">("loading");

  const loadShipments = useCallback(async () => {
    try {
      setLoadState("loading");
      const res = await apiJson<{
        success?: boolean;
        data?: ApiShipmentRow[];
      }>("/fulfillment/shipments");
      const rows = res?.data ?? [];
      setShipments(rows.map(mapApiShipment));
      setLoadState("ready");
    } catch {
      toast.error("Could not load shipments");
      setShipments([]);
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    void loadShipments();
  }, [loadShipments]);

  const filtered = useMemo(() => {
    let items = shipments;
    if (filter !== "All") {
      items = items.filter((s) => s.status === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (s) =>
          s.trackingId.toLowerCase().includes(q) ||
          s.orderId.toLowerCase().includes(q) ||
          s.customer.toLowerCase().includes(q) ||
          s.carrier.toLowerCase().includes(q),
      );
    }
    return items;
  }, [filter, search, shipments]);

  const totalShipments = shipments.length;
  const inTransit = shipments.filter((s) => s.status === "In Transit").length;
  const delivered = shipments.filter((s) => s.status === "Delivered").length;
  const failed = shipments.filter((s) => s.status === "Failed").length;

  const stats = [
    {
      label: "Total Shipments",
      value: totalShipments,
      icon: <Package className="w-5 h-5" />,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      label: "In Transit",
      value: inTransit,
      icon: <Truck className="w-5 h-5" />,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Delivered",
      value: delivered,
      icon: <CheckCircle className="w-5 h-5" />,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      label: "Failed",
      value: failed,
      icon: <XCircle className="w-5 h-5" />,
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      <PageWithInsights
        insights={
          <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Quick actions
              </div>
              <div className="mt-3 grid gap-2">
                <Link
                  href="/dashboard/orders"
                  className="inline-flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
                >
                  <span>View orders</span>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </Link>
                <Link
                  href="/dashboard/fulfillment/shipments"
                  className="inline-flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
                >
                  <span>All shipments</span>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                KPI snapshot
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                  <div className="text-xs text-gray-500">In transit</div>
                  <div className="text-lg font-bold text-gray-900 mt-0.5">
                    {inTransit}
                  </div>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                  <div className="text-xs text-gray-500">Delivered</div>
                  <div className="text-lg font-bold text-gray-900 mt-0.5">
                    {delivered}
                  </div>
                </div>
              </div>
            </div>
          </>
        }
      >
        <PageHeader
          title="Shipments"
          subtitle="Track and manage all outbound deliveries"
          actions={
            <Button className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl shadow-sm shadow-green-500/20 transition-colors">
              <Plus className="w-4 h-4" />
              Create Shipment
            </Button>
          }
        />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${stat.iconBg} ${stat.iconColor}`}>{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter & Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by tracking ID, order, customer, carrier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition-colors placeholder:text-gray-400"
            />
          </div>
          <div className="flex items-center gap-1 p-1 bg-gray-50 rounded-xl border border-gray-100">
            <Filter className="w-3.5 h-3.5 text-gray-400 ml-2 mr-1" />
            {FILTER_TABS.map((tab) => (
              <Button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filter === tab
                    ? "bg-green-500 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-white"
                }`}
              >
                {tab}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Shipment Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loadState === "loading" ? (
          <div className="py-20 text-center text-sm text-gray-500">Loading shipments…</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <Truck className="w-7 h-7 text-gray-300" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">No shipments found</h3>
            <p className="text-sm text-gray-500">
              {loadState === "error"
                ? "We could not load shipment data. Try again."
                : "Try adjusting your filters or search query"}
            </p>
            {loadState === "error" && (
              <Button
                type="button"
                onClick={() => void loadShipments()}
                className="mt-4 text-sm font-semibold text-green-600 hover:text-green-700"
              >
                Retry
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead scope="col">
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider" scope="col">
                    Tracking ID
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider" scope="col">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider" scope="col">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider" scope="col">
                    Carrier
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider" scope="col">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider" scope="col">
                    Ship Date
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider" scope="col">
                    ETA
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right" scope="col">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-green-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <code className="text-xs text-gray-700 bg-gray-50 px-2 py-1 rounded-md font-mono font-medium">
                          {shipment.trackingId}
                        </code>
                        <Button
                          onClick={() => navigator.clipboard.writeText(shipment.trackingId)}
                          className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all"
                          title="Copy tracking ID"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">{shipment.orderId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-800">{shipment.customer}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-700 font-medium">{shipment.carrier}</span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={shipment.status} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-500 text-xs">{formatDate(shipment.shipDate)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-500 text-xs">{formatDate(shipment.eta)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                          title="Track shipment"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Showing <span className="font-semibold text-gray-700">{filtered.length}</span> of{" "}
              <span className="font-semibold text-gray-700">{shipments.length}</span> shipments
            </p>
            <div className="flex items-center gap-1">
              <Button className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all">
                Previous
              </Button>
              <Button className="px-3 py-1.5 text-xs font-semibold text-white bg-green-500 rounded-lg">
                1
              </Button>
              <Button className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all">
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
      </PageWithInsights>
    </div>
  );
}

