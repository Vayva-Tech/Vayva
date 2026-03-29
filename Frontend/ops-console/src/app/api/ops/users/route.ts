import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";
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

    const response = await apiClient.get('/api/v1/admin/users', {
      q: search,
    });

    return NextResponse.json(response);
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

    const response = await apiClient.post('/api/v1/admin/users', {
      email,
      name,
      role,
    });

    // Audit Log
    await OpsAuthService.logEvent(currentUser.id, "OPS_USER_CREATED", {
      createdUserEmail: email,
      role,
    });

    return NextResponse.json(response);

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

    const response = await apiClient.delete(`/api/v1/admin/users/${userId}`);

    await OpsAuthService.logEvent(currentUser.id, "OPS_USER_DELETED", {
      deletedUserId: userId,
    });

    return NextResponse.json(response);
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

    const response = await apiClient.patch(`/api/v1/admin/users/${userId}`, {
      action,
    });

    await OpsAuthService.logEvent(currentUser.id, response.logAction, {
      targetUserId: userId,
      targetUserEmail: response.user?.email,
    });

    return NextResponse.json(response);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    logger.error("[USER_UPDATE_ERROR]", { error });
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}
