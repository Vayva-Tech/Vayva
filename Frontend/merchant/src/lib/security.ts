// Frontend must not use Prisma directly - delegate to backend
// import { prisma } from "@vayva/db"; // REMOVED - Backend-only
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/session";
import { logAuditEvent, AuditEventType } from "@/lib/audit";

const BACKEND_URL = process.env.BACKEND_API_URL || '';

/**
 * Check if user has active sudo mode
 * Delegates to backend which handles:
 * - Session lookup
 * - Store verification
 * - Expiration checking
 */
export async function checkSudoMode(userId: string, storeId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  
  if (!token) {
    return false;
  }

  try {
    // Call backend instead of direct Prisma query
    const res = await fetch(
      `${BACKEND_URL}/api/v1/security/check-sudo?storeId=${storeId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      console.error('[Security] Failed to check sudo mode', { status: res.status });
      return false;
    }

    const data = await res.json();
    return data.data.isSudo;
  } catch (error) {
    console.error('[Security] Error checking sudo mode', error);
    return false;
  }
}

/**
 * Require sudo mode - throws error if not active
 * Delegates to backend which handles:
 * - Sudo mode verification
 * - Security event logging
 */
export async function requireSudoMode(userId: string, storeId: string) {
  const isSudo = await checkSudoMode(userId, storeId);
  
  if (!isSudo) {
    // Log security event via backend
    await logAuditEvent(storeId, userId, "SECURITY_STEP_UP_REQUIRED" as any, { 
      targetType: "SECURITY" 
    });
    
    throw new Error("Sudo mode required");
  }
}
