import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { prisma } from "@/lib/prisma";

// GET /api/education/modules?courseId=xxx - Get modules for a course
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: "courseId is required" },
        { status: 400 }
      );
    }

    const modules = await (prisma as any).educationModule.findMany({
      where: {
        courseId,
        course: { storeId },
      },
      include: {
        lessons: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            type: true,
            duration: true,
            isPublished: true,
            order: true,
          },
        },
        _count: {
          select: {
            lessons: true,
          },
        },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: modules,
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/education/modules',
      operation: 'GET_MODULES',
    });
    return NextResponse.json(
      { error: 'Failed to complete operation' },
      { status: 500 }
    );
  }
}
