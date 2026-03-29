"use client";

import { logger } from "@vayva/shared";
import React, { useState, useEffect } from "react";
import { Button, Card, Input } from "@vayva/ui";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Spinner as Loader2,
  Ticket,
  MagnifyingGlass as Search,
  DownloadSimple as Download,
  QrCode,
} from "@phosphor-icons/react";
import { format } from "date-fns";

interface TicketOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventName: string;
  eventDate: string;
  ticketType: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: "PAID" | "PENDING" | "REFUNDED" | "USED";
  purchasedAt: string;
  qrCode: string;
}

type TicketFilter = "all" | "paid" | "used" | "refunded";

import { apiJson } from "@/lib/api-client-shared";

interface TicketsResponse {
  items: TicketOrder[];
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<TicketFilter>("all");

  useEffect(() => {
    void loadTickets();
  }, [filter]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await apiJson<TicketsResponse>(
        `/api/nightlife/tickets?filter=${filter}`,
      );
      setTickets(Array.isArray(data?.items) ? data.items : []);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[LOAD_TICKETS_ERROR]", {
        error: _errMsg,
        filter,
        app: "merchant",
      });
      toast.error(_errMsg || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const markAsUsed = async (id: string) => {
    try {
      await apiJson<{ success: boolean }>(
        `/api/nightlife/tickets/${id}/check-in`,
        {
          method: "POST",
        },
      );
      toast.success("Ticket checked in!");
      void loadTickets();
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[CHECK_IN_TICKET_ERROR]", {
        error: _errMsg,
        ticketId: id,
        app: "merchant",
      });
      toast.error("Check-in failed");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "USED":
        return "bg-blue-100 text-blue-800";
      case "REFUNDED":
        return "bg-red-100 text-red-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-white text-gray-700";
    }
  };

  const filteredTickets = tickets.filter(
    (t) =>
      t.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.eventName?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Calculate stats
  const totalRevenue = tickets
    .filter((t) => (t as any).status === "PAID" || (t as any).status === "USED")
    .reduce((sum: number, t) => sum + t.totalAmount, 0);
  const totalTicketsSold = tickets
    .filter((t) => (t as any).status === "PAID" || (t as any).status === "USED")
    .reduce((sum: number, t) => sum + t.quantity, 0);
  const ticketsUsed = tickets
    .filter((t) => (t as any).status === "USED")
    .reduce((sum: number, t) => sum + t.quantity, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Ticket Sales
          </h1>
          <p className="text-gray-500">
            Track ticket orders and check-ins
          </p>
        </div>
        <Button variant="outline">
          <Download size={16} className="mr-2" />
          Export
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-500">Total Revenue</div>
          <div className="text-2xl font-bold">
            ₦{totalRevenue.toLocaleString()}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Tickets Sold</div>
          <div className="text-2xl font-bold">{totalTicketsSold}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Checked In</div>
          <div className="text-2xl font-bold text-green-600">{ticketsUsed}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500">Check-in Rate</div>
          <div className="text-2xl font-bold">
            {totalTicketsSold > 0
              ? Math.round((ticketsUsed / totalTicketsSold) * 100)
              : 0}
            %
          </div>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <Input type="text"
            placeholder="Search by name, order number, or event..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target?.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-black outline-none"
          />
        </div>
        <div className="flex gap-2">
          {[
            { key: "all", label: "All" },
            { key: "paid", label: "Paid" },
            { key: "used", label: "Used" },
            { key: "refunded", label: "Refunded" },
          ].map((tab) => (
            <Button
              key={tab.key}
              variant={filter === tab.key ? "primary" : "outline"}
              size="sm"
                            onClick={() => setFilter(tab.key as TicketFilter)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Tickets Table */}
      {filteredTickets.length === 0 ? (
        <Card className="p-12 text-center">
          <Ticket className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="font-bold text-gray-900 text-lg">
            No tickets found
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            {searchQuery
              ? "No results match your search"
              : "Ticket orders will appear here"}
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white border-b border-gray-200" scope="col">
                <tr>
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase" scope="col">
                    Order
                  </th>
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase" scope="col">
                    Customer
                  </th>
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase" scope="col">
                    Event
                  </th>
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase" scope="col">
                    Ticket
                  </th>
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase" scope="col">
                    Qty
                  </th>
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase" scope="col">
                    Amount
                  </th>
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase" scope="col">
                    Status
                  </th>
                  <th className="text-left p-4 text-xs font-bold text-gray-500 uppercase" scope="col">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-white">
                    <td className="p-4">
                      <div className="font-mono text-sm">
                        {ticket.orderNumber}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(ticket.purchasedAt), "MMM d, h:mm a")}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{ticket.customerName}</div>
                      <div className="text-xs text-gray-500">
                        {ticket.customerPhone}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{ticket.eventName}</div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(ticket.eventDate), "EEE, MMM d")}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm">{ticket.ticketType}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-medium">{ticket.quantity}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold">
                        ₦{ticket?.totalAmount?.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge className={getStatusColor((ticket as any).status)}>
                        {ticket.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      {ticket.status === "PAID" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAsUsed(ticket.id)}
                        >
                          <QrCode size={14} className="mr-1" />
                          Check In
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
