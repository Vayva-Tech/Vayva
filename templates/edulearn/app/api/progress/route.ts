import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const progressSchema = z.object({
  enrollmentId: z.string(),
  lessonId: z.string(),
  isCompleted: z.boolean().optional(),
  timeSpent: z.number().optional(),
  lastPosition: z.number().optional(), // Video timestamp
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = progressSchema.parse(body);

    // Verify enrollment exists
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        id: validatedData.enrollmentId,
      },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: true,
              },
            },
          },
        },
      },
    });

    if (!enrollment) {
      return Response.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // Verify lesson exists in this course
    const lessonExists = enrollment.course.modules.some((module: any) =>
      module.lessons.some((lesson: any) => lesson.id === validatedData.lessonId)
    );

    if (!lessonExists) {
      return Response.json(
        { error: 'Lesson not found in this course' },
        { status: 404 }
      );
    }

    // Upsert lesson progress
    const progress = await prisma.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: validatedData.enrollmentId,
          lessonId: validatedData.lessonId,
        },
      },
      update: {
        isCompleted: validatedData.isCompleted ?? undefined,
        timeSpent: {
          increment: validatedData.timeSpent ?? 0,
        },
        lastPosition: validatedData.lastPosition ?? undefined,
      },
      create: {
        enrollmentId: validatedData.enrollmentId,
        lessonId: validatedData.lessonId,
        isCompleted: validatedData.isCompleted ?? false,
        timeSpent: validatedData.timeSpent ?? 0,
        lastPosition: validatedData.lastPosition ?? null,
      },
    });

    // Update overall course progress
    const totalLessons = enrollment.course.modules.reduce(
      (sum: number, module: any) => sum + module.lessons.length, 0
    );
    
    const completedLessons = await prisma.lessonProgress.count({
      where: {
        enrollmentId: validatedData.enrollmentId,
        isCompleted: true,
      },
    });

    const courseProgress = totalLessons > 0 
      ? Math.round((completedLessons / totalLessons) * 100) 
      : 0;

    // Update enrollment progress
    await prisma.enrollment.update({
      where: {
        id: validatedData.enrollmentId,
      },
      data: {
        progress: courseProgress,
        lastAccessedAt: new Date(),
        totalTimeSpent: {
          increment: validatedData.timeSpent ?? 0,
        },
        ...(validatedData.isCompleted && { completedAt: new Date() }),
      },
    });

    return Response.json({
      success: true,
      progress: {
        id: progress.id,
        enrollmentId: progress.enrollmentId,
        lessonId: progress.lessonId,
        isCompleted: progress.isCompleted,
        timeSpent: progress.timeSpent,
        lastPosition: progress.lastPosition ? Number(progress.lastPosition) : null,
        completedAt: progress.completedAt,
      },
      courseProgress,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid input data', details: (error as any).errors },
        { status: 400 }
      );
    }

    console.error('Lesson progress API error:', error);
    return Response.json(
      { error: 'Failed to update lesson progress' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const enrollmentId = searchParams.get('enrollmentId');
    const lessonId = searchParams.get('lessonId');

    const where: any = {};

    if (enrollmentId) {
      where.enrollmentId = enrollmentId;
    }

    if (lessonId) {
      where.lessonId = lessonId;
    }

    const progressRecords = await prisma.lessonProgress.findMany({
      where,
      include: {
        lesson: {
          select: {
            title: true,
            type: true,
            duration: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const transformedProgress = progressRecords.map((record: any) => ({
      id: record.id,
      enrollmentId: record.enrollmentId,
      lessonId: record.lessonId,
      isCompleted: record.isCompleted,
      timeSpent: record.timeSpent,
      lastPosition: record.lastPosition ? Number(record.lastPosition) : null,
      completedAt: record.completedAt,
      createdAt: record.createdAt,
      lesson: {
        title: record.lesson.title,
        type: record.lesson.type,
        duration: record.lesson.duration,
      },
    }));

    return Response.json({
      progress: transformedProgress,
    });
  } catch (error) {
    console.error('Lesson progress GET API error:', error);
    return Response.json(
      { error: 'Failed to fetch lesson progress' },
      { status: 500 }
    );
  }
}