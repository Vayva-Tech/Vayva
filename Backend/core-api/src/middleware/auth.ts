import type { NextRequest } from "next/server";
import { requireAuthFromRequest } from "@/lib/session.server";

export type AuthenticatedStoreContext = {
  storeId: string;
  userId: string;
};

/**
 * Resolve the current merchant session for API routes (JWT, Bearer, NextAuth).
 */
export async function authenticateRequest(
  request: NextRequest,
): Promise<AuthenticatedStoreContext | null> {
  const user = await requireAuthFromRequest(request);
  if (!user?.storeId) return null;
  return { storeId: user.storeId, userId: user.id };
}
