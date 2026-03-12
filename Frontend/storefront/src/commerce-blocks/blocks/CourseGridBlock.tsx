"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button, Input } from "@vayva/ui";
import { reportError } from "@/lib/error";

interface CourseItem {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  price: number;
  duration: number;
  level: string;
  category: string;
}

export default function CourseGridBlock({ query }: { query?: string }) {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState(query || "");

  useEffect(() => {
    const run = async () => {
      try {
        const url = new URL("/api/storefront/courses", window.location.origin);
        const res = await fetch(url.toString());
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(String((json as any)?.error || "Failed to fetch courses"));
        setCourses((json as any)?.data || []);
      } catch (e: unknown) {
        reportError(e, { scope: "CommerceBlock.CourseGrid.fetch", app: "storefront" });
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return courses.filter((c) => {
      if (!s) return true;
      return c.title.toLowerCase().includes(s) || c.description.toLowerCase().includes(s);
    });
  }, [courses, q]);

  if (loading) return <div className="p-6 text-sm text-text-tertiary">Loading courses...</div>;

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
          <div className="text-xs font-black uppercase tracking-widest text-text-tertiary">Courses</div>
          <div className="text-2xl font-black tracking-tight">Learn with us</div>
        </div>
        <div className="w-full sm:w-96">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search courses..." />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map((c) => (
          <div key={c.id} className="rounded-3xl border border-gray-200 bg-transparent overflow-hidden">
            {c.thumbnailUrl ? (
              <div className="h-44 w-full bg-gray-100">
                <img src={c.thumbnailUrl} alt={c.title} className="h-44 w-full object-cover" />
              </div>
            ) : null}
            <div className="p-5">
              <div className="text-[10px] uppercase tracking-widest text-text-tertiary">{c.level} • {c.category}</div>
              <div className="mt-1 font-black text-lg leading-tight">{c.title}</div>
              <div className="mt-2 text-sm text-text-secondary line-clamp-3">{c.description}</div>
              <div className="mt-5 flex items-end justify-between">
                <div className="text-xl font-black text-blue-700">{c.price ? `₦${c.price.toLocaleString()}` : "Free"}</div>
                <Button
                  onClick={() => {
                    window.location.href = `?courseId=${c.id}#enroll`;
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                >
                  Enroll
                </Button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 ? (
          <div className="col-span-1 md:col-span-3 p-12 text-center border border-dashed border-border/60 rounded-[32px]">
            <p className="text-sm text-text-tertiary">No courses found.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
