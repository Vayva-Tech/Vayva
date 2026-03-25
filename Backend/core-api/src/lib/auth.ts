import { NextAuthOptions } from "next-auth";
import { getServerSession as getServerSessionNext } from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@vayva/db";
import bcrypt from "bcryptjs";
import { Adapter } from "next-auth/adapters";
import type { NextRequest } from "next/server";

function requireAuthEnv(app: "merchant") {
  const url = process.env.NEXTAUTH_URL;
  if (!url) throw new Error("NEXTAUTH_URL missing");
  const host = new URL(url).host;
  if (app === "merchant" && host !== "merchant.vayva.ng") {
    throw new Error(
      `NEXTAUTH_URL must be https://merchant.vayva.ng (got ${url})`,
    );
  }
}

if (process.env.VERCEL_ENV === "production") {
  requireAuthEnv("merchant");
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-vayva-merchant-session"
          : "next-auth.merchant-session",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: "/signin",
    signOut: "/signout",
    error: "/auth/error",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }
        // Find user
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            memberships: {
              where: { status: "ACTIVE" },
              include: {
                store: {
                  include: {
                    aiSubscription: true,
                  },
                },
              },
            },
          },
        });
        if (!user || !user.isEmailVerified) {
          throw new Error("Invalid credentials or email not verified");
        }
        // Verify password
        const isValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );
        if (!isValid) {
          throw new Error("Invalid credentials");
        }
        // Get primary store (first active membership)
        const primaryMembership = user.memberships[0];
        if (!primaryMembership) {
          throw new Error("No active store membership found");
        }
        return {
          id: user.id,
          email: user.email,
          name:
            `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
            user.email,
          storeId: primaryMembership.storeId,
          storeName: primaryMembership.store.name,
          role: primaryMembership.role_enum,
          plan: primaryMembership.store.plan || "FREE",
          trialEndsAt: primaryMembership.store.aiSubscription?.trialExpiresAt
            ? primaryMembership.store.aiSubscription.trialExpiresAt.toISOString()
            : null,
          emailVerified: user.isEmailVerified,
          onboardingCompleted: primaryMembership.store.onboardingCompleted,
          sessionVersion: user.sessionVersion,
        };
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        const u = new URL(url);
        if (u.origin === baseUrl) return url;
      } catch {
        // ignore
      }
      return baseUrl;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({
      token,
      user,
      trigger,
      session,
    }: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      token: any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      user?: any;
      trigger?: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      session?: any;
    }) {
      // 1. Initial Sign In
      if (user) {
        token.storeId = user.storeId;
        token.storeName = user.storeName;
        token.role = user.role;
        token.plan = user.plan;
        token.trialEndsAt = user.trialEndsAt;
        token.emailVerified = user.emailVerified;
        token.onboardingCompleted = user.onboardingCompleted;
        token.sessionVersion = user.sessionVersion;
        token.lastActive = Date.now();
        token.sub = user.id;
      }
      // 2. Handle Session Updates (e.g. Profile changes)
      if (trigger === "update" && session) {
        token.storeName =
          (session as Record<string, unknown>).storeName || token.storeName;
        token.onboardingCompleted =
          (session as Record<string, unknown>).onboardingCompleted ??
          token.onboardingCompleted;
        token.lastActive = Date.now(); // Update activity on explicit refresh
      }
      // 3. Idle Timeout Check (e.g. 30 Minutes)
      const MAX_IDLE_TIME = 30 * 60 * 1000; // 30 mins
      const now = Date.now();
      // If token has a lastActive time and we've exceeded idle time
      if (
        token.lastActive &&
        now - (token.lastActive as number) > MAX_IDLE_TIME
      ) {
        // We could invalidate here, but NextAuth makes it hard to "kill" a JWT.
        // We return a flag that the session check can see and reject.
        return { ...token, error: "RefreshAccessTokenError" };
      }
      // Update lastActive (Sliding Window)
      // NOTE: This runs on every JWT decode (every API call / page load).
      // To prevent thrashing, we only update if > 1 min has passed?
      // Actually, NextAuth only writes the cookie back if we change the token in `signIn` or `update`.
      // Standard `jwt` callback read doesn't always persist updates to the cookie unless `trigger` involved,
      // BUT for sliding expiration we relying on `maxAge` usually.
      // To strictly enforce "Revoke on Idle", we need to check the timestamp.
      // We will update `lastActive` here to allow "Sliding Window".
      // RATE LIMIT: Only update if > 5 minutes have passed to prevent Set-Cookie thrashing
      const REFRESH_WINDOW = 5 * 60 * 1000;
      if (
        !token.lastActive ||
        now - (token.lastActive as number) > REFRESH_WINDOW
      ) {
        token.lastActive = now;
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: { session: any; token: any }) {
      // Enforce Idle Revocation
      if (token.error === "RefreshAccessTokenError") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return null as unknown as any; // Force sign out
      }
      // Add custom fields to session
      if (session.user) {
        session.user.id = token.sub;
        session.user.storeId = token.storeId;
        session.user.storeName = token.storeName;
        session.user.role = token.role;
        session.user.plan = token.plan;
        session.user.trialEndsAt = token.trialEndsAt;
        session.user.emailVerified = token.emailVerified;
        session.user.onboardingCompleted = token.onboardingCompleted;
        session.user.sessionVersion = token.sessionVersion;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
// Export getServerSession for compatibility
export { getServerSession } from "next-auth";

/** Resolve store id from NextAuth session (BFF / route handlers). */
export async function getAuthStoreId(_req: NextRequest): Promise<string | null> {
  const session = await getServerSessionNext(authOptions);
  const user = session?.user as { storeId?: string } | undefined;
  return user?.storeId ?? null;
}
