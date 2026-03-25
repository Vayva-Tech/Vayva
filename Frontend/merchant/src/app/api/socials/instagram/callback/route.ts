import { NextRequest, NextResponse } from "next/server";
import { prisma, Prisma } from "@vayva/db";
import { handleApiError } from "@/lib/api-error-handler";
import { encrypt } from "@/lib/security/encryption";

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

export async function GET(request: NextRequest): Promise<Response> {
  const returnToCookie = request.cookies.get("ig_oauth_return_to")?.value ?? null;
  const returnTo = safeReturnTo(returnToCookie);

  const buildRedirectUrl = (params: Record<string, string>): string => {
    const url = new URL(returnTo, request.nextUrl.origin || "/");
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
    return url.toString();
  };

  try {
    const code = request.nextUrl.searchParams.get("code");
    const state = request.nextUrl.searchParams.get("state");

    const expectedState = request.cookies.get("ig_oauth_state")?.value ?? null;

    if (!code) {
      return NextResponse.redirect(buildRedirectUrl({ ig: "error", reason: "missing_code" }));
    }

    if (!state || !expectedState || state !== expectedState) {
      return NextResponse.redirect(buildRedirectUrl({ ig: "error", reason: "invalid_state" }));
    }

    const storeId = request.cookies.get("ig_oauth_store_id")?.value?.trim() ?? "";
    if (!storeId) {
      return NextResponse.redirect(buildRedirectUrl({ ig: "error", reason: "missing_store" }));
    }

    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;
    const redirectUri = process.env.META_IG_REDIRECT_URI;

    if (!appId || !appSecret || !redirectUri) {
      return NextResponse.redirect(buildRedirectUrl({ ig: "error", reason: "missing_config" }));
    }

    const tokenUrl = new URL("https://graph.facebook.com/v17.0/oauth/access_token");
    tokenUrl.searchParams.set("client_id", appId);
    tokenUrl.searchParams.set("client_secret", appSecret);
    tokenUrl.searchParams.set("redirect_uri", redirectUri);
    tokenUrl.searchParams.set("code", code);

    const tokenRes = await fetch(tokenUrl.toString(), { method: "GET" });
    if (!tokenRes.ok) {
      return NextResponse.redirect(buildRedirectUrl({ ig: "error", reason: "token_exchange_failed" }));
    }

    const shortLived = await readJsonOrThrow<FbTokenResponse>(tokenRes);

    const longLivedUrl = new URL("https://graph.facebook.com/v17.0/oauth/access_token");
    longLivedUrl.searchParams.set("grant_type", "fb_exchange_token");
    longLivedUrl.searchParams.set("client_id", appId);
    longLivedUrl.searchParams.set("client_secret", appSecret);
    longLivedUrl.searchParams.set("fb_exchange_token", shortLived.access_token);

    const longRes = await fetch(longLivedUrl.toString(), { method: "GET" });
    if (!longRes.ok) {
      return NextResponse.redirect(buildRedirectUrl({ ig: "error", reason: "long_lived_exchange_failed" }));
    }

    const longLived = await readJsonOrThrow<FbTokenResponse>(longRes);

    const accountsUrl = new URL("https://graph.facebook.com/v17.0/me/accounts");
    accountsUrl.searchParams.set("fields", "id,name,access_token,instagram_business_account");
    accountsUrl.searchParams.set("access_token", longLived.access_token);

    const accountsRes = await fetch(accountsUrl.toString(), { method: "GET" });
    if (!accountsRes.ok) {
      return NextResponse.redirect(buildRedirectUrl({ ig: "error", reason: "fetch_pages_failed" }));
    }

    const accounts = await readJsonOrThrow<FbAccountsResponse>(accountsRes);
    const pageWithIg = (accounts.data || []).find((p) => p.instagram_business_account?.id && p.access_token);

    if (!pageWithIg || !pageWithIg.access_token || !pageWithIg.instagram_business_account?.id) {
      return NextResponse.redirect(buildRedirectUrl({ ig: "error", reason: "no_ig_business_account" }));
    }

    const encryptedPageToken = encrypt(pageWithIg.access_token);

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
      return NextResponse.redirect(buildRedirectUrl({ ig: "error", reason: "store_not_found" }));
    }

    const settings = (store.settings as StoreSettings | null) ?? {};
    const nextSettings: StoreSettings = {
      ...settings,
      instagram: {
        connected: true,
        provider: "meta",
        pageId: pageWithIg.id,
        pageName: pageWithIg.name || null,
        igBusinessId: pageWithIg.instagram_business_account.id,
        encryptedPageAccessToken: encryptedPageToken,
        connectedAt: new Date().toISOString(),
      },
    };

    await prisma.store.update({
      where: { id: storeId },
      data: {
        settings: nextSettings as Prisma.InputJsonValue,
      },
    });

    const res = NextResponse.redirect(buildRedirectUrl({ ig: "connected" }), {
      headers: {
        "Cache-Control": "no-store",
      },
    });

    res.cookies.set("ig_oauth_state", "", { path: "/", maxAge: 0 });
    res.cookies.set("ig_oauth_return_to", "", { path: "/", maxAge: 0 });
    res.cookies.set("ig_oauth_store_id", "", { path: "/", maxAge: 0 });

    return res;
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/api/socials/instagram/callback",
      operation: "INSTAGRAM_OAUTH_CALLBACK",
    });
    return NextResponse.redirect(buildRedirectUrl({ ig: "error", reason: "internal_error" }));
  }
}
