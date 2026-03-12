"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { Badge, Button } from "@vayva/ui";
import { Calendar, Clock, User } from "@phosphor-icons/react/ssr";
import { BookingListActions } from "@/components/bookings/BookingListActions";
import { CreateBookingModal } from "@/components/bookings/CreateBookingModal";
import { apiJson } from "@/lib/api-client-shared";
import { logger } from "@vayva/shared";
import { toast } from "sonner";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";

interface BookingItem {
  id: string;
  serviceId: string;
  customerId: string | null;
  startsAt: string;
  endsAt: string;
  status: string;
  notes: string | null;
  service: { id: string; title: string };
  customer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
}

interface ServiceOption {
  id: string;
  name: string;
}

interface CustomerOption {
  id: string;
  name: string;
}

const STATUS_VARIANT_MAP: Record<
  string,
  "default" | "success" | "warning" | "error" | "info"
> = {
  CONFIRMED: "success",
  COMPLETED: "success",
  CANCELLED: "error",
  NO_SHOW: "error",
  PENDING: "warning",
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([]);
  const [customerOptions, setCustomerOptions] = useState<CustomerOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [bookingsData, servicesData, customersData] = await Promise.all([
        apiJson<BookingItem[]>("/api/bookings"),
        apiJson<{ items?: { id: string; title: string }[] }>(
          "/api/products?type=SERVICE&limit=100",
        ),
        apiJson<{
          items?: {
            id: string;
            firstName?: string;
            lastName?: string;
            name?: string;
          }[];
        }>("/api/customers?limit=100"),
      ]);

      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setServiceOptions(
        (Array.isArray(servicesData?.items) ? servicesData.items : []).map(
          (s: { id: string; title: string }) => ({ id: s.id, name: s.title }),
        ),
      );
      setCustomerOptions(
        (Array.isArray(customersData?.items) ? customersData.items : []).map(
          (c: { id: string; name?: string; firstName?: string; lastName?: string }) => ({
            id: c.id,
            name:
              c.name ||
              [c.firstName, c.lastName].filter(Boolean).join(" ") ||
              "Customer",
          }),
        ),
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load bookings";
      logger.error("[FETCH_BOOKINGS_ERROR]", {
        error: message,
        app: "merchant",
      });
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <DashboardPageShell
        title="Bookings & Appointments"
        description="Manage your schedule and client visits"
        category="Commerce"
      >
        <div className="bg-background/70 backdrop-blur-xl rounded-2xl border border-border/60 overflow-hidden shadow-card">
          <div className="p-6 border-b border-border/40">
            <div className="h-5 w-40 bg-background/30 rounded-lg animate-pulse" />
          </div>
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-background/30 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </DashboardPageShell>
    );
  }

  if (error) {
    return (
      <DashboardPageShell
        title="Bookings & Appointments"
        description="Manage your schedule and client visits"
        category="Commerce"
      >
        <div className="bg-background/70 backdrop-blur-xl rounded-2xl border border-border/60 p-12 text-center shadow-card">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-text-tertiary opacity-70" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Failed to load bookings
          </h3>
          <p className="text-sm text-text-secondary mb-4">{error}</p>
          <Button onClick={fetchData} className="rounded-xl font-bold">
            Try Again
          </Button>
        </div>
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell
      title="Bookings & Appointments"
      description="Manage your schedule and client visits"
      category="Commerce"
      actions={
        <CreateBookingModal
          services={serviceOptions}
          customers={customerOptions}
        />
      }
    >
      <div className="bg-background/70 backdrop-blur-xl rounded-2xl border border-border/60 overflow-hidden shadow-card">
        <div className="p-6 border-b border-border/40 flex items-center justify-between">
          <h2 className="font-bold text-text-primary">Upcoming Schedule</h2>
          <div className="text-sm text-text-tertiary">
            {bookings.length} total bookings
          </div>
        </div>

        <div className="p-6">
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
              <h3 className="font-bold text-text-primary">No bookings yet</h3>
              <p className="text-text-tertiary text-sm mt-1">
                New appointments will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-background/70 backdrop-blur-xl p-4 rounded-2xl border border-border/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                      {format(new Date(booking.startsAt), "d")}
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary">
                        {booking?.service?.title}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-text-tertiary">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {format(new Date(booking.startsAt), "h:mm a")} -{" "}
                          {format(new Date(booking.endsAt), "h:mm a")}
                        </span>
                        {booking.customer && (
                          <span className="flex items-center gap-1">
                            <User size={14} />
                            {booking?.customer?.firstName}{" "}
                            {booking?.customer?.lastName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      variant={STATUS_VARIANT_MAP[(booking as any).status] || "default"}
                    >
                      {booking.status.toLowerCase().replace(/_/g, " ")}
                    </Badge>
                    <BookingListActions
                      booking={{
                        ...booking,
                        customerId: booking.customerId,
                        startsAt: new Date(booking.startsAt),
                        endsAt: new Date(booking.endsAt),
                      }}
                      services={serviceOptions}
                      customers={customerOptions}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardPageShell>
  );
}
