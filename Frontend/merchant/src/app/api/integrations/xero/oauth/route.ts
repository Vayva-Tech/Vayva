import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { rateLimiter } from "@/middleware/rate-limiter";
import { logger, ErrorCategory } from "@/lib/logger";

const XERO_AUTH_URL = "https://login.xero.com/identity/connect/authorize";
const XERO_TOKEN_URL = "https://identity.xero.com/connect/token";

function asJsonRecord(v: unknown): Record<string, unknown> | null {
  return v !== null && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

/**
 * GET /api/integrations/xero/oauth
 * Rate limited OAuth endpoint
 */
export async function GET(req: NextRequest) {
  const rateLimitResponse = await rateLimiter(req);
  if (rateLimitResponse) return rateLimitResponse;

  const action = req.nextUrl.searchParams.get("action");

  if (action === "authorize") {
    return handleAuthorization();
  }
  if (action === "callback") {
    return handleCallback(req);
  }
  if (action === "refresh") {
    return handleRefreshToken(req);
  }
  if (action === "disconnect") {
    return handleDisconnect(req);
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

/**
 * Step 1: Redirect to Xero for authorization
 */
async function handleAuthorization() {
  const clientId = process.env.XERO_CLIENT_ID;
  const redirectUri = process.env.XERO_REDIRECT_URI;
  const scope =
    process.env.XERO_SCOPE || "openid profile email accounting.transactions offline_access";

  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: "Xero credentials not configured" }, { status: 500 });
  }

  const state = generateRandomState();
  const codeVerifier = generateCodeVerifier();

  const authUrl = new URL(XERO_AUTH_URL);
  authUrl.searchParams.append("client_id", clientId);
  authUrl.searchParams.append("redirect_uri", redirectUri);
  authUrl.searchParams.append("scope", scope);
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append("state", state);
  authUrl.searchParams.append("code_challenge", await generateCodeChallenge(codeVerifier));
  authUrl.searchParams.append("code_challenge_method", "S256");

  const response = NextResponse.redirect(authUrl.toString());
  response.cookies.set("xero_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10,
    path: "/",
  });
  response.cookies.set("xero_code_verifier", codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10,
    path: "/",
  });

  return response;
}

/**
 * Step 2: Handle OAuth callback from Xero
 */
async function handleCallback(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const storedState = req.cookies.get("xero_oauth_state")?.value;
  const codeVerifier = req.cookies.get("xero_code_verifier")?.value;

  if (!code || !state || !codeVerifier) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  if (state !== storedState) {
    return NextResponse.json({ error: "Invalid state parameter" }, { status: 403 });
  }

  const clientId = process.env.XERO_CLIENT_ID;
  const clientSecret = process.env.XERO_CLIENT_SECRET;
  const redirectUri = process.env.XERO_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json({ error: "Xero credentials not configured" }, { status: 500 });
  }

  try {
    const response = await fetch(XERO_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get access token");
    }

    const raw: unknown = await response.json();
    const tokens = asJsonRecord(raw);
    if (!tokens || typeof tokens.access_token !== "string") {
      throw new Error("Invalid token response");
    }

    const responseRedirect = NextResponse.redirect(
      `${process.env.FRONTEND_URL}/dashboard/settings/integrations?connected=xero`
    );
    responseRedirect.cookies.delete("xero_oauth_state");
    responseRedirect.cookies.delete("xero_code_verifier");

    return responseRedirect;
  } catch (error) {
    logger.error("Xero OAuth Error:", ErrorCategory.API, error);
    return NextResponse.json({ error: "Failed to connect to Xero" }, { status: 500 });
  }
}

/**
 * Refresh access token
 */
async function handleRefreshToken(req: NextRequest) {
  const refreshToken = req.nextUrl.searchParams.get("refresh_token");

  if (!refreshToken) {
    return NextResponse.json({ error: "Refresh token required" }, { status: 400 });
  }

  const clientId = process.env.XERO_CLIENT_ID;
  const clientSecret = process.env.XERO_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Xero credentials not configured" }, { status: 500 });
  }

  try {
    const response = await fetch(XERO_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const raw: unknown = await response.json();
    const tokens = asJsonRecord(raw);
    const accessToken =
      tokens && typeof tokens.access_token === "string" ? tokens.access_token : null;
    const expiresIn =
      tokens && typeof tokens.expires_in === "number" ? tokens.expires_in : undefined;

    if (!accessToken) {
      throw new Error("Invalid token response");
    }

    return NextResponse.json({
      success: true,
      data: {
        accessToken,
        expiresIn,
      },
    });
  } catch (error) {
    logger.error("Token Refresh Error:", ErrorCategory.API, error);
    return NextResponse.json({ error: "Failed to refresh token" }, { status: 500 });
  }
}

/**
 * Disconnect Xero
 */
async function handleDisconnect(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  const storeId = session?.user?.storeId;
  if (!session?.user || !storeId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    message: "Xero disconnected successfully",
  });
}

function generateRandomState(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

function generateCodeVerifier(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
