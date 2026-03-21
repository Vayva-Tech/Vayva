import { urls } from "@vayva/shared";

/**
 * TENANT RESOLVER
 * Authoritative logic for Vayva domain routing.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function resolveRequest(input: { hostname: string; path: string; tenantMap: Record<string, string> }) {
    const { hostname, path, tenantMap } = input;
    const host = hostname.toLowerCase();
    const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || urls.storefrontRoot();
    // 1. Platform Root (Marketing)
    // We handle vayva.ng, www.vayva.ng, and apex domains for localhost/preview
    if (host === APP_DOMAIN ||
        host === `www.${APP_DOMAIN}` ||
        host === "localhost" ||
        host.startsWith("localhost:")) {
        return {
            resolvedTenant: null,
            tenantType: "platform",
            action: "render",
            destination: null,
            reason: "Primary platform domain detected.",
        };
    }
    // 2. Admin Portal
    if (host === `admin.${APP_DOMAIN}`) {
        return {
            resolvedTenant: null,
            tenantType: "admin",
            action: "redirect",
            destination: urls.merchantDashboard(),
            reason: "Admin subdomain deprecated. Redirecting to /dashboard.",
        };
    }
    // 3. Tenant Storefronts (*.vayva.ng)
    if (host.endsWith(`.${APP_DOMAIN}`)) {
        const subdomain = host.replace(`.${APP_DOMAIN}`, "");
        // Handle deeply nested subdomains as invalid (e.g. foo.bar.vayva.ng)
        if (subdomain.includes(".")) {
            return {
                resolvedTenant: null,
                tenantType: "unknown",
                action: "not_found",
                destination: "/404",
                reason: "Invalid subdomain hierarchy.",
            };
        }
        const tenantId = tenantMap[subdomain];
        if (tenantId) {
            return {
                resolvedTenant: tenantId,
                tenantType: "storefront",
                action: "rewrite",
                destination: `/store/${subdomain}${path}`,
                reason: `Resolved tenant: ${subdomain} (${tenantId})`,
            };
        }
        return {
            resolvedTenant: null,
            tenantType: "unknown",
            action: "not_found",
            destination: "/store-not-found",
            reason: `Unregistered tenant subdomain: ${subdomain}`,
        };
    }
    // 4. Vercel Preview Domains (*.vercel.app)
    if (host.endsWith(".vercel.app")) {
        // For simplicity in previews, we render platform unless we add custom header logic later
        return {
            resolvedTenant: null,
            tenantType: "platform",
            action: "render",
            destination: null,
            reason: "Vercel preview domain - defaulting to platform.",
        };
    }
    // Default Fallback
    return {
        resolvedTenant: null,
        tenantType: "unknown",
        action: "not_found",
        destination: "/404",
        reason: "Unrecognized hostname.",
    };
}
