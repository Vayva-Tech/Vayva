import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class EducationService {
  constructor(private readonly db = prisma) {}

  async getEnrollments(storeId: string) {
    const enrollments = await this.db.educationEnrollment.findMany({
      where: { storeId },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            code: true,
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
      studentPhone: e.student.phone,
      courseId: e.courseId,
      courseTitle: e.course.title,
      courseCode: e.course.code,
      status: e.status,
      progress: e.progress,
      enrolledAt: e.enrolledAt,
      completedAt: e.completedAt,
    }));
  }
}
