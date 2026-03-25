/**
 * Course Management Feature
 * 
 * Handles course creation, updates, analytics, and dashboard data
 */

import type { PrismaClient } from '@vayva/db';
import type { Course, CourseAnalytics, GetCourseStatsResponse } from '../types';

/**
 * Get course statistics for dashboard
 */
export async function getCourseStats(
  prisma: PrismaClient,
  storeId: string,
  options?: {
    courseId?: string;
    categoryId?: string;
    status?: 'draft' | 'published' | 'archived';
  }
): Promise<GetCourseStatsResponse['data']> {
  const { courseId, categoryId, status } = options || {};

  // Build filter conditions
  const where: any = { storeId };
  
  if (courseId) {
    where.id = courseId;
  }
  
  if (categoryId) {
    where.categoryId = categoryId;
  }
  
  if (status) {
    where.status = status;
  }

  // Fetch courses with enrollments and revenue data
  const courses = await (prisma as any).course.findMany({
    where,
    include: {
      _count: {
        select: {
          enrollments: true,
          assignments: true,
        },
      },
      instructor: {
        select: {
          id: true,
          name: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Transform to Course format
  const courseData: Course[] = courses.map((course: any) => ({
    id: course.id,
    title: course.title,
    description: course.description,
    instructorId: course.instructorId,
    instructorName: course.instructor?.name,
    category: course.category?.name || 'Uncategorized',
    price: course.price || 0,
    maxStudents: course.maxStudents || 100,
    enrolledStudents: course._count.enrollments || 0,
    status: course.status as 'draft' | 'published' | 'archived',
    progress: calculateCourseProgress(course),
    revenue: calculateCourseRevenue(course),
    rating: course.rating || 0,
    reviewCount: course.reviewCount || 0,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
    publishedAt: course.publishedAt,
    thumbnailUrl: course.thumbnailUrl,
  }));

  // Calculate aggregations
  const totalCourses = courseData.length;
  const activeCourses = courseData.filter((c) => c.status === 'published').length;

  const byCategory = courseData.reduce((acc, course) => {
    acc[course.category] = (acc[course.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byStatus = courseData.reduce((acc, course) => {
    acc[course.status] = (acc[course.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCourses = [...courseData]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const lowPerformingCourses = [...courseData]
    .filter((c) => c.enrolledStudents < 10)
    .sort((a, b) => a.progress - b.progress)
    .slice(0, 5);

  const revenueByCategory = courseData.reduce((acc, course) => {
    acc[course.category] = (acc[course.category] || 0) + course.revenue;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalCourses,
    activeCourses,
    byCategory,
    byStatus,
    topCourses,
    lowPerformingCourses,
    revenueByCategory,
  };
}

/**
 * Create a new course
 */
export async function createCourse(
  prisma: PrismaClient,
  storeId: string,
  instructorId: string,
  data: {
    title: string;
    description?: string;
    categoryId?: string;
    price?: number;
    maxStudents?: number;
    thumbnailUrl?: string;
  }
): Promise<Course> {
  const course = await (prisma as any).course.create({
    data: {
      storeId,
      instructorId,
      title: data.title,
      description: data.description,
      categoryId: data.categoryId,
      price: data.price || 0,
      maxStudents: data.maxStudents || 100,
      thumbnailUrl: data.thumbnailUrl,
      status: 'draft',
    },
    include: {
      instructor: {
        select: {
          name: true,
        },
      },
      category: {
        select: {
          name: true,
        },
      },
    },
  });

  return transformCourse(course);
}

/**
 * Update course details
 */
export async function updateCourse(
  prisma: PrismaClient,
  courseId: string,
  data: Partial<{
    title: string;
    description?: string;
    categoryId?: string;
    price?: number;
    maxStudents?: number;
    thumbnailUrl?: string;
    status?: 'draft' | 'published' | 'archived';
  }>
): Promise<Course> {
  const course = await (prisma as any).course.update({
    where: { id: courseId },
    data,
    include: {
      instructor: {
        select: {
          name: true,
        },
      },
      category: {
        select: {
          name: true,
        },
      },
    },
  });

  return transformCourse(course);
}

/**
 * Publish a course
 */
export async function publishCourse(
  prisma: PrismaClient,
  courseId: string
): Promise<Course> {
  return updateCourse(prisma, courseId, { status: 'published' });
}

/**
 * Get course analytics
 */
export async function getCourseAnalytics(
  prisma: PrismaClient,
  storeId: string,
  courseId?: string
): Promise<CourseAnalytics[]> {
  const where: any = { storeId };
  if (courseId) {
    where.id = courseId;
  }

  const courses = await (prisma as any).course.findMany({
    where,
    include: {
      enrollments: {
        where: {
          status: 'active',
        },
      },
      assignments: true,
    },
  });

  return courses.map((course: any) => {
    const completions = course.enrollments.filter(
      (e: any) => e.status === 'completed'
    ).length;
    const enrollments = course.enrollments.length;
    const completionRate = enrollments > 0 ? (completions / enrollments) * 100 : 0;

    return {
      courseId: course.id,
      courseTitle: course.title,
      enrollments,
      completions,
      completionRate,
      averageProgress: calculateCourseProgress(course),
      activeLearners: course.enrollments.filter(
        (e: any) => e.status === 'active'
      ).length,
      revenue: calculateCourseRevenue(course),
      refundRate: 0, // Would need refund data
      satisfactionScore: course.rating || 0,
      engagementScore: calculateEngagementScore(course),
      dropoffPoints: [], // Would need module-level data
    };
  });
}

// Helper functions
function calculateCourseProgress(course: any): number {
  // Simplified calculation - would need actual module/lesson data
  const completedEnrollments = course.enrollments?.filter(
    (e: any) => e.status === 'completed'
  ).length || 0;
  const totalEnrollments = course.enrollments?.length || 0;
  return totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0;
}

function calculateCourseRevenue(course: any): number {
  // Simplified - would need actual order/payment data
  return course.revenue || 0;
}

function calculateEngagementScore(course: any): number {
  // Simplified engagement calculation
  const enrollments = course.enrollments?.length || 0;
  const activeEnrollments = course.enrollments?.filter(
    (e: any) => e.status === 'active'
  ).length || 0;
  return enrollments > 0 ? (activeEnrollments / enrollments) * 100 : 0;
}

function transformCourse(course: any): Course {
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    instructorId: course.instructorId,
    instructorName: course.instructor?.name,
    category: course.category?.name || 'Uncategorized',
    price: course.price || 0,
    maxStudents: course.maxStudents || 100,
    enrolledStudents: course._count?.enrollments || 0,
    status: course.status as 'draft' | 'published' | 'archived',
    progress: calculateCourseProgress(course),
    revenue: calculateCourseRevenue(course),
    rating: course.rating || 0,
    reviewCount: course.reviewCount || 0,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
    publishedAt: course.publishedAt,
    thumbnailUrl: course.thumbnailUrl,
  };
}
