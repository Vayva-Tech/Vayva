import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { prisma } from "@vayva/db";
import bcrypt from "bcryptjs";

export function requireAuthEnv(app: "ops") {
  const url = process.env?.NEXTAUTH_URL;
  if (!url) throw new Error("NEXTAUTH_URL missing");

  if (process.env?.NODE_ENV === "production" && process.env?.CI !== "true") {
    const host = new URL(url).host;
    if (app === "ops" && host !== "ops.vayva.ng") {
      throw new Error(`NEXTAUTH_URL must be https://ops.vayva.ng (got ${url})`);
    }
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/ops/login",
    error: "/ops/login",
  },
  cookies: {
    sessionToken: {
      name: process.env?.NODE_ENV === "production"
          ? "__Secure-vayva-ops-session"
          : "next-auth.ops-session",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env?.NODE_ENV === "production",
      },
    },
  },
  providers: [
    CredentialsProvider({
      name: "Ops Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;

        if (!email || !password) return null;

        const user = await prisma.opsUser?.findUnique({
          where: { email: String(email).toLowerCase() },
        });

        if (!user) return null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!user.isActive) throw new Error("Account disabled");

        const ok = await bcrypt.compare(String(password), user.password);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
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
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.name = user.name || "";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const user = session.user as { id?: string; role?: string; name?: string };
        user.id = token.sub || "";
        user.role = token.role as string;
        user.name = token.name || "";
      }
      return session;
    },
  },
  secret: process.env?.NEXTAUTH_SECRET,
};
