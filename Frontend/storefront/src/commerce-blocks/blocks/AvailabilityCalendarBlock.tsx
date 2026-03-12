"use client";

import React, { useEffect, useState } from "react";
import { reportError } from "@/lib/error";
import { BookingWidget } from "@/components/travel/BookingWidget";
import { useStore } from "@/context/StoreContext";
import type { PublicStore } from "@/types/storefront";

interface StayItem {
  id: string;
  title: string;
  description: string | null;
  price: number;
  image: string | null;
}

export default function AvailabilityCalendarBlock({ productId }: { productId?: string }) {
  const { store } = useStore();
  const [stay, setStay] = useState<StayItem | null>(null);
  const [loading, setLoading] = useState(true);

  const publicStore: PublicStore | null = store
    ? {
        id: store.id,
        slug: store.slug,
        name: store.name,
        tagline: store.tagline,
        industry: store.industry,
        plan: store.plan,
        theme: store.theme
          ? {
              templateId: store.theme.templateId || "minimal",
              primaryColor: store.theme.primaryColor || "#000000",
              accentColor: store.theme.accentColor || "#FFFFFF",
              oneProductConfig: store.theme.oneProductConfig,
            }
          : {
              templateId: "minimal",
              primaryColor: "#000000",
              accentColor: "#FFFFFF",
            },
        contact: store.contact,
        policies: store.policies,
      }
    : null;

  useEffect(() => {
    const run = async () => {
      try {
        if (productId) {
          // Minimal fetch by listing and finding the item (keeps API surface small)
          const url = new URL("/api/storefront/stays", window.location.origin);
          url.searchParams.set("limit", "50");
          const res = await fetch(url.toString());
          const json = await res.json().catch(() => ({}));
          const list: StayItem[] = (json as any)?.data || [];
          const found = list.find((s) => s.id === productId) || null;
          setStay(found);
          return;
        }

        const url = new URL("/api/storefront/stays", window.location.origin);
        url.searchParams.set("limit", "1");
        const res = await fetch(url.toString());
        const json = await res.json().catch(() => ({}));
        setStay(((json as any)?.data || [])[0] || null);
      } catch (e: unknown) {
        reportError(e, { scope: "CommerceBlock.AvailabilityCalendar.fetch", app: "storefront" });
        setStay(null);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [productId]);

  if (loading) return <div className="p-6 text-sm text-text-tertiary">Loading availability...</div>;

  if (!publicStore || !stay) {
    return (
      <div className="p-6 rounded-3xl border border-gray-200 bg-transparent">
        <div className="text-sm font-bold">No stay selected</div>
        <div className="text-xs text-text-tertiary mt-1">Add a stay product first, then set productId.</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">
      <div className="rounded-3xl border border-gray-200 bg-transparent overflow-hidden">
        {stay.image ? (
          <div className="h-64 w-full bg-gray-100">
            <img src={stay.image} alt={stay.title} className="h-64 w-full object-cover" />
          </div>
        ) : null}
        <div className="p-6">
          <div className="text-xs font-black uppercase tracking-widest text-text-tertiary">Stays</div>
          <div className="text-2xl font-black tracking-tight mt-1">{stay.title}</div>
          {stay.description ? <div className="mt-3 text-sm text-text-secondary">{stay.description}</div> : null}
        </div>
      </div>

      <BookingWidget productId={stay.id} price={stay.price} store={publicStore} />
    </div>
  );
}
