/**
 * Assignments & Assessments Feature
 * 
 * Handles assignment creation, submissions, grading, and analytics
 */

import type { PrismaClient } from '@vayva/db';
import type { 
  Assignment, 
  AssignmentSubmission, 
  GetAssignmentsResponse 
} from '../types';

/**
 * Get assignments data for dashboard
 */
export async function getAssignments(
  prisma: PrismaClient,
  storeId: string,
  options?: {
    courseId?: string;
    status?: 'published' | 'closed';
    pendingGrading?: boolean;
  }
): Promise<GetAssignmentsResponse['data']> {
  const { courseId, status, pendingGrading } = options || {};

  // Build filter conditions
  const where: any = { storeId };
  
  if (courseId) {
    where.courseId = courseId;
  }
  
  if (status) {
    where.status = status;
  }

  // Fetch assignments with submission data
  const assignments = await (prisma as any).assignment.findMany({
    where,
    include: {
      course: {
        select: {
          id: true,
          title: true,
        },
      },
      submissions: {
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          submittedAt: 'desc',
        },
      },
    },
    orderBy: {
      dueDate: 'asc',
    },
  });

  // Transform to Assignment format
  const assignmentData: Assignment[] = assignments.map((assignment: any) => ({
    id: assignment.id,
    title: assignment.title,
    courseId: assignment.courseId,
    courseTitle: assignment.course?.title,
    type: assignment.type as 'quiz' | 'assignment' | 'project' | 'exam',
    dueDate: assignment.dueDate,
    totalPoints: assignment.totalPoints || 100,
    submissionsCount: assignment.submissions?.length || 0,
    gradedCount: assignment.submissions?.filter(
      (s: any) => s.grade !== null && s.grade !== undefined
    ).length || 0,
    pendingGrading: assignment.submissions?.filter(
      (s: any) =>
        s.submittedAt &&
        (s.grade === null || s.grade === undefined)
    ).length || 0,
    averageScore: calculateAverageScore(assignment.submissions || []),
    status: assignment.status as 'draft' | 'published' | 'closed',
    createdAt: assignment.createdAt,
  }));

  // Get all submissions for recent submissions list
  const allSubmissions = assignments.flatMap((a: any) => a.submissions || []);
  
  // Transform to AssignmentSubmission format
  const recentSubmissions: AssignmentSubmission[] = allSubmissions
    .slice(0, 20)
    .map((submission: any) => transformSubmission(submission));

  // Grading queue (pending submissions)
  const gradingQueue: AssignmentSubmission[] = allSubmissions
    .filter(
      (s: any) =>
        s.submittedAt &&
        (s.grade === null || s.grade === undefined)
    )
    .slice(0, 50)
    .map((submission: any) => transformSubmission(submission));

  // Aggregations
  const totalAssignments = assignmentData.length;
  const pendingGradingCount = gradingQueue.length;
  const overdueSubmissions = countOverdueSubmissions(assignments);

  return {
    totalAssignments,
    pendingGrading: pendingGradingCount,
    overdueSubmissions,
    assignments: assignmentData,
    recentSubmissions,
    gradingQueue,
  };
}

/**
 * Create a new assignment
 */
export async function createAssignment(
  prisma: PrismaClient,
  storeId: string,
  courseId: string,
  data: {
    title: string;
    type: 'quiz' | 'assignment' | 'project' | 'exam';
    dueDate: Date;
    totalPoints?: number;
    description?: string;
  }
): Promise<Assignment> {
  const assignment = await (prisma as any).assignment.create({
    data: {
      storeId,
      courseId,
      title: data.title,
      type: data.type,
      dueDate: data.dueDate,
      totalPoints: data.totalPoints || 100,
      description: data.description,
      status: 'published',
    },
    include: {
      course: {
        select: {
          title: true,
        },
      },
    },
  });

  return transformAssignment(assignment);
}

/**
 * Submit an assignment
 */
