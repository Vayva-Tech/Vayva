import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import crypto from "crypto";
import { logger } from "@/lib/logger";

function safeReturnTo(value: string | null): string {
  if (!value) return "/dashboard/socials";
  if (!value.startsWith("/")) return "/dashboard/socials";
  return value;
}

export const GET = withVayvaAPI(
  PERMISSIONS.INTEGRATIONS_MANAGE,
  async (req, { storeId }) => {
    try {
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

      const { searchParams } = new URL(req.url);
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
        headers: {
          "Cache-Control": "no-store",
        },
      });

      res.cookies.set("ig_oauth_state", state, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 10,
      });

      res.cookies.set("ig_oauth_return_to", returnTo, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 10,
      });

      return res;
    } catch (error: unknown) {
      logger.error("[INSTAGRAM_CONNECT_GET]", error, { storeId });
      const msg =
        error instanceof Error
          ? error.message
          : "Failed to start Instagram connect";
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  },
);
