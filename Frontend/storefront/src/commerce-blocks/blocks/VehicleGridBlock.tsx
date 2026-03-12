"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Input, Button } from "@vayva/ui";
import { reportError } from "@/lib/error";

interface VehicleItem {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  image: string | null;
  slug: string;
}

export default function VehicleGridBlock({ year, make, model }: { year?: string; make?: string; model?: string }) {
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [qMake, setQMake] = useState(make || "");
  const [qModel, setQModel] = useState(model || "");
  const [qYear, setQYear] = useState(year || "");

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = new URL("/api/storefront/vehicles", window.location.origin);
        if (qYear) url.searchParams.set("year", qYear);
        if (qMake) url.searchParams.set("make", qMake);
        if (qModel) url.searchParams.set("model", qModel);

        const res = await fetch(url.toString());
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(String((json as any)?.error || "Failed to fetch vehicles"));

        setVehicles((json as any)?.data || []);
      } catch (e: unknown) {
        reportError(e, { scope: "CommerceBlock.VehicleGrid.fetch", app: "storefront" });
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [qYear, qMake, qModel]);

  const title = useMemo(() => {
    const parts = [qYear, qMake, qModel].filter(Boolean);
    return parts.length ? parts.join(" ") : "Vehicles";
  }, [qYear, qMake, qModel]);

  if (loading) return <div className="p-6 text-sm text-text-tertiary">Loading vehicles...</div>;

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
          <div className="text-xs font-black uppercase tracking-widest text-text-tertiary">Vehicles</div>
          <div className="text-2xl font-black tracking-tight">{title}</div>
        </div>
        <div className="grid grid-cols-3 gap-2 w-full sm:w-[520px]">
          <Input value={qYear} onChange={(e) => setQYear(e.target.value)} placeholder="Year" />
          <Input value={qMake} onChange={(e) => setQMake(e.target.value)} placeholder="Make" />
          <Input value={qModel} onChange={(e) => setQModel(e.target.value)} placeholder="Model" />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {vehicles.map((v) => (
          <div key={v.id} className="rounded-3xl border border-gray-200 bg-transparent overflow-hidden">
            {v.image ? (
              <div className="h-44 w-full bg-gray-100">
                <img src={v.image} alt={v.title} className="h-44 w-full object-cover" />
              </div>
            ) : null}
            <div className="p-5">
              <div className="font-black text-lg">{v.title}</div>
              <div className="mt-1 text-xs text-text-tertiary">{v.year} • {v.make} • {v.model}</div>
              <div className="mt-4 flex items-end justify-between">
                <div className="text-xl font-black text-blue-700">₦{Number(v.price).toLocaleString()}</div>
                <Button
                  onClick={() => {
                    window.location.href = `/vehicles/${v.slug}`;
                  }}
                  className="bg-transparent border border-gray-200 rounded-xl"
                >
                  View
                </Button>
              </div>
            </div>
          </div>
        ))}

        {vehicles.length === 0 ? (
          <div className="col-span-1 md:col-span-3 p-12 text-center border border-dashed border-border/60 rounded-[32px]">
            <p className="text-sm text-text-tertiary">No vehicles found.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
