import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import bcrypt from "bcryptjs";
import { OpsAuthService } from "@/lib/ops-auth";

const SALT_ROUNDS = 12;

/**
 * POST /api/ops/invitations/accept
 * Accept an invitation and create a new user account
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password, name } = body;

    // Validation
    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return NextResponse.json(
        { error: "Password does not meet requirements", details: passwordErrors },
        { status: 400 }
      );
    }

    // Find the invitation
    const invitation = await prisma.opsInvitation?.findUnique({
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

    // Hash the password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create the user account
    const userName = name || invitation.email?.split("@")[0];
    const newUser = await prisma.opsUser?.create({
      data: {
        email: invitation.email,
        password: passwordHash,
        name: userName,
        role: invitation.role,
        isActive: true,
        isMfaEnabled: false,
      },
    });

    // Update the invitation as accepted
    await prisma.opsInvitation?.update({
      where: { id: invitation.id },
      data: {
        acceptedAt: new Date(),
      },
    });

    // Audit log the acceptance
    await OpsAuthService.logEvent(newUser.id, "OPS_INVITATION_ACCEPTED", {
      invitationId: invitation.id,
      invitedById: invitation.invitedById,
      role: invitation.role,
    });

    // Send notification email to the inviter (if exists)
    if (invitation.invitedById) {
      try {
        const inviter = await prisma.opsUser?.findUnique({
          where: { id: invitation.invitedById },
        });
        if (inviter) {
          const { OpsEmailService } = await import("@/lib/ops-email");
          await OpsEmailService.sendInvitationAcceptedNotification(inviter.email, {
            newMemberName: userName,
            newMemberEmail: invitation.email,
            roleLabel: invitation.role,
          });
        }
      } catch {
        // Non-critical: don't fail if notification email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Failed to accept invitation";
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}

function validatePassword(password: string): string[] {
  const errors: string[] = [];

  if (password.length < 12) {
    errors.push("Password must be at least 12 characters long");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return errors;
}
