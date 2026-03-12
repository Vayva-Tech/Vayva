import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { randomBytes, createHash } from "crypto";
import { urls } from "@vayva/shared";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export const POST = withVayvaAPI(
  PERMISSIONS.TEAM_MANAGE,
  async (req, { storeId, user }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const email = getString(body.email);
      const role = getString(body.role);
      const phone = getString(body.phone);
      const userId = user.id;

      // Validation
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json(
          { error: "Valid email is required" },
          { status: 400 },
        );
      }

      if (!role) {
        return NextResponse.json(
          { error: "Role is required" },
          { status: 400 },
        );
      }

      // Check if user already exists in this store
      const existingMember = await prisma.membership.findFirst({
        where: {
          storeId,
          user: {
            email: email.toLowerCase(),
          },
        },
      });

      if (existingMember) {
        return NextResponse.json(
          { error: "This user is already a member of your team" },
          { status: 409 },
        );
      }

      // Check if there's already a pending invite
      const existingInvite = await prisma.staffInvite.findFirst({
        where: {
          storeId,
          email: email.toLowerCase(),
          acceptedAt: null,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (existingInvite) {
        return NextResponse.json(
          { error: "An invite has already been sent to this email" },
          { status: 409 },
        );
      }

      // Basic store-level rate limiting (invites/hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const sentLastHour = await prisma.staffInvite.count({
        where: { storeId, createdAt: { gte: oneHourAgo } },
      });
      if (sentLastHour > 20) {
        return NextResponse.json(
          { error: "Too many invites. Please try later." },
          { status: 429 },
        );
      }

      // Generate secure invite token (unguessable)
      const rawToken = randomBytes(32).toString("hex");
      const tokenHash = createHash("sha256").update(rawToken).digest("hex");
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      // Create invite and enqueue email inside a transaction
      const invite = await prisma.$transaction(async (tx) => {
        const created = await tx.staffInvite.create({
          data: {
            storeId,
            email: email.toLowerCase(),
            role,
            phone: phone || null,
            token: tokenHash, // Store the hash
            expiresAt,
            createdBy: userId,
          },
        });

        const store = await tx.store.findUnique({
          where: { id: storeId },
          select: { name: true },
        });
        const inviterName =
          `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email;
        const acceptUrl = urls.merchantInviteUrl(rawToken); // Send the raw token in email

        // Best-effort dedupe
        try {
          await tx.emailOutbox.create({
            data: {
              type: "INVITE",
              toEmail: created.email,
              subject: `You’ve been invited to ${store?.name || "Your store"} on Vayva`,
              dedupeKey: `invite_${created.id}`,
              payload: {
                storeName: store?.name || "Your store",
                inviterName,
                acceptUrl,
              },
              status: "PENDING",
            },
          });
        } catch {
          // ignore unique dedupeKey conflicts
        }

        return created;
      });

      return NextResponse.json({
        success: true,
        inviteId: invite.id,
        message: "Invite sent successfully",
      });
    } catch (error: unknown) {
      logger.error("[MERCHANT_TEAM_INVITE_POST]", error, {
        storeId,
        userId: user.id,
      });
      return NextResponse.json(
        { error: "Failed to send invite" },
        { status: 500 },
      );
    }
  },
);
