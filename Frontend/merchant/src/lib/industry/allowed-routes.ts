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
  "/beta/desktop-app",
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
  content: [
    "/dashboard/posts",
    "/dashboard/blog",
    "/dashboard/courses",
    "/dashboard/enrollments",
    "/dashboard/students",
    "/dashboard/instructors",
    "/dashboard/class-sessions",
    "/dashboard/attendance",
    "/dashboard/assessments",
    "/dashboard/grades",
    "/dashboard/learning-materials",
    "/dashboard/announcements",
  ],
  tenants: ["/dashboard/tenants"],
  subscriptions: ["/dashboard/subscriptions"],
  plans: ["/dashboard/plans"],
  feature_flags: ["/dashboard/feature-flags"],
  api_keys: ["/dashboard/api-keys"],
  customers: ["/dashboard/customers"],
  ops_console: ["/dashboard/ops-console"],
  meal_kit: ["/dashboard/meal-kit"],
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
        const parentPrefix = customRoutes.create?.replace(/\/new$/, "");
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

/**
 * Checks if a given pathname is allowed for the merchant's industry and enabled tools.
 * Returns true if allowed, false if the route is gated and not available.
 */
export function isRouteAllowed(
  pathname: string,
  industrySlug: IndustrySlug | null,
  enabledTools?: string[]
): boolean {
  // First check industry-level permissions
  const industryAllowed = isRouteAllowedForIndustry(pathname, industrySlug);
  if (!industryAllowed) return false;

  // If no enabled tools list provided, allow all industry routes
  if (!enabledTools || enabledTools.length === 0) return true;

  // Core modules are always allowed
  const coreModules = ["catalog", "sales"];
  const allEnabledTools = [...new Set([...coreModules, ...enabledTools])];

  // Check if route belongs to an enabled tool
  for (const tool of allEnabledTools) {
    const routes = MODULE_DEFAULT_ROUTES[tool];
    if (routes) {
      for (const route of routes) {
        if (pathname === route || pathname.startsWith(route + "/")) {
          return true;
        }
      }
    }
  }

  // Check universal routes
  for (const route of UNIVERSAL_ROUTES) {
    if (pathname === route || pathname.startsWith(route + "/")) {
      return true;
    }
  }

  // If we get here and the route is in industry allowed routes,
  // but not in enabled tools, check if it's a custom module route
  const config = industrySlug ? INDUSTRY_CONFIG[industrySlug] : null;
  if (config?.moduleRoutes) {
    for (const [mod, routes] of Object.entries(config.moduleRoutes) as [string, { index?: string; create?: string }][]) {
      if (allEnabledTools.includes(mod)) {
        if (routes.index && (pathname === routes.index || pathname.startsWith(routes.index + "/"))) {
          return true;
        }
        if (routes.create && pathname === routes.create) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Gets the list of routes that should be hidden from navigation
 * based on disabled tools.
 */
export function getHiddenRoutes(
  industrySlug: IndustrySlug | null,
  enabledTools: string[]
): Set<string> {
  const hidden = new Set<string>();

  if (!industrySlug) return hidden;

  const config = INDUSTRY_CONFIG[industrySlug];
  if (!config) return hidden;

  const coreModules = ["catalog", "sales"];
  const allEnabled = new Set([...coreModules, ...enabledTools]);

  // Find disabled modules
  for (const mod of config.modules) {
    if (!allEnabled.has(mod)) {
      // Add all routes for this disabled module to hidden set
      const routes = MODULE_DEFAULT_ROUTES[mod];
      if (routes) {
        for (const route of routes) {
          hidden.add(route);
        }
      }

      // Add custom routes
      const customRoutes = config.moduleRoutes?.[mod];
      if (customRoutes?.index) {
        hidden.add(customRoutes.index);
      }
      if (customRoutes?.create) {
        hidden.add(customRoutes.create);
      }
    }
  }

  return hidden;
}
