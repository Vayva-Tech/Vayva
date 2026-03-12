import { NextResponse } from "next/server";
import { logger } from "@vayva/shared";
import { getSessionUser } from "@/lib/session.server";
/**
 * Authentication middleware for API routes
 * Validates JWT token and attaches user info to request
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function withAuth(handler: any, options: any= {}) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return async (req: any) => {
        try {
            const session = await getSessionUser();
            if (!session && !options.optional) {
                return NextResponse.json({ error: "Unauthorized - Please login" }, { status: 401 });
            }
            // Attach user to request
            const authReq = req;
            if (session) {
                authReq.user = session;
            }
            return handler(authReq);
        }
        catch (error) {
            logger.error("[AuthMiddleware] Authentication failed", { error: (error as Error)?.message });
            return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
        }
    };
}
/**
 * Helper to extract user from authenticated request
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getRequestUser(req: any) {
    if (!req.user) {
        throw new Error("User not authenticated");
    }
    return req.user;
}
