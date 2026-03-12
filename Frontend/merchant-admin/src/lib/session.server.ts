/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

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

  // 2) Web: NextAuth cookie session
  const session = await getServerSession(authOptions);
  return session?.user || null;
}

export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  return session?.user || null;
}

export async function clearSession() {
  // Intentional no-op: NextAuth signOut() handles session clearing
  return true;
}

export async function createSession(...args: any[]) {
  // Intentional no-op: NextAuth handles session creation via OAuth providers
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
