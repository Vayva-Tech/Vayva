import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";

// GET /api/posts - Get all blog posts
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const status = searchParams.get("status");
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");

      // Build query params
      const queryParams = new URLSearchParams();
      if (status) queryParams.set("status", status);
      queryParams.set("limit", limit.toString());
      queryParams.set("offset", offset.toString());

      // Forward to Backend API
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/posts?${queryParams}`,
        {
          headers: {
            "x-store-id": storeId,
          },
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to fetch posts" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to fetch posts" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json(data);
    } catch (error: unknown) {
      logger.error("[POSTS_GET_ERROR] Failed to fetch posts", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to fetch posts" },
        { status: 500 }
      );
    }
  }
);

// POST /api/posts - Create a new blog post
export const POST = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string } }) => {
    try {
      const body = await req.json();
      const {
        title,
        slug,
        content,
        excerpt,
        featuredImage,
        status,
        tags,
        categoryId,
        publishedAt,
      } = body;

      // Forward to Backend API to create post
      const backendResponse = await fetch(
        `${process?.env?.BACKEND_API_URL}/api/posts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-store-id": storeId,
            "x-user-id": user.id,
          },
          body: JSON.stringify({
            title,
            slug,
            content,
            excerpt,
            featuredImage,
            status,
            tags,
            categoryId,
            publishedAt,
          }),
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to create post" }));
        return NextResponse.json(
          { success: false, error: error.error || "Failed to create post" },
          { status: (backendResponse as any).status }
        );
      }

      const data = await backendResponse.json();
      return NextResponse.json({ success: true, data: data.data }, { status: 201 });
    } catch (error: unknown) {
      logger.error("[POSTS_POST_ERROR] Failed to create post", { error: error instanceof Error ? error.message : String(error), storeId });
      return NextResponse.json(
        { success: false, error: "Failed to create post" },
        { status: 500 }
      );
    }
  }
);
