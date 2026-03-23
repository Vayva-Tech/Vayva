"use client";
// @ts-nocheck

import { useState } from "react";
import {
  CalendarDays,
  Clock,
  Plus,
  Search,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  XCircle,
  CircleDot,
  Banknote,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const BOOKINGS = [
  { id: "1", customer: "Chidinma Okafor", service: "Hair Braiding (Box Braids)", date: "2026-03-22", time: "09:00 AM", duration: "2h 30m", amount: 25000, status: "Confirmed" },
  { id: "2", customer: "Emeka Nwosu", service: "Consultation", date: "2026-03-22", time: "10:00 AM", duration: "45m", amount: 5000, status: "Completed" },
  { id: "3", customer: "Aisha Bello", service: "Bridal Makeup", date: "2026-03-22", time: "11:30 AM", duration: "1h 30m", amount: 75000, status: "Pending" },
  { id: "4", customer: "Oluwaseun Adeyemi", service: "Cornrows & Styling", date: "2026-03-22", time: "01:00 PM", duration: "2h", amount: 18000, status: "Confirmed" },
  { id: "5", customer: "Funke Akindele", service: "Locs Retwist", date: "2026-03-22", time: "02:30 PM", duration: "1h 30m", amount: 15000, status: "Pending" },
  { id: "6", customer: "Tunde Bakare", service: "Makeup (Glam Look)", date: "2026-03-23", time: "09:30 AM", duration: "1h 15m", amount: 35000, status: "Cancelled" },
  { id: "7", customer: "Ngozi Eze", service: "Hair Braiding (Knotless)", date: "2026-03-23", time: "11:00 AM", duration: "3h", amount: 30000, status: "Confirmed" },
  { id: "8", customer: "Yusuf Ibrahim", service: "Consultation", date: "2026-03-23", time: "12:00 PM", duration: "30m", amount: 3500, status: "Completed" },
];

const TODAY_SCHEDULE = [
  { time: "09:00 AM", customer: "Chidinma Okafor", service: "Hair Braiding (Box Braids)", duration: "2h 30m", status: "Confirmed" },
  { time: "10:00 AM", customer: "Emeka Nwosu", service: "Consultation", duration: "45m", status: "Completed" },
  { time: "11:30 AM", customer: "Aisha Bello", service: "Bridal Makeup", duration: "1h 30m", status: "Pending" },
  { time: "01:00 PM", customer: "Oluwaseun Adeyemi", service: "Cornrows & Styling", duration: "2h", status: "Confirmed" },
  { time: "02:30 PM", customer: "Funke Akindele", service: "Locs Retwist", duration: "1h 30m", status: "Pending" },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

type Status = "Confirmed" | "Pending" | "Cancelled" | "Completed";

const STATUS_CONFIG: Record<Status, { bg: string; text: string; dot: string; icon: any }> = {
  Confirmed: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500", icon: CheckCircle2 },
  Pending: { bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-500", icon: AlertCircle },
  Cancelled: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500", icon: XCircle },
  Completed: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", icon: CircleDot },
};

function formatNaira(n: number) {
  if (n >= 1000) return "\u20A6" + (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "K";
  return "\u20A6" + n.toLocaleString();
}

function formatNairaFull(n: number) {
  return "\u20A6" + n.toLocaleString("en-NG");
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function BookingsPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");

  const filtered = BOOKINGS.filter((b) => {
    const matchStatus = filterStatus === "All" || b.status === filterStatus;
    const matchSearch =
      search === "" ||
      b.customer.toLowerCase().includes(search.toLowerCase()) ||
      b.service.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const summaryCards = [
    { label: "Today's Bookings", value: "8", icon: CalendarDays, accent: "bg-green-50 text-green-600" },
    { label: "This Week", value: "34", icon: Clock, accent: "bg-blue-50 text-blue-600" },
    { label: "Revenue", value: "\u20A6425K", icon: Banknote, accent: "bg-purple-50 text-purple-600" },
  ];

  return (
    <div className="min-h-screen space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Bookings</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
              {BOOKINGS.length}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Manage appointments and client schedules</p>
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors">
          <Plus size={16} />
          New Booking
        </button>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${card.accent}`}>
                <Icon size={22} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Today's Schedule ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Today&apos;s Schedule</h2>
          <p className="text-xs text-gray-500 mt-0.5">Upcoming bookings for today</p>
        </div>

        <div className="px-6 py-4">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[63px] top-0 bottom-0 w-px bg-gray-200" />

            <div className="space-y-0">
              {TODAY_SCHEDULE.map((slot, idx) => {
                const statusCfg = STATUS_CONFIG[slot.status as Status];
                const StatusIcon = statusCfg.icon;
                return (
                  <div key={idx} className="relative flex items-start gap-5 py-3 group">
                    {/* Time */}
                    <div className="w-[52px] shrink-0 text-right">
                      <span className="text-xs font-semibold text-gray-500">{slot.time}</span>
                    </div>

                    {/* Dot on timeline */}
                    <div className="relative z-10 shrink-0">
                      <div className={`w-3 h-3 rounded-full border-2 border-white ${statusCfg.dot} shadow-sm`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 -mt-1 pb-2">
                      <div className="bg-gray-50 group-hover:bg-green-50/40 rounded-xl p-3.5 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{slot.customer}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{slot.service}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">{slot.duration}</span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusCfg.bg} ${statusCfg.text}`}>
                              <StatusIcon size={10} />
                              {slot.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Booking Table ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Table header bar */}
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">All Bookings</h2>
            <p className="text-xs text-gray-500 mt-0.5">{filtered.length} booking{filtered.length !== 1 ? "s" : ""}</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-48 pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
            </div>

            {/* Status filters */}
            <div className="hidden sm:flex items-center gap-1.5">
              {["All", "Confirmed", "Pending", "Cancelled", "Completed"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    filterStatus === s
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table columns */}
        <div className="hidden lg:grid lg:grid-cols-[1.2fr_1.4fr_1fr_0.6fr_0.7fr_0.7fr_80px] gap-4 px-6 py-3 bg-gray-50/80 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <span>Customer</span>
          <span>Service</span>
          <span>Date / Time</span>
          <span>Duration</span>
          <span>Amount (\u20A6)</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-50">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Search size={36} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-900">No bookings found</p>
              <p className="text-xs text-gray-500 mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            filtered.map((booking) => {
              const statusCfg = STATUS_CONFIG[booking.status as Status];
              return (
                <div key={booking.id} className="group px-6 py-4 hover:bg-gray-50/50 transition-colors">
                  {/* Desktop */}
                  <div className="hidden lg:grid lg:grid-cols-[1.2fr_1.4fr_1fr_0.6fr_0.7fr_0.7fr_80px] gap-4 items-center">
                    {/* Customer */}
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {getInitials(booking.customer)}
                      </div>
                      <span className="text-sm font-medium text-gray-900 truncate">{booking.customer}</span>
                    </div>

                    {/* Service */}
                    <span className="text-sm text-gray-700 truncate">{booking.service}</span>

                    {/* Date / Time */}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(booking.date).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                      <p className="text-xs text-gray-500">{booking.time}</p>
                    </div>

                    {/* Duration */}
                    <span className="text-sm text-gray-600">{booking.duration}</span>

                    {/* Amount */}
                    <span className="text-sm font-semibold text-gray-900">{formatNairaFull(booking.amount)}</span>

                    {/* Status */}
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusCfg.bg} ${statusCfg.text} border ${
                      booking.status === "Confirmed" ? "border-green-200" :
                      booking.status === "Pending" ? "border-yellow-200" :
                      booking.status === "Cancelled" ? "border-red-200" :
                      "border-blue-200"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                      {booking.status}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors" title="View">
                        <Eye size={14} className="text-gray-500" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors" title="Edit">
                        <Pencil size={14} className="text-gray-500" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Delete">
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    </div>
                  </div>

                  {/* Mobile */}
                  <div className="lg:hidden space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {getInitials(booking.customer)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{booking.customer}</p>
                          <p className="text-xs text-gray-500">{booking.service}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusCfg.bg} ${statusCfg.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                        {booking.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <CalendarDays size={12} />
                          {new Date(booking.date).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {booking.time}
                        </span>
                        <span>{booking.duration}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{formatNairaFull(booking.amount)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
