// @ts-nocheck
"use client";

import { logger } from "@vayva/shared";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, Card, Input, Label, Select, Textarea } from "@vayva/ui";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { BackButton } from "@/components/ui/BackButton";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import {
  Plus,
  Trash as Trash2,
  Spinner as Loader2,
  Calendar,
  Ticket,
  Users,
} from "@phosphor-icons/react/ssr";
import { FileUpload } from "@/components/ui/FileUpload";
import { format } from "date-fns";

interface TicketType {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  sold: number;
  description: string;
}

interface EventData {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  address: string;
  dressCode: string;
  ageLimit: string;
  musicGenre: string;
  images: string[];
  ticketTypes: TicketType[];
  status: string;
  ticketsSold: number;
  revenue: number;
}

import { apiJson } from "@/lib/api-client-shared";

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [event, setEvent] = useState<EventData | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventDate: "",
    eventTime: "",
    venue: "",
    address: "",
    dressCode: "",
    ageLimit: "18+",
    musicGenre: "",
    images: [] as string[],
  });
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);

  useEffect(() => {
    void loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const data = await apiJson<EventData>(`/api/nightlife/events/${eventId}`);
      setEvent(data);
      setFormData({
        title: data.title || "",
        description: data.description || "",
        eventDate: data.eventDate?.split("T")[0] || "",
        eventTime: data.eventTime || "",
        venue: data.venue || "",
        address: data.address || "",
        dressCode: data.dressCode || "",
        ageLimit: data.ageLimit || "18+",
        musicGenre: data.musicGenre || "",
        images: data.images || [],
      });
      setTicketTypes(data.ticketTypes || []);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[LOAD_EVENT_ERROR]", { error: _errMsg, app: "merchant" });
      toast.error(_errMsg || "Failed to load event");
      router.push("/dashboard/nightlife/events");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addTicketType = () => {
    setTicketTypes([
      ...ticketTypes,
      { name: "", price: 0, quantity: 50, sold: 0, description: "" },
    ]);
  };

  const updateTicketType = (
    index: number,
    field: keyof TicketType,
    value: TicketType[keyof TicketType],
  ) => {
    const updated = [...ticketTypes];
    updated[index] = { ...updated[index], [field]: value };
    setTicketTypes(updated);
  };

  const removeTicketType = (index: number) => {
    if (ticketTypes.length > 1 && ticketTypes[index].sold === 0) {
      setTicketTypes(ticketTypes.filter((_: any, i: number) => i !== index));
    } else if (ticketTypes[index].sold > 0) {
      toast.error("Cannot remove ticket type with sales");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await apiJson<{ success: boolean }>(`/api/nightlife/events/${eventId}`, {
        method: "PATCH",
        body: JSON.stringify({ ...formData, ticketTypes }),
      });

      toast.success("Event updated successfully!");
      void loadEvent();
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[UPDATE_EVENT_ERROR]", {
        error: _errMsg,
        eventId,
        app: "merchant",
      });
      toast.error("Failed to update event");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Breadcrumbs />
      <BackButton
        href="/dashboard/nightlife/events"
        label="Back to Events"
        className="mb-6"
      />

      {/* Event Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet/10 rounded-lg">
              <Ticket size={20} className="text-violet" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Tickets Sold</div>
              <div className="text-xl font-bold">{event.ticketsSold}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Users size={20} className="text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Revenue</div>
              <div className="text-xl font-bold">
                ₦{(event.revenue || 0).toLocaleString()}
              </div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Calendar size={20} className="text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Event Date</div>
              <div className="text-xl font-bold">
                {event.eventDate
                  ? format(new Date(event.eventDate), "MMM d")
                  : "TBD"}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit Event</h1>
        <Badge
          className={event.status === "active"
              ? "bg-green-50 text-green-600"
              : "bg-white text-gray-700"
          }
        >
          {event.status}
        </Badge>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <Card className="p-6">
          <h2 className="font-bold text-lg mb-4">Event Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <Label>Event Name *</Label>
              <Input
                value={formData.title}
                onChange={(e: any) => handleChange("title", e.target?.value)}
                placeholder="e.g., Saturday Night Live"
                required
              />
            </div>
            <div className="col-span-2">
              <Label>Description *</Label>
              <Textarea
                value={formData.description}
                onChange={(e: any) => handleChange("description", e.target?.value)}
                placeholder="Describe your event..."
                rows={4}
                required
              />
            </div>
            <div>
              <Label>Event Date *</Label>
              <Input
                type="date"
                value={formData.eventDate}
                onChange={(e: any) => handleChange("eventDate", e.target?.value)}
                required
              />
            </div>
            <div>
              <Label>Start Time *</Label>
              <Input
                type="time"
                value={formData.eventTime}
                onChange={(e: any) => handleChange("eventTime", e.target?.value)}
                required
              />
            </div>
            <div>
              <Label>Venue Name *</Label>
              <Input
                value={formData.venue}
                onChange={(e: any) => handleChange("venue", e.target?.value)}
                placeholder="e.g., Club Noir"
                required
              />
            </div>
            <div>
              <Label>Address</Label>
              <Input
                value={formData.address}
                onChange={(e: any) => handleChange("address", e.target?.value)}
                placeholder="Full address"
              />
            </div>
            <div>
              <Label>Dress Code</Label>
              <Input
                value={formData.dressCode}
                onChange={(e: any) => handleChange("dressCode", e.target?.value)}
                placeholder="e.g., Smart Casual"
              />
            </div>
            <div>
              <Label>Age Limit</Label>
              <Select
                value={formData.ageLimit}
                onChange={(e: any) => handleChange("ageLimit", e.target?.value)}
                className="w-full p-2 border border-gray-200 rounded-lg"
                title="Age Limit"
              >
                <option value="18+">18+</option>
                <option value="21+">21+</option>
                <option value="All Ages">All Ages</option>
              </Select>
            </div>
            <div>
              <Label>Music Genre</Label>
              <Input
                value={formData.musicGenre}
                onChange={(e: any) => handleChange("musicGenre", e.target?.value)}
                placeholder="e.g., Afrobeats, Hip-Hop"
              />
            </div>
          </div>
        </Card>

        {/* Event Images */}
        <Card className="p-6">
          <h2 className="font-bold text-lg mb-4">Event Images</h2>
          <FileUpload
            value={formData.images[0] || ""}
            onChange={(url: string) => handleChange("images", [url])}
            label="Upload Event Flyer"
            accept="image/jpeg,image/png,image/webp"
            purpose="PRODUCT_IMAGE"
            entityId={params.id as string}
            maxSizeMB={5}
          />
        </Card>

        {/* Ticket Types */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Ticket Types</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addTicketType}
            >
              <Plus size={16} className="mr-1" />
              Add Ticket Type
            </Button>
          </div>
          <div className="space-y-4">
            {ticketTypes.map((ticket: any, index: number) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-500">
                      Ticket Type {index + 1}
                    </span>
                    {ticket.sold > 0 && (
                      <Badge className="bg-green-500/20 text-green-600 text-xs">
                        {ticket.sold} sold
                      </Badge>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTicketType(index)}
                    className="text-red-500 hover:text-red-500/80"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={ticket.name}
                      onChange={(e: any) =>
                        updateTicketType(index, "name", e.target?.value)
                      }
                      placeholder="e.g., VIP"
                    />
                  </div>
                  <div>
                    <Label>Price (₦)</Label>
                    <Input
                      type="number"
                      value={ticket.price}
                      onChange={(e: any) =>
                        updateTicketType(index, "price", Number(e.target?.value))
                      }
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={ticket.quantity}
                      onChange={(e: any) =>
                        updateTicketType(
                          index,
                          "quantity",
                          Number(e.target?.value),
                        )
                      }
                      placeholder="100"
                      min={ticket.sold}
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={ticket.description}
                      onChange={(e: any) =>
                        updateTicketType(index, "description", e.target?.value)
                      }
                      placeholder="What's included"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <BackButton variant="outline" label="Cancel" />
          <Button type="submit" isLoading={saving}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
