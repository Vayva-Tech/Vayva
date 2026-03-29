import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";
import { logger } from "@vayva/shared";

export async function POST(req: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();
    const body = await req.json();
    const { email, role, name } = body;

    const response = await apiClient.post('/api/v1/admin/invitations', {
      email,
      role,
      name,
    });

    return NextResponse.json(response);
  } catch (error) {
    logger.error("[INVITATION_ERROR]", { error });
    return NextResponse.json(
      { error: "Failed to send invitation" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();
    
    const response = await apiClient.get('/api/v1/admin/invitations');
    
    return NextResponse.json(response);
  } catch (error) {
    logger.error("[INVITATIONS_LIST_ERROR]", { error });
    return NextResponse.json(
      { error: "Failed to fetch invitations" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();
    const { searchParams } = new URL(req.url);
    const invitationId = searchParams.get("id");

    if (!invitationId) {
      return NextResponse.json(
        { error: "Invitation ID is required" },
        { status: 400 }
      );
    }

    const response = await apiClient.delete(`/api/v1/admin/invitations?id=${invitationId}`);
    
    return NextResponse.json(response);
  } catch (error) {
    logger.error("[INVITATION_DELETE_ERROR]", { error });
    return NextResponse.json(
      { error: "Failed to cancel invitation" },
      { status: 500 }
    );
  }
}
