import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import crypto from "crypto";
import { withOpsAuth, OpsAuthContext } from "@/lib/withOpsAuth";
import { hasPermission, ROLE_METADATA, getAssignableRoles, isOpsRole, OpsRole } from "@/lib/roles";
import { OpsEmailService } from "@/lib/ops-email";
import { OpsAuthService } from "@/lib/ops-auth";

const INVITATION_EXPIRY_HOURS = 24;

/**
 * POST /api/ops/invitations
 * Send invitation email to a new team member
 */
export const POST = withOpsAuth(
  async (req: NextRequest, context: OpsAuthContext) => {
    const { user } = context;
    try {
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const body = await req.json();
      const { email, role, name } = body;

      // Validation
      if (!email || !role) {
        return NextResponse.json(
          { error: "Email and role are required" },
          { status: 400 }
        );
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: "Invalid email address" },
          { status: 400 }
        );
      }

      if (!isOpsRole(user.role)) {
        return NextResponse.json(
          { error: "Invalid user role" },
          { status: 403 },
        );
      }

      // Check if inviter has permission to invite users
      if (!hasPermission(user.role, "users", "create")) {
        return NextResponse.json(
          { error: "Insufficient permissions to send invitations" },
          { status: 403 }
        );
      }

      // Check if inviter can assign this specific role
      const assignableRoles = getAssignableRoles(user.role);
      if (!isOpsRole(role) || !assignableRoles.includes(role)) {
        return NextResponse.json(
          { error: `You cannot invite users with role: ${role}` },
          { status: 403 }
        );
      }

      // Check if email already exists
      const existingUser = await prisma.opsUser?.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "A user with this email already exists" },
          { status: 409 }
        );
      }

      // Check for existing pending invitation (not yet accepted and not expired)
      const existingInvitation = await prisma.opsInvitation?.findFirst({
        where: {
          email,
          acceptedAt: null,
          expiresAt: { gt: new Date() },
        },
      });

      if (existingInvitation) {
        return NextResponse.json(
          { error: "An invitation is already pending for this email" },
          { status: 409 }
        );
      }

      // Generate secure token
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + INVITATION_EXPIRY_HOURS);

      // Store invitation in database
      const result = await prisma.opsInvitation?.create({
        data: {
          email,
          role,
          token,
          invitedById: user.id,
          expiresAt,
        },
      });
      const invitationId = result?.id;

      // Generate acceptance URL
      const baseUrl = process.env.NEXT_PUBLIC_OPS_CONSOLE_URL || 
                      process.env.NEXT_PUBLIC_BASE_URL || 
                      "https://ops.vayva.ng";
      const acceptUrl = `${baseUrl}/invite/accept?token=${token}`;

      // Send invitation email
      const roleMeta = ROLE_METADATA[role];
      const emailResult = await OpsEmailService.sendInvitationEmail(email, {
        inviterName: user.name || user.email,
        inviterEmail: user.email,
        role,
        roleLabel: roleMeta?.label || role,
        acceptUrl,
        expiresAt,
      });

      if (!emailResult.success) {
        // Rollback: delete the invitation
        await prisma.opsInvitation?.delete({ where: { id: invitationId } }).catch(() => {
          // Ignore cleanup errors
        });

        return NextResponse.json(
          { error: "Failed to send invitation email", details: emailResult.error },
          { status: 500 }
        );
      }

      // Audit log
      await OpsAuthService.logEvent(user.id, "OPS_INVITATION_SENT", {
        invitedEmail: email,
        invitedRole: role,
        invitationId,
      });

      return NextResponse.json({
        success: true,
        message: "Invitation sent successfully",
        invitationId,
        expiresAt,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to send invitation";
      return NextResponse.json(
        { error: errorMsg },
        { status: 500 }
      );
    }
  },
  { requiredPermission: { category: "users", action: "create" } }
);

/**
 * GET /api/ops/invitations
 * List pending invitations
 */
export const GET = withOpsAuth(
  async (_req: NextRequest, context: OpsAuthContext) => {
    const { user } = context;
    try {
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      // Check permission
      if (!isOpsRole(user.role)) {
        return NextResponse.json(
          { error: "Invalid user role" },
          { status: 403 },
        );
      }
      if (!hasPermission(user.role, "users", "view")) {
        return NextResponse.json(
          { error: "Insufficient permissions" },
          { status: 403 }
        );
      }

      // Fetch pending invitations (not yet accepted and not expired)
      const invitations = await prisma.opsInvitation?.findMany({
        where: {
          acceptedAt: null,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
        include: {
          invitedBy: {
            select: { name: true, email: true },
          },
        },
      }) ?? [];

      return NextResponse.json({ invitations });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to fetch invitations";
      return NextResponse.json(
        { error: errorMsg },
        { status: 500 }
      );
    }
  },
  { requiredPermission: { category: "users", action: "view" } }
);

/**
 * DELETE /api/ops/invitations?id=<invitationId>
 * Cancel/delete a pending invitation
 */
export const DELETE = withOpsAuth(
  async (req: NextRequest, context: OpsAuthContext) => {
    const { user } = context;
    try {
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const { searchParams } = new URL(req.url);
      const invitationId = searchParams.get("id");

      if (!invitationId) {
        return NextResponse.json(
          { error: "Invitation ID is required" },
          { status: 400 }
        );
      }

      // Check permission
      if (!isOpsRole(user.role)) {
        return NextResponse.json(
          { error: "Invalid user role" },
          { status: 403 },
        );
      }
      if (!hasPermission(user.role, "users", "delete")) {
        return NextResponse.json(
          { error: "Insufficient permissions to cancel invitations" },
          { status: 403 }
        );
      }

      // Find the invitation
      const invitation = await prisma.opsInvitation?.findUnique({
        where: { id: invitationId },
      });

      if (!invitation) {
        return NextResponse.json(
          { error: "Invitation not found" },
          { status: 404 }
        );
      }

      // Check if already accepted or expired
      if (invitation.acceptedAt !== null) {
        return NextResponse.json(
          { error: "Can only cancel pending invitations" },
          { status: 400 }
        );
      }

      // Delete the invitation
      await prisma.opsInvitation?.delete({
        where: { id: invitationId },
      });

      // Audit log
      await OpsAuthService.logEvent(user.id, "OPS_INVITATION_CANCELLED", {
        invitationId,
        invitedEmail: invitation.email,
        invitedRole: invitation.role,
      });

      return NextResponse.json({
        success: true,
        message: "Invitation cancelled successfully",
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to cancel invitation";
      return NextResponse.json(
        { error: errorMsg },
        { status: 500 }
      );
    }
  },
  { requiredPermission: { category: "users", action: "delete" } }
);
