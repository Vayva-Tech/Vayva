import { NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";

/**
 * GET /api/ops/me
 * 
 * Returns the current authenticated ops user
 */
export async function GET() {
  try {
    const { user, session } = await OpsAuthService.requireSession();
    
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      session: {
        id: session.id,
        expiresAt: session.expiresAt,
      },
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    if (errMsg === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}
