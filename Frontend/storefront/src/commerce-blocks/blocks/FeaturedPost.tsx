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

export default function FeaturedPost({ postId }: { postId?: string }) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        if (!postId) {
          setPost(null);
          return;
        }

        const url = new URL("/api/storefront/posts/one", window.location.origin);
        url.searchParams.set("postId", postId);
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error("Failed to fetch post");
        const json = await res.json();
        setPost(json.data || null);
      } catch (e: unknown) {
        reportError(e, { scope: "CommerceBlock.FeaturedPost.fetch", app: "storefront" });
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [postId]);

  if (loading) return <div className="p-6 text-sm text-text-tertiary">Loading post...</div>;

  if (error) {
    return (
      <div className="p-6 rounded-3xl border border-red-100 bg-red-50/50">
        <p className="text-sm font-bold text-red-600">This section couldn't load.</p>
        <p className="text-[10px] text-red-400 mt-1">{error}</p>
      </div>
    );
  }

  if (!postId) {
    return (
      <div className="p-6 rounded-3xl border border-border/40 bg-white/30">
        <p className="text-xs text-text-tertiary">Select a post to feature.</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-6 rounded-3xl border border-border/40 bg-white/30">
        <p className="text-xs text-text-tertiary">Post not found.</p>
      </div>
    );
  }

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="block rounded-[32px] border border-border/40 bg-white/40 hover:bg-white/60 transition-colors overflow-hidden"
    >
      {post.featuredImage && (
        <div className="w-full aspect-[21/9] bg-gray-100">
          <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-6">
        <div className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
          {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ""}
        </div>
        <div className="mt-2 text-xl font-black tracking-tight">{post.title}</div>
        {post.excerpt && (
          <div className="mt-2 text-sm text-text-secondary leading-relaxed line-clamp-3">
            {post.excerpt}
          </div>
        )}
      </div>
    </Link>
  );
}
