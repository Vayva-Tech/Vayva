import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow Public Routes (Login page, Static assets, Public API)
  // Note: /api/ops/auth/login is the only public API for ops
  const publicPaths = [
    "/ops/login",
    "/_next",
    "/favicon.ico",
    "/api/ops/auth/login",
  ];

  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 2. Identify Protected Ops Routes
  const isOpsRoute = pathname.startsWith("/ops");
  const isOpsApiRoute = pathname.startsWith("/api/ops");

  if (!isOpsRoute && !isOpsApiRoute) {
    return NextResponse.next();
  }

  // 3. Check Session
  const legacyOpsSessionCookie = request.cookies.get("vayva_ops_session");
  const nextAuthSessionCookie =
    request.cookies.get("next-auth.session-token") ||
    request.cookies.get("__Secure-next-auth.session-token");

  const sessionCookie = legacyOpsSessionCookie || nextAuthSessionCookie;

  if (!sessionCookie) {
    // If API -> 401 Unauthorized
    if (isOpsApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // If UI -> Redirect to Login with `next` param
    const loginUrl = new URL("/ops/login", request.url);
    // Don't add next if it's just /ops or meaningless
    if (pathname !== "/ops") {
      loginUrl.searchParams.set("next", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();

  // Security Headers
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );

  const cspHeader = `
        default-src 'self';
        script-src 'self' 'unsafe-inline';
        style-src 'self' 'unsafe-inline';
        img-src 'self' blob: data: https://images.unsplash.com https://placehold.co https://*.amazonaws.com;
        font-src 'self';
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        connect-src 'self';
        frame-ancestors 'none';
        upgrade-insecure-requests;
    `
    .replace(/\s{2,}/g, " ")
    .trim();

  response.headers.set("Content-Security-Policy", cspHeader);

  return response;
}

export const config = {
  // Match ops routes and API routes
  matcher: ["/ops/:path*", "/api/ops/:path*"],
};
