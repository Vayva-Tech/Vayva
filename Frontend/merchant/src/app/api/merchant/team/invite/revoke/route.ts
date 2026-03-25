import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const body = await request.json();
        const { inviteId } = body;

        if (!inviteId) {
            return NextResponse.json({ error: "Invite ID is required" }, { status: 400 });
        }

        const deleted = await prisma.staffInvite?.deleteMany({
            where: {
                id: inviteId,
                storeId,
                acceptedAt: null,
            },
        });

        if (deleted.count === 0) {
            return NextResponse.json(
                { error: "Invite not found or already accepted" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Invite revoked successfully",
        });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error) {
    handleApiError(error, { endpoint: "/api/merchant/team/invite/revoke", operation: "POST" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
