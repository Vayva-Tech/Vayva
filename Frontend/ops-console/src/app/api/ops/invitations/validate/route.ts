import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";

/**
 * GET /api/ops/invitations/validate?token=...
 * Validate an invitation token without authenticating
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    // Find the invitation
    const invitation = await prisma.opsInvitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invalid invitation token" },
        { status: 404 }
      );
    }

    // Check if invitation has expired
    if (new Date() > invitation.expiresAt) {
      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 410 }
      );
    }

    // Check if invitation is still pending
    // Note: opsInvitation model doesn't have status field - check acceptedAt instead
    if (invitation.acceptedAt) {
      return NextResponse.json(
        { error: "Invitation is already accepted" },
        { status: 410 }
      );
    }

    // Check if user already exists with this email
    const existingUser = await prisma.opsUser?.findUnique({
      where: { email: invitation.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    // Return invitation details (without sensitive token)
    return NextResponse.json({
      valid: true,
      invitation: {
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Failed to validate invitation";
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}
