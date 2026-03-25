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

    const events = (await prisma.event?.findMany({
      where: {
        storeId,
        ...(query && {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
            { venue: { contains: query, mode: "insensitive" } },
          ],
        }),
      },
      select: {
        id: true,
        title: true,
        category: true,
        startDate: true,
        endDate: true,
        status: true,
        bannerImage: true,
        venue: true,
      },
      orderBy: { startDate: "asc" },
      take: limit,
    })) || [];

    const formatted = events.map((e) => ({
      id: e.id,
      name: e.title,
      category: e.category,
      startDate: e.startDate,
      endDate: e.endDate,
      status: e.status,
      image: e.bannerImage || null,
      venue: e.venue || null,
    }));

    return NextResponse.json(
      { success: true, data: formatted },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/editor-data/events",
      operation: "GET_EDITOR_EVENTS",
    });
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
