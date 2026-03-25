"use client";

import { logger } from "@vayva/shared";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input, Label, Select, Textarea } from "@vayva/ui";
import { toast } from "sonner";
import { BackButton } from "@/components/ui/BackButton";
import { Plus, Trash as Trash2 } from "@phosphor-icons/react/ssr";
import { FileUpload } from "@/components/ui/FileUpload";
import { apiJson } from "@/lib/api-client-shared";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageWithInsights } from "@/components/layout/PageWithInsights";

interface TicketType {
  name: string;
  price: number;
  quantity: number;
  description: string;
}

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
    {
      name: "Regular",
      price: 0,
      quantity: 100,
      description: "General admission",
    },
  ]);

    const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addTicketType = () => {
    setTicketTypes([
      ...ticketTypes,
      { name: "", price: 0, quantity: 50, description: "" },
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
    if (ticketTypes.length > 1) {
      setTicketTypes(ticketTypes.filter((_: any, i: number) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      await apiJson<{ success: boolean }>("/api/nightlife/events", {
        method: "POST",
        body: JSON.stringify({ ...formData, ticketTypes }),
      });

      toast.success("Event created successfully");
      router.push("/dashboard/nightlife/events");
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[CREATE_EVENT_ERROR]", { error: _errMsg, app: "merchant" });
      toast.error("Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageWithInsights
        insights={
          <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Tip
              </div>
              <div className="mt-2 text-sm font-semibold text-gray-900">
                Add a flyer
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Events with clear posters and ticket types convert better.
              </p>
            </div>
          </>
        }
      >
        <div className="flex items-center gap-4">
          <BackButton href="/dashboard/nightlife/events" label="Back to Events" />
          <PageHeader title="Create New Event" subtitle="Set details, tickets, and a flyer." />
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
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
                  <span className="font-medium text-sm text-gray-500">
                    Ticket Type {index + 1}
                  </span>
                  {ticketTypes.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTicketType(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
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
          <Button type="submit" isLoading={loading}>
            Create Event
          </Button>
        </div>
      </form>
      </PageWithInsights>
    </div>
  );
}
