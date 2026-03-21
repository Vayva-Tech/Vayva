import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { prisma } from "@/lib/prisma";

// GET /api/education/modules?courseId=xxx - Get modules for a course
export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
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
