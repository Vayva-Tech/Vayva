import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { prisma } from "@vayva/db";
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
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);

    const campaigns = (await prisma.campaign?.findMany({
      where: {
        storeId,
        ...(query && {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { messageBody: { contains: query, mode: "insensitive" } },
          ],
        }),
      },
      select: {
        id: true,
        name: true,
        status: true,
        channel: true,
        scheduledAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    })) || [];

    return NextResponse.json(
      { success: true, data: campaigns },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/editor-data/campaigns",
      operation: "GET_EDITOR_CAMPAIGNS",
    });
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}
