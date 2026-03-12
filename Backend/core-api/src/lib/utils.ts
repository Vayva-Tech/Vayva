import { apiJson } from "./api-client-shared";
export { cn } from "@vayva/ui";

export const fetcher = <T = unknown>(url: string) => apiJson<T>(url);

/**
 * Normalizes a URL for comparison in the sidebar (e.g. active states)
 */
export function normalizeSidebarHref(rawHref: unknown): string {
  const href = String(rawHref || "").trim();
  if (!href) return "";

  const ensureLeadingSlash = (s: string) => (s.startsWith("/") ? s : `/${s}`);
  const withoutHash = href.split("#")[0] || "";
  const withoutQuery = (withoutHash.split("?")[0] || "").trim();
  if (!withoutQuery) return "";

  let path = ensureLeadingSlash(withoutQuery);
  path = path.replace(/\/+/g, "/"); // Collapse multiple slashes

  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }
  return path;
}

/**
 * Client-side telemetry tracking
 */
export const telemetry = {
  track: async (eventName: string, properties: Record<string, unknown>) => {
    try {
      // keepalive: true ensures the request completes even if page navigation occurs
      await apiJson<{ success: boolean }>("/api/telemetry/event", {
        method: "POST",
        keepalive: true,
        body: JSON.stringify({
          eventName,
          properties: {
            ...properties,
            timestamp: new Date().toISOString(),
            url:
              typeof window !== "undefined"
                ? window.location.pathname
                : undefined,
          },
        }),
      });
    } catch (err) {
      // Silently fail telemetry errors to avoid UX interruption
      console.warn("[Telemetry] Failed to track event:", eventName, err);
    }
  },
};
