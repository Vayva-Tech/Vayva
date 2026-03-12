"use client";

import { logger } from "@vayva/shared";
import React, { useState, useEffect } from "react";
import { Button, Card } from "@vayva/ui";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Spinner as Loader2,
  Calendar,
  Users,
  Wine,
  Phone,
  Check,
  X,
} from "@phosphor-icons/react";
import { format } from "date-fns";

interface Reservation {
  id: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  tableName: string;
  tableType: string;
  date: string;
  time: string;
  partySize: number;
  minimumSpend: number;
  bottles: { name: string; quantity: number; price: number }[];
  totalAmount: number;
  status: "pending" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
  specialRequests: string;
  createdAt: string;
}

type ReservationFilter = "tonight" | "upcoming" | "past" | "all";

import { apiJson } from "@/lib/api-client-shared";

export default function ReservationsPage() {
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filter, setFilter] = useState<ReservationFilter>("all");

  useEffect(() => {
    void loadReservations();
  }, [filter]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const data = await apiJson<Reservation[]>(
        `/api/nightlife/reservations?filter=${filter}`,
      );
      setReservations(Array.isArray(data) ? data : []);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[LOAD_RESERVATIONS_ERROR]", {
        error: _errMsg,
        filter,
        app: "merchant",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await apiJson<{ success: boolean }>(`/api/nightlife/reservations/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      toast.success("Status updated");
      void loadReservations();
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[UPDATE_RESERVATION_STATUS_ERROR]", {
        error: _errMsg,
        reservationId: id,
        status,
        app: "merchant",
      });
      toast.error("Failed to update status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      case "NO_SHOW":
        return "bg-background/30 text-text-secondary";
      default:
        return "bg-background/30 text-text-secondary";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-text-tertiary" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Table Reservations
          </h1>
          <p className="text-text-tertiary">
            Manage table bookings and bottle pre-orders
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-border pb-4">
        {[
          { key: "tonight", label: "Tonight" },
          { key: "upcoming", label: "Upcoming" },
          { key: "past", label: "Past" },
          { key: "all", label: "All" },
        ].map((tab) => (
          <Button
            key={tab.key}
            variant={filter === tab.key ? "primary" : "ghost"}
            size="sm"
                        onClick={() => setFilter(tab.key as ReservationFilter)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-text-tertiary">Total Reservations</div>
          <div className="text-2xl font-bold">{reservations.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-text-tertiary">Confirmed</div>
          <div className="text-2xl font-bold text-green-600">
            {reservations.filter((r) => (r as any).status === "CONFIRMED").length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-text-tertiary">Pending Approval</div>
          <div className="text-2xl font-bold text-yellow-600">
            {reservations.filter((r) => (r as any).status?.toUpperCase() === "PENDING").length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-text-tertiary">Expected Revenue</div>
          <div className="text-2xl font-bold">
            ₦
            {reservations
              .filter((r) => (r as any).status?.toUpperCase() === "PENDING")
              .reduce((sum: number, r) => sum + r.totalAmount, 0)
              .toLocaleString()}
          </div>
        </Card>
      </div>

      {/* Reservations List */}
      {reservations.length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
          <h3 className="font-bold text-text-primary text-lg">
            No reservations
          </h3>
          <p className="text-text-tertiary text-sm mt-1">
            {filter === "tonight"
              ? "No reservations for tonight"
              : "No reservations found"}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <Card key={reservation.id} className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                {/* Guest Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Users size={18} className="text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">
                        {reservation.guestName}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-text-tertiary">
                        <Phone size={12} />
                        {reservation.guestPhone}
                      </div>
                    </div>
                    <Badge className={getStatusColor((reservation as any).status)}>
                      {reservation.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-text-tertiary">Date</span>
                      <p className="font-medium">
                        {format(new Date(reservation.date), "EEE, MMM d")}
                      </p>
                    </div>
                    <div>
                      <span className="text-text-tertiary">Time</span>
                      <p className="font-medium">{reservation.time}</p>
                    </div>
                    <div>
                      <span className="text-text-tertiary">Table</span>
                      <p className="font-medium">
                        {reservation.tableName} ({reservation.tableType})
                      </p>
                    </div>
                    <div>
                      <span className="text-text-tertiary">Party Size</span>
                      <p className="font-medium">
                        {reservation.partySize} guests
                      </p>
                    </div>
                  </div>

                  {reservation?.bottles?.length > 0 && (
                    <div className="mt-4 p-3 bg-background/30 rounded-lg">
                      <div className="flex items-center gap-2 text-sm font-medium mb-2">
                        <Wine size={14} />
                        Bottle Pre-Order
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {reservation?.bottles?.map((bottle, i) => (
                          <span
                            key={i}
                            className="text-xs bg-background/70 backdrop-blur-xl px-2 py-1 rounded border"
                          >
                            {bottle.quantity}x {bottle.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {reservation.specialRequests && (
                    <div className="mt-3 text-sm text-text-secondary">
                      <span className="font-medium">Note:</span>{" "}
                      {reservation.specialRequests}
                    </div>
                  )}
                </div>

                {/* Amount & Actions */}
                <div className="lg:text-right space-y-4">
                  <div>
                    <div className="text-sm text-text-tertiary">
                      Total Amount
                    </div>
                    <div className="text-2xl font-bold">
                      ₦{reservation?.totalAmount?.toLocaleString()}
                    </div>
                    <div className="text-xs text-text-tertiary">
                      Min. spend: ₦{reservation?.minimumSpend?.toLocaleString()}
                    </div>
                  </div>

                  {reservation.status?.toUpperCase() === "PENDING" && (
                    <div className="flex gap-2 lg:justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateStatus(reservation.id, "CANCELLED")
                        }
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <X size={14} className="mr-1" />
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          updateStatus(reservation.id, "CONFIRMED")
                        }
                      >
                        <Check size={14} className="mr-1" />
                        Confirm
                      </Button>
                    </div>
                  )}

                  {reservation.status === "CONFIRMED" && (
                    <div className="flex gap-2 lg:justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(reservation.id, "NO_SHOW")}
                      >
                        No Show
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          updateStatus(reservation.id, "COMPLETED")
                        }
                      >
                        Mark Completed
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
