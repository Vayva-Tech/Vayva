import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

export const dynamic = "force-dynamic";

// Next.js App Router API Route
export async function GET(req: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();
    // Allow Admins and Owners to view users
    if (!["OPS_OWNER", "OPS_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("q") || "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const users = await prisma.opsUser.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user: currentUser } = await OpsAuthService.requireSession();
    // Only Owner can create new users for now
    if (currentUser.role !== "OPS_OWNER") {
      return NextResponse.json(
        { error: "Only Owners can invite new users" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { email, name, role } = body;

    if (!email || !name || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const { user, tempPassword } = await OpsAuthService.createUser(
      currentUser.role,
      {
        email,
        name,
        role,
      },
    );

    // Audit Log
    await OpsAuthService.logEvent(currentUser.id, "OPS_USER_CREATED", {
      createdUserEmail: email,
      role,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      tempPassword, // Return temp password to display once
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { user: currentUser } = await OpsAuthService.requireSession();
    if (currentUser.role !== "OPS_OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    if (userId === currentUser.id) {
      return NextResponse.json(
        { error: "Cannot delete yourself" },
        { status: 400 },
      );
    }

    // Soft delete (deactivate) or hard delete? Let's toggle active state for now or hard delete if requested.
    // For security, let's just delete for now to keep it clean, or update isActive.
    // The implementation plan implies management. Let's do a hard delete for cleanup or deactivate.
    // Schema has `isActive`. Let's toggle that via a PATCH, but for DELETE method specifically...
    // Let's implement DELETE as actual delete for cleanup, or maybe just deactivate?
    // Let's stick to DELETE = Delete for simplicity of "Remove User".

    await prisma.opsUser.delete({
      where: { id: userId },
    });

    await OpsAuthService.logEvent(currentUser.id, "OPS_USER_DELETED", {
      deletedUserId: userId,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 },
    );
  }
}
export async function PATCH(req: NextRequest) {
  try {
    const { user: currentUser } = await OpsAuthService.requireSession();
    if (currentUser.role !== "OPS_OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { userId, action } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (userId === currentUser.id) {
      return NextResponse.json(
        { error: "Cannot modify yourself" },
        { status: 400 },
      );
    }

    const user = await prisma.opsUser.findUnique({ where: { id: userId } });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    let logAction = "";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let updateData: any = {};

    switch (action) {
      case "TOGGLE_STATUS":
        updateData = { isActive: !user.isActive };
        logAction = user.isActive
          ? "OPS_USER_DEACTIVATED"
          : "OPS_USER_ACTIVATED";
        break;
      case "RESET_2FA":
        // Reset 2FA by clearing the secret
        updateData = { twoFactorSecret: null };
        logAction = "OPS_USER_2FA_RESET";
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const updated = await prisma.opsUser.update({
      where: { id: userId },
      data: updateData,
    });

    await OpsAuthService.logEvent(currentUser.id, logAction, {
      targetUserId: userId,
      targetUserEmail: user.email,
    });

    return NextResponse.json({ success: true, user: updated });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    logger.error("[USER_UPDATE_ERROR]", { error });
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}
