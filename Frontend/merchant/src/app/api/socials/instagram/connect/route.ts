import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { requireAuthFromRequest } from "@/lib/session.server";

function safeReturnTo(value: string | null): string {
  if (!value) return "/dashboard/socials";
  if (!value.startsWith("/")) return "/dashboard/socials";
  return value;
}

const oauthCookieOpts = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 10,
};

/**
 * GET /api/socials/instagram/connect
 * Starts Meta OAuth from the merchant origin so HttpOnly cookies (state, return path, store) are sent to our callback.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const appId = process.env.META_APP_ID;
    const redirectUri = process.env.META_IG_REDIRECT_URI;

    if (!appId || !redirectUri) {
      return NextResponse.json(
        {
          error:
            "Missing Meta Instagram configuration (META_APP_ID, META_IG_REDIRECT_URI)",
        },
        { status: 500 },
      );
    }

    const { searchParams } = new URL(request.url);
    const returnTo = safeReturnTo(searchParams.get("returnTo"));
    const state = crypto.randomUUID();

    const authorizeUrl = new URL(
      "https://www.facebook.com/v17.0/dialog/oauth",
    );
    authorizeUrl.searchParams.set("client_id", appId);
    authorizeUrl.searchParams.set("redirect_uri", redirectUri);
    authorizeUrl.searchParams.set("response_type", "code");
    authorizeUrl.searchParams.set(
      "scope",
      [
        "pages_show_list",
        "pages_read_engagement",
        "pages_messaging",
        "instagram_basic",
        "instagram_manage_messages",
      ].join(","),
    );
    authorizeUrl.searchParams.set("state", state);

    const res = NextResponse.redirect(authorizeUrl.toString(), {
      headers: { "Cache-Control": "no-store" },
    });

    res.cookies.set("ig_oauth_state", state, oauthCookieOpts);
    res.cookies.set("ig_oauth_return_to", returnTo, oauthCookieOpts);
    res.cookies.set("ig_oauth_store_id", user.storeId, oauthCookieOpts);

    return res;
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/socials/instagram/connect",
      operation: "INSTAGRAM_CONNECT_GET",
    });
    return NextResponse.json(
      { error: "Failed to start Instagram connect" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/socials/instagram/connect
 * Connect Instagram account (backend-assisted flow)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/socials/instagram/connect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to connect Instagram");
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/socials/instagram/connect",
      operation: "CONNECT_INSTAGRAM",
    });
    return NextResponse.json(
      { error: "Failed to connect Instagram" },
      { status: 500 },
    );
  }
}
