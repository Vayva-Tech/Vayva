"use client";
// @ts-nocheck

import { useState, useMemo } from "react";
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

// ─── Mock Data ──────────────────────────────────────────────────────────────

const SHIPMENTS: Shipment[] = [
  {
    id: "1",
    trackingId: "GIG-NG-20260318-4921",
    orderId: "ORD-7842",
    customer: "Adebayo Ogundimu",
    carrier: "GIG Logistics",
    status: "In Transit",
    shipDate: "2026-03-18",
    eta: "2026-03-23",
  },
  {
    id: "2",
    trackingId: "DHL-NG-20260317-3384",
    orderId: "ORD-7843",
    customer: "Chidinma Okafor",
    carrier: "DHL",
    status: "Delivered",
    shipDate: "2026-03-15",
    eta: "2026-03-17",
  },
  {
    id: "3",
    trackingId: "GIGL-NG-20260319-1157",
    orderId: "ORD-7844",
    customer: "Emeka Nwosu",
    carrier: "GIGL",
    status: "Processing",
    shipDate: "2026-03-19",
    eta: "2026-03-24",
  },
  {
    id: "4",
    trackingId: "KWK-NG-20260320-6693",
    orderId: "ORD-7845",
    customer: "Fatima Abdullahi",
    carrier: "Kwik",
    status: "In Transit",
    shipDate: "2026-03-20",
    eta: "2026-03-23",
  },
  {
    id: "5",
    trackingId: "GIG-NG-20260316-0821",
    orderId: "ORD-7846",
    customer: "Olumide Akinwale",
    carrier: "GIG Logistics",
    status: "Delivered",
    shipDate: "2026-03-14",
    eta: "2026-03-16",
  },
  {
    id: "6",
    trackingId: "DHL-NG-20260312-5574",
    orderId: "ORD-7847",
    customer: "Ngozi Eze",
    carrier: "DHL",
    status: "Delivered",
    shipDate: "2026-03-10",
    eta: "2026-03-12",
  },
  {
    id: "7",
    trackingId: "GIGL-NG-20260321-7830",
    orderId: "ORD-7848",
    customer: "Ibrahim Musa",
    carrier: "GIGL",
    status: "Failed",
    shipDate: "2026-03-19",
    eta: "2026-03-21",
  },
  {
    id: "8",
    trackingId: "KWK-NG-20260320-2290",
    orderId: "ORD-7849",
    customer: "Aisha Bello",
    carrier: "Kwik",
    status: "Failed",
    shipDate: "2026-03-18",
    eta: "2026-03-20",
  },
];

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
  return new Date(dateStr).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Page Component ─────────────────────────────────────────────────────────

export default function ShipmentsPage() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let items = SHIPMENTS;
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
          s.carrier.toLowerCase().includes(q)
      );
    }
    return items;
  }, [filter, search]);

  const totalShipments = SHIPMENTS.length;
  const inTransit = SHIPMENTS.filter((s) => s.status === "In Transit").length;
  const delivered = SHIPMENTS.filter((s) => s.status === "Delivered").length;
  const failed = SHIPMENTS.filter((s) => s.status === "Failed").length;

  const stats = [
    {
      label: "Total Shipments",
      value: 156,
      icon: <Package className="w-5 h-5" />,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      label: "In Transit",
      value: 23,
      icon: <Truck className="w-5 h-5" />,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Delivered",
      value: 128,
      icon: <CheckCircle className="w-5 h-5" />,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      label: "Failed",
      value: 5,
      icon: <XCircle className="w-5 h-5" />,
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Shipments</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage all outbound deliveries</p>
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl shadow-sm shadow-green-500/20 transition-colors">
          <Plus className="w-4 h-4" />
          Create Shipment
        </button>
      </div>

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
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filter === tab
                    ? "bg-green-500 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Shipment Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <Truck className="w-7 h-7 text-gray-300" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">No shipments found</h3>
            <p className="text-sm text-gray-500">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Tracking ID
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Carrier
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Ship Date
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    ETA
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
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
                        <button
                          onClick={() => navigator.clipboard.writeText(shipment.trackingId)}
                          className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all"
                          title="Copy tracking ID"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
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
                        <button
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                          title="Track shipment"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
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
              <span className="font-semibold text-gray-700">{SHIPMENTS.length}</span> shipments
            </p>
            <div className="flex items-center gap-1">
              <button className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all">
                Previous
              </button>
              <button className="px-3 py-1.5 text-xs font-semibold text-white bg-green-500 rounded-lg">
                1
              </button>
              <button className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
