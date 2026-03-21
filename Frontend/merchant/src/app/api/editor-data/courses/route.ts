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

      const courses = (await prisma.course?.findMany({
        where: {
          storeId,
          ...(query && {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { category: { contains: query, mode: "insensitive" } },
            ],
          }),
        },
        select: {
          id: true,
          title: true,
          category: true,
          price: true,
          currency: true,
          thumbnailUrl: true,
          isPublished: true,
        },
        orderBy: { updatedAt: "desc" },
        take: limit,
      })) || [];

      const formatted = courses.map((c) => ({
        id: c.id,
        name: c.title,
        category: c.category,
        price: Number(c.price) || 0,
        currency: c.currency,
        thumbnail: c.thumbnailUrl || null,
        isPublished: c.isPublished,
      }));

      return NextResponse.json(
        { success: true, data: formatted },
        { headers: { "Cache-Control": "no-store" } },
      );
  } catch (error) {
    handleApiError(error, { endpoint: "/api/editor-data/courses", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
