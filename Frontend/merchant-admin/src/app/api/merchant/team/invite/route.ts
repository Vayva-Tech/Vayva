import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS, canInviteMember } from "@/lib/team/permissions";
import { prisma } from "@/lib/prisma";
import { randomBytes, createHash } from "crypto";
import { BRAND, urls } from "@vayva/shared";
import { logger } from "@/lib/logger";

export const POST = withVayvaAPI(PERMISSIONS.TEAM_MANAGE, async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string; firstName?: string | null; lastName?: string | null; email?: string | null } }) => {
    try {
        const body = await req.json();
        const { email, role, phone } = body;
        const userId = user.id;

        // Validation
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
        }

        if (!role) {
            return NextResponse.json({ error: "Role is required" }, { status: 400 });
        }

        // Check seat limits before creating invite
        const { allowed: seatAvailable, limit, current } = await canInviteMember(storeId);
        if (!seatAvailable) {
            return NextResponse.json(
                { error: `Seat limit reached (${current}/${limit}). Upgrade your plan to add more team members.` },
                { status: 403 }
            );
        }

        // Check if user already exists in this store
        const existingMember = await prisma.membership?.findFirst({
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
                { status: 409 }
            );
        }

        // Check if there's already a pending invite
        const existingInvite = await prisma.staffInvite?.findFirst({
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
                { status: 409 }
            );
        }

        // Basic store-level rate limiting (invites/hour)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const sentLastHour = await prisma.staffInvite?.count({
            where: { storeId, createdAt: { gte: oneHourAgo } },
        });
        if (sentLastHour > 20) {
            return NextResponse.json({ error: "Too many invites. Please try later." }, { status: 429 });
        }

        // Generate secure invite token (unguessable)
        const rawToken = randomBytes(32).toString("hex");
        const tokenHash = createHash("sha256").update(rawToken).digest("hex");
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        // Create invite and enqueue email inside a transaction
        const invite = await prisma.$transaction(async (tx) => {
            const created = await tx.staffInvite?.create({
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

            const store = await (tx as any).store?.findUnique({ where: { id: storeId }, select: { name: true } });
            const inviterName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email;
            const acceptUrl = urls.merchantInviteUrl(rawToken); // Send the raw token in email

            // Best-effort dedupe
            try {
                await (tx as any).emailOutbox?.create({
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
                        status: "pending",
                    },
                });
            } catch (_e: unknown) {
                // ignore unique dedupeKey conflicts
            }

            return created;
        });

        return NextResponse.json({
            success: true,
            inviteId: invite.id,
            message: "Invite sent successfully",
        });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error("[TEAM_INVITE_ERROR]", { error: errorMessage, storeId, userId: user.id });
        return NextResponse.json(
            { error: "Failed to send invite" },
            { status: 500 }
        );
    }
});
