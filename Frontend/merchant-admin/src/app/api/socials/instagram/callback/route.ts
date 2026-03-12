import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { encrypt } from "@/lib/security/encryption";
import { logger } from "@/lib/logger";

type FbTokenResponse = {
  access_token: string;
  token_type?: string;
  expires_in?: number;
};

type FbAccountsResponse = {
  data?: Array<{
    id: string;
    name?: string;
    access_token?: string;
    instagram_business_account?: {
      id: string;
    };
  }>;
};

interface StoreSettings {
  instagram?: {
    connected: boolean;
    provider: string;
    pageId: string;
    pageName: string | null;
    igBusinessId: string;
    encryptedPageAccessToken: string;
    connectedAt: string;
  };
  [key: string]: unknown;
}

function safeReturnTo(value: string | null): string {
  if (!value) return "/dashboard/socials";
  if (!value.startsWith("/")) return "/dashboard/socials";
  return value;
}

async function readJsonOrThrow<T>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(text || "Provider returned invalid response");
  }
}

export const GET = withVayvaAPI(PERMISSIONS.INTEGRATIONS_MANAGE, async (req: NextRequest, { storeId }: { storeId: string }) => {
  const returnToCookie = req.cookies?.get("ig_oauth_return_to")?.value || null;
  const returnTo = safeReturnTo(returnToCookie);
  const buildRedirectUrl = (params: Record<string, string>): string => {
    const url = new URL(returnTo, req.nextUrl?.origin);
    for (const [key, value] of Object.entries(params)) {url?.searchParams?.set(key, value);
    }
    return url.toString();
  };

  try {
    const code = req.nextUrl?.searchParams.get("code");
    const state = req.nextUrl?.searchParams.get("state");

    const expectedState = req.cookies?.get("ig_oauth_state")?.value || null;

    if (!code) {
      return NextResponse.redirect(buildRedirectUrl({ ig: "ERROR", reason: "missing_code" }));
    }

    if (!state || !expectedState || state !== expectedState) {
      return NextResponse.redirect(buildRedirectUrl({ ig: "ERROR", reason: "invalid_state" }));
    }

    const appId = process.env?.META_APP_ID;
    const appSecret = process.env?.META_APP_SECRET;
    const redirectUri = process.env?.META_IG_REDIRECT_URI;

    if (!appId || !appSecret || !redirectUri) {
      return NextResponse.redirect(buildRedirectUrl({ ig: "ERROR", reason: "missing_config" }));
    }

    const tokenUrl = new URL("https://graph.facebook?.com/v17.0/oauth/access_token");
    tokenUrl.searchParams?.set("client_id", appId);
    tokenUrl.searchParams?.set("client_secret", appSecret);
    tokenUrl.searchParams?.set("redirect_uri", redirectUri);
    tokenUrl.searchParams?.set("code", code);

    const tokenRes = await fetch(tokenUrl.toString(), { method: "GET" });
    if (!tokenRes.ok) {
      return NextResponse.redirect(buildRedirectUrl({ ig: "ERROR", reason: "token_exchange_failed" }));
    }

    const shortLived = await readJsonOrThrow<FbTokenResponse>(tokenRes);

    const longLivedUrl = new URL("https://graph.facebook?.com/v17.0/oauth/access_token");
    longLivedUrl.searchParams?.set("grant_type", "fb_exchange_token");
    longLivedUrl.searchParams?.set("client_id", appId);
    longLivedUrl.searchParams?.set("client_secret", appSecret);
    longLivedUrl.searchParams?.set("fb_exchange_token", shortLived.access_token);

    const longRes = await fetch(longLivedUrl.toString(), { method: "GET" });
    if (!longRes.ok) {
      return NextResponse.redirect(buildRedirectUrl({ ig: "ERROR", reason: "long_lived_exchange_failed" }));
    }

    const longLived = await readJsonOrThrow<FbTokenResponse>(longRes);

    const accountsUrl = new URL("https://graph.facebook?.com/v17.0/me/accounts");
    accountsUrl.searchParams?.set("fields", "id,name,access_token,instagram_business_account");
    accountsUrl.searchParams?.set("access_token", longLived.access_token);

    const accountsRes = await fetch(accountsUrl.toString(), { method: "GET" });
    if (!accountsRes.ok) {
      return NextResponse.redirect(buildRedirectUrl({ ig: "ERROR", reason: "fetch_pages_failed" }));
    }

    const accounts = await readJsonOrThrow<FbAccountsResponse>(accountsRes);
    const pageWithIg = (accounts.data || []).find((p) => p.instagram_business_account?.id && p.access_token);

    if (!pageWithIg || !pageWithIg.access_token || !pageWithIg.instagram_business_account?.id) {
      return NextResponse.redirect(buildRedirectUrl({ ig: "ERROR", reason: "no_ig_business_account" }));
    }

    const encryptedPageToken = encrypt(pageWithIg.access_token);

    const store = await prisma.store?.findUnique({ where: { id: storeId } });
    if (!store) {
      return NextResponse.redirect(buildRedirectUrl({ ig: "ERROR", reason: "store_not_found" }));
    }

    const settings = (store.settings as StoreSettings | null) ?? {};
    const nextSettings: StoreSettings = {
      ...settings,
      instagram: {
        connected: true,
        provider: "meta",
        pageId: pageWithIg.id,
        pageName: pageWithIg.name || null,
        igBusinessId: pageWithIg.instagram_business_account?.id,
        encryptedPageAccessToken: encryptedPageToken,
        connectedAt: new Date().toISOString(),
      },
    };

    await prisma.store?.update({
      where: { id: storeId },
      data: {
        settings: nextSettings as any,
      },
    });

    const res = NextResponse.redirect(buildRedirectUrl({ ig: "connected" }), {
      headers: {
        "Cache-Control": "no-store",
      },
    });

    res.cookies?.set("ig_oauth_state", "", { path: "/", maxAge: 0 });
    res.cookies?.set("ig_oauth_return_to", "", { path: "/", maxAge: 0 });

    return res;
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("[INSTAGRAM_CALLBACK_GET] Failed to complete OAuth", { storeId, error: err.message });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});
