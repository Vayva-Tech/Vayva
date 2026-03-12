import { NextResponse } from "next/server";
import { prisma, AppRole } from "@vayva/db";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "token required" }, { status: 400 });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const now = new Date();

    const invite = await prisma.staffInvite.findFirst({
      where: {
        token: tokenHash,
        acceptedAt: null,
        expiresAt: { gt: now },
      },
      include: {
        store: {
          select: { name: true },
        },
      },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Invalid or expired invite" },
        { status: 400 },
      );
    }

    const userExists = await prisma.user.findUnique({
      where: { email: invite.email.toLowerCase() },
      select: { id: true },
    });

    return NextResponse.json({
      email: invite.email,
      role: invite.role,
      storeName: invite.store.name,
      userExists: !!userExists,
    });
  } catch {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const parsedBody: unknown = await req.json().catch(() => ({}));
    const body = isRecord(parsedBody) ? parsedBody : {};
    const token = typeof body.token === "string" ? body.token : undefined;
    const firstName =
      typeof body.firstName === "string" ? body.firstName : undefined;
    const lastName =
      typeof body.lastName === "string" ? body.lastName : undefined;
    const password =
      typeof body.password === "string" ? body.password : undefined;

    if (!token) {
      return NextResponse.json(
        { error: "token required" },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const now = new Date();
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const invite = await prisma.staffInvite.findFirst({
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
      return NextResponse.json(
        { error: "Invalid or expired invite" },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    // Create or find user by email
    const emailLower = invite.email.toLowerCase();
    let user = await prisma.user.findUnique({
      where: { email: emailLower },
      select: { id: true },
    });

    if (!user) {
      if (!firstName || !lastName || !password) {
        return NextResponse.json(
          { error: "Profile details required for new account" },
          { status: 400 },
        );
      }
      if (password.length < 8) {
        return NextResponse.json(
          { error: "Password must be at least 8 characters" },
          { status: 400 },
        );
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      user = await prisma.user.create({
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

    // At this point user is guaranteed non-null (found or created above)
    const userId = user.id;

    const roleEnum = (() => {
      const r = String(invite.role || "")
        .trim()
        .toUpperCase();
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
      await tx.membership.upsert({
        where: { userId_storeId: { userId, storeId: invite.storeId } },
        update: {
          role_enum: roleEnum,
          status: "ACTIVE",
        },
        create: {
          userId,
          storeId: invite.storeId,
          role_enum: roleEnum,
          status: "ACTIVE",
        },
      });

      await tx.staffInvite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      });
    });

    return NextResponse.json(
      { success: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e: unknown) {
    logger.error("[INVITE_ACCEPT_POST]", e);
    return NextResponse.json(
      { error: "Failed to accept invite" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
