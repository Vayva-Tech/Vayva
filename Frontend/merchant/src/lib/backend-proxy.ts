import { NextRequest } from "next/server";
import { requireAuthFromRequest } from "@/lib/session.server";

const AUTH_COOKIE_CANDIDATES = [
  "vayva_session",
  "session",
  "__Secure-vayva-merchant-session",
  "next-auth.merchant-session",
  "__Secure-next-auth.session-token",
  "next-auth.session-token",
] as const;

function getCookieToken(request: NextRequest): string | null {
  for (const key of AUTH_COOKIE_CANDIDATES) {
    const value = request.cookies.get(key)?.value;
    if (value) return value;
  }
  return null;
}

export async function buildBackendAuthHeaders(request: NextRequest) {
  const user = await requireAuthFromRequest(request);
  if (!user) return null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-store-id": user.storeId,
  };

  const rawAuth = request.headers.get("authorization");
  if (rawAuth?.startsWith("Bearer ")) {
    headers.Authorization = rawAuth;
  } else {
    const token = getCookieToken(request);
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  return { user, headers };
}

export function buildBackendUrl(path: string): string {
  const base = process.env.BACKEND_API_URL || "";
  return `${base.replace(/\/$/, "")}${path}`;
}
