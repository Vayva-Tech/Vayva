"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Badge, Card, CardContent, CardHeader } from "@vayva/ui";

interface DeliverySlot {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  bookedCount: number;
  isAvailable: boolean;
  zipCodes: string[];
}

interface DeliverySlotPickerProps {
  storeId: string;
  customerZipCode: string;
  selectedSlotId?: string;
  onSlotSelect?: (slotId: string) => void;
}

export function DeliverySlotPicker({
  storeId,
  customerZipCode,
  selectedSlotId,
  onSlotSelect,
}: DeliverySlotPickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [availableSlots, setAvailableSlots] = useState<DeliverySlot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      void fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate, customerZipCode, storeId]);

  const fetchAvailableSlots = async (date: Date) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/meal-kit/delivery-slots?storeId=${storeId}&date=${date.toISOString()}&zipCode=${customerZipCode}`
      );

      if (response.ok) {
        const data = (await response.json()) as DeliverySlot[];
        setAvailableSlots(data);
      }
    } catch (error) {
      console.error("Failed to fetch delivery slots:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSlot = (slotId: string) => {
    onSlotSelect?.(slotId);
  };

  const getAvailabilityStatus = (slot: DeliverySlot) => {
    const remaining = slot.maxCapacity - slot.bookedCount;

    if (!slot.isAvailable) return { text: "Full", variant: "error" as const };
    if (remaining <= 2)
      return { text: `${remaining} left`, variant: "error" as const };
    if (remaining <= 5)
      return { text: `${remaining} left`, variant: "warning" as const };
    return { text: "Available", variant: "default" as const };
  };

  const dateInputValue = selectedDate
    ? format(selectedDate, "yyyy-MM-dd")
    : "";

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Choose delivery slot</h3>
            <p className="text-sm text-gray-600">
              Select a convenient date and time for delivery
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-2">
            {customerZipCode}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <label htmlFor="delivery-date" className="text-sm font-medium">
            Select date
          </label>
          <input
            id="delivery-date"
            type="date"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            value={dateInputValue}
            onChange={(e) => {
              const v = e.target.value;
              setSelectedDate(v ? new Date(`${v}T12:00:00`) : undefined);
            }}
          />
          {selectedDate ? (
            <p className="text-sm text-gray-600">
              {format(selectedDate, "PPP")}
            </p>
          ) : null}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Available time slots</span>
            {loading ? (
              <span className="text-xs text-gray-500">Loading…</span>
            ) : null}
          </div>

          {availableSlots.length === 0 ? (
            <div className="rounded-lg bg-gray-50 py-8 text-center text-sm text-gray-600">
              No delivery slots available for this date in your area.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {availableSlots.map((slot) => {
                const status = getAvailabilityStatus(slot);
                const isSelected = selectedSlotId === slot.id;

                return (
                  <Card
                    key={slot.id}
                    className={`cursor-pointer transition-all ${
                      isSelected ? "ring-2 ring-emerald-500" : ""
                    } ${!slot.isAvailable ? "cursor-not-allowed opacity-50" : ""}`}
                    onClick={() => slot.isAvailable && handleBookSlot(slot.id)}
                  >
                    <CardContent className="p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-semibold">
                          {slot.startTime} – {slot.endTime}
                        </span>
                        {isSelected ? (
                          <span className="text-emerald-600">✓</span>
                        ) : null}
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant={status.variant} className="text-xs">
                          {status.text}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {slot.bookedCount}/{slot.maxCapacity} booked
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          <p className="font-semibold">Delivery information</p>
          <ul className="space-y-1 text-xs">
            <li>• Free delivery on orders above ₦10,000</li>
            <li>• Standard delivery fee: ₦1,500</li>
            <li>• SMS notification on delivery day</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
