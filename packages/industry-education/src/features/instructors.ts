/**
 * Instructor Performance Feature
 * 
 * Handles instructor analytics, performance tracking, and ratings
 */

import type { PrismaClient } from '@vayva/db';
import type { 
  Instructor, 
  InstructorPerformance, 
  GetInstructorPerformanceResponse 
} from '../types';

/**
 * Get instructor performance data for dashboard
 */
export async function getInstructorPerformance(
  prisma: PrismaClient,
  storeId: string,
  options?: {
    instructorId?: string;
    period?: 'week' | 'month' | 'quarter' | 'year';
  }
): Promise<GetInstructorPerformanceResponse['data']> {
  const { instructorId, period = 'month' } = options || {};

  // Fetch instructors with course and student data
  const where: any = { storeId };
  if (instructorId) {
    where.id = instructorId;
  }

  const instructors = await prisma.user.findMany({
    where: {
      ...where,
      role: 'instructor',
    },
    include: {
      courses: {
        include: {
          enrollments: true,
          assignments: true,
        },
      },
      reviews: {
        select: {
          rating: true,
          comment: true,
          createdAt: true,
        },
      },
    },
  });

  // Transform to Instructor format
  const instructorData: Instructor[] = instructors.map((instructor: any) => {
    const courses = instructor.courses || [];
    const totalStudents = courses.reduce(
      (sum: number, course: any) => sum + (course._count?.enrollments || 0),
      0
    );
    const totalRevenue = courses.reduce(
      (sum: number, course: any) => sum + (course.revenue || 0),
      0
    );
    const averageRating = calculateAverageRating(instructor.reviews || []);
    const completionRate = calculateCompletionRate(courses);

    return {
      id: instructor.id,
      name: instructor.name || instructor.email,
      email: instructor.email,
      avatarUrl: instructor.avatarUrl,
      bio: instructor.bio,
      coursesCount: courses.length,
      totalStudents,
      averageRating,
      reviewCount: instructor.reviews?.length || 0,
      completionRate,
      totalRevenue,
      responseTime: instructor.responseTime || 24,
      joinedAt: instructor.createdAt,
      isVerified: instructor.isVerified || false,
      specialties: instructor.specialties,
    };
  });

  // Transform to InstructorPerformance format
  const performanceData: InstructorPerformance[] = instructorData.map(
    (instructor) => ({
      instructorId: instructor.id,
      instructorName: instructor.name,
      courses: instructor.coursesCount,
      students: instructor.totalStudents,
      rating: instructor.averageRating,
      reviews: instructor.reviewCount,
      completionRate: instructor.completionRate,
      revenue: instructor.totalRevenue,
      responseTime: instructor.responseTime,
      engagement: calculateEngagementScore(instructor),
      trend: determinePerformanceTrend(instructor),
    })
  );

  // Aggregations
  const totalInstructors = instructorData.length;
  const averageRating =
    instructorData.reduce((sum, i) => sum + i.averageRating, 0) /
      (totalInstructors || 1);
  const averageCompletionRate =
    instructorData.reduce((sum, i) => sum + i.completionRate, 0) /
      (totalInstructors || 1);

  // Top performers (by revenue and rating)
  const topPerformers = [...performanceData]
    .sort((a, b) => b.revenue - a.revenue || b.rating - a.rating)
    .slice(0, 5);

  // Needs support (low rating or completion rate)
  const needsSupport = performanceData
    .filter((p) => p.rating < 4.0 || p.completionRate < 70)
    .sort((a, b) => a.rating - b.rating);

  // Performance distribution
  const performanceDistribution = {
    excellent: performanceData.filter((p) => p.rating >= 4.5).length,
    good: performanceData.filter(
      (p) => p.rating >= 4.0 && p.rating < 4.5
    ).length,
    average: performanceData.filter(
      (p) => p.rating >= 3.0 && p.rating < 4.0
    ).length,
    belowAverage: performanceData.filter((p) => p.rating < 3.0).length,
  };

  return {
    totalInstructors,
    averageRating,
    averageCompletionRate,
    topPerformers,
    needsSupport,
    performanceDistribution,
  };
}

/**
 * Create a new instructor
 */
