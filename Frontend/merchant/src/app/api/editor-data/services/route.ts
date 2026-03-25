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

    const services = await prisma.product?.findMany({
      where: {
        storeId,
        productType: "SERVICE",
        ...(query && {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        }),
      },
      select: {
        id: true,
        title: true,
        price: true,
        description: true,
        metadata: true,
      },
      orderBy: { updatedAt: "desc" },
      take: limit,
    }) || [];

    const formatted = services.map((svc) => {
      const meta = (svc.metadata as Record<string, unknown> | null) || null;
      const durationMinutes = meta ? Number(meta.durationMinutes) : NaN;

      return {
        id: svc.id,
        name: svc.title,
        price: Number(svc.price) || 0,
        duration: Number.isFinite(durationMinutes) ? durationMinutes : 60,
        description: svc.description || null,
      };
    });

    return NextResponse.json({
      success: true,
      data: formatted,
    }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/editor-data/services",
      operation: "GET_EDITOR_SERVICES",
    });
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}
