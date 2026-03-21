import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { prisma } from "@/lib/prisma";

// GET /api/education/submissions?assignmentId=xxx - Get submissions for an assignment
export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get("assignmentId");
    const studentId = searchParams.get("studentId");

    if (!assignmentId) {
      return NextResponse.json(
        { success: false, error: "assignmentId is required" },
        { status: 400 }
      );
    }

    // Verify assignment belongs to store
    const assignment = await (prisma as any).educationAssignment.findFirst({
      where: {
        id: assignmentId,
        lesson: {
          module: {
            course: { storeId },
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: "Assignment not found" },
        { status: 404 }
      );
    }

    let where: Record<string, unknown> = { assignmentId };
    if (studentId) {
      where.studentId = studentId;
    }

    const submissions = await (prisma as any).educationSubmission.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: submissions });
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/education/submissions',
      operation: 'GET_SUBMISSIONS',
    });
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

// POST /api/education/submissions - Create submission
export async function POST(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const body = await request.json();

    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/education/submissions`, {
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
      endpoint: '/api/education/submissions',
      operation: 'CREATE_SUBMISSION',
    });
    return NextResponse.json(
      { error: 'Failed to create submission' },
      { status: 500 }
    );
  }
}
