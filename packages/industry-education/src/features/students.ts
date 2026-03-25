/**
 * Student Progress Tracking Feature
 * 
 * Handles student enrollment, progress tracking, and at-risk identification
 */

import type { PrismaClient } from '@vayva/db';
import type { Student, StudentProgress, GetStudentProgressResponse } from '../types';

/**
 * Get student progress data for dashboard
 */
export async function getStudentProgress(
  prisma: PrismaClient,
  storeId: string,
  options?: {
    studentId?: string;
    courseId?: string;
    atRiskOnly?: boolean;
  }
): Promise<GetStudentProgressResponse['data']> {
  const { studentId, courseId, atRiskOnly } = options || {};

  // Build filter conditions
  const where: any = { storeId };
  
  if (studentId) {
    where.id = studentId;
  }

  // Fetch students with enrollment data
  const students = await (prisma as any).user.findMany({
    where,
    include: {
      enrollments: {
        include: {
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
      certificates: {
        select: {
          id: true,
        },
      },
    },
  });

  // Transform to Student format and calculate progress
  const studentData: Student[] = students.map((student: any) => {
    const enrollments = student.enrollments || [];
    const completedCourses = enrollments.filter(
      (e: any) => e.status === 'completed'
    ).length;
    const inProgressCourses = enrollments.filter(
      (e: any) => e.status === 'active'
    ).length;
    const overallProgress = calculateOverallProgress(enrollments);
    const isAtRisk = identifyAtRiskStudent(enrollments);

    return {
      id: student.id,
      name: student.name || student.email,
      email: student.email,
      avatarUrl: student.avatarUrl,
      enrollmentCount: enrollments.length,
      completedCourses,
      inProgressCourses,
      overallProgress,
      totalLearningTime: calculateTotalLearningTime(enrollments),
      lastActiveAt: calculateLastActiveDate(enrollments),
      enrolledAt: student.createdAt,
      certificatesEarned: student.certificates?.length || 0,
      averageGrade: calculateAverageGrade(enrollments),
      atRisk: isAtRisk,
    };
  });

  // Filter for at-risk students if requested
  let filteredStudents = studentData;
  if (atRiskOnly) {
    filteredStudents = studentData.filter((s) => s.atRisk);
  }

  // Calculate detailed progress for each student
  const studentProgress: StudentProgress[] = filteredStudents.map((student) => ({
    studentId: student.id,
    studentName: student.name,
    overallProgress: student.overallProgress,
    courses: studentData
      .flatMap((s: any) => s.enrollments || [])
      .map((enrollment: any) => ({
        courseId: enrollment.course?.id,
        courseTitle: enrollment.course?.title,
        progress: enrollment.progress || 0,
        status: enrollment.status as 'active' | 'completed' | 'at-risk',
        lastActivity: enrollment.lastAccessedAt || enrollment.updatedAt,
        timeSpent: enrollment.timeSpent || 0,
        assignmentsCompleted: enrollment.assignmentsCompleted || 0,
        assignmentsTotal: enrollment.assignmentsTotal || 0,
      })),
    atRiskReasons: student.atRisk ? getAtRiskReasons(student) : undefined,
  }));

  // Aggregations
  const totalStudents = studentData.length;
  const activeStudents = studentData.filter((s) => s.inProgressCourses > 0).length;
  const atRiskCount = studentData.filter((s) => s.atRisk).length;
  const overallProgress =
    studentData.reduce((sum, s) => sum + s.overallProgress, 0) /
      (totalStudents || 1);

  // Completion trend (last 30 days)
  const completionTrend = generateCompletionTrend(storeId, totalStudents);

  return {
    overallProgress,
    totalStudents,
    activeStudents,
    atRiskCount,
    studentProgress,
    completionTrend,
  };
}

/**
 * Identify at-risk students based on progress and activity
 */
export function identifyAtRiskStudents(students: Student[]): Student[] {
  return students.filter((student) => {
    if (student.atRisk) return true;
    if (student.overallProgress < 60) return true;
    const daysSinceActive = Math.floor(
      (Date.now() - student.lastActiveAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceActive > 7;
  });
}

/**
 * Update student progress
 */
export async function updateStudentProgress(
  prisma: PrismaClient,
  enrollmentId: string,
  data: {
    progress?: number;
    timeSpent?: number;
    assignmentsCompleted?: number;
    lastAccessedAt?: Date;
  }
): Promise<void> {
  await (prisma as any).enrollment.update({
    where: { id: enrollmentId },
    data: {
      progress: data.progress,
      timeSpent: data.timeSpent,
      assignmentsCompleted: data.assignmentsCompleted,
      lastAccessedAt: data.lastAccessedAt || new Date(),
    },
  });
}

// Helper functions
function calculateOverallProgress(enrollments: any[]): number {
  if (!enrollments || enrollments.length === 0) return 0;
  
  const totalProgress = enrollments.reduce((sum, e) => sum + (e.progress || 0), 0);
  return Math.round(totalProgress / enrollments.length);
}

function calculateTotalLearningTime(enrollments: any[]): number {
  return enrollments.reduce((sum, e) => sum + (e.timeSpent || 0), 0);
}

function calculateLastActiveDate(enrollments: any[]): Date {
  const dates = enrollments
    .map((e: any) => e.lastAccessedAt || e.updatedAt)
    .filter(Boolean)
    .sort((a: any, b: any) => new Date(b).getTime() - new Date(a).getTime());
  
  return dates.length > 0 ? new Date(dates[0]) : new Date();
}

function calculateAverageGrade(enrollments: any[]): number | undefined {
  const grades = enrollments
    .map((e: any) => e.grade)
    .filter((g: any) => g !== null && g !== undefined);
  
  if (grades.length === 0) return undefined;
  
  const sum = grades.reduce((acc: number, g: number) => acc + g, 0);
  return Math.round((sum / grades.length) * 100) / 100;
}

function identifyAtRiskStudent(enrollments: any[]): boolean {
  if (!enrollments || enrollments.length === 0) return false;
  
  // At-risk criteria:
  // 1. Overall progress < 60%
  // 2. No activity in last 7 days
  // 3. Multiple incomplete assignments
  
  const overallProgress = calculateOverallProgress(enrollments);
  if (overallProgress < 60) return true;
  
  const lastActive = calculateLastActiveDate(enrollments);
  const daysSinceActive = Math.floor(
    (new Date().getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSinceActive > 7) return true;
  
  const pendingAssignments = enrollments.some((e: any) => {
    const completed = e.assignmentsCompleted || 0;
    const total = e.assignmentsTotal || 0;
    return total > 0 && completed < total * 0.5;
  });
  
  if (pendingAssignments) return true;
  
  return false;
}

function getAtRiskReasons(student: Student): string[] {
  const reasons: string[] = [];
  
  if (student.overallProgress < 60) {
    reasons.push(`Low progress (${student.overallProgress}%)`);
  }
  
  const daysSinceActive = Math.floor(
    (new Date().getTime() - student.lastActiveAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSinceActive > 7) {
    reasons.push(`Inactive for ${daysSinceActive} days`);
  }
  
  if ((student.inProgressCourses || 0) > 0 && student.overallProgress < 50) {
    reasons.push('Falling behind in courses');
  }
  
  return reasons;
}

function generateCompletionTrend(storeId: string, totalStudents: number) {
  // Generate mock trend data for last 30 days
  const trend = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Mock completions (would need actual data in production)
    const completions = Math.floor(Math.random() * (totalStudents * 0.1));
    
    trend.push({
      date: date.toISOString().split('T')[0],
      completions,
    });
  }
  
  return trend;
}
