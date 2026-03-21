import { logger } from "@/lib/logger";
import { NextRequest } from "next/server";

/**
 * Verify internal API authentication from ops-console or other internal services
 * Uses x-internal-secret header
 */
export function verifyInternalAuth(req: NextRequest): boolean {
  const secret = req.headers.get("x-internal-secret");
  const expectedSecret = process.env.INTERNAL_API_SECRET;
  
  if (!expectedSecret) {
    logger.error("[INTERNAL_AUTH] INTERNAL_API_SECRET not configured");
    return false;
  }
  
  return secret === expectedSecret;
}

/**
 * Get ops-console client info from request headers
 */
export function getOpsClientInfo(req: NextRequest): {
  client: string | null;
  userId: string | null;
  userEmail: string | null;
} {
  return {
    client: req.headers.get("x-vayva-client"),
    userId: req.headers.get("x-ops-user-id"),
    userEmail: req.headers.get("x-ops-user-email"),
  };
}

/**
 * Middleware helper for internal routes
 * Checks both internal secret and optional ops user context
 */
export function requireInternalAuth(
  req: NextRequest,
  options: { requireOpsUser?: boolean } = {}
): {
  authenticated: boolean;
  clientInfo: ReturnType<typeof getOpsClientInfo>;
  error?: string;
} {
  const clientInfo = getOpsClientInfo(req);
  
  if (!verifyInternalAuth(req)) {
    return {
      authenticated: false,
      clientInfo,
      error: "Invalid or missing internal secret",
    };
  }
  
  if (options.requireOpsUser && !clientInfo.userId) {
    return {
      authenticated: false,
      clientInfo,
      error: "Ops user context required",
    };
  }
  
  return {
    authenticated: true,
    clientInfo,
  };
}
