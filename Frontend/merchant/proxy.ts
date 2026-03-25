import { NextResponse, type NextRequest } from "next/server";
import { resolveRequest } from "@/lib/routing/tenant-engine";
import { getToken } from "next-auth/jwt";
import { jwtVerify, type JWTPayload } from "jose";

// import { redis } from "@/lib/redis"; // Removed to prevent build-time import

const FALLBACK_TENANT_MAP: Record<string, string> = {
  bloom: "tenant_bloom_001",
  gizmo: "tenant_gizmo_002",
  standard: "vayva-standard-id",
};

async function getVayvaSessionPayload(request: NextRequest) {
  const token = request.cookies.get("vayva_session")?.value;
  if (!token) return null;

  const secret =
    process.env.JWT_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "dev-secret-change-in-production";

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload;
  } catch {
    return null;
  }
}

function getGlobalObject(): unknown {
  return Function("return globalThis")();
}

const getTenantMap = async () => {
  // Middleware runs in the Edge runtime; ioredis is not Edge-safe.
  // For local dev (and any edge execution), fallback to a static tenant map.
  const globalObj = getGlobalObject() as { EdgeRuntime?: unknown };
  if (
    process.env.NEXT_RUNTIME === "edge" ||
    typeof globalObj.EdgeRuntime !== "undefined"
  )
    return FALLBACK_TENANT_MAP;

  // Local dev should not depend on Redis being available.
  if (process.env.NODE_ENV !== "production") {
    return FALLBACK_TENANT_MAP;
  }

  // If Redis isn't configured, don't attempt a connection.
  // Local dev should still work with the static fallback tenant map.
  if (!process.env.REDIS_URL && !process.env.UPSTASH_REDIS_REST_URL) {
    return FALLBACK_TENANT_MAP;
  }

  try {
    const { getRedisClient } = await import("@/lib/redis");
    const redis = await getRedisClient();
    const cached = await redis.get("tenant_map");
    if (cached) return JSON.parse(cached);
  } catch (e) {
    console.warn("Middleware: Failed to fetch tenant map from Redis", e);
  }
  return FALLBACK_TENANT_MAP;
};

