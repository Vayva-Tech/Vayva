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
    const collections = await prisma.collection?.findMany({
      where: { storeId },
      include: {
        _count: {
          select: { collectionProducts: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    }) || [];

    // Format to match EditorCollection interface
    const formatted = collections.map((col) => ({
      id: col.id,
      name: col.title,
      slug: col.handle,
      productCount: col._count?.collectionProducts || 0,
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
    }, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    handleApiError(error, { endpoint: "/api/editor-data/collections", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
