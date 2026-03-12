import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const query = searchParams.get("query") || "";
      const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);

      const posts = (await prisma.blogPost?.findMany({
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
          excerpt: true,
          featuredImage: true,
          status: true,
          publishedAt: true,
        },
        orderBy: { updatedAt: "desc" },
        take: limit,
      })) || [];

      const formatted = posts.map((p) => ({
        id: p.id,
        name: p.title,
        slug: p.slug,
        status: p.status,
        publishedAt: p.publishedAt,
        image: p.featuredImage || null,
        excerpt: p.excerpt || null,
      }));

      return NextResponse.json(
        { success: true, data: formatted },
        { headers: { "Cache-Control": "no-store" } },
      );
    } catch (error) {
      logger.error("[EDITOR_DATA_POSTS_GET] Failed to fetch posts", { storeId, error });
      return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }
  },
);
