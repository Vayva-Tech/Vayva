import { INDUSTRY_CONFIG } from "@/config/industry";
import { IndustrySlug } from "@/lib/templates/types";

/**
 * Routes that are always accessible regardless of industry.
 * These are platform-level pages, not tied to any commerce module.
 */
const UNIVERSAL_ROUTES = new Set([
  "/dashboard",
  "/dashboard/analytics",
  "/dashboard/account",
  "/dashboard/billing",
  "/dashboard/control-center",
  "/dashboard/autopilot",
  "/dashboard/extensions",
  "/dashboard/support",
  "/dashboard/socials",
  "/dashboard/creative-editor",
  "/dashboard/inbox",
  "/dashboard/referrals",
  "/dashboard/notifications",
  "/dashboard/setup-checklist",
  "/dashboard/wa-agent",
  "/dashboard/settings",
  "/dashboard/reports",
  "/dashboard/reviews",
  "/dashboard/appeals",
  "/dashboard/approvals",
  "/dashboard/automations",
  "/dashboard/domains",
  "/dashboard/editor",
  "/dashboard/publish",
  "/dashboard/sites",
  "/dashboard/templates",
]);

/**
 * Maps a module name to its default route prefixes.
 * These are the routes that become available when a module is included.
 */
const MODULE_DEFAULT_ROUTES: Record<string, string[]> = {
  catalog: ["/dashboard/products"],
  sales: ["/dashboard/orders"],
  bookings: ["/dashboard/bookings"],
  fulfillment: [
    "/dashboard/fulfillment",
    "/dashboard/logistics",
    "/dashboard/inventory",
  ],
  finance: ["/dashboard/finance"],
  marketing: ["/dashboard/marketing"],
  content: ["/dashboard/posts", "/dashboard/blog"],
  customers: ["/dashboard/customers"],
  ops_console: ["/dashboard/ops-console"],
};

/**
 * Computes the set of allowed route prefixes for a given industry.
 * Returns null if no industry is set (allow everything as fallback).
 */
export function getIndustryAllowedRoutes(
  industrySlug: IndustrySlug | null,
): Set<string> | null {
  if (!industrySlug) return null;

  const config = INDUSTRY_CONFIG[industrySlug];
  if (!config) return null;

  const allowed = new Set(UNIVERSAL_ROUTES);

  for (const mod of config.modules) {
    // Add default routes for this module
    const defaults = MODULE_DEFAULT_ROUTES[mod];
    if (defaults) {
      for (const route of defaults) {
        allowed.add(route);
      }
    }

    // Add industry-specific custom routes (from moduleRoutes overrides)
    const customRoutes = config.moduleRoutes?.[mod];
    if (customRoutes) {
      if (customRoutes.index) {
        // Extract the route prefix (e.g., "/dashboard/menu-items" from "/dashboard/menu-items")
        allowed.add(customRoutes.index);
      }
      if (customRoutes.create) {
        // The create route's parent is already covered by the index prefix
        const parentPrefix = customRoutes.create.replace(/\/new$/, "");
        allowed.add(parentPrefix);
      }
    }
  }

  return allowed;
}

/**
 * Checks if a given pathname is allowed for the merchant's industry.
 * Returns true if allowed, false if the route is industry-gated and not available.
 */
export function isRouteAllowedForIndustry(
  pathname: string,
  industrySlug: IndustrySlug | null,
): boolean {
  const allowedRoutes = getIndustryAllowedRoutes(industrySlug);

  // No industry set or no config → allow everything (graceful fallback)
  if (!allowedRoutes) return true;

  // Exact match on /dashboard root
  if (pathname === "/dashboard") return true;

  // Check if the pathname starts with any allowed route prefix
  for (const route of allowedRoutes) {
    if (route === "/dashboard") continue; // Skip root, already handled
    if (pathname === route || pathname.startsWith(route + "/")) {
      return true;
    }
  }

  return false;
}
