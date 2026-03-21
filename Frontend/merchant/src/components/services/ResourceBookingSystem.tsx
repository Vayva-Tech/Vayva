"use client";

import { useState, useMemo } from "react";
import { Button, Input, Label, Select, Textarea } from "@vayva/ui";
import { Plus, Trash, Clock, MapPin, Users, Calendar as CalendarIcon, Check } from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import { format, addMinutes, parseISO, isWithinInterval, startOfDay, endOfDay } from "date-fns";

export interface Resource {
  id: string;
  name: string;
  type: "room" | "equipment" | "vehicle" | "other";
  capacity?: number;
  location?: string;
  description?: string;
  color: string;
}

export interface ResourceBooking {
  id: string;
  resourceId: string;
  title: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  bookedBy?: string;
  notes?: string;
  status: "confirmed" | "pending" | "cancelled";
}

interface ResourceBookingSystemProps {
  resources: Resource[];
  bookings: ResourceBooking[];
  onResourcesChange: (resources: Resource[]) => void;
  onBookingsChange: (bookings: ResourceBooking[]) => void;
}

const RESOURCE_COLORS = [
  "#3b82f6", // blue
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
];

export function ResourceBookingSystem({
  resources,
  bookings,
  onResourcesChange,
  onBookingsChange,
}: ResourceBookingSystemProps) {
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState<boolean>(false);

  // New resource form
  const [newResourceName, setNewResourceName] = useState<string>("");
  const [newResourceType, setNewResourceType] = useState<Resource["type"]>("room");
  const [newResourceCapacity, setNewResourceCapacity] = useState<string>("");
  const [newResourceLocation, setNewResourceLocation] = useState<string>("");

  // New booking form
  const [bookingTitle, setBookingTitle] = useState<string>("");
  const [bookingStart, setBookingStart] = useState<string>("09:00");
  const [bookingEnd, setBookingEnd] = useState<string>("10:00");
  const [bookingNotes, setBookingNotes] = useState<string>("");

  const selectedResourceData = resources.find((r) => r.id === selectedResource);

  const addResource = () => {
    if (!newResourceName.trim()) {
      toast.error("Resource name is required");
      return;
    }

    const newResource: Resource = {
      id: crypto.randomUUID(),
      name: newResourceName.trim(),
      type: newResourceType,
      capacity: newResourceCapacity ? parseInt(newResourceCapacity) : undefined,
      location: newResourceLocation.trim() || undefined,
      color: RESOURCE_COLORS[resources.length % RESOURCE_COLORS.length],
    };

    onResourcesChange([...resources, newResource]);
    setNewResourceName("");
    setNewResourceCapacity("");
    setNewResourceLocation("");
    setSelectedResource(newResource.id);
  };

  const removeResource = (id: string) => {
    onResourcesChange(resources.filter((r) => r.id !== id));
    onBookingsChange(bookings.filter((b) => b.resourceId !== id));
    if (selectedResource === id) setSelectedResource(null);
  };

  const addBooking = () => {
    if (!selectedResource || !bookingTitle.trim()) {
      toast.error("Please select a resource and enter a title");
      return;
    }

    const startDateTime = new Date(`${selectedDate}T${bookingStart}`);
    const endDateTime = new Date(`${selectedDate}T${bookingEnd}`);

    if (endDateTime <= startDateTime) {
      toast.error("End time must be after start time");
      return;
    }

    // Check for conflicts
    const hasConflict = bookings.some((b) => {
      if (b.resourceId !== selectedResource || b.status === "cancelled") return false;
      const bStart = parseISO(b.startTime);
      const bEnd = parseISO(b.endTime);
      return (
        isWithinInterval(startDateTime, { start: bStart, end: bEnd }) ||
        isWithinInterval(endDateTime, { start: bStart, end: bEnd }) ||
        isWithinInterval(bStart, { start: startDateTime, end: endDateTime })
      );
    });

    if (hasConflict) {
      toast.error("This time slot conflicts with an existing booking");
      return;
    }

    const newBooking: ResourceBooking = {
      id: crypto.randomUUID(),
      resourceId: selectedResource,
      title: bookingTitle.trim(),
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      notes: bookingNotes.trim() || undefined,
      status: "confirmed",
    };

    onBookingsChange([...bookings, newBooking]);
    setBookingTitle("");
    setBookingNotes("");
    setShowBookingForm(false);
    toast.success("Booking confirmed!");
  };

  const cancelBooking = (bookingId: string) => {
    onBookingsChange(
      bookings.map((b) =>
        b.id === bookingId ? { ...b, status: "cancelled" as const } : b,
      ),
    );
    toast.success("Booking cancelled");
  };

  const getBookingsForResourceAndDate = (resourceId: string, dateStr: string) => {
    const date = parseISO(dateStr);
    return bookings.filter((b) => {
      if (b.resourceId !== resourceId || b.status === "cancelled") return false;
      const bDate = parseISO(b.startTime);
      return format(bDate, "yyyy-MM-dd") === dateStr;
    });
  };

  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0");
    return [`${hour}:00`, `${hour}:30`];
  }).flat();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Resource Booking</h3>
        </div>
        <Input
          type="date"
          value={selectedDate}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedDate(e.target.value)}
          className="w-auto"
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Resources List */}
        <div className="w-full lg:w-72 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Resources ({resources.length})</h4>
          </div>

          <div className="space-y-2">
            {resources.map((resource) => (
              <Button
                key={resource.id}
                variant="ghost"
                onClick={() => setSelectedResource(resource.id)}
                className={`w-full flex items-start gap-2 p-3 rounded-lg border text-left transition-colors h-auto justify-start ${
                  selectedResource === resource.id
                    ? "border-green-500 bg-green-500/5"
                    : "border-gray-100 hover:bg-gray-50"
                }`}
              >
                <div
                  className="w-3 h-3 rounded-full mt-1"
                  style={{ backgroundColor: resource.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{resource.name}</p>
                  <p className="text-xs text-gray-400 capitalize">
                    {resource.type}
                  </p>
                  {resource.capacity && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <Users className="h-3 w-3" />
                      {resource.capacity} people
                    </p>
                  )}
                  {resource.location && (
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {resource.location}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    removeResource(resource.id);
                  }}
                  className="text-gray-400 hover:text-red-500 h-auto p-1"
                >
                  <Trash className="h-3.5 w-3.5" />
                </Button>
              </Button>
            ))}
          </div>

          {/* Add Resource */}
          <div className="pt-2 border-t border-gray-100 space-y-2">
            <Input
              value={newResourceName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewResourceName(e.target.value)}
              placeholder="Resource name"
              className="h-8 text-sm"
            />
            <Select
              value={newResourceType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewResourceType(e.target.value as Resource["type"])}
              className="w-full h-8 px-2 border border-gray-100 rounded text-sm bg-white"
            >
              <option value="room">Room</option>
              <option value="equipment">Equipment</option>
              <option value="vehicle">Vehicle</option>
              <option value="other">Other</option>
            </Select>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                value={newResourceCapacity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewResourceCapacity(e.target.value)}
                placeholder="Capacity"
                className="h-8 text-sm"
              />
              <Input
                value={newResourceLocation}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewResourceLocation(e.target.value)}
                placeholder="Location"
                className="h-8 text-sm"
              />
            </div>
            <Button size="sm" variant="outline" onClick={addResource} className="w-full">
              <Plus className="h-3 w-3 mr-1" />
              Add Resource
            </Button>
          </div>
        </div>

        {/* Bookings View */}
        <div className="flex-1">
          {selectedResourceData ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">
                    {selectedResourceData.name} - {format(parseISO(selectedDate), "MMMM d, yyyy")}
                  </h4>
                  <p className="text-sm text-gray-400">
                    {getBookingsForResourceAndDate(selectedResource!, selectedDate).length} bookings today
                  </p>
                </div>
                <Button size="sm" onClick={() => setShowBookingForm(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Book Resource
                </Button>
              </div>

              {/* Timeline View */}
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-3 border-b border-gray-100">
                  <div className="grid grid-cols-[60px_1fr] gap-4">
                    <span className="text-xs font-medium text-gray-500">Time</span>
                    <span className="text-xs font-medium text-gray-500">Booking</span>
                  </div>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {timeSlots.map((time) => {
                    const bookings_ = getBookingsForResourceAndDate(selectedResource!, selectedDate);
                    const booking = bookings_.find((b) => {
                      const start = format(parseISO(b.startTime), "HH:mm");
                      const end = format(parseISO(b.endTime), "HH:mm");
                      return time >= start && time < end;
                    });

                    return (
                      <div
                        key={time}
                        className="grid grid-cols-[60px_1fr] gap-4 p-2 border-b border-gray-100 hover:bg-white"
                      >
                        <span className="text-xs text-gray-400">{time}</span>
                        {booking ? (
                          <div
                            className="p-2 rounded text-sm"
                            style={{
                              backgroundColor: `${selectedResourceData.color}20`,
                              borderLeft: `3px solid ${selectedResourceData.color}`,
                            }}
                          >
                            <div className="font-medium">{booking.title}</div>
                            <div className="text-xs text-gray-400">
                              {format(parseISO(booking.startTime), "h:mm a")} -{" "}
                              {format(parseISO(booking.endTime), "h:mm a")}
                            </div>
                            {booking.notes && (
                              <div className="text-xs text-gray-400 mt-1">
                                {booking.notes}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400/50">—</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <CalendarIcon className="h-12 w-12 mb-2 opacity-50" />
              <p className="text-sm">Select a resource to view bookings</p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && selectedResource && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
            <h4 className="font-medium">New Booking</h4>

            <div>
              <Label className="text-xs">Resource</Label>
              <p className="text-sm font-medium">{selectedResourceData?.name}</p>
            </div>

            <div>
              <Label className="text-xs">Title</Label>
              <Input
                value={bookingTitle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBookingTitle(e.target.value)}
                placeholder="e.g., Client Meeting"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Start Time</Label>
                <Input
                  type="time"
                  value={bookingStart}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBookingStart(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">End Time</Label>
                <Input
                  type="time"
                  value={bookingEnd}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBookingEnd(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Notes</Label>
              <Textarea
                value={bookingNotes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBookingNotes(e.target.value)}
                placeholder="Additional details..."
                rows={2}
                className="mt-1 resize-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowBookingForm(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={addBooking} className="flex-1">
                <Check className="h-4 w-4 mr-1" />
                Confirm Booking
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
