"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

/**
 * White-label tracking alias under /order/track.
 * Supports merchant links like: https://merchant-site.com/order/track?code=KWIK-123
 * Redirects to the full tracking page at /tracking.
 */
export default function OrderTrackAliasPage(): null {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = params.get("code");
    const q = new URLSearchParams();
    if (code) q.set("code", code);
    router.replace(`/tracking${q.toString() ? `?${q.toString()}` : ""}`);
  }, [params, router]);

  return null;
}

