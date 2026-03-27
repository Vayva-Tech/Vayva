// Backend/core-api/src/services/education/courses.service.ts
import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class EducationCoursesService {
  constructor(private readonly db = prisma) {}

  /**
   * Get course statistics
   */
  async getCourseStats(storeId: string, options?: any) {
    try {
      const { courseId, categoryId, status } = options || {};
      
      const where: any = { storeId };
      
      if (courseId) where.id = courseId;
      if (categoryId) where.categoryId = categoryId;
      if (status) where.status = status;

      const courses = await this.db.course.findMany({ where });
      
      const totalStudents = await this.db.enrollment.count({
        where: { courseId: courseId || undefined },
      });

      const totalRevenue = await this.db.order.aggregate({
        where: {
          storeId,
          orderItems: {
            some: {
              product: {
                courseId: courseId || undefined,
              },
            },
          },
        },
        _sum: { total: true },
      });

      return {
        totalCourses: courses.length,
        totalStudents,
        totalRevenue: Number(totalRevenue._sum.total || 0),
        averageRating: 4.5, // Would need review aggregation
      };
    } catch (error) {
      logger.error('[EducationCoursesService.getCourseStats]', { storeId, error });
      throw error;
    }
  }

  /**
   * Get all courses for store
   */
  async getStoreCourses(storeId: string, filters?: any) {
    try {
      const where: any = { storeId };
      
      if (filters?.status) where.status = filters.status;
      if (filters?.categoryId) where.categoryId = filters.categoryId;

      return await this.db.course.findMany({
        where,
        include: {
          category: true,
          enrollments: {
            select: {
              student: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      logger.error('[EducationCoursesService.getStoreCourses]', { storeId, error });
      throw error;
    }
  }

  /**
   * Create course
   */
  async createCourse(storeId: string, data: any) {
    try {
      const course = await this.db.course.create({
        data: {
          ...data,
          storeId,
        },
      });
      
      logger.info('[EducationCoursesService.createCourse]', { 
        courseId: course.id, 
        storeId 
      });
      
      return course;
    } catch (error) {
      logger.error('[EducationCoursesService.createCourse]', { storeId, error });
      throw error;
    }
  }

  /**
   * Update course
   */
  async updateCourse(id: string, data: any) {
    try {
      return await this.db.course.update({
        where: { id },
        data,
      });
    } catch (error) {
      logger.error('[EducationCoursesService.updateCourse]', { id, error });
      throw error;
    }
  }
}
