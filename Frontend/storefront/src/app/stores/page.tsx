"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { reportError } from "@/lib/error";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

type StoreDirectoryItem = {
  id: string;
  displayName: string;
  city?: string | null;
  state?: string | null;
  slug: string;
  pickupAvailable?: boolean | null;
  whatsappNumberE164?: string | null;
};

export default function StoreDirectoryPage(): React.JSX.Element {
  const [stores, setStores] = useState<StoreDirectoryItem[]>([]);
  const [filters, setFilters] = useState<{
    state: string;
    city: string;
    category: string;
  }>({
    state: "",
    city: "",
    category: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStores = async () => {
    try {
      const params = new URLSearchParams({
        state: filters.state,
        city: filters.city,
        category: filters.category,
      }).toString();
      const res = await axios.get(`${API_URL}/marketplace/stores?${params}`);
      setStores(res.data || []);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: unknown) {
      reportError(err, {
        scope: "StoreDirectoryPage.fetchStores",
        app: "storefront",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [filters]);

  return (
    <div className="min-h-screen bg-[#F7FAF7]">
      {/* Header */}
      <div className="bg-background/70 backdrop-blur-xl border-b border-gray-100 px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-[#0B1220] mb-4">
            Discover Stores
          </h1>
          <p className="text-lg text-[#525252] mb-8">
            Find trusted Nigerian merchants near you
          </p>

          {/* Filters */}
          <div className="flex gap-4">
            <select
              className="px-4 py-3 border border-gray-200 rounded-lg bg-background/70 backdrop-blur-xl"
              value={filters.state}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={(e: any) =>
                setFilters({ ...filters, state: e.target.value })
              }
            >
              <option value="">All States</option>
              <option value="Lagos">Lagos</option>
              <option value="FCT">Abuja (FCT)</option>
              <option value="Rivers">Rivers</option>
            </select>
            <select
              className="px-4 py-3 border border-gray-200 rounded-lg bg-background/70 backdrop-blur-xl"
              value={filters.city}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={(e: any) =>
                setFilters({ ...filters, city: e.target.value })
              }
            >
              <option value="">All Cities</option>
              <option value="Ikeja">Ikeja</option>
              <option value="Lekki">Lekki</option>
              <option value="Abuja">Abuja</option>
            </select>
          </div>
        </div>
      </div>

      {/* Store Grid */}
      <div className="max-w-6xl mx-auto px-8 py-12">
        {isLoading ? (
          <div className="text-center text-gray-400 py-12">
            Loading stores...
          </div>
        ) : stores.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            No stores found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <div
                key={store.id}
                className="bg-background/70 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-2xl font-bold text-gray-400">
                    {store.displayName?.[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0B1220]">
                      {store.displayName}
                    </h3>
                    <p className="text-sm text-[#525252]">
                      {store.city}, {store.state}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mb-4">
                  <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded font-bold">
                    Verified
                  </span>
                  {store.pickupAvailable && (
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold">
                      Pickup
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/stores/${store.slug}`}
                    className="flex-1 px-4 py-2 bg-[#22C55E] text-white rounded-lg text-center font-medium hover:bg-[#16A34A] transition-all"
                  >
                    Visit Store
                  </a>
                  {store.whatsappNumberE164 && (
                    <a
                      href={`https://wa.me/${store.whatsappNumberE164}`}
                      className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-white/60 transition-all"
                    >
                      💬
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
