"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  initAnalytics,
  trackPageView,
  VAYVA_CONSENT_CHANGED_EVENT,
} from "@/lib/analytics";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const sync = () => {
      initAnalytics();
    };
    sync();
    window.addEventListener(VAYVA_CONSENT_CHANGED_EVENT, sync);
    return () => window.removeEventListener(VAYVA_CONSENT_CHANGED_EVENT, sync);
  }, []);

  // Track page views on route change
  useEffect(() => {
    if (!pathname) return;
    const path = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    trackPageView(path);
  }, [pathname, searchParams]);

  return <>{children}</>;
}