export async function createInstructor(
  prisma: PrismaClient,
  storeId: string,
  data: {
    name: string;
    email: string;
    bio?: string;
    specialties?: string[];
    avatarUrl?: string;
  }
): Promise<Instructor> {
  const instructor = await prisma.user.create({
    data: {
      storeId,
      email: data.email,
      name: data.name,
      bio: data.bio,
      specialties: data.specialties,
      avatarUrl: data.avatarUrl,
      role: 'instructor',
      isVerified: false,
    },
  });

  return {
    id: instructor.id,
    name: instructor.name || instructor.email,
    email: instructor.email,
    avatarUrl: instructor.avatarUrl,
    bio: instructor.bio,
    coursesCount: 0,
    totalStudents: 0,
    averageRating: 0,
    reviewCount: 0,
    completionRate: 0,
    totalRevenue: 0,
    responseTime: 24,
    joinedAt: instructor.createdAt,
    isVerified: instructor.isVerified,
    specialties: instructor.specialties,
  };
}

/**
 * Update instructor details
 */
export async function updateInstructor(
  prisma: PrismaClient,
  instructorId: string,
  data: Partial<{
    name: string;
    bio?: string;
    specialties?: string[];
    avatarUrl?: string;
    responseTime?: number;
  }>
): Promise<Instructor> {
  const instructor = await prisma.user.update({
    where: { id: instructorId, role: 'instructor' },
    data,
  });

  // Fetch updated data
  return getInstructorById(prisma, instructorId);
}

/**
 * Get instructor courses
 */
export async function getInstructorCourses(
  prisma: PrismaClient,
  instructorId: string
): Promise<any[]> {
  const courses = await prisma.course.findMany({
    where: { instructorId },
    include: {
      _count: {
        select: {
          enrollments: true,
        },
      },
      category: {
        select: {
          name: true,
        },
      },
    },
  });

  return courses;
}

// Helper functions
function calculateAverageRating(reviews: any[]): number {
  if (!reviews || reviews.length === 0) return 0;
  
  const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
  return Math.round((sum / reviews.length) * 100) / 100;
}

function calculateCompletionRate(courses: any[]): number {
  if (!courses || courses.length === 0) return 0;
  
  const totalEnrollments = courses.reduce(
    (sum, c) => sum + (c._count?.enrollments || 0),
    0
  );
  const completedEnrollments = courses.reduce(
    (sum, c) =>
      sum +
      (c.enrollments || []).filter((e: any) => e.status === 'completed').length,
    0
  );
  
  return totalEnrollments > 0
    ? Math.round((completedEnrollments / totalEnrollments) * 100)
    : 0;
}

function calculateEngagementScore(instructor: Instructor): number {
  // Simplified engagement calculation based on multiple factors
  const ratingWeight = (instructor.averageRating / 5) * 40;
  const responseWeight = Math.max(0, 30 - instructor.responseTime);
  const courseWeight = Math.min(20, instructor.coursesCount * 2);
  const studentWeight = Math.min(10, instructor.totalStudents / 10);
  
  return Math.round(ratingWeight + responseWeight + courseWeight + studentWeight);
}

function determinePerformanceTrend(instructor: Instructor): 'up' | 'down' | 'stable' {
  // Simplified trend determination
  if (instructor.averageRating >= 4.5 && instructor.completionRate >= 80) {
    return 'up';
  } else if (instructor.averageRating < 3.5 || instructor.completionRate < 60) {
    return 'down';
  }
  return 'stable';
}

async function getInstructorById(
  prisma: PrismaClient,
  instructorId: string
): Promise<Instructor> {
  const instructor = await prisma.user.findUnique({
    where: { id: instructorId },
    include: {
      courses: {
        include: {
          enrollments: true,
        },
      },
      reviews: true,
    },
  });

  if (!instructor) {
    throw new Error('Instructor not found');
  }

  const courses = instructor.courses || [];
  const totalStudents = courses.reduce(
    (sum, c) => sum + (c._count?.enrollments || 0),
    0
  );
  const totalRevenue = courses.reduce(
    (sum, c) => sum + (c.revenue || 0),
    0
  );
  const averageRating = calculateAverageRating(instructor.reviews || []);
  const completionRate = calculateCompletionRate(courses);

  return {
    id: instructor.id,
    name: instructor.name || instructor.email,
    email: instructor.email,
    avatarUrl: instructor.avatarUrl,
    bio: instructor.bio,
    coursesCount: courses.length,
    totalStudents,
    averageRating,
    reviewCount: instructor.reviews?.length || 0,
    completionRate,
    totalRevenue,
    responseTime: instructor.responseTime || 24,
    joinedAt: instructor.createdAt,
    isVerified: instructor.isVerified || false,
    specialties: instructor.specialties,
  };
}
