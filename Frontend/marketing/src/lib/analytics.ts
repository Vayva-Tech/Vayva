export const VAYVA_CONSENT_CHANGED_EVENT = "vayva-consent-changed";

const CONSENT_KEY = "vayva_cookie_consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function getGaMeasurementId(): string | undefined {
  return process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || undefined;
}

export function readCookieConsent(): {
  analytics: boolean;
  marketing: boolean;
} | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      analytics?: boolean;
      marketing?: boolean;
    };
    return {
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
    };
  } catch {
    return null;
  }
}

export function hasAnalyticsConsent(): boolean {
  const c = readCookieConsent();
  return c !== null && c.analytics === true;
}

let injectStarted = false;

function injectGtagScript(measurementId: string): void {
  if (typeof document === "undefined" || injectStarted) return;
  injectStarted = true;

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    anonymize_ip: true,
    send_page_view: false,
  });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);
}

/** Load GA (if configured) when the user has opted into analytics cookies. */
export function initAnalytics(): void {
  if (typeof window === "undefined") return;
  const id = getGaMeasurementId();
  if (!id || !hasAnalyticsConsent()) return;
  injectGtagScript(id);
}

export function trackPageView(path: string): void {
  if (typeof window === "undefined" || !hasAnalyticsConsent()) return;
  const id = getGaMeasurementId();
  if (!id) return;
  initAnalytics();
  if (typeof window.gtag !== "function") return;
  window.gtag("config", id, {
    page_path: path,
    anonymize_ip: true,
  });
}

/** Funnel / interaction events (GA4), gated on analytics cookie consent. */
export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean | undefined>,
): void {
  if (typeof window === "undefined" || !hasAnalyticsConsent()) return;
  const id = getGaMeasurementId();
  if (!id) return;
  initAnalytics();
  if (typeof window.gtag !== "function") return;
  const payload = Object.fromEntries(
    Object.entries(params ?? {}).filter(([, v]) => v !== undefined),
  ) as Record<string, string | number | boolean>;
  window.gtag("event", name, payload);
}
