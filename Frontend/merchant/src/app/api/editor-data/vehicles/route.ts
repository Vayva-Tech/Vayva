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

      const vehicles = (await prisma.vehicle?.findMany({
        where: {
          storeId,
          ...(query && {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { licensePlate: { contains: query, mode: "insensitive" } },
            ],
          }),
        },
        select: {
          id: true,
          name: true,
          type: true,
          licensePlate: true,
          capacity: true,
          isActive: true,
        },
        orderBy: { updatedAt: "desc" },
        take: limit,
      })) || [];

      return NextResponse.json(
        {
          success: true,
          data: vehicles,
        },
        { headers: { "Cache-Control": "no-store" } },
      );
  } catch (error) {
    handleApiError(error, { endpoint: "/api/editor-data/vehicles", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
