"use client";

import { logger } from "@vayva/shared";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Calendar,
  Plus,
  MapPin,
  Spinner as Loader2,
  Ticket,
} from "@phosphor-icons/react/ssr";
import { Button, Card, Badge } from "@vayva/ui";
import Link from "next/link";
import { apiJson } from "@/lib/api-client-shared";
import { format } from "date-fns";

interface NightlifeEvent {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  image: string | null;
  ticketsSold: number;
  ticketTypes: { name: string; price: number; available: number }[];
  status: "DRAFT" | "ACTIVE" | "SOLD_OUT" | "PAST";
}

export default function NightlifeEventsPage() {
  const [events, setEvents] = useState<NightlifeEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await apiJson<NightlifeEvent[]>("/api/nightlife/events");
      setEvents(Array.isArray(data) ? data : []);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[LOAD_EVENTS_ERROR]", { error: _errMsg, app: "merchant" });
      toast.error(_errMsg || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadEvents();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "SOLD_OUT":
        return "bg-purple-100 text-purple-800";
      case "PAST":
        return "bg-white text-gray-700";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

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
            Events
          </h1>
          <p className="text-gray-500">
            Create and manage your nightlife events
          </p>
        </div>
        <Link href="/dashboard/nightlife/events/new">
          <Button>
            <Plus size={18} className="mr-2" />
            Create Event
          </Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="font-bold text-gray-900 text-lg">No events yet</h3>
          <p className="text-gray-500 text-sm mt-1 mb-6">
            Create your first event to start selling tickets
          </p>
          <Link href="/dashboard/nightlife/events/new">
            <Button variant="outline">Create Your First Event</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/dashboard/nightlife/events/${event.id}`}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="aspect-video bg-gradient-to-br from-purple-900 to-black relative">
                  {event.image ? (
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Calendar className="w-12 h-12 text-white/30" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge className={getStatusColor((event as any).status)}>
                      {event.status}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 group-hover:text-purple-600 transition-colors">
                    {event.title}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      {format(new Date(event.eventDate), "EEE, MMM d")} at{" "}
                      {event.eventTime}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} />
                      {event.venue}
                    </div>
                    <div className="flex items-center gap-2">
                      <Ticket size={14} />
                      {event.ticketsSold} tickets sold
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
