"use client";

import { useEffect, useState } from "react";
import { logger } from "@vayva/shared";
import { Button, EmptyState, cn } from "@vayva/ui";
import {
  QrCode,
  Spinner as Loader2,
  CheckCircle,
  Clock,
} from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import { motion } from "framer-motion";
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
          "/api/bookings?status=CONFIRMED,CHECKED_IN&limit=50&sort=date:desc",
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin w-8 h-8 text-text-tertiary" />
      </div>
    );
  }

  return (
    <div className="relative max-w-5xl mx-auto space-y-8 pb-20">
      {isPaidPlan && (
        <div className="fixed inset-0 pointer-events-none -z-10">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/[0.04] rounded-full blur-[120px]" />
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="text-sm text-text-secondary">Operations</div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-text-primary tracking-tight">
            Guest Check-in
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Scan tickets and manage event entry.
          </p>
        </div>
        <Button className="rounded-xl h-11 px-5 font-bold shadow-card">
          <QrCode className="mr-2 h-4 w-4" /> Open Scanner
        </Button>
      </div>

      {entries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[24px] border border-border/60 bg-background/70 backdrop-blur-xl shadow-card p-12"
        >
          <EmptyState
            title="No guests to check in"
            icon="Users"
            description="Confirmed bookings and ticket holders will appear here for check-in."
          />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[20px] border border-border/60 bg-background/70 backdrop-blur-xl overflow-hidden"
        >
          <table className="w-full text-sm text-left">
            <thead className="border-b border-border/40">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
                  Guest
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
                  Ticket
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {entries.map((e) => (
                <tr
                  key={e.id}
                  className="hover:bg-background/20 transition-colors"
                >
                  <td className="px-6 py-4 text-text-primary font-medium">
                    {e.customerName}
                  </td>
                  <td className="px-6 py-4 text-text-secondary">
                    {e.ticketType || "General"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md inline-flex items-center gap-1",
                        (e as any).status === "CHECKED_IN"
                          ? "bg-success/20 text-success"
                          : "bg-warning/20 text-warning",
                      )}
                    >
                      {e.status === "CHECKED_IN" ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      {e.status === "CHECKED_IN" ? "Checked In" : "Waiting"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-text-tertiary text-xs">
                    {e.bookingDate
                      ? new Date(e.bookingDate).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}
