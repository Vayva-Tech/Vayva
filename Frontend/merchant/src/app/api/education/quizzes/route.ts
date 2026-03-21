// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { prisma } from "@/lib/prisma";

// GET /api/education/quizzes?lessonId=xxx - Get quizzes for a lesson
export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lessonId");
    const courseId = searchParams.get("courseId");

    let where: Record<string, unknown> = {};

    if (lessonId) {
      where = {
        lessonId,
        lesson: {
          module: {
            course: { storeId },
          },
        },
      };
    } else if (courseId) {
      where = {
        lesson: {
          module: {
            courseId,
            course: { storeId },
          },
        },
      };
    }

    const quizzes = await (prisma as any).educationQuiz.findMany({
      where,
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: quizzes });
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/education/quizzes',
      operation: 'GET_QUIZZES',
    });
    return NextResponse.json(
      { error: 'Failed to fetch quizzes' },
      { status: 500 }
    );
  }
}

// POST /api/education/quizzes - Create quiz
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/education/quizzes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-store-id': storeId,
      },
      body: JSON.stringify(body),
    });

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/education/quizzes',
      operation: 'CREATE_QUIZ',
    });
    return NextResponse.json(
      { error: 'Failed to create quiz' },
      { status: 500 }
    );
  }
}

// PUT /api/education/quizzes?id=xxx - Update a quiz
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const quizId = searchParams.get("id");

    if (!quizId) {
      return NextResponse.json(
        { success: false, error: "Quiz ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/education/quizzes/${quizId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-store-id': storeId,
      },
      body: JSON.stringify(body),
    });

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/education/quizzes',
      operation: 'UPDATE_QUIZ',
    });
    return NextResponse.json(
      { error: 'Failed to update quiz' },
      { status: 500 }
    );
  }
}

// DELETE /api/education/quizzes?id=xxx - Delete a quiz
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const quizId = searchParams.get("id");

    if (!quizId) {
      return NextResponse.json(
        { success: false, error: "Quiz ID is required" },
        { status: 400 }
      );
    }

    const result = await apiJson<{
      success: boolean;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/education/quizzes/${quizId}`, {
      method: 'DELETE',
      headers: {
        'x-store-id': storeId,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/education/quizzes',
      operation: 'DELETE_QUIZ',
    });
    return NextResponse.json(
      { error: 'Failed to delete quiz' },
      { status: 500 }
    );
  }
}
