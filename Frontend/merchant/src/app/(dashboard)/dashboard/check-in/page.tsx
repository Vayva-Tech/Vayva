"use client";

import { useEffect, useState } from "react";
import { logger } from "@vayva/shared";
import { Button } from "@vayva/ui";
import { QrCode, CheckCircle, ClockCounterClockwise, Users, Calendar } from "@phosphor-icons/react";
import { toast } from "sonner";
import { apiJson } from "@/lib/api-client-shared";
import { useAuth } from "@/context/AuthContext";

interface CheckInEntry {
  id: string;
  customerName: string;
  ticketType?: string;
  status: string;
  checkedInAt?: string;
  bookingDate: string;
}

interface RawBooking {
  id: string;
  customer?: { name?: string };
  customerName?: string;
  service?: { name?: string };
  ticketType?: string;
  metadata?: { checkedIn?: boolean; checkedInAt?: string; ticketType?: string };
  date?: string;
  createdAt?: string;
  status?: string;
}

interface BookingsResponse {
  bookings?: RawBooking[];
  data?: RawBooking[];
}

export default function CheckInPage() {
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
  const [entries, setEntries] = useState<CheckInEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCheckIns() {
      try {
        setLoading(true);
        const data = await apiJson<BookingsResponse>(
          "/bookings?status=CONFIRMED,CHECKED_IN&limit=50&sort=date:desc",
        );
        const bookings = Array.isArray(data)
          ? data
          : (data?.bookings ?? data?.data ?? []);

        setEntries(
          (bookings as RawBooking[]).map((b) => ({
            id: b.id,
            customerName: b.customer?.name || b.customerName || "Guest",
            ticketType:
              b.service?.name || b.ticketType || b.metadata?.ticketType,
            status: b.metadata?.checkedIn ? "CHECKED_IN" : "CONFIRMED",
            checkedInAt: b.metadata?.checkedInAt,
            bookingDate: b.date || b.createdAt || "",
          })),
        );
      } catch (error: unknown) {
        const _errMsg = error instanceof Error ? error.message : String(error);
        logger.error("[CHECK_IN_FETCH_ERROR]", {
          error: _errMsg,
          app: "merchant",
        });
        toast.error(_errMsg || "Failed to load check-in data");
      } finally {
        setLoading(false);
      }
    }
    void fetchCheckIns();
  }, []);

  // Calculate metrics
  const totalEntries = entries.length;
  const checkedIn = entries.filter(e => e.status === 'CHECKED_IN').length;
  const confirmed = entries.filter(e => e.status === 'CONFIRMED').length;
  const checkInRate = totalEntries > 0 ? Math.round((checkedIn / totalEntries) * 100) : 0;

  if (loading) {
    return (
      <div className="p-12 flex justify-center">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Check-In</h1>
          <p className="text-sm text-gray-500 mt-1">Manage customer arrivals and attendance</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700 text-white px-4 h-10 rounded-xl font-semibold">
          <QrCode size={18} className="mr-2" />
          Scan QR Code
        </Button>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryWidget
          icon={<Users size={18} />}
          label="Total Bookings"
          value={String(totalEntries)}
          trend="today"
          positive
        />
        <SummaryWidget
          icon={<CheckCircle size={18} />}
          label="Checked In"
          value={String(checkedIn)}
          trend="arrived"
          positive
        />
        <SummaryWidget
          icon={<ClockCounterClockwise size={18} />}
          label="Expected"
          value={String(confirmed)}
          trend="pending"
          positive
        />
        <SummaryWidget
          icon={<Calendar size={18} />}
          label="Check-in Rate"
          value={`${checkInRate}%`}
          trend="attendance"
          positive={checkInRate >= 80}
        />
      </div>

      {/* Check-in List */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {entries.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <QrCode size={32} className="text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No bookings found</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Customer bookings will appear here for check-in.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {entries.map((entry) => (
              <div key={entry.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                      <Users size={24} className="text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{entry.customerName}</h3>
                      <p className="text-xs text-gray-500">{entry.ticketType || 'General Admission'}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(entry.bookingDate).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {entry.status === 'CHECKED_IN' ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle size={20} />
                        <span className="text-sm font-medium">Checked In</span>
                        <span className="text-xs text-gray-500">
                          {entry.checkedInAt ? new Date(entry.checkedInAt).toLocaleTimeString() : ''}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-orange-600">
                        <ClockCounterClockwise size={20} />
                        <span className="text-sm font-medium">Expected</span>
                      </div>
                    )}
                    {entry.status !== 'CHECKED_IN' && (
                      <Button
                        onClick={() => { /* Handle check-in */ }}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 h-9 rounded-xl font-semibold"
                      >
                        Check In
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
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
