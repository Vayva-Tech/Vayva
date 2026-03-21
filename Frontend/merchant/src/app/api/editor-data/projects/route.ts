import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);

    const projects = (await prisma.portfolioProject?.findMany({
      where: {
        storeId,
        ...(query && {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { slug: { contains: query, mode: "insensitive" } },
          ],
        }),
      },
      select: {
        id: true,
        title: true,
        slug: true,
        images: true,
        description: true,
      },
      orderBy: { updatedAt: "desc" },
      take: limit,
    })) || [];

    return NextResponse.json(
      { success: true, data: projects },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/editor-data/projects",
      operation: "GET_EDITOR_PROJECTS",
    });
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
