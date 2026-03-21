import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { prisma } from "@/lib/prisma";

// GET /api/education/courses/[id] - Get a single course
export async function GET(request: NextRequest, { params }: { params: Promise<{ id?: string }> }) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    const course = await (prisma as any).educationCourse.findFirst({
      where: {
        id,
        storeId,
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            bio: true,
          },
        },
        modules: {
          orderBy: { order: "asc" },
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
        },
        _count: {
          select: {
            enrollments: true,
            modules: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: course,
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/education/courses/[id]",
      operation: "GET_COURSE",
    });
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}
