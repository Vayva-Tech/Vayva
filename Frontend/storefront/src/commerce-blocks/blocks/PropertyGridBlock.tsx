"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button, Input } from "@vayva/ui";
import { reportError } from "@/lib/error";

interface PropertyItem {
  id: string;
  title: string;
  description: string;
  purpose: string;
  type: string;
  price: number;
  currency: string;
  address: string;
  city: string;
  state: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  featured: boolean;
  image: string | null;
}

export default function PropertyGridBlock({ q }: { q?: string }) {
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState(q || "");

  useEffect(() => {
    const run = async () => {
      try {
        const url = new URL("/api/storefront/properties", window.location.origin);
        if (query.trim()) url.searchParams.set("q", query.trim());

        const res = await fetch(url.toString());
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(String((json as any)?.error || "Failed to fetch properties"));

        setProperties((json as any)?.data || []);
      } catch (e: unknown) {
        reportError(e, { scope: "CommerceBlock.PropertyGrid.fetch", app: "storefront" });
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [query]);

  const title = useMemo(() => {
    return query.trim() ? `Results for “${query.trim()}”` : "Featured properties";
  }, [query]);

  if (loading) return <div className="p-6 text-sm text-text-tertiary">Loading properties...</div>;

  if (error) {
    return (
      <div className="p-6 rounded-3xl border border-red-100 bg-red-50/50">
        <p className="text-sm font-bold text-red-600">This section couldn't load.</p>
        <p className="text-[10px] text-red-400 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end justify-between">
        <div>
          <div className="text-xs font-black uppercase tracking-widest text-text-tertiary">Real Estate</div>
          <div className="text-2xl font-black tracking-tight">{title}</div>
        </div>
        <div className="w-full sm:w-96">
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search city, address, title..." />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {properties.map((p) => (
          <div key={p.id} className="rounded-3xl border border-gray-200 bg-transparent overflow-hidden">
            {p.image ? (
              <div className="h-44 w-full bg-gray-100">
                <img src={p.image} alt={p.title} className="h-44 w-full object-cover" />
              </div>
            ) : null}
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="font-black text-lg leading-tight">{p.title}</div>
                <div className="text-[10px] px-2 py-1 rounded-full bg-background/40 text-text-tertiary">
                  {p.purpose}
                </div>
              </div>
              <div className="mt-2 text-xs text-text-tertiary">{p.city}, {p.state}</div>
              <div className="mt-3 text-xl font-black text-[#2563EB]">₦{Number(p.price).toLocaleString()}</div>
              <div className="mt-4">
                <Button
                  onClick={() => {
                    window.location.href = `?propertyId=${p.id}#schedule-viewing`;
                  }}
                  className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-bold py-3 rounded-xl"
                >
                  Schedule viewing
                </Button>
              </div>
            </div>
          </div>
        ))}

        {properties.length === 0 ? (
          <div className="col-span-1 md:col-span-3 p-12 text-center border border-dashed border-border/60 rounded-[32px]">
            <p className="text-sm text-text-tertiary">No properties found.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
