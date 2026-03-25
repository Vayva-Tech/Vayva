/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

type SessionUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  storeId: string;
  storeName: string;
  role: string;
  sessionVersion: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function getNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function readBearerToken(req: Request): string | null {
  const auth = req.headers.get("authorization") || "";
  if (!auth.startsWith("Bearer ")) return null;
  const token = auth.slice("Bearer ".length).trim();
  return token || null;
}

function readCookieToken(req: Request): string | null {
  const cookieHeader = req.headers.get("cookie") || "";
  if (!cookieHeader) return null;
  const cookieParts = cookieHeader.split(";").map((part) => part.trim());
  const names = [
    "vayva_session",
    "session",
    "__Secure-vayva-merchant-session",
    "next-auth.merchant-session",
    "__Secure-next-auth.session-token",
    "next-auth.session-token",
  ];
  for (const name of names) {
    const pair = cookieParts.find((part) => part.startsWith(`${name}=`));
    if (!pair) continue;
    const value = pair.slice(name.length + 1);
    if (value) return decodeURIComponent(value);
  }
  return null;
}

async function validateBearerToken(token: string): Promise<SessionUser | null> {
  const apiOrigin = process.env.BACKEND_API_URL;
  if (!apiOrigin) return null;

  const res = await fetch(`${apiOrigin.replace(/\/$/, "")}/api/auth/merchant/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "x-vayva-client": "mobile",
    },
    cache: "no-store",
  });

  if (!res.ok) return null;

  const payload: unknown = await res.json().catch(() => null);
  if (!isRecord(payload)) return null;
  const data = payload.data;
  if (!isRecord(data)) return null;

  const user = data.user;
  const store = data.store;
  if (!isRecord(user) || !isRecord(store)) return null;

  const id = getString(user.id);
  const email = getString(user.email);
  const firstName = (typeof user.firstName === "string" || user.firstName === null)
    ? (user.firstName as string | null)
    : null;
  const lastName = (typeof user.lastName === "string" || user.lastName === null)
    ? (user.lastName as string | null)
    : null;
  const storeId = getString(user.storeId) || getString(store.id);
  const storeName = getString(store.name);
  const role = getString(user.role) || "viewer";
  const sessionVersion = getNumber(user.sessionVersion) ?? 0;

  if (!id || !email || !storeId || !storeName) return null;

  return {
    id,
    email,
    firstName,
    lastName,
    storeId,
    storeName,
    role,
    sessionVersion,
  };
}

export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/signin");
  }

  return session.user;
}

export async function requireAuthFromRequest(req: Request) {
  // 1) Mobile / API clients: Bearer token (validated by backend)
  const bearer = readBearerToken(req);
  if (bearer) {
    const user = await validateBearerToken(bearer);
    if (user) return user;
  }

  // 1.1) Cookie-based JWT fallback for OTP/session cookie flows
  const cookieToken = readCookieToken(req);
  if (cookieToken) {
    const user = await validateBearerToken(cookieToken);
    if (user) return user;
  }

  // 2) Web: NextAuth cookie session
  const session = await getServerSession(authOptions);
  return session?.user || null;
}

/**
 * Resolve the current merchant user for server components (e.g. dashboard layout).
 * Prefer validating `vayva_session` / bearer-style cookies via the backend (same as
 * middleware and BFF routes), then fall back to NextAuth JWT session.
 */
export async function getSessionUser() {
  const cookieStore = await cookies();
  const all = cookieStore.getAll();
  const cookieHeader = all.map((c) => `${c.name}=${c.value}`).join("; ");
  const req = new Request("http://localhost/", {
    headers: cookieHeader ? { cookie: cookieHeader } : {},
  });
  return requireAuthFromRequest(req);
}

export async function clearSession() {
  const cookieStore = await cookies();
  const cookieNames = [
    "vayva_session",
    "session",
    "__Secure-vayva-merchant-session",
    "next-auth.merchant-session",
    "__Secure-next-auth.session-token",
    "next-auth.session-token",
  ];
  for (const name of cookieNames) {
    cookieStore.delete(name);
  }
  return true;
}

export async function createSession(...args: any[]) {
  const opts = args?.[0];
  const token = opts?.token || opts?.accessToken || null;
  if (!token || typeof token !== "string") return false;

  const rememberMe = opts?.rememberMe === true;
  const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7;

  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";
  cookieStore.set("vayva_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge,
  });

  return true;
}

export async function generateToken(payload: Record<string, string>) {
  // Generate a secure token using crypto
  const encoder = new TextEncoder();
  const data = encoder.encode(`${JSON.stringify(payload)}:${Date.now()}`);
  
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}
