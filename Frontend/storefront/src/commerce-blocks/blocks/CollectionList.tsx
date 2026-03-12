"use client";

import React, { useEffect, useState } from "react";
import NextLink from "next/link";
import Image from "next/image";

import { reportError } from "@/lib/error";

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  productCount: number;
  url: string;
}

interface CollectionListProps {
  limit?: number;
}

export default function CollectionList({ limit = 6 }: CollectionListProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const url = new URL(
          "/api/storefront/collections",
          window.location.origin,
        );
        if (limit) url.searchParams.set("limit", limit.toString());

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error("Failed to fetch collections");

        const data = await res.json();
        setCollections(data.data || []);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: unknown) {
        reportError(err, {
          scope: "CommerceBlock.CollectionList.fetchCollections",
          app: "storefront",
        });
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [limit]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="space-y-4 animate-pulse">
            <div className="aspect-[4/3] w-full bg-white/40 rounded-2xl" />
            <div className="h-4 w-2/3 bg-white/40 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-3xl border border-red-100 bg-red-50/50 text-center">
        <p className="text-sm font-bold text-red-600">
          This section couldn't load.
        </p>
      </div>
    );
  }

  if (collections.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
      {collections.map((collection) => (
        <NextLink
          key={collection.id}
          href={collection.url}
          className="group block space-y-4"
        >
          <div className="relative aspect-[4/3] bg-white/40 rounded-2xl overflow-hidden shadow-sm group-hover:shadow-xl transition-all duration-500 group-hover:-translate-y-1">
            {collection.imageUrl ? (
              <Image
                src={collection.imageUrl}
                alt={collection.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/5">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/20 shadow-lg inline-flex items-center gap-2">
                <span className="text-[10px] font-black text-text-primary uppercase tracking-wider">
                  {collection.productCount} Items
                </span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">
              {collection.name}
            </h3>
            {collection.description && (
              <p className="text-[11px] text-text-tertiary line-clamp-1 mt-0.5">
                {collection.description}
              </p>
            )}
          </div>
        </NextLink>
      ))}
    </div>
  );
}
