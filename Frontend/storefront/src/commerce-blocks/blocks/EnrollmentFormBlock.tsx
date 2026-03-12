"use client";

import React, { useEffect, useState } from "react";
import { Button, Input } from "@vayva/ui";
import { reportError } from "@/lib/error";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  price: number;
}

export default function EnrollmentFormBlock({ courseId }: { courseId?: string }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!courseId) {
        setLoading(false);
        return;
      }

      try {
        const url = new URL("/api/storefront/courses/one", window.location.origin);
        url.searchParams.set("courseId", courseId);
        const res = await fetch(url.toString());
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(String((json as any)?.error || "Failed to fetch course"));
        setCourse((json as any)?.data || null);
      } catch (e: unknown) {
        reportError(e, { scope: "CommerceBlock.EnrollmentForm.fetch", app: "storefront" });
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [courseId]);

  const onEnroll = async () => {
    if (!course) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/storefront/courses/enroll/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course.id,
          studentEmail: email.trim(),
          studentName: name.trim() || null,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(String((json as any)?.error || "Enrollment failed"));

      const reference = (json as any)?.data?.reference;
      const requiresPayment = Boolean((json as any)?.data?.requiresPayment);

      if (!requiresPayment) {
        return;
      }

      if (!reference) throw new Error("Missing payment reference");

      const payRes = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });

      const payJson = await payRes.json().catch(() => ({}));
      if (!payRes.ok) throw new Error(String((payJson as any)?.error || "Payment init failed"));

      const authorizationUrl = (payJson as any)?.authorizationUrl;
      if (authorizationUrl) {
        window.location.href = authorizationUrl;
        return;
      }
    } catch (e: unknown) {
      reportError(e, { scope: "CommerceBlock.EnrollmentForm.enroll", app: "storefront" });
      setError(e instanceof Error ? e.message : "Enrollment failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (!courseId) {
    return (
      <div className="p-6 rounded-3xl border border-gray-200 bg-transparent">
        <div className="text-sm font-bold">Select a course</div>
        <div className="text-xs text-text-tertiary mt-1">Add a courseId prop in WebStudio.</div>
      </div>
    );
  }

  if (loading) return <div className="p-6 text-sm text-text-tertiary">Loading enrollment...</div>;

  if (error || !course) {
    return (
      <div className="p-6 rounded-3xl border border-red-100 bg-red-50/50">
        <p className="text-sm font-bold text-red-600">This section couldn't load.</p>
        <p className="text-[10px] text-red-400 mt-1">{error || "Course not found"}</p>
      </div>
    );
  }

  return (
    <div id="enroll" className="max-w-4xl mx-auto px-6 py-12">
      <div className="rounded-3xl border border-gray-200 bg-transparent p-6">
        <div className="text-xs font-black uppercase tracking-widest text-text-tertiary">Enroll</div>
        <div className="mt-1 text-2xl font-black tracking-tight">{course.title}</div>
        <div className="mt-2 text-sm text-text-secondary">{course.description}</div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name (optional)" />
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        </div>

        {error ? <div className="mt-3 text-[10px] text-red-500">{error}</div> : null}

        <div className="mt-5">
          <Button
            onClick={onEnroll}
            disabled={!email.trim() || submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl disabled:opacity-50"
          >
            {submitting ? "Processing..." : course.price ? `Pay & Enroll (₦${course.price.toLocaleString()})` : "Enroll for free"}
          </Button>
        </div>
      </div>
    </div>
  );
}
