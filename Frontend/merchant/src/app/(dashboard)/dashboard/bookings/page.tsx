// @ts-nocheck
"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { Button, Icon } from "@vayva/ui";
import { Calendar, Clock, User, Users, CheckCircle, XCircle } from "@phosphor-icons/react";
import { BookingListActions } from "@/components/bookings/BookingListActions";
import { CreateBookingModal } from "@/components/bookings/CreateBookingModal";
import { apiJson } from "@/lib/api-client-shared";
import { logger } from "@vayva/shared";
import { toast } from "sonner";

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

  // Calculate metrics
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED").length;
  const pendingBookings = bookings.filter((b) => b.status === "PENDING").length;
  const completedBookings = bookings.filter((b) => b.status === "COMPLETED").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Bookings & Appointments</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your schedule and client visits</p>
        </div>
        <CreateBookingModal
          services={serviceOptions}
          customers={customerOptions}
        >
          <Button className="rounded-xl gap-2 bg-green-500 hover:bg-green-600 text-white px-5 font-medium">
            <Icon name="Plus" size={16} />
            Create Booking
          </Button>
        </CreateBookingModal>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Icon name="Warning" size={32} className="text-red-500" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">Failed to load bookings</h3>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <Button onClick={fetchData} className="rounded-xl bg-green-500 hover:bg-green-600 text-white font-medium px-6">
            Try Again
          </Button>
        </div>
      )}

      {/* Summary Widgets */}
      {!isLoading && bookings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SummaryWidget
            icon={<Calendar size={18} />}
            label="Total Bookings"
            value={String(totalBookings)}
            trend="+12%"
            positive
          />
          <SummaryWidget
            icon={<CheckCircle size={18} />}
            label="Confirmed"
            value={String(confirmedBookings)}
            trend="+8%"
            positive
          />
          <SummaryWidget
            icon={<Clock size={18} />}
            label="Pending"
            value={String(pendingBookings)}
            trend="-3%"
            positive={false}
          />
          <SummaryWidget
            icon={<Users size={18} />}
            label="Completed"
            value={String(completedBookings)}
            trend="+15%"
            positive
          />
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="bg-gray-100 rounded-2xl h-96 animate-pulse" />
        </div>
      )}

      {/* Main Content */}
      {!isLoading && (
        <>
          {/* Tab Navigation */}
          {bookings.length > 0 && (
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center gap-6">
                <button className="text-sm font-medium border-b-2 border-green-500 text-green-600 pb-3 -mb-3.5 transition-colors">
                  All Bookings
                </button>
                <button className="text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 pb-3 -mb-3.5 transition-colors">
                  Upcoming
                </button>
                <button className="text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 pb-3 -mb-3.5 transition-colors">
                  Confirmed
                </button>
                <button className="text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 pb-3 -mb-3.5 transition-colors">
                  Completed
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                  <Icon name="Filter" size={14} />
                  Filter
                </button>
              </div>
            </div>
          )}

          {/* Bookings List Card */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Upcoming Schedule</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {bookings.length} booking{bookings.length !== 1 ? "s" : ""} found
                </p>
              </div>
            </div>

            <div className="p-6">
              {bookings.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="Calendar" size={32} className="mx-auto mb-2 text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">No bookings yet</h3>
                  <p className="text-sm text-gray-500">
                    New appointments will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 font-bold text-lg shrink-0">
                          {format(new Date(booking.startsAt), "d")}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {booking?.service?.title}
                          </h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
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
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            booking.status === "CONFIRMED" || booking.status === "COMPLETED"
                              ? "bg-green-50 text-green-600"
                              : booking.status === "PENDING"
                              ? "bg-orange-50 text-orange-600"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {booking.status === "CONFIRMED" && <CheckCircle size={12} />}
                          {booking.status === "COMPLETED" && <CheckCircle size={12} />}
                          {booking.status === "CANCELLED" && <XCircle size={12} />}
                          {booking.status === "NO_SHOW" && <XCircle size={12} />}
                          {booking.status === "PENDING" && <Clock size={12} />}
                          {booking.status.toLowerCase().replace(/_/g, " ")}
                        </span>
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
        </>
      )}
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
        </div>
        <div className="p-2.5 rounded-xl bg-gray-100 text-gray-600">
          {icon}
        </div>
      </div>
      <div className={`flex items-center text-sm font-medium ${positive ? 'text-green-600' : 'text-red-600'}`}>
        <span>{trend}</span>
        <span className="ml-1">{positive ? '↗' : '↘'}</span>
      </div>
    </div>
  );
}
