// @ts-nocheck
import { logger } from "@vayva/shared";
import { NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "token required" }, { status: 400 });
    }

    // Fetch invite details via API
    const result = await apiJson<{
      success: boolean;
      data?: { email?: string; role?: string; storeName?: string; userExists?: boolean };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/team/invites/accept?token=${token}`);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Invalid or expired invite' }, { status: 400 });
    }

    return NextResponse.json({
      email: result.data?.email,
      role: result.data?.role,
      storeName: result.data?.storeName,
      userExists: result.data?.userExists || false,
    });
    } catch (error) {
    handleApiError(
      error,
      {
        endpoint: "/api/team/invites/accept",
        operation: "FETCH_INVITE_DETAILS",
      }
    );
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { token, firstName, lastName, password } = body;

    if (!token) {
      return NextResponse.json({ error: "token required" }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }

    const now = new Date();
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const invite = await prisma.staffInvite?.findFirst({
      where: {
        token: tokenHash,
        acceptedAt: null,
        expiresAt: { gt: now },
      },
      select: {
        id: true,
        storeId: true,
        email: true,
        role: true,
        expiresAt: true,
      },
    });

    if (!invite) {
      return NextResponse.json({ error: "Invalid or expired invite" }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }

    // Create or find user by email
    const emailLower = invite.email?.toLowerCase();
    let user = await prisma.user?.findUnique({
      where: { email: emailLower },
      select: { id: true }
    });

    if (!user) {
      if (!firstName || !lastName || !password) {
        return NextResponse.json({ error: "Profile details required for new account" }, { status: 400 });
      }
      if (password.length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      user = await prisma.user?.create({
        data: {
          email: emailLower,
          password: hashedPassword,
          firstName,
          lastName,
          isEmailVerified: true,
        },
        select: { id: true },
      });
    }

    const roleEnum = (() => {
      const r = String(invite.role || "").trim().toUpperCase();
      if (r === "OWNER") return AppRole.OWNER;
      if (r === "ADMIN") return AppRole.ADMIN;
      if (r === "STAFF") return AppRole.STAFF;
      if (r === "SUPPORT") return AppRole.SUPPORT;
      if (r === "FINANCE") return AppRole.FINANCE;
      if (r === "OPS_ADMIN") return AppRole.OPS_ADMIN;
      if (r === "OPS_AGENT") return AppRole.OPS_AGENT;
      return AppRole.STAFF;
    })();

    await prisma.$transaction(async (tx) => {
      // Membership is unique by (userId, storeId)
      await tx.membership?.upsert({
        where: { userId_storeId: { userId: user!.id, storeId: invite.storeId } },
        update: {
          role_enum: roleEnum,
          status: "ACTIVE" as any,
        },
        create: {
          userId: user!.id,
          storeId: invite.storeId,
          role_enum: roleEnum,
          status: "ACTIVE" as any,
        },
      });

      await tx.staffInvite?.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      });
    });

    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
    } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    logger.error("[INVITE_ACCEPT_ERROR] Failed to accept invite", { message });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
