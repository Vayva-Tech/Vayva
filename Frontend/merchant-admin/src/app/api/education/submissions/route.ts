import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";
import { prisma } from "@/lib/prisma";

// GET /api/education/submissions?assignmentId=xxx - Get submissions for an assignment
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
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

      const where: Record<string, unknown> = { assignmentId };
      if (studentId) {
        where.studentId = studentId;
      }

      const submissions = await (prisma as any).educationAssignmentSubmission.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignment: {
            select: {
              id: true,
              title: true,
              maxScore: true,
            },
          },
        },
        orderBy: { submittedAt: "desc" },
      });

      return NextResponse.json({
        success: true,
        data: submissions,
      });
    } catch (error: unknown) {
      logger.error("[SUBMISSIONS_GET_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Failed to fetch submissions" },
        { status: 500 }
      );
    }
  }
);

// POST /api/education/submissions - Submit an assignment
export const POST = withVayvaAPI(
  PERMISSIONS.STORE_VIEW,
  async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string } }) => {
    try {
      const body = await req.json();
      const { assignmentId, content, attachments } = body;

      if (!assignmentId || !content) {
        return NextResponse.json(
          { success: false, error: "assignmentId and content are required" },
          { status: 400 }
        );
      }

      // Verify assignment exists and belongs to store
      const assignment = await (prisma as any).educationAssignment.findFirst({
        where: {
          id: assignmentId,
          lesson: {
            module: {
              course: { storeId },
            },
          },
        },
        include: {
          _count: {
            select: { submissions: true },
          },
        },
      });

      if (!assignment) {
        return NextResponse.json(
          { success: false, error: "Assignment not found" },
          { status: 404 }
        );
      }

      // Check if assignment is published
      if (!assignment.isPublished) {
        return NextResponse.json(
          { success: false, error: "This assignment is not available" },
          { status: 403 }
        );
      }

      // Check due date
      const now = new Date();
      if (assignment.dueDate && now > new Date(assignment.dueDate) && !assignment.allowLateSubmission) {
        return NextResponse.json(
          { success: false, error: "Assignment deadline has passed" },
          { status: 403 }
        );
      }

      // Check if student already submitted
      const existingSubmission = await (prisma as any).educationAssignmentSubmission.findFirst({
        where: {
          assignmentId,
          studentId: user.id,
        },
      });

      if (existingSubmission) {
        return NextResponse.json(
          { success: false, error: "You have already submitted this assignment" },
          { status: 409 }
        );
      }

      const submission = await (prisma as any).educationAssignmentSubmission.create({
        data: {
          assignmentId,
          studentId: user.id,
          content,
          attachments,
          submittedAt: now,
          status: "PENDING",
        },
        include: {
          assignment: {
            select: {
              id: true,
              title: true,
              maxScore: true,
            },
          },
        },
      });

      logger.info("[SUBMISSION_CREATED]", { 
        submissionId: submission.id, 
        assignmentId, 
        studentId: user.id,
        storeId 
      });

      return NextResponse.json({
        success: true,
        data: submission,
      });
    } catch (error: unknown) {
      logger.error("[SUBMISSION_CREATE_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Failed to submit assignment" },
        { status: 500 }
      );
    }
  }
);

// PUT /api/education/submissions?id=xxx - Grade a submission
export const PUT = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string } }) => {
    try {
      const { searchParams } = new URL(req.url);
      const submissionId = searchParams.get("id");

      if (!submissionId) {
        return NextResponse.json(
          { success: false, error: "Submission ID is required" },
          { status: 400 }
        );
      }

      const body = await req.json();
      const { score, feedback, status } = body;

      // Verify submission exists and belongs to store
      const existing = await (prisma as any).educationAssignmentSubmission.findFirst({
        where: {
          id: submissionId,
          assignment: {
            lesson: {
              module: {
                course: { storeId },
              },
            },
          },
        },
        include: {
          assignment: true,
        },
      });

      if (!existing) {
        return NextResponse.json(
          { success: false, error: "Submission not found" },
          { status: 404 }
        );
      }

      // Validate score
      if (score !== undefined && (score < 0 || score > existing.assignment.maxScore)) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Score must be between 0 and ${existing.assignment.maxScore}` 
          },
          { status: 400 }
        );
      }

      const submission = await (prisma as any).educationAssignmentSubmission.update({
        where: { id: submissionId },
        data: {
          ...(score !== undefined && { score }),
          ...(feedback !== undefined && { feedback }),
          ...(status && { status }),
          gradedAt: new Date(),
          gradedBy: user.id,
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignment: {
            select: {
              id: true,
              title: true,
              maxScore: true,
            },
          },
        },
      });

      logger.info("[SUBMISSION_GRADED]", { 
        submissionId, 
        score,
        storeId,
        gradedBy: user.id 
      });

      return NextResponse.json({
        success: true,
        data: submission,
      });
    } catch (error: unknown) {
      logger.error("[SUBMISSION_GRADE_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Failed to grade submission" },
        { status: 500 }
      );
    }
  }
);
