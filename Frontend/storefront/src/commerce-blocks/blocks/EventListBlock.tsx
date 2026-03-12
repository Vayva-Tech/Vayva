"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button, Input } from "@vayva/ui";
import { reportError } from "@/lib/error";

interface EventItem {
  id: string;
  title: string;
  description: string | null;
  venue: string | null;
  address: string | null;
  startDate: string;
  endDate: string;
  timezone: string;
  capacity: number;
  bannerImage: string | null;
  category: string;
}

export default function EventListBlock({ query }: { query?: string }) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState(query || "");

  useEffect(() => {
    const run = async () => {
      try {
        const url = new URL("/api/storefront/events", window.location.origin);
        url.searchParams.set("upcoming", "true");
        const res = await fetch(url.toString());
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(String((json as any)?.error || "Failed to fetch events"));
        setEvents((json as any)?.data || []);
      } catch (e: unknown) {
        reportError(e, { scope: "CommerceBlock.EventList.fetch", app: "storefront" });
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return events.filter((e) => {
      if (!s) return true;
      return (
        e.title.toLowerCase().includes(s) ||
        (e.description || "").toLowerCase().includes(s) ||
        (e.venue || "").toLowerCase().includes(s)
      );
    });
  }, [events, q]);

  if (loading) return <div className="p-6 text-sm text-text-tertiary">Loading events...</div>;

  if (error) {
    return (
      <div className="p-6 rounded-3xl border border-red-100 bg-red-50/50">
        <p className="text-sm font-bold text-red-600">This section couldn't load.</p>
        <p className="text-[10px] text-red-400 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-widest text-text-tertiary">Events</div>
          <div className="text-2xl font-black tracking-tight">Upcoming events</div>
        </div>
        <div className="w-full sm:w-80">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search events..." />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((e) => {
          const start = new Date(e.startDate);
          const label = start.toLocaleString([], {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div key={e.id} className="rounded-3xl border border-gray-200 bg-transparent overflow-hidden">
              {e.bannerImage ? (
                <div className="h-44 w-full bg-gray-100">
                  <img src={e.bannerImage} alt={e.title} className="h-44 w-full object-cover" />
                </div>
              ) : null}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="font-black text-lg leading-tight">{e.title}</div>
                  <div className="text-[10px] px-2 py-1 rounded-full bg-background/40 text-text-tertiary">
                    {e.category}
                  </div>
                </div>

                <div className="mt-2 text-xs text-text-tertiary">{label}</div>
                {e.venue ? <div className="mt-1 text-xs text-text-tertiary">{e.venue}</div> : null}

                {e.description ? (
                  <div className="mt-3 text-sm text-text-secondary line-clamp-3">{e.description}</div>
                ) : null}

                <div className="mt-5">
                  <Button
                    onClick={() => {
                      window.location.href = `?eventId=${e.id}#tickets`;
                    }}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl"
                  >
                    Get tickets
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
