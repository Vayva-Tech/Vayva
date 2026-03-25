import { getServerSession as nextAuthGetServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

/** NextAuth session for App Router route handlers (merchant core-api). */
export function getServerSession() {
  return nextAuthGetServerSession(authOptions);
}