export async function proxy(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const path = request.nextUrl.pathname;

  // Preflight requests must not be redirected (browsers treat redirected preflights as failures).
  if (request.method === "OPTIONS") {
    return NextResponse.next();
  }

  // 0. Tenant Resolution
  const isPublicAsset =
    path.startsWith("/_next") ||
    path.startsWith("/favicon.ico") ||
    path.startsWith("/images") ||
    path.startsWith("/healthz");

  if (!isPublicAsset) {
    const tenantMap = await getTenantMap();
    const resolution = resolveRequest({
      hostname,
      path,
      tenantMap,
    });

    if (resolution.action === "rewrite" && resolution.destination) {
      return NextResponse.rewrite(new URL(resolution.destination, request.url));
    }

    if (resolution.action === "redirect" && resolution.destination) {
      return NextResponse.redirect(
        new URL(resolution.destination, request.url),
      );
    }

    if (resolution.action === "not_found" && resolution.destination) {
      return NextResponse.rewrite(new URL(resolution.destination, request.url));
    }
  }

  // 1. Auth Guard (Merchant Admin)
  const protectedPaths = [
    "/dashboard",
    "/settings",
    "/control-center",
    "/", // Protect root to force auth check/redirect
    "/onboarding", // Protect onboarding flow
    "/designer", // Protect theme editor
    "/billing", // Protect billing pages
  ];
  const isProtected =
    path === "/" || protectedPaths.some((p) => path.startsWith(p) && p !== "/");

  const [vayvaSession, nextAuthToken] = await Promise.all([
    getVayvaSessionPayload(request),
    getToken({ req: request, secret: process.env.NEXTAUTH_SECRET }),
  ]);

  const session = vayvaSession as (JWTPayload & Record<string, unknown>) | null;

  type TokenData = {
    sub?: string;
    storeId?: string;
    role?: string;
    plan?: string;
    trialEndsAt?: string | number | Date;
    industrySlug?: string;
    onboardingCompleted?: boolean;
    emailVerified?: boolean;
  };

  const tokenData: TokenData | null = (nextAuthToken as TokenData | null)
    ? (nextAuthToken as TokenData)
    : session
      ? {
          sub: (session.sub as string | undefined) ?? undefined,
          storeId: (session.storeId as string | undefined) ?? undefined,
          role: (session.role as string | undefined) ?? undefined,
          plan: (session.plan as string | undefined) ?? undefined,
          trialEndsAt: (session.trialEndsAt as string | undefined) ?? undefined,
          industrySlug: (session.industrySlug as string | undefined) ?? undefined,
          onboardingCompleted:
            (session.onboardingCompleted as boolean | undefined) ?? undefined,
          emailVerified: (session.emailVerified as boolean | undefined) ?? true,
        }
      : null;

  // 1.0 Auth Pages: If already authenticated, don't allow access to /signin or /signup.
  // This prevents noisy /me fetches and improves UX.
  const isAuthPage = path.startsWith("/signin") || path.startsWith("/signup");
  if (tokenData && isAuthPage) {
    if (!tokenData.emailVerified) {
      return NextResponse.redirect(new URL("/verify", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 1.0.1 Verify page must be reachable without auth (email verification often starts unauthenticated).
  // If already verified, skip it.
  if (path.startsWith("/verify") && tokenData?.emailVerified) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isProtected) {
    // 1.1 Unauthenticated -> Sign In
    if (!tokenData) {
      const url = request.nextUrl.clone();
      url.pathname = "/signin";
      url.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(url);
    }

    // 1.2 Unverified Email -> /verify (but allow access to /verify itself)
    if (!tokenData.emailVerified && !path.startsWith("/verify")) {
      return NextResponse.redirect(new URL("/verify", request.url));
    }
  }

  // 2. Trial Expiry Hard-Lock
  if (tokenData && tokenData.plan === "FREE" && tokenData.trialEndsAt) {
    const trialEndsAt = new Date(tokenData.trialEndsAt as string);
    const isExpired = new Date() > trialEndsAt;

    // Allow only billing page if expired
    const isBillingPage = path.startsWith("/dashboard/billing");
    const isTrialExpiredPage = path === "/billing/trial-expired";

    if (isExpired && !isBillingPage && !isTrialExpiredPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/billing/trial-expired";
      url.searchParams.set("expired", "true");
      return NextResponse.redirect(url);
    }
    // 4. Industry Route Protection (Variant Guardrails)
    if (tokenData && tokenData.industrySlug) {
      const industry = tokenData.industrySlug as string;

      // Define restricted paths
      const foodPaths = ["/dashboard/food", "/dashboard/menu-items", "/dashboard/kitchen"];
      // const retailPaths = ["/dashboard/products", "/dashboard/inventory"]; // Example
      const servicePaths = ["/dashboard/bookings", "/dashboard/services"];

      // Logic: If I am Retail, I cannot go to Food paths
      if (industry === "retail" && foodPaths.some(p => path.startsWith(p))) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      // If I am Food, I cannot go to Service paths (strict variant isolation)
      // (This depends on if we allow mixed stores. For V1, we assume strict.)
      if (industry === "food" && servicePaths.some(p => path.startsWith(p))) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  const response = NextResponse.next();

  // 3. Security Headers
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );
  response.headers.set("X-Frame-Options", "DENY"); // Use frame-ancestors for fine-grained control
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  );

  // 3.1 Caching Strategy (API/Auth = No Store)
  if (path.startsWith("/api") || path.startsWith("/signin") || path.startsWith("/signup")) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }

  const isDev = process.env.NODE_ENV !== "production";
  const scriptSrc = isDev
    ? "'self' 'unsafe-inline' 'unsafe-eval' https://js.paystack.co https://va.vercel-scripts.com"
    : "'self' 'unsafe-inline' 'unsafe-eval' https://js.paystack.co";
  const styleSrc = isDev
    ? "'self' 'unsafe-inline' https://fonts.googleapis.com"
    : "'self' 'unsafe-inline'";
  const fontSrc = isDev ? "'self' data: https://fonts.gstatic.com" : "'self' data:";
  const connectSrc = isDev
    ? "'self' https://*.vayva.ng https://api.paystack.co https://vitals.vercel-insights.com"
    : "'self' https://*.vayva.ng https://api.paystack.co";

  const cspHeader = `
        default-src 'self';
        script-src ${scriptSrc};
        style-src ${styleSrc};
        img-src 'self' blob: data: https://images.unsplash.com https://placehold.co https://*.amazonaws.com https://*.vayva.ng https://*.paystack.co;
        font-src ${fontSrc};
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        connect-src ${connectSrc};
        frame-ancestors 'none';
        upgrade-insecure-requests;
    `
    .replace(/\s{2,}/g, " ")
    .trim();

  response.headers.set("Content-Security-Policy", cspHeader);

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
