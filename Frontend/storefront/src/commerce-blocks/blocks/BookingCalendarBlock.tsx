"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button, Input } from "@vayva/ui";
import { reportError } from "@/lib/error";

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  serviceDetails?: {
    duration?: number;
    hasDeposit?: boolean;
  };
}

export default function BookingCalendarBlock({ serviceId }: { serviceId?: string }) {
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(serviceId || "");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successBookingId, setSuccessBookingId] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const url = new URL("/api/storefront/services", window.location.origin);
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error("Failed to fetch services");
        const json = await res.json();
        const svc = (json.data || []) as Service[];
        setServices(svc);

        if (!selectedServiceId && svc.length > 0) {
          setSelectedServiceId(svc[0]!.id);
        }
      } catch (e: unknown) {
        reportError(e, { scope: "CommerceBlock.BookingCalendar.fetchServices", app: "storefront" });
        setError(e instanceof Error ? e.message : "Failed to load services");
      } finally {
        setLoadingServices(false);
      }
    };

    run();
  }, [selectedServiceId]);

  const selectedService = useMemo(() => {
    return services.find((s) => s.id === selectedServiceId) || null;
  }, [services, selectedServiceId]);

  useEffect(() => {
    const run = async () => {
      if (!selectedServiceId || !date) return;
      setLoadingSlots(true);
      setError(null);
      setSuccessBookingId(null);

      try {
        const url = new URL("/api/storefront/bookings/slots", window.location.origin);
        url.searchParams.set("serviceId", selectedServiceId);
        url.searchParams.set("date", date);

        const res = await fetch(url.toString());
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(String((json as any)?.error || "Failed to fetch slots"));
        }

        const nextSlots = (json as any)?.data?.slots || [];
        setSlots(nextSlots);
        setSelectedSlot("");
      } catch (e: unknown) {
        reportError(e, { scope: "CommerceBlock.BookingCalendar.fetchSlots", app: "storefront" });
        setError(e instanceof Error ? e.message : "Failed to load slots");
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    run();
  }, [selectedServiceId, date]);

  const canSubmit = Boolean(selectedServiceId && date && selectedSlot && name.trim() && !submitting);

  const onSubmit = async () => {
    if (!selectedService) return;

    setSubmitting(true);
    setError(null);
    setSuccessBookingId(null);

    try {
      const startsAt = new Date(selectedSlot);
      const durationMinutes =
        Number.isFinite(Number(selectedService.serviceDetails?.duration))
          ? Number(selectedService.serviceDetails?.duration)
          : 60;
      const endsAt = new Date(startsAt);
      endsAt.setMinutes(endsAt.getMinutes() + Math.max(15, durationMinutes));

      const res = await fetch("/api/storefront/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService.id,
          startsAt: startsAt.toISOString(),
          endsAt: endsAt.toISOString(),
          name: name.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(String((json as any)?.error || "Booking failed"));
      }

      const bookingId = (json as any)?.data?.bookingId;
      setSuccessBookingId(bookingId || "ok");
    } catch (e: unknown) {
      reportError(e, { scope: "CommerceBlock.BookingCalendar.createBooking", app: "storefront" });
      setError(e instanceof Error ? e.message : "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingServices) {
    return <div className="p-6 text-sm text-text-tertiary">Loading booking calendar...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex flex-col gap-2">
        <div className="text-xs font-black uppercase tracking-widest text-text-tertiary">Bookings</div>
        <div className="text-2xl font-black tracking-tight">Book an Appointment</div>
        <div className="text-sm text-text-tertiary">
          Select a service, pick a date, choose a time slot, and confirm.
        </div>
      </div>

      {error ? (
        <div className="mt-6 p-4 rounded-2xl border border-red-100 bg-red-50/50">
          <div className="text-sm font-bold text-red-600">This section couldn't load.</div>
          <div className="text-[10px] text-red-400 mt-1">{error}</div>
        </div>
      ) : null}

      {successBookingId ? (
        <div className="mt-6 p-4 rounded-2xl border border-green-100 bg-green-50/50">
          <div className="text-sm font-bold text-green-700">Booking created.</div>
          <div className="text-[10px] text-green-600 mt-1">Reference: {successBookingId}</div>
        </div>
      ) : null}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-gray-200 bg-transparent p-5">
          <div className="text-sm font-black">Service</div>
          <div className="mt-3">
            <select
              className="w-full rounded-xl border border-gray-200 bg-white/70 px-3 py-3 text-sm"
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {selectedService ? (
            <div className="mt-4 text-xs text-text-tertiary">
              <div className="font-bold text-text-secondary">₦{Number(selectedService.price).toLocaleString()}</div>
              {selectedService.description ? <div className="mt-1">{selectedService.description}</div> : null}
              {selectedService.serviceDetails?.duration ? (
                <div className="mt-2">Duration: {selectedService.serviceDetails.duration} mins</div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-6 text-sm font-black">Date</div>
          <div className="mt-3">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="mt-6 text-sm font-black">Your details</div>
          <div className="mt-3 grid grid-cols-1 gap-3">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)" />
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)" />
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-transparent p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-black">Available times</div>
            <div className="text-[10px] text-text-tertiary">
              {loadingSlots ? "Loading..." : `${slots.length} slots`}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {slots.map((iso) => {
              const label = new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
              const active = selectedSlot === iso;
              return (
                <Button
                  key={iso}
                  onClick={() => setSelectedSlot(iso)}
                  className={
                    active
                      ? "py-3 px-3 rounded-xl border border-blue-600 bg-blue-50 text-blue-700"
                      : "py-3 px-3 rounded-xl border border-gray-200 hover:border-blue-300 text-gray-700"
                  }
                >
                  {label}
                </Button>
              );
            })}

            {!loadingSlots && slots.length === 0 ? (
              <div className="col-span-2 sm:col-span-3 p-4 rounded-2xl border border-gray-100 bg-background/40 text-xs text-text-tertiary">
                No availability for this date.
              </div>
            ) : null}
          </div>

          <div className="mt-6">
            <Button
              onClick={onSubmit}
              disabled={!canSubmit}
              className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl disabled:opacity-50"
            >
              {submitting ? "Booking..." : "Confirm booking"}
            </Button>
            <div className="mt-2 text-[10px] text-text-tertiary">
              Payment can be added after confirmation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
