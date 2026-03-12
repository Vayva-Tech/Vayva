import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const enrollmentSchema = z.object({
  courseId: z.string(),
  studentId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = enrollmentSchema.parse(body);

    // Check if course exists and is published
    const course = await prisma.course.findUnique({
      where: {
        id: validatedData.courseId,
        storeId: process.env.STORE_ID || 'default-edu-store',
        isPublished: true,
      },
    });

    if (!course) {
      return Response.json(
        { error: 'Course not found or not available' },
        { status: 404 }
      );
    }

    // Check if student is already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        courseId_studentId: {
          courseId: validatedData.courseId,
          studentId: validatedData.studentId,
        },
      },
    });

    if (existingEnrollment) {
      if (existingEnrollment.status === 'active') {
        return Response.json(
          { error: 'Already enrolled in this course' },
          { status: 400 }
        );
      }
      
      // Re-activate dropped/suspended enrollment
      const updatedEnrollment = await prisma.enrollment.update({
        where: {
          id: existingEnrollment.id,
        },
        data: {
          status: 'active',
          startedAt: new Date(),
        },
      });

      return Response.json({
        success: true,
        enrollment: {
          id: updatedEnrollment.id,
          courseId: updatedEnrollment.courseId,
          studentId: updatedEnrollment.studentId,
          status: updatedEnrollment.status,
          progress: Number(updatedEnrollment.progress),
        },
      });
    }

    // Create new enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        courseId: validatedData.courseId,
        studentId: validatedData.studentId,
        status: 'active',
        progress: 0,
      },
    });

    return Response.json({
      success: true,
      enrollment: {
        id: enrollment.id,
        courseId: enrollment.courseId,
        studentId: enrollment.studentId,
        status: enrollment.status,
        progress: Number(enrollment.progress),
        startedAt: enrollment.startedAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Enrollment API error:', error);
    return Response.json(
      { error: 'Failed to enroll in course' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const courseId = searchParams.get('courseId');
    const status = searchParams.get('status') || 'active';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {
      status: status as any,
    };

    if (studentId) {
      where.studentId = studentId;
    }

    if (courseId) {
      where.courseId = courseId;
    }

    const [enrollments, total] = await Promise.all([
      prisma.enrollment.findMany({
        where,
        include: {
          course: {
            select: {
              title: true,
              thumbnailUrl: true,
              instructorId: true,
              level: true,
            },
          },
        },
        orderBy: {
          startedAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.enrollment.count({ where }),
    ]);

    const transformedEnrollments = enrollments.map(enrollment => ({
      id: enrollment.id,
      courseId: enrollment.courseId,
      studentId: enrollment.studentId,
      status: enrollment.status,
      progress: Number(enrollment.progress),
      startedAt: enrollment.startedAt,
      completedAt: enrollment.completedAt,
      lastAccessedAt: enrollment.lastAccessedAt,
      totalTimeSpent: enrollment.totalTimeSpent,
      course: {
        title: enrollment.course.title,
        thumbnailUrl: enrollment.course.thumbnailUrl,
        instructorId: enrollment.course.instructorId,
        level: enrollment.course.level,
      },
    }));

    return Response.json({
      enrollments: transformedEnrollments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Enrollments API error:', error);
    return Response.json(
      { error: 'Failed to fetch enrollments' },
      { status: 500 }
    );
  }
}