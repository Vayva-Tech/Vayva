"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { reportError } from "@/lib/error";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  publishedAt: string | null;
}

export default function PostList({ limit = 6 }: { limit?: number }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const url = new URL("/api/storefront/posts", window.location.origin);
        url.searchParams.set("limit", String(limit));
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error("Failed to fetch posts");
        const json = await res.json();
        setPosts(json.data || []);
      } catch (e: unknown) {
        reportError(e, { scope: "CommerceBlock.PostList.fetch", app: "storefront" });
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [limit]);

  if (loading) return <div className="p-6 text-sm text-text-tertiary">Loading posts...</div>;

  if (error) {
    return (
      <div className="p-6 rounded-3xl border border-red-100 bg-red-50/50">
        <p className="text-sm font-bold text-red-600">This section couldn't load.</p>
        <p className="text-[10px] text-red-400 mt-1">{error}</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="p-12 text-center border border-dashed border-border/60 rounded-[32px]">
        <p className="text-sm text-text-tertiary">No posts published yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {posts.map((p) => (
        <Link
          key={p.id}
          href={`/blog/${p.slug}`}
          className="block rounded-3xl border border-border/40 bg-white/40 hover:bg-white/60 transition-colors overflow-hidden"
        >
          {p.featuredImage && (
            <div className="w-full aspect-[16/9] bg-gray-100">
              <img src={p.featuredImage} alt={p.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
              {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : ""}
            </div>
            <div className="mt-2 text-sm font-black tracking-tight">{p.title}</div>
            {p.excerpt && (
              <div className="mt-2 text-[11px] text-text-secondary leading-relaxed line-clamp-3">
                {p.excerpt}
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
