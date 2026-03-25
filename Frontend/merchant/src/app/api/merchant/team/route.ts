import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { prisma } from "@/lib/prisma";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { PERMISSIONS } from "@/lib/team/permissions";

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
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
  } catch (error) {
    handleApiError(error, { endpoint: "/api/merchant/team", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
