import { NextResponse, type NextRequest } from "next/server";

const rateLimit = new Map<string, { count: number; lastReset: number }>();

const RESERVED_STORE_SLUGS = new Set([
  "admin",
  "merchant",
  "ops",
  "www",
  "api",
  "support",
  "app",
  "dashboard",
  "help",
  "docs",
  "blog",
  "status",
]);

const COMMERCE_ROUTES = new Set([
  "products",
  "collections",
  "cart",
  "checkout",
  "account",
  "menu",
  "orders",
  "favorites",
  "gift-cards",
  "past-deliveries",
  "api",
]);

export default function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const pathParts = url.pathname.split("/").filter(Boolean);
  const firstSegment = pathParts[0];

  const rawHost = request.headers.get("host") || "";
  const hostname = rawHost.split(":")[0] || "";

  // Handle localhost for development
  if (hostname.includes("localhost") && hostname.includes(":")) {
    // If localhost, we might be testing subdomains like "demo.localhost:3000"
    // But usually locally we might access via path or just assume single tenant for dev if no custom hosts file.
    // For this fix, let's treat "localhost:3000" as the main app, and subdomains if present.
  }

  // Define the main domain (in prod)
  // const currentHost = hostname.replace(`.vayva.ng`, ""); // "demo"

  // 1. Rewrite Logic (Sector 2 Fix)
  // Check if it's a subgraph/custom domain
  // We exclude the main domain "vayva.ng" and "www.vayva.ng" (Marketing)
  // And "app.vayva.ng" (Merchant Admin - handled by different app usually, but if routed here, careful)

  // Since this is the "Storefront" app middleware, we assume traffic coming here IS for the storefronts or the marketing site.
  // We need to differentiate "Marketing" vs "Store".

  // Simplified Logic per Prompt:
  // If subdomain exists and is not 'www', rewrite to /_sites/[subdomain]

  // Clean hostname to get subdomain
  // logic: if hostname is "freds-shop.vayva.ng", subdomain is "freds-shop"
  const isVercelDomain = hostname.endsWith(".vercel.app"); // fallback

  // Extract subdomain
  // const subdomain = hostname.split('.')[0]; -- Reference logic

  // Better parsing:
  const searchParams = request.nextUrl.searchParams.toString();
  const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""}`;

  // Check if subdomain
  // We look for [slug].vayva.ng
  // Exclude 'www' and base domain
  if (!hostname.startsWith("localhost") && hostname.includes(".")) {
    const isVayvaNg = hostname.endsWith(".vayva.ng");
    if (isVayvaNg || isVercelDomain) {
      const parts = hostname.split(".");
      const subdomain = parts[0] || "";
      const isApex = hostname === "vayva.ng" || hostname === "www.vayva.ng";
      const isValidSlug = /^[a-z0-9-]{3,63}$/.test(subdomain);
      if (!isApex && isValidSlug && !RESERVED_STORE_SLUGS.has(subdomain)) {
        // Rule 52.6: Prioritize commerce routes
        if (firstSegment && COMMERCE_ROUTES.has(firstSegment)) {
          // Serve natively
          return NextResponse.next();
        }

        // Fallback to deployment static bundle (rewritten path)
        return NextResponse.rewrite(
          new URL(`/_sites/${subdomain}${path}`, request.url),
        );
      }
    }
  }

  // Development / Localhost Loopback for testing
  // Allow accessing /_sites/demo explicitly or handle localhost mapping if using tools like ngrok
  // For now, if we are on localhost and NOT a subdomain (just localhost:3000), act as landing page.

  const response = NextResponse.next();

  // Standard Security Headers
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  );

  // 1.1 Caching Strategy
  if (url.pathname.startsWith("/api")) {
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }

  // Simple In-Memory Rate Limit (Ephemeral)
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const RATE_LIMIT_WINDOW = 60 * 1000; // 1 Minute
  const API_LIMIT = 300; // 300 req/min

  const key = ip;
  const now = Date.now();
  const record = rateLimit.get(key) || { count: 0, lastReset: now };

  if (now - record.lastReset > RATE_LIMIT_WINDOW) {
    record.count = 0;
    record.lastReset = now;
  }

  record.count++;
  rateLimit.set(key, record);

  if (record.count > API_LIMIT) {
    return new NextResponse(JSON.stringify({ error: "Too Many Requests" }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": "60",
      },
    });
  }

  // Security Hardening: Block /paystack-test in production/test environments
  if (
    request.nextUrl.pathname === "/paystack-test" &&
    (process.env.NODE_ENV === "production" ||
      process.env.NODE_ENV === "test") &&
    process.env.IS_TEST_MODE !== "true"
  ) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // 2. CSP (Content Security Policy)
  const cspHeader = `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.paystack.co;
        style-src 'self' 'unsafe-inline';
        img-src 'self' blob: data: https://images.unsplash.com https://placehold.co https://*.amazonaws.com https://*.vayva.ng;
        font-src 'self' data:;
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        connect-src 'self' https://*.vayva.ng https://api.paystack.co;
        frame-ancestors 'none';
        upgrade-insecure-requests;
    `
    .replace(/\s{2,}/g, " ")
    .trim();

  response.headers.set("Content-Security-Policy", cspHeader);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
