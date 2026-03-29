import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const backendBase = () => process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";

// GET /api/education/quizzes?lessonId=xxx - Get quizzes for a lesson
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lessonId");
    const courseId = searchParams.get("courseId");

    if (!lessonId && !courseId) {
      return NextResponse.json(
        { success: false, error: "lessonId or courseId is required" },
        { status: 400 }
      );
    }

    // Fetch quizzes via backend API
    const params: Record<string, string> = {};
    if (lessonId) params.lessonId = lessonId;
    if (courseId) params.courseId = courseId;
    
    const response = await apiJson(`${process.env.BACKEND_API_URL}/api/education/quizzes?${new URLSearchParams(params)}`, {
      method: 'GET',
      headers: auth.headers,
    });

    return NextResponse.json(response);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/education/quizzes",
      operation: "GET_QUIZZES",
    });
    return NextResponse.json({ error: "Failed to fetch quizzes" }, { status: 500 });
  }
}

type QuizMutationResponse = {
  success: boolean;
  data?: unknown;
  error?: string;
};

// POST /api/education/quizzes - Create quiz
export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body: unknown = await request.json();

    const result = await apiJson<QuizMutationResponse>(`${backendBase()}/api/education/quizzes`, {
      method: "POST",
      headers: auth.headers,
      body: JSON.stringify(body),
    });

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/education/quizzes",
      operation: "CREATE_QUIZ",
    });
    return NextResponse.json({ error: "Failed to create quiz" }, { status: 500 });
  }
}

// PUT /api/education/quizzes?id=xxx - Update a quiz
export async function PUT(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const quizId = searchParams.get("id");

    if (!quizId) {
      return NextResponse.json(
        { success: false, error: "Quiz ID is required" },
        { status: 400 }
      );
    }

    const body: unknown = await request.json();

    const result = await apiJson<QuizMutationResponse>(
      `${backendBase()}/api/education/quizzes/${quizId}`,
      {
        method: "PUT",
        headers: auth.headers,
        body: JSON.stringify(body),
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/education/quizzes",
      operation: "UPDATE_QUIZ",
    });
    return NextResponse.json({ error: "Failed to update quiz" }, { status: 500 });
  }
}

// DELETE /api/education/quizzes?id=xxx - Delete a quiz
export async function DELETE(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
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
    }>(`${backendBase()}/api/education/quizzes/${quizId}`, {
      method: "DELETE",
      headers: {
        ...auth.headers,
        "x-store-id": storeId,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/education/quizzes",
      operation: "DELETE_QUIZ",
    });
    return NextResponse.json({ error: "Failed to delete quiz" }, { status: 500 });
  }
}
