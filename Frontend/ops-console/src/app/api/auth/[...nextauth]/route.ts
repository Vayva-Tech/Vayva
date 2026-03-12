import NextAuth from "next-auth";
import { authOptions, requireAuthEnv } from "@/lib/nextauth";
import type { NextRequest } from "next/server";

function handler(req: Request) {
  requireAuthEnv("ops");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return NextAuth(authOptions)(req as unknown as NextRequest);
}

export { handler as GET, handler as POST };
