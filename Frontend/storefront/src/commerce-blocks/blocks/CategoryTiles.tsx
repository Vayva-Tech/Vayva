"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@vayva/ui";

import { reportError } from "@/lib/error";

interface Collection {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  url: string;
}

export default function CategoryTiles() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await fetch("/api/storefront/collections?limit=4");
        const data = await res.json();
        setCollections(data.data || []);
      } catch (err: unknown) {
        reportError(err, {
          scope: "CommerceBlock.CategoryTiles.fetchCollections",
          app: "storefront",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-white/40 animate-pulse rounded-3xl"
          />
        ))}
      </div>
    );
  }

  if (collections.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {collections.map((collection, i) => (
        <Link
          key={collection.id}
          href={collection.url}
          className={cn(
            "group relative aspect-square rounded-[32px] overflow-hidden flex items-center justify-center p-6 text-center transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl",
            i % 4 === 0
              ? "bg-primary/10 text-primary"
              : i % 4 === 1
                ? "bg-blue-500/10 text-blue-600"
                : i % 4 === 2
                  ? "bg-amber-500/10 text-amber-600"
                  : "bg-zinc-900 text-white",
          )}
        >
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
          <div className="relative space-y-2">
            <h3 className="font-black uppercase tracking-tight text-lg md:text-xl leading-none">
              {collection.name}
            </h3>
            <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">
              {collection.productCount} Products
            </p>
          </div>
          <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </div>
        </Link>
      ))}
    </div>
  );
}
