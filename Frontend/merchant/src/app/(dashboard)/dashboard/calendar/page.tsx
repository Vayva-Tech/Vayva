"use client";
// @ts-nocheck

import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CalendarDays,
  ShoppingBag,
  Users,
  Truck,
  Calendar,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Mock events with Nigerian context                                  */
/* ------------------------------------------------------------------ */

const EVENTS = [
  { id: "1", title: "Chidinma Okafor - Box Braids", date: "2026-03-22", time: "09:00 AM", type: "Booking" },
  { id: "2", title: "Order #4821 Pickup", date: "2026-03-22", time: "11:00 AM", type: "Order" },
  { id: "3", title: "Aisha Bello - Bridal Makeup", date: "2026-03-22", time: "01:00 PM", type: "Booking" },
  { id: "4", title: "Staff Meeting", date: "2026-03-23", time: "08:30 AM", type: "Meeting" },
  { id: "5", title: "Tunde Bakare - Consultation", date: "2026-03-23", time: "10:00 AM", type: "Booking" },
  { id: "6", title: "Fabric Delivery from Aba", date: "2026-03-24", time: "02:00 PM", type: "Delivery" },
  { id: "7", title: "Adaeze Umeh - Lash Extensions", date: "2026-03-24", time: "09:00 AM", type: "Booking" },
  { id: "8", title: "Order #4835 Dispatch", date: "2026-03-25", time: "10:30 AM", type: "Order" },
  { id: "9", title: "Ngozi Eze - Silk Press", date: "2026-03-26", time: "11:00 AM", type: "Booking" },
  { id: "10", title: "Monthly Review Meeting", date: "2026-03-27", time: "04:00 PM", type: "Meeting" },
  { id: "11", title: "Funke Akindele - Cornrows", date: "2026-03-28", time: "09:30 AM", type: "Booking" },
  { id: "12", title: "Inventory Restock Delivery", date: "2026-03-30", time: "01:00 PM", type: "Delivery" },
  { id: "13", title: "Emeka Nwosu - Fade Cut", date: "2026-03-31", time: "10:00 AM", type: "Booking" },
  { id: "14", title: "Order #4850 Shipped", date: "2026-03-18", time: "03:00 PM", type: "Order" },
  { id: "15", title: "Kemi Adekunle - Gel Nails", date: "2026-03-15", time: "12:00 PM", type: "Booking" },
  { id: "16", title: "Supplier Meeting - Lagos", date: "2026-03-10", time: "09:00 AM", type: "Meeting" },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

type EventType = "Order" | "Booking" | "Meeting" | "Delivery";

const TYPE_CONFIG: Record<EventType, { bg: string; text: string; dot: string; icon: any }> = {
  Order: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", icon: ShoppingBag },
  Booking: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500", icon: CalendarDays },
  Meeting: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500", icon: Users },
  Delivery: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500", icon: Truck },
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function dateKey(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getMondayOffset(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Mon=0 ... Sun=6
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function CalendarPage() {
  const today = new Date(2026, 2, 22); // March 22, 2026
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [viewMode, setViewMode] = useState<"Month" | "Week" | "Day">("Month");
  const [selectedDate, setSelectedDate] = useState<string>(
    dateKey(today.getFullYear(), today.getMonth(), today.getDate())
  );

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const mondayOffset = getMondayOffset(currentYear, currentMonth);
  const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate());

  // Event lookup by date
  const eventsByDate = useMemo(() => {
    const map: Record<string, typeof EVENTS> = {};
    EVENTS.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, []);

  // Upcoming 5 events from today
  const upcomingEvents = useMemo(() => {
    return EVENTS.filter((e) => e.date >= todayKey)
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
      .slice(0, 5);
  }, []);

  // Highlighted dates for mini calendar
  const highlightedDates = useMemo(() => {
    const set = new Set<number>();
    EVENTS.forEach((e) => {
      const parts = e.date.split("-");
      const y = parseInt(parts[0]);
      const m = parseInt(parts[1]) - 1;
      const d = parseInt(parts[2]);
      if (y === currentYear && m === currentMonth) set.add(d);
    });
    return set;
  }, [currentYear, currentMonth]);

  // Calendar grid cells
  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < mondayOffset; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);
  // Pad end to complete the last row
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  function prevMonth() {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
  }

  function nextMonth() {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
  }

  function goToToday() {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(todayKey);
  }

  // Mini calendar for current month
  const miniCells: (number | null)[] = [];
  for (let i = 0; i < mondayOffset; i++) miniCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) miniCells.push(d);

  return (
    <div className="min-h-screen space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Calendar</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage your schedule</p>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center bg-gray-100 rounded-xl p-1">
            {(["Month", "Week", "Day"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  viewMode === v
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Today button */}
          <button
            onClick={goToToday}
            className="px-3.5 py-2 text-xs font-semibold text-green-600 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
          >
            Today
          </button>

          {/* Nav arrows */}
          <div className="flex items-center gap-1">
            <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <ChevronLeft size={18} className="text-gray-600" />
            </button>
            <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <ChevronRight size={18} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
        {/* ── Month View ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Month / Year label */}
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h2>
          </div>

          {/* 7-column day headers (Mon-Sun) */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {DAY_HEADERS.map((d) => (
              <div key={d} className="py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>

          {/* Date cells */}
          <div className="grid grid-cols-7">
            {calendarCells.map((day, i) => {
              if (day === null) {
                return (
                  <div key={`empty-${i}`} className="min-h-[96px] border-b border-r border-gray-50 bg-gray-50/30" />
                );
              }

              const key = dateKey(currentYear, currentMonth, day);
              const isToday = key === todayKey;
              const isSelected = key === selectedDate;
              const dayEvents = eventsByDate[key] || [];

              return (
                <button
                  key={key}
                  onClick={() => setSelectedDate(key)}
                  className={`min-h-[96px] p-2 border-b border-r border-gray-50 text-left transition-colors ${
                    isSelected
                      ? "bg-green-50/60 ring-2 ring-inset ring-green-500/30"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <span
                    className={`inline-flex items-center justify-center w-7 h-7 text-sm font-semibold rounded-full ${
                      isToday
                        ? "bg-green-500 text-white"
                        : isSelected
                        ? "text-green-700"
                        : "text-gray-700"
                    }`}
                  >
                    {day}
                  </span>

                  {/* Colored event dots */}
                  {dayEvents.length > 0 && (
                    <div className="flex items-center gap-1 mt-1.5">
                      {dayEvents.slice(0, 4).map((ev) => (
                        <span
                          key={ev.id}
                          className={`w-2 h-2 rounded-full ${TYPE_CONFIG[ev.type as EventType].dot}`}
                        />
                      ))}
                      {dayEvents.length > 4 && (
                        <span className="text-[10px] text-gray-400 font-medium">+{dayEvents.length - 4}</span>
                      )}
                    </div>
                  )}

                  {/* Mini event labels on desktop */}
                  <div className="hidden md:block mt-1 space-y-0.5">
                    {dayEvents.slice(0, 2).map((ev) => {
                      const cfg = TYPE_CONFIG[ev.type as EventType];
                      return (
                        <div
                          key={ev.id}
                          className={`text-[10px] leading-tight font-medium truncate px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.text}`}
                        >
                          {ev.title.length > 22 ? ev.title.slice(0, 22) + "..." : ev.title}
                        </div>
                      );
                    })}
                    {dayEvents.length > 2 && (
                      <p className="text-[10px] text-gray-400 px-1.5">+{dayEvents.length - 2} more</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Upcoming Events</h3>
              <p className="text-xs text-gray-500 mt-0.5">Next 5 scheduled items</p>
            </div>

            <div className="divide-y divide-gray-50">
              {upcomingEvents.map((ev) => {
                const cfg = TYPE_CONFIG[ev.type as EventType];
                const TypeIcon = cfg.icon;
                return (
                  <div key={ev.id} className="px-5 py-3.5 hover:bg-gray-50/50 transition-colors cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 p-1.5 rounded-lg ${cfg.bg}`}>
                        <TypeIcon size={14} className={cfg.text} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{ev.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">
                            {new Date(ev.date + "T00:00:00").toLocaleDateString("en-NG", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <span className="text-gray-300">|</span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock size={10} />
                            {ev.time}
                          </span>
                        </div>
                      </div>
                      <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.bg} ${cfg.text} ${
                        ev.type === "Order" ? "border-blue-200" :
                        ev.type === "Booking" ? "border-green-200" :
                        ev.type === "Meeting" ? "border-purple-200" :
                        "border-orange-200"
                      }`}>
                        {ev.type}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mini Calendar Widget */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h3>
              <Calendar size={16} className="text-gray-400" />
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAY_HEADERS.map((d) => (
                <div key={d} className="text-center text-[10px] font-semibold text-gray-400 uppercase py-1">
                  {d.charAt(0)}
                </div>
              ))}
            </div>

            {/* Mini date cells */}
            <div className="grid grid-cols-7 gap-y-0.5">
              {miniCells.map((day, i) => {
                if (day === null) {
                  return <div key={`me-${i}`} className="w-full aspect-square" />;
                }

                const key = dateKey(currentYear, currentMonth, day);
                const isToday = key === todayKey;
                const hasEvent = highlightedDates.has(day);
                const isSelected = key === selectedDate;

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedDate(key)}
                    className="relative flex items-center justify-center aspect-square"
                  >
                    <span
                      className={`w-7 h-7 flex items-center justify-center text-xs font-medium rounded-full transition-colors ${
                        isToday
                          ? "bg-green-500 text-white font-bold"
                          : isSelected
                          ? "bg-green-100 text-green-700 font-bold"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {day}
                    </span>
                    {hasEvent && !isToday && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-green-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Add Event */}
          <button className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-2xl shadow-sm transition-colors">
            <Plus size={16} />
            Quick Add Event
          </button>
        </div>
      </div>
    </div>
  );
}