export async function submitAssignment(
  prisma: PrismaClient,
  assignmentId: string,
  studentId: string,
  data: {
    submissionUrl?: string;
    content?: string;
  }
): Promise<AssignmentSubmission> {
  const now = new Date();
  
  // Get assignment to check due date
  const assignment = await (prisma as any).assignment.findUnique({
    where: { id: assignmentId },
    select: { dueDate: true },
  });

  if (!assignment) {
    throw new Error('Assignment not found');
  }

  const isLate = now > assignment.dueDate;

  const submission = await (prisma as any).assignmentSubmission.create({
    data: {
      assignmentId,
      studentId,
      submittedAt: now,
      status: isLate ? 'late' : 'submitted',
      submissionUrl: data.submissionUrl,
      content: data.content,
    },
    include: {
      student: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return transformSubmission(submission);
}

/**
 * Grade a submission
 */
export async function gradeSubmission(
  prisma: PrismaClient,
  submissionId: string,
  data: {
    grade: number;
    feedback?: string;
  }
): Promise<AssignmentSubmission> {
  const submission = await (prisma as any).assignmentSubmission.update({
    where: { id: submissionId },
    data: {
      grade: data.grade,
      feedback: data.feedback,
      status: 'graded',
      gradedAt: new Date(),
    },
    include: {
      student: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return transformSubmission(submission);
}

/**
 * Get pending grading queue
 */
export async function getPendingGradingQueue(
  prisma: PrismaClient,
  storeId: string,
  limit: number = 50
): Promise<AssignmentSubmission[]> {
  const submissions = await (prisma as any).assignmentSubmission.findMany({
    where: {
      assignment: {
        storeId,
      },
      submittedAt: {
        not: null,
      },
      grade: null,
    },
    include: {
      assignment: {
        select: {
          title: true,
          course: {
            select: {
              title: true,
            },
          },
        },
      },
      student: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      submittedAt: 'asc',
    },
    take: limit,
  });

  return submissions.map(transformSubmission);
}

// Helper functions
function transformAssignment(assignment: any): Assignment {
  return {
    id: assignment.id,
    title: assignment.title,
    courseId: assignment.courseId,
    courseTitle: assignment.course?.title,
    type: assignment.type as 'quiz' | 'assignment' | 'project' | 'exam',
    dueDate: assignment.dueDate,
    totalPoints: assignment.totalPoints || 100,
    submissionsCount: assignment._count?.submissions || 0,
    gradedCount: assignment.submissions?.filter(
      (s: any) => s.grade !== null && s.grade !== undefined
    ).length || 0,
    pendingGrading: assignment.submissions?.filter(
      (s: any) =>
        s.submittedAt &&
        (s.grade === null || s.grade === undefined)
    ).length || 0,
    averageScore: calculateAverageScore(assignment.submissions || []),
    status: assignment.status as 'draft' | 'published' | 'closed',
    createdAt: assignment.createdAt,
  };
}

function transformSubmission(submission: any): AssignmentSubmission {
  const isLate = submission.submittedAt && new Date(submission.submittedAt) > submission.assignment.dueDate;
  const daysLate = isLate
    ? Math.floor(
        (new Date(submission.submittedAt).getTime() -
          new Date(submission.assignment.dueDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : undefined;

  return {
    id: submission.id,
    assignmentId: submission.assignmentId,
    studentId: submission.studentId,
    studentName: submission.student?.name || submission.student?.email,
    submittedAt: submission.submittedAt,
    grade: submission.grade,
    feedback: submission.feedback,
    status: submission.grade
      ? 'graded'
      : isLate
      ? 'late'
      : 'submitted',
    submissionUrl: submission.submissionUrl,
    daysLate,
  };
}

function calculateAverageScore(submissions: any[]): number | undefined {
  const gradedSubmissions = submissions.filter(
    (s) => s.grade !== null && s.grade !== undefined
  );
  
  if (gradedSubmissions.length === 0) return undefined;
  
  const sum = gradedSubmissions.reduce(
    (acc, s) => acc + (s.grade || 0),
    0
  );
  return Math.round((sum / gradedSubmissions.length) * 100) / 100;
}

function countOverdueSubmissions(assignments: any[]): number {
  const now = new Date();
  let count = 0;

  assignments.forEach((assignment: any) => {
    const dueDate = new Date(assignment.dueDate);
    
    assignment.submissions?.forEach((submission: any) => {
      if (!submission.submittedAt && dueDate < now) {
        count++;
      }
    });
  });

  return count;
}
