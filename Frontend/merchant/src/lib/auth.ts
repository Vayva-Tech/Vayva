import { NextAuthOptions, Session, User, getServerSession as getServerSessionInternal } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

interface AuthUser {
    id: string;
    storeId: string;
    storeName: string;
    role: string;
    plan: string;
    trialEndsAt: string;
    emailVerified: boolean;
    onboardingCompleted: boolean;
    sessionVersion: string;
}

type AuthSession = Session & {
    user: AuthUser;
    storeName?: string;
    onboardingCompleted?: boolean;
}

type CustomToken = JWT & {
    storeId?: string;
    storeName?: string;
    role?: string;
    plan?: string;
    trialEndsAt?: string;
    emailVerified?: boolean;
    onboardingCompleted?: boolean;
    sessionVersion?: string;
    lastActive?: number;
    error?: string;
}

function requireAuthEnv(app: "merchant") {
    const url = process.env?.NEXTAUTH_URL;
    if (!url) throw new Error("NEXTAUTH_URL missing");
    const host = new URL(url).host;
    const allowedHostsRaw = process.env?.NEXTAUTH_ALLOWED_HOSTS;
    const allowedHosts = (allowedHostsRaw ? allowedHostsRaw.split(",") : [])
        .map((h) => h.trim())
        .filter(Boolean);
    const defaultAllowedHosts = ["merchant.vayva.ng"];

    const merchantAllowedHosts = allowedHosts.length > 0 ? allowedHosts : defaultAllowedHosts;

    if (app === "merchant" && !merchantAllowedHosts.includes(host)) {
        throw new Error(
            `NEXTAUTH_URL host must be one of: ${merchantAllowedHosts.join(", ")} (got ${url})`,
        );
    }
}

if (process.env.VERCEL_ENV === "production") {
    requireAuthEnv("merchant");
}

export const authOptions: NextAuthOptions = {
    cookies: {
        sessionToken: {
            name: process.env.NODE_ENV === "production"
                ? "__Secure-vayva-merchant-session"
                : "next-auth.merchant-session",
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env?.NODE_ENV === "production",
            },
        },
    },
    session: {
        strategy: "jwt",
        maxAge: 7 * 24 * 60 * 60,
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

                try {
                    const response = await fetch(
                        `${process?.env?.INTERNAL_API_URL || process.env?.NEXT_PUBLIC_API_URL}/api/auth/merchant/login`,
                        {
                            method: "POST",
                            body: JSON.stringify({
                                email: credentials.email,
                                password: credentials.password,
                            }),
                            headers: { "Content-Type": "application/json" },
                        },
                    );

                    const result = await response.json();

                    if ((response as any).status === 403 && result.error?.message === "OTP_REQUIRED") {
                        throw new Error("OTP_REQUIRED");
                    }

                    if ((response as any).status === 401 && result.error?.message === "INVALID_CREDENTIALS") {
                        throw new Error("INVALID_CREDENTIALS");
                    }

                    if (!response.ok) {
                        throw new Error(result.error?.message || "Authentication failed");
                    }

                    return result.data?.user;
                } catch (error) {
                    if (error instanceof Error && error.message === "OTP_REQUIRED") {
                        throw error;
                    }
                    throw new Error("Internal authentication error");
                }
            },
        }),
    ],
    callbacks: {
        async redirect({ url, baseUrl }) {
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            try {
                const u = new URL(url);
                if (u.origin === baseUrl) return url;
            } catch {
                // ignore
            }
            return baseUrl;
        },
        async jwt({ token, user, trigger, session }) {
            const t = token as CustomToken;
            
            if (user) {
                const u = user as unknown as AuthUser;
                t.storeId = u.storeId;
                t.storeName = u.storeName;
                t.role = u.role;
                t.plan = u.plan;
                t.trialEndsAt = u.trialEndsAt;
                t.emailVerified = u.emailVerified;
                t.onboardingCompleted = u.onboardingCompleted;
                t.sessionVersion = u.sessionVersion;
                t.lastActive = Date.now();
                t.sub = u.id;
            }
            
            if (trigger === "update" && session) {
                const s = session as unknown as { storeName?: string; onboardingCompleted?: boolean };
                t.storeName = s.storeName || t.storeName;
                t.onboardingCompleted = s.onboardingCompleted ?? t.onboardingCompleted;
                t.lastActive = Date.now();
            }
            
            const MAX_IDLE_TIME = 30 * 60 * 1000;
            const now = Date.now();
            const lastActive = t.lastActive;
            
            if (lastActive && now - lastActive > MAX_IDLE_TIME) {
                return { ...t, error: "RefreshAccessTokenError" };
            }
            
            const REFRESH_WINDOW = 5 * 60 * 1000;
            if (!lastActive || now - lastActive > REFRESH_WINDOW) {
                t.lastActive = now;
            }
            
            return t;
        },
        async session({ session, token }) {
            const t = token as CustomToken;
            
            if (t.error === "RefreshAccessTokenError") {
                return null as unknown as Session;
            }
            
            const su = session.user as unknown as AuthUser;
            if (su) {
                su.id = token.sub as string;
                su.storeId = t.storeId as string;
                su.storeName = t.storeName as string;
                su.role = t.role as string;
                su.plan = t.plan as string;
                su.trialEndsAt = t.trialEndsAt as string;
                su.emailVerified = t.emailVerified as boolean;
                su.onboardingCompleted = t.onboardingCompleted as boolean;
                su.sessionVersion = t.sessionVersion as string;
            }
            
            return session;
        },
    },
    secret: process.env?.NEXTAUTH_SECRET,
};

// Re-export next-auth functions
export { getServerSession } from "next-auth";

// Alias for compatibility (getServerSessionInternal already imported at top)
export { getServerSessionInternal as auth };

// Simple auth helper for API routes
export function withAuth(handler: (...args: unknown[]) => Promise<Response>) {
  return async (req: Request, ...args: any[]) => {
    const session = await getServerSessionInternal(authOptions);
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    return handler(req, ...args);
  };
}
