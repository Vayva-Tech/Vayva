import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const { searchParams } = new URL(request.url);
      const moduleId = searchParams.get("moduleId");
      const courseId = searchParams.get("courseId");

      if (!moduleId && !courseId) {
        return NextResponse.json(
          { success: false, error: "moduleId or courseId is required" },
          { status: 400 }
        );
      }

      let where: Record<string, unknown> = {};

      if (moduleId) {
        where = {
          moduleId,
          module: {
            course: { storeId },
          },
        };
      } else {
        where = {
          module: {
            courseId,
            course: { storeId },
          },
        };
      }

      const lessons = await (prisma as any).educationLesson.findMany({
        where,
        include: {
          module: {
            select: {
              id: true,
              title: true,
              courseId: true,
            },
          },
          _count: {
            select: {
              assignments: true,
              quizzes: true,
            },
          },
        },
        orderBy: { order: "asc" },
      });

      return NextResponse.json({
        success: true,
        data: lessons,
      });
  } catch (error) {
    handleApiError(error, { endpoint: "/api/education/lessons", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
