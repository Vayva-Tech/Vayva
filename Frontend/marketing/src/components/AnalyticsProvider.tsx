"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initAnalytics, trackPageView } from "@/lib/analytics";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize analytics on mount
  useEffect(() => {
    initAnalytics();
  }, []);

  // Track page views on route change
  useEffect(() => {
    if (!pathname) return;
    const path = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    trackPageView(path);
  }, [pathname, searchParams]);

  return <>{children}</>;
}
