import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";
export const GET = withVayvaAPI(PERMISSIONS.TEAM_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const members = await prisma.membership?.findMany({
            where: { storeId },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatarUrl: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        const invites = await prisma.staffInvite?.findMany({
            where: { storeId },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json({
            members: (members ?? []).map((m) => ({
                id: (m as any).id,
                userId: (m as any).userId,
                name: `${(m as any)?.user?.firstName || ""} ${(m as any)?.user?.lastName || ""}`.trim() ||
                    "Unknown",
                email: (m as any).user?.email,
                role: (m as any).role_enum,
                status: (m as any).status,
                joinedAt: (m as any).createdAt,
            })),
            invites: (invites ?? []).map((i) => ({
                id: (i as any).id,
                email: (i as any).email,
                role: (i as any).role,
                status: (i as any).acceptedAt
                    ? "accepted"
                    : new Date((i as any).expiresAt) < new Date()
                        ? "expired"
                        : "pending",
                createdAt: (i as any).createdAt,
                expiresAt: (i as any).expiresAt,
            })),
        }, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    }
    catch (error: unknown) {
        logger.error("[MERCHANT_TEAM_GET] Failed to fetch team", { storeId, error });
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
});
