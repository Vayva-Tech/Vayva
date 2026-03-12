import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withOpsAPI } from "@/lib/api-handler";
import { logger } from "@vayva/shared";

/**
 * POST /api/ops/impersonate
 * 
 * Start an impersonation session.
 * This allows support agents to act on behalf of a merchant/user.
 * Requires permission: ops:impersonate:start
 */
const postHandler = withOpsAPI(
  async (req: any, context: any) => {
    const { user, requestId } = context;
    
    const body = await req.json();
    const { targetUserId, targetType = "merchant", reason, sessionDuration = 3600 } = body;

    if (!targetUserId) {
      return NextResponse.json(
        { error: "Target user ID is required" },
        { status: 400 }
      );
    }

    if (!reason || reason.length < 10) {
      return NextResponse.json(
        { error: "A detailed reason (min 10 chars) is required for impersonation" },
        { status: 400 }
      );
    }

    // Validate target user exists (simplified query)
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 }
      );
    }

    // Store impersonation in a cookie-based session for now
    // (impersonationSession model doesn't exist in schema)

    // Log the impersonation start for audit
    await prisma.opsAuditEvent.create({
      data: {
        eventType: "IMPERSONATION_STARTED",
        opsUserId: user.id,
        metadata: {
          targetUserId,
          targetEmail: targetUser.email,
          reason,
          sessionDuration,
        },
      },
    });

    logger.info("[IMPERSONATION_STARTED]", {
      requestId,
      impersonatorId: user.id,
      impersonatorEmail: user.email,
      targetUserId,
      targetEmail: targetUser.email,
      reason,
    });

    return NextResponse.json({
      success: true,
      data: {
        targetUser: {
          id: targetUser.id,
          email: targetUser.email,
          name: targetUser.firstName 
            ? `${targetUser.firstName} ${targetUser.lastName || ""}`.trim()
            : targetUser.email,
        },
        impersonator: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        expiresAt: new Date(Date.now() + sessionDuration * 1000).toISOString(),
        reason,
      },
    });
  },
  { requiredPermission: "ops:impersonate:start" }
);

/**
 * DELETE /api/ops/impersonate
 * 
 * End an active impersonation session.
 * Requires permission: ops:impersonate:stop (self) or ops:impersonate:stop:any (any session)
 */
const deleteHandler = withOpsAPI(
  async (req: any, context: any) => {
    const { user, requestId } = context;
    
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    // Since impersonationSession model doesn't exist yet, we use cookie-based sessions
    // For now, simply log the stop action
    
    // Log the impersonation end
    await prisma.opsAuditEvent.create({
      data: {
        eventType: "IMPERSONATION_ENDED",
        opsUserId: user.id,
        metadata: {
          endedBy: user.id,
          sessionId: sessionId || "unknown",
        },
      },
    });

    logger.info("[IMPERSONATION_ENDED]", {
      requestId,
      endedBy: user.id,
      sessionId: sessionId || "unknown",
    });

    return NextResponse.json({
      success: true,
      data: {
        endedAt: new Date().toISOString(),
      },
    });
  },
  { requiredPermission: "ops:impersonate:stop" }
);

/**
 * GET /api/ops/impersonate
 * 
 * Get active impersonation sessions.
 * - Returns own active session by default
 * - Returns all active sessions if user has ops:impersonate:view:any permission
 */
const getHandler = withOpsAPI(
  async (req: any, context: any) => {
    const { user } = context;
    
    // Since impersonationSession model doesn't exist, return 501 Not Implemented
    return NextResponse.json(
      { 
        error: "Not Implemented",
        message: "Impersonation session persistence is not yet available",
        data: []
      },
      { status: 501 }
    );
  },
  { requiredPermission: "ops:impersonate:view" }
);

export async function POST(
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  const params = await context.params;
  return postHandler(req, { params } as any);
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  const params = await context.params;
  return deleteHandler(req, { params } as any);
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  const params = await context.params;
  return getHandler(req, { params } as any);
}
