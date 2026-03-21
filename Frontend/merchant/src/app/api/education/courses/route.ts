import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { prisma } from "@/lib/prisma";

// GET /api/education/courses - Get all courses for the merchant
export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const instructorId = searchParams.get("instructorId");

    const where: Record<string, unknown> = { storeId };

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    if (instructorId) {
      where.instructorId = instructorId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [courses, total] = await Promise.all([
      (prisma as any).educationCourse.findMany({
        where,
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              modules: true,
              enrollments: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      }),
      (prisma as any).educationCourse.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: courses,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + courses.length < total,
      },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/education/courses",
      operation: "GET_COURSES",
    });
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
