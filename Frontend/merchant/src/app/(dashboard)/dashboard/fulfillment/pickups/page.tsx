"use client";
import { Button } from "@vayva/ui";

import { useState } from "react";
import {
  Package,
  Clock,
  CheckCircle,
  Plus,
  MapPin,
  User,
  ShoppingBag,
  Eye,
  Phone,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface PickupItem {
  id: string;
  customer: string;
  orderId: string;
  itemsCount: number;
  pickupLocation: string;
  scheduledTime: string;
  status: "Scheduled" | "Ready" | "Completed";
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const PICKUPS: PickupItem[] = [
  {
    id: "1",
    customer: "Adebayo Ogundimu",
    orderId: "ORD-8201",
    itemsCount: 3,
    pickupLocation: "Lekki Phase 1 Hub, Lagos",
    scheduledTime: "2026-03-22 10:00 AM",
    status: "Scheduled",
  },
  {
    id: "2",
    customer: "Chidinma Okafor",
    orderId: "ORD-8202",
    itemsCount: 1,
    pickupLocation: "Victoria Island Store, Lagos",
    scheduledTime: "2026-03-22 11:30 AM",
    status: "Ready",
  },
  {
    id: "3",
    customer: "Emeka Nwosu",
    orderId: "ORD-8203",
    itemsCount: 5,
    pickupLocation: "Wuse II Pickup Point, Abuja",
    scheduledTime: "2026-03-22 09:00 AM",
    status: "Completed",
  },
  {
    id: "4",
    customer: "Fatima Abdullahi",
    orderId: "ORD-8204",
    itemsCount: 2,
    pickupLocation: "Ikeja City Mall, Lagos",
    scheduledTime: "2026-03-22 02:00 PM",
    status: "Scheduled",
  },
  {
    id: "5",
    customer: "Ibrahim Musa",
    orderId: "ORD-8205",
    itemsCount: 4,
    pickupLocation: "Alausa Hub, Ikeja, Lagos",
    scheduledTime: "2026-03-22 12:00 PM",
    status: "Ready",
  },
  {
    id: "6",
    customer: "Ngozi Eze",
    orderId: "ORD-8206",
    itemsCount: 2,
    pickupLocation: "Trans Amadi Store, Port Harcourt",
    scheduledTime: "2026-03-22 03:30 PM",
    status: "Scheduled",
  },
];

// ─── Status Styles ──────────────────────────────────────────────────────────

const STATUS_STYLES: Record<PickupItem["status"], { bg: string; text: string; dot: string }> = {
  Scheduled: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  Ready: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  Completed: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
};

function StatusBadge({ status }: { status: PickupItem["status"] }) {
  const s = STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

// ─── Page Component ─────────────────────────────────────────────────────────

export default function PickupsPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = ["All", "Scheduled", "Ready", "Completed"];

  const filtered =
    activeFilter === "All" ? PICKUPS : PICKUPS.filter((p) => p.status === activeFilter);

  const scheduled = PICKUPS.filter((p) => p.status === "Scheduled").length;
  const ready = PICKUPS.filter((p) => p.status === "Ready").length;
  const completedToday = PICKUPS.filter((p) => p.status === "Completed").length;

  const stats = [
    {
      label: "Scheduled",
      value: 5,
      icon: <Clock className="w-5 h-5" />,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      label: "Ready",
      value: 3,
      icon: <Package className="w-5 h-5" />,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Completed Today",
      value: 8,
      icon: <CheckCircle className="w-5 h-5" />,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pickups</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage customer pickup orders and scheduling
          </p>
        </div>
        <Button className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl shadow-sm shadow-green-500/20 transition-colors">
          <Plus className="w-4 h-4" />
          Schedule Pickup
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-gray-50 rounded-xl border border-gray-100 w-fit">
        {filters.map((tab) => (
          <Button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeFilter === tab
                ? "bg-green-500 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-white"
            }`}
          >
            {tab}
          </Button>
        ))}
      </div>

      {/* Pickup Queue Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <Package className="w-7 h-7 text-gray-300" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">No pickups found</h3>
            <p className="text-sm text-gray-500">No pickup orders match the current filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Pickup Location
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Scheduled Time
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((pickup) => (
                  <tr key={pickup.id} className="hover:bg-green-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                          <User className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="font-semibold text-gray-900">{pickup.customer}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-700">{pickup.orderId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-gray-600">
                          {pickup.itemsCount} {pickup.itemsCount === 1 ? "item" : "items"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="text-gray-600 text-xs">{pickup.pickupLocation}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-gray-600 text-xs">{pickup.scheduledTime}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={pickup.status} />
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
                          title="Contact customer"
                        >
                          <Phone className="w-4 h-4" />
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
          <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50/40">
            <p className="text-xs text-gray-500">
              Showing <span className="font-semibold text-gray-700">{filtered.length}</span> of{" "}
              <span className="font-semibold text-gray-700">{PICKUPS.length}</span> pickups
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

