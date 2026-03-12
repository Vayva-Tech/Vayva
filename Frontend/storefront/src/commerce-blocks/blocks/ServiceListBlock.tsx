"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Input } from "@vayva/ui";
import { reportError } from "@/lib/error";
import { ServiceList } from "@/templates/bookly-pro/components/ServiceList";
import { BookingWizard } from "@/templates/bookly-pro/components/BookingWizard";

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

function buildBookingTimes(details: any, durationMinutes: number): { startsAt: string; endsAt: string } | null {
  const timeRaw = typeof details?.time === "string" ? details.time : "";
  const dateRaw = typeof details?.date === "string" ? details.date : "";

  const [hhStr, mmStr] = timeRaw.split(":");
  const hh = Number.parseInt(hhStr || "", 10);
  const mm = Number.parseInt(mmStr || "0", 10);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;

  // BookingWizard currently returns demo day-of-month strings (e.g. "27").
  // We'll interpret that as "next occurrence of this day" in the current (or next) month.
  const day = Number.parseInt(dateRaw, 10);
  if (!Number.isFinite(day) || day < 1 || day > 31) return null;

  const now = new Date();
  const starts = new Date(now);
  starts.setSeconds(0, 0);
  starts.setHours(hh, mm, 0, 0);
  starts.setDate(day);

  // If date resolves to the past, bump to next month.
  if (starts.getTime() < now.getTime()) {
    starts.setMonth(starts.getMonth() + 1);
  }

  const ends = new Date(starts);
  ends.setMinutes(ends.getMinutes() + Math.max(15, durationMinutes));

  return { startsAt: starts.toISOString(), endsAt: ends.toISOString() };
}

export default function ServiceListBlock({ category }: { category?: string }) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Service | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const url = new URL("/api/storefront/services", window.location.origin);
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error("Failed to fetch services");
        const json = await res.json();
        setServices(json.data || []);
      } catch (e: unknown) {
        reportError(e, { scope: "CommerceBlock.ServiceList.fetch", app: "storefront" });
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return services.filter((s) => {
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        (s.description || "").toLowerCase().includes(q)
      );
    });
  }, [services, query]);

  if (loading) return <div className="p-6 text-sm text-text-tertiary">Loading services...</div>;

  if (error) {
    return (
      <div className="p-6 rounded-3xl border border-red-100 bg-red-50/50">
        <p className="text-sm font-bold text-red-600">This section couldn't load.</p>
        <p className="text-[10px] text-red-400 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-4xl mx-auto px-6 pt-10">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-text-tertiary">
              Bookings
            </div>
            <div className="text-2xl font-black tracking-tight">Services</div>
          </div>
          <div className="w-full sm:w-80">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search services..."
            />
          </div>
        </div>
      </div>

      {/* Reuse existing full-feature template component */}
      <ServiceList
        services={filtered as any}
        onBook={(svc) => setSelected(svc as any)}
      />

      {selected && (
        <BookingWizard
          service={selected as any}
          onClose={() => setSelected(null)}
          onComplete={async (details: any) => {
            try {
              const durationMinutes =
                Number.isFinite(Number(selected.serviceDetails?.duration))
                  ? Number(selected.serviceDetails?.duration)
                  : 60;

              const times = buildBookingTimes(details, durationMinutes);
              if (!times) {
                throw new Error("Invalid booking time selection");
              }

              await fetch("/api/storefront/bookings/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  serviceId: selected.id,
                  startsAt: times.startsAt,
                  endsAt: times.endsAt,
                  name: "Guest",
                }),
              });
            } catch (e: unknown) {
              reportError(e, {
                scope: "CommerceBlock.ServiceList.createBooking",
                app: "storefront",
              });
            } finally {
              setSelected(null);
            }
          }}
        />
      )}

      {/* Category prop exists in registry; we keep it reserved for future filtering */}
      {category ? (
        <div className="max-w-4xl mx-auto px-6 pb-10 text-[10px] text-text-tertiary">
          Category filter: {category}
        </div>
      ) : null}
    </div>
  );
}
