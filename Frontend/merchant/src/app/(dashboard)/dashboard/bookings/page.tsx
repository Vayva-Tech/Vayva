"use client";
import { Button } from "@vayva/ui";

import { useState, useEffect, useMemo, useCallback } from "react";
import { apiJson } from "@/lib/api-client-shared";
import { toast } from "sonner";
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
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
/*  Types & helpers                                                    */
/* ------------------------------------------------------------------ */

type Status = "Confirmed" | "Pending" | "Cancelled" | "Completed";

interface BookingRow {
  id: string;
  customer: string;
  service: string;
  date: string;
  time: string;
  duration: string;
  amount: number;
  status: Status;
}

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
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      const start = new Date();
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setMonth(end.getMonth() + 2);
      const res = await apiJson<{
        success?: boolean;
        data?: Array<{
          id: string;
          customerName: string;
          service: string;
          date: string;
          time: string;
          duration: string;
          amount: number;
          status: Status;
        }>;
      }>(
        `/api/bookings?start=${encodeURIComponent(start.toISOString())}&end=${encodeURIComponent(end.toISOString())}`,
      );
      const rows = (res.data ?? []).map((b) => ({
        id: b.id,
        customer: b.customerName,
        service: b.service,
        date: b.date,
        time: b.time,
        duration: b.duration,
        amount: b.amount,
        status: b.status,
      }));
      setBookings(rows);
    } catch {
      toast.error("Could not load bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

  const todayKey = new Date().toISOString().slice(0, 10);

  const todaySchedule = useMemo(() => {
    return bookings
      .filter((b) => b.date === todayKey)
      .sort((a, b) => a.time.localeCompare(b.time))
      .map((b) => ({
        time: b.time,
        customer: b.customer,
        service: b.service,
        duration: b.duration,
        status: b.status,
      }));
  }, [bookings, todayKey]);

  const weekStats = useMemo(() => {
    const now = new Date();
    const dow = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    const inWeek = bookings.filter((b) => {
      const d = new Date(b.date + "T12:00:00");
      return d >= monday && d <= sunday;
    });
    const revenue = inWeek.reduce((s, b) => s + b.amount, 0);
    return { weekCount: inWeek.length, revenue };
  }, [bookings]);

  const filtered = bookings.filter((b) => {
    const matchStatus = filterStatus === "All" || b.status === filterStatus;
    const matchSearch =
      search === "" ||
      b.customer.toLowerCase().includes(search.toLowerCase()) ||
      b.service.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const todayCount = bookings.filter((b) => b.date === todayKey).length;

  const summaryCards = [
    {
      label: "Today's Bookings",
      value: String(todayCount),
      icon: CalendarDays,
      accent: "bg-green-50 text-green-600",
    },
    {
      label: "This Week",
      value: String(weekStats.weekCount),
      icon: Clock,
      accent: "bg-blue-50 text-blue-600",
    },
    {
      label: "Week Revenue",
      value: formatNaira(weekStats.revenue),
      icon: Banknote,
      accent: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <ErrorBoundary serviceName="BookingsDashboard">
      <div className="min-h-screen space-y-6">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Bookings</h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                {bookings.length}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Manage appointments and client schedules</p>
          </div>
          <Button className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors">
            <Plus size={16} />
            New Booking
        </Button>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500 py-12 text-center">Loading bookings…</div>
      ) : null}

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
              {todaySchedule.length === 0 ? (
                <p className="text-sm text-gray-500 py-6 pl-20">No bookings scheduled for today.</p>
              ) : null}
              {todaySchedule.map((slot, idx) => {
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
                <Button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    filterStatus === s
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {s}
                </Button>
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
                      <Button className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors" title="View">
                        <Eye size={14} className="text-gray-500" />
                      </Button>
                      <Button className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors" title="Edit">
                        <Pencil size={14} className="text-gray-500" />
                      </Button>
                      <Button className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" title="Delete">
                        <Trash2 size={14} className="text-red-400" />
                      </Button>
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
      </ErrorBoundary>
    </div>
  );
}

