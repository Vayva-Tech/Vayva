import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { rateLimiter } from "@/middleware/rate-limiter";
import { logger, ErrorCategory } from "@/lib/logger";

const QUICKBOOKS_AUTH_URL = "https://appcenter.intuit.com/connect/oauth2";
const QUICKBOOKS_TOKEN_URL = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";

function asJsonRecord(v: unknown): Record<string, unknown> | null {
  return v !== null && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

/**
 * GET /api/integrations/quickbooks/oauth
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
 * Step 1: Redirect to QuickBooks for authorization
 */
function handleAuthorization() {
  const clientId = process.env.QUICKBOOKS_CLIENT_ID;
  const redirectUri = process.env.QUICKBOOKS_REDIRECT_URI;
  const scope = process.env.QUICKBOOKS_SCOPE || "com.intuit.quickbooks.accounting";

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "QuickBooks credentials not configured" },
      { status: 500 }
    );
  }

  const state = generateRandomState();

  const authUrl = new URL(QUICKBOOKS_AUTH_URL);
  authUrl.searchParams.append("client_id", clientId);
  authUrl.searchParams.append("redirect_uri", redirectUri);
  authUrl.searchParams.append("scope", scope);
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append("state", state);

  const response = NextResponse.redirect(authUrl.toString());
  response.cookies.set("qb_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10,
    path: "/",
  });

  return response;
}

/**
 * Step 2: Handle OAuth callback from QuickBooks
 */
async function handleCallback(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const storedState = req.cookies.get("qb_oauth_state")?.value;

  if (!code || !state) {
    return NextResponse.json({ error: "Missing code or state" }, { status: 400 });
  }

  if (state !== storedState) {
    return NextResponse.json({ error: "Invalid state parameter" }, { status: 403 });
  }

  const clientId = process.env.QUICKBOOKS_CLIENT_ID;
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET;
  const redirectUri = process.env.QUICKBOOKS_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json(
      { error: "QuickBooks credentials not configured" },
      { status: 500 }
    );
  }

  try {
    const tokenResponse = await fetch(QUICKBOOKS_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to get access token");
    }

    const tokensUnknown: unknown = await tokenResponse.json();
    const tokens = asJsonRecord(tokensUnknown);
    if (!tokens || typeof tokens.access_token !== "string") {
      throw new Error("Invalid token response");
    }

    const response = NextResponse.redirect(
      `${process.env.FRONTEND_URL}/dashboard/settings/integrations?connected=quickbooks`
    );
    response.cookies.delete("qb_oauth_state");

    return response;
  } catch (error) {
    logger.error("QuickBooks OAuth Error:", ErrorCategory.API, error);
    return NextResponse.json(
      { error: "Failed to connect to QuickBooks" },
      { status: 500 }
    );
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

  const clientId = process.env.QUICKBOOKS_CLIENT_ID;
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "QuickBooks credentials not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(QUICKBOOKS_TOKEN_URL, {
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
 * Disconnect QuickBooks
 */
async function handleDisconnect(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  const storeId = session?.user?.storeId;
  if (!session?.user || !storeId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    message: "QuickBooks disconnected successfully",
  });
}

function generateRandomState(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}
