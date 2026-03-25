import { NextResponse, type NextRequest } from "next/server";

// Route matchers
const PUBLIC_ROUTES = [
  "",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/onboarding",
  "/api/auth",
  "/api/public",
  "/api/webhooks",
  "/_next",
  "/static",
  "/favicon.ico",
];

const PROTECTED_ROUTE_PREFIXES = [
  "/dashboard",
  "/beta",
  "/api/beta",
  "/api/account",
  "/api/billing",
  "/api/checkout",
  "/api/customers",
  "/api/finance",
  "/api/fulfillment",
  "/api/integrations",
  "/api/nightlife",
  "/api/social-connections",
  "/api/workflows",
  "/api/ledger",
  "/api/me",
  "/api/onboarding",
  "/api/ops",
  "/api/payments",
  "/api/merchant",
  "/api/orders",
  "/api/products",
  "/api/settings",
  "/api/socials",
  "/api/storage",
  "/api/support",
  "/api/team",
  "/api/uploads",
];

const AUTH_ROUTES = [
  "/signin",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

function matchesAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

/**
 * Check if a route is public (no auth required)
 */
function isPublicRoute(pathname: string): boolean {
  if (pathname === "/") return true;
  // Email / OTP verification must stay reachable without a session
  if (pathname === "/verify" || pathname.startsWith("/verify/")) return true;
  return (
    PUBLIC_ROUTES.some((route) => route && pathname.startsWith(route)) ||
    pathname.includes("/_next/") ||
    pathname.includes("/static/") ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|css|js|ico|woff|woff2)$/) !== null
  );
}

/**
 * Check if a route requires authentication
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
}

/**
 * Check if route is an auth page (redirect if logged in)
 */
function isAuthRoute(pathname: string): boolean {
  return matchesAuthRoute(pathname);
}

/**
 * Get auth token from request
 */
function getAuthToken(request: NextRequest): string | null {
  const cookieNames = [
    "vayva_session",
    "session",
    "__Secure-vayva-merchant-session",
    "next-auth.merchant-session",
    "__Secure-next-auth.session-token",
    "next-auth.session-token",
  ];
  for (const name of cookieNames) {
    const value = request.cookies.get(name)?.value;
    if (value) return value;
  }

  // Check Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  return null;
}

/**
 * Next.js Middleware for route protection
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = getAuthToken(request);
  const isAuthenticated = !!token;

  // 1. Security headers for all responses
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.paystack.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://api.paystack.co; frame-ancestors 'none'; base-uri 'self'; form-action 'self';");

  // 2. Public routes - allow access
  if (isPublicRoute(pathname)) {
    // Fail-safe: ensure the domain root always lands on auth/dashboard
    if (pathname === "/") {
      return NextResponse.redirect(
        new URL(isAuthenticated ? "/dashboard" : "/signin", request.url),
      );
    }
    return response;
  }

  // 3. Auth routes - redirect to dashboard if already logged in
  if (isAuthRoute(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 4. Protected routes - require authentication
  if (isProtectedRoute(pathname)) {
    if (!isAuthenticated) {
      // API routes return 401
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }
      // Page routes redirect to sign-in (App Router uses /signin)
      const loginUrl = new URL("/signin", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

/**
 * Middleware configuration
 * Match all routes except static files and API routes that handle their own auth
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};
