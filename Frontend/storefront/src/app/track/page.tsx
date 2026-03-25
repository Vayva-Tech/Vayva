"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

/**
 * White-label tracking alias.
 * Supports merchant links like: https://merchant-site.com/track?code=KWIK-123
 * and redirects to the full tracking page at /tracking.
 */
export default function TrackAliasPage(): null {
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

