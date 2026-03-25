import jwt, { JwtPayload } from "jsonwebtoken";
import { prisma } from "@vayva/db";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession, type Session } from "next-auth";
import { getToken } from "next-auth/jwt";
import { authOptions } from "@/lib/auth";
import { logger } from "@vayva/shared";
import { COOKIE_NAME } from "./session";

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;

export function getJwtSecret(): string {
  if (!JWT_SECRET) {
    throw new Error("Missing NEXTAUTH_SECRET or JWT_SECRET");
  }
  return JWT_SECRET;
}

export function generateToken(payload: Record<string, unknown>): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: "30d",
  });
}

export function verifyToken(token: string): JwtPayload | string | null {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch {
    return null;
  }
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME);

  if (!token) return null;

  try {
    const decoded = verifyToken(token.value);
    if (!decoded || typeof decoded === "string" || !decoded.sub) return null;

    // Fetch user and membership from DB to ensure session is still valid
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        sessionVersion: true,
      },
    });

    if (!user) return null;

    // Check session version for revocation
    if (
      decoded.version !== undefined &&
      user.sessionVersion > decoded.version
    ) {
      return null;
    }

    const membership = await prisma.membership.findFirst({
      where: { userId: user.id },
      include: {
        store: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!membership) return null;

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      storeId: membership.storeId,
      storeName: membership.store.name,
      role: membership.role_enum,
      sessionVersion: user.sessionVersion,
    };
  } catch {
    return null;
  }
}

export async function getSessionUserFromRequest(req: NextRequest) {
  // 1. Bearer JWT (API / BFF). If the header is present but not our JWT (e.g. opaque session token), fall through to cookie + NextAuth.
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (decoded && typeof decoded !== "string" && decoded.sub) {
      const user = await prisma.user.findUnique({
        where: { id: decoded.sub },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          sessionVersion: true,
        },
      });

      if (user) {
        const membership = await prisma.membership.findFirst({
          where: { userId: user.id },
          include: { store: true },
        });

        if (membership) {
          return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            storeId: membership.storeId,
            storeName: membership.store?.name,
            role: membership.role_enum,
            sessionVersion: user.sessionVersion,
          };
        }
      }
    }
  }

  // 2. Cookie JWT (Same-origin API)
  const token = req.cookies.get(COOKIE_NAME);
  if (!token) return null;

  const decoded = verifyToken(token.value);
  if (!decoded || typeof decoded === "string" || !decoded.sub) return null;

  const user = await prisma.user.findUnique({
    where: { id: decoded.sub },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      sessionVersion: true,
    },
  });

  if (!user) return null;

  const membership = await prisma.membership.findFirst({
    where: { userId: user.id },
    include: { store: true },
  });

  if (!membership) return null;

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    storeId: membership.storeId,
    storeName: membership.store?.name,
    role: membership.role_enum,
    sessionVersion: user.sessionVersion,
  };
}

function merchantNextAuthSessionCookieName(): string {
  return process.env.NODE_ENV === "production"
    ? "__Secure-vayva-merchant-session"
    : "next-auth.merchant-session";
}

async function userFromDbById(userId: string) {
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      sessionVersion: true,
    },
  });
  if (!dbUser) return null;
  const membership = await prisma.membership.findFirst({
    where: { userId: dbUser.id },
    include: { store: true },
  });
  if (!membership) return null;
  return {
    id: dbUser.id,
    email: dbUser.email,
    firstName: dbUser.firstName,
    lastName: dbUser.lastName,
    storeId: membership.storeId,
    storeName: membership.store?.name,
    role: membership.role_enum,
    sessionVersion: dbUser.sessionVersion,
  };
}

/**
 * Enhanced session fetcher that also works with NextAuth
 */
export async function requireAuthFromRequest(req: NextRequest) {
  const user = await getSessionUserFromRequest(req);
  if (user) return user;

  // NextAuth JWT in cookie on this request (works for merchant BFF forwarding Cookie header)
  const nextAuthSecret = process.env.NEXTAUTH_SECRET;
  if (nextAuthSecret) {
    const secureCookie = process.env.NODE_ENV === "production";
    try {
      const naJwt = await getToken({
        req,
        secret: nextAuthSecret,
        cookieName: merchantNextAuthSessionCookieName(),
        secureCookie,
      });
      if (
        naJwt &&
        typeof naJwt.sub === "string" &&
        naJwt.sub.length > 0 &&
        !naJwt.error
      ) {
        const fromNa = await userFromDbById(naJwt.sub);
        if (fromNa) return fromNa;
      }
    } catch {
      // getToken can throw on malformed cookies; fall through to getServerSession
    }
  }

  // NextAuth check (cookies() / async context)
  const session = (await getServerSession(authOptions)) as Session | null;
  const sessionUser = session?.user as unknown;
  if (
    sessionUser &&
    typeof sessionUser === "object" &&
    sessionUser !== null &&
    "id" in sessionUser
  ) {
    const id = (sessionUser as { id?: unknown }).id;
    if (typeof id === "string") {
      const fromSession = await userFromDbById(id);
      if (fromSession) return fromSession;
    }
  }

  return null;
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

export async function createSession(
  sessionUser: Record<string, unknown>,
  _merchant: Record<string, unknown> | null,
  _ip: string | null,
): Promise<string> {
  const token = generateToken({
    ...sessionUser,
    sub: sessionUser.id,
    version: sessionUser.sessionVersion,
  });
  await setSessionCookie(token);
  return token;
}

export async function clearSession() {
  const cookieStore = await cookies();
  const user = await getSessionUser();

  if (user) {
    // Increment session version in DB to invalidate all old tokens
    await prisma.user.update({
      where: { id: user.id },
      data: { sessionVersion: { increment: 1 } },
    });
    logger.info("[SESSION_CLEARED]", { userId: user.id, app: "merchant" });
  }

  // Clear cookie
  cookieStore.delete(COOKIE_NAME);
}

export function toAuthErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (message.startsWith("Unauthorized")) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 },
    );
  }
  if (message.startsWith("Forbidden")) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: message } },
      { status: 403 },
    );
  }
  return null;
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth() {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireStoreAccess(storeId?: string) {
  const user = await requireAuth();
  if (storeId && user.storeId !== storeId) {
    throw new Error("Forbidden: Access to this store denied");
  }
  return user;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const user = await getSessionUser();
  return !!user;
}
