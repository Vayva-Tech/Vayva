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

  /**
   * Get student enrollments
   */
  async getStudentEnrollments(storeId: string, studentId?: string) {
    try {
      const where: any = { storeId };
      
      if (studentId) {
        where.studentId = studentId;
      }

      const enrollments = await this.db.enrollment.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
              code: true,
              status: true,
            },
          },
        },
        orderBy: { enrolledAt: 'desc' },
      });

      return enrollments.map((e) => ({
        id: e.id,
        studentId: e.studentId,
        studentName: `${e.student.firstName} ${e.student.lastName}`,
        studentEmail: e.student.email,
        courseId: e.courseId,
        courseTitle: e.course.title,
        courseCode: e.course.code,
        courseStatus: e.course.status,
        status: e.status,
        progress: e.progress,
        grade: e.grade,
        enrolledAt: e.enrolledAt,
        completedAt: e.completedAt,
      }));
    } catch (error) {
      logger.error('[EducationCoursesService.getStudentEnrollments]', { storeId, error });
      throw error;
    }
  }

  /**
   * Create student enrollment
   */
  async createEnrollment(storeId: string, studentId: string, courseId: string) {
    try {
      // Check if course exists
      const course = await this.db.course.findUnique({
        where: { id: courseId },
      });

      if (!course) {
        throw new Error('Course not found');
      }

      if (course.storeId !== storeId) {
        throw new Error('Course does not belong to this store');
      }

      // Check if already enrolled
      const existing = await this.db.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId,
            courseId,
          },
        },
      });

      if (existing) {
        throw new Error('Student already enrolled in this course');
      }

      const enrollment = await this.db.enrollment.create({
        data: {
          storeId,
          studentId,
          courseId,
          status: 'active',
          progress: 0,
        },
        include: {
          student: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          course: {
            select: {
              title: true,
              code: true,
            },
          },
        },
      });

      logger.info('[EducationCoursesService.createEnrollment]', {
        enrollmentId: enrollment.id,
        studentId,
        courseId,
      });

      return enrollment;
    } catch (error) {
      logger.error('[EducationCoursesService.createEnrollment]', { storeId, studentId, courseId, error });
      throw error;
    }
  }

  /**
   * Update enrollment progress
   */
  async updateEnrollmentProgress(enrollmentId: string, progress: number, completedModules?: string[]) {
    try {
      if (progress < 0 || progress > 100) {
        throw new Error('Progress must be between 0 and 100');
      }

      const enrollment = await this.db.enrollment.update({
        where: { id: enrollmentId },
        data: {
          progress,
          completedModules: completedModules || [],
          status: progress === 100 ? 'completed' : 'active',
          completedAt: progress === 100 ? new Date() : null,
        },
      });

      logger.info('[EducationCoursesService.updateEnrollmentProgress]', {
        enrollmentId,
        progress,
      });

      return enrollment;
    } catch (error) {
      logger.error('[EducationCoursesService.updateEnrollmentProgress]', { enrollmentId, progress, error });
      throw error;
    }
  }

  /**
   * Generate certificate for completed enrollment
   */
  async generateCertificate(storeId: string, enrollmentId: string) {
    try {
      const enrollment = await this.db.enrollment.findUnique({
        where: { id: enrollmentId },
        include: {
          student: true,
          course: true,
        },
      });

      if (!enrollment) {
        throw new Error('Enrollment not found');
      }

      if (enrollment.status !== 'completed') {
        throw new Error('Student has not completed the course');
      }

      // Check if certificate already exists
      const existingCert = await this.db.certificate.findFirst({
        where: {
          studentId: enrollment.studentId,
          courseId: enrollment.courseId,
        },
      });

      if (existingCert) {
        throw new Error('Certificate already issued');
      }

      const certificateNumber = `CERT-${storeId.toUpperCase()}-${Date.now()}`;
      const verificationCode = Math.random().toString(36).substring(2, 12).toUpperCase();

      const certificate = await this.db.certificate.create({
        data: {
          storeId,
          studentId: enrollment.studentId,
          courseId: enrollment.courseId,
          certificateNumber,
          verificationCode,
          templateUrl: '/templates/default-certificate.svg',
          grade: enrollment.grade,
          issuedAt: new Date(),
        },
        include: {
          student: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          course: {
            select: {
              title: true,
              code: true,
            },
          },
        },
      });

      logger.info('[EducationCoursesService.generateCertificate]', {
        certificateId: certificate.id,
        certificateNumber,
      });

      return {
        id: certificate.id,
        certificateNumber: certificate.certificateNumber,
        verificationCode: certificate.verificationCode,
        studentName: `${certificate.student.firstName} ${certificate.student.lastName}`,
        courseTitle: certificate.course.title,
        courseCode: certificate.course.code,
        issuedAt: certificate.issuedAt,
        downloadUrl: `/api/v1/education/certificates/${certificate.id}/download`,
        verificationUrl: `/api/v1/education/verify/${certificate.verificationCode}`,
      };
    } catch (error) {
      logger.error('[EducationCoursesService.generateCertificate]', { enrollmentId, error });
      throw error;
    }
  }

  /**
   * Get course analytics
   */
  async getCourseAnalytics(storeId: string, courseId?: string) {
    try {
      const where: any = { storeId };
      if (courseId) {
        where.courseId = courseId;
      }

      const [totalEnrollments, activeEnrollments, completedEnrollments, revenueData] = await Promise.all([
        this.db.enrollment.count({ where }),
        this.db.enrollment.count({ ...where, status: 'active' }),
        this.db.enrollment.count({ ...where, status: 'completed' }),
        this.db.order.aggregate({
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
        }),
      ]);

      const completionRate = totalEnrollments > 0 
        ? (completedEnrollments / totalEnrollments) * 100 
        : 0;

      return {
        totalEnrollments,
        activeEnrollments,
        completedEnrollments,
        completionRate: Math.round(completionRate * 100) / 100,
        totalRevenue: Number(revenueData._sum.total || 0),
      };
    } catch (error) {
      logger.error('[EducationCoursesService.getCourseAnalytics]', { storeId, courseId, error });
      throw error;
    }
  }
}
