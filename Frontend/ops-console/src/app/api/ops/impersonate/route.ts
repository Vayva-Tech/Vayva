import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";
import { logger } from "@vayva/shared";

/**
 * POST /api/ops/impersonate
 * 
 * Start an impersonation session.
 * This allows support agents to act on behalf of a merchant/user.
 */
export async function POST(req: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();
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

    const response = await apiClient.post('/api/v1/admin/impersonate/start', {
      targetUserId,
      targetType,
      reason,
      sessionDuration,
    });

    return NextResponse.json(response);
  } catch (error) {
    logger.error("[IMPERSONATION_ERROR]", { error });
    return NextResponse.json(
      { error: "Failed to start impersonation" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    const response = await apiClient.delete(`/api/v1/admin/impersonate/stop?sessionId=${sessionId}`);

    return NextResponse.json(response);
  } catch (error) {
    logger.error("[IMPERSONATION_STOP_ERROR]", { error });
    return NextResponse.json(
      { error: "Failed to stop impersonation" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();
    const response = await apiClient.get('/api/v1/admin/impersonate/sessions');
    return NextResponse.json(response);
  } catch (error) {
    logger.error("[IMPERSONATION_SESSIONS_ERROR]", { error });
    return NextResponse.json(
      { error: "Failed to fetch impersonation sessions" },
      { status: 500 }
    );
  }
}

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
