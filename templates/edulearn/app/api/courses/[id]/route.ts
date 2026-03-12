import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const course = await prisma.course.findUnique({
      where: {
        id: params.id,
        storeId: process.env.STORE_ID || 'default-edu-store',
        isPublished: true,
      },
      include: {
        modules: {
          include: {
            lessons: {
              orderBy: {
                orderIndex: 'asc',
              },
            },
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
        enrollments: {
          where: {
            status: 'active',
          },
          select: {
            id: true,
            studentId: true,
            progress: true,
            startedAt: true,
          },
        },
      },
    });

    if (!course) {
      return Response.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Transform course data
    const transformedCourse = {
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnailUrl: course.thumbnailUrl,
      instructorId: course.instructorId,
      price: Number(course.price),
      currency: course.currency,
      duration: course.duration,
      level: course.level,
      category: course.category,
      tags: course.tags,
      isPublished: course.isPublished,
      publishedAt: course.publishedAt,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      // Module and lesson structure
      modules: course.modules.map((module: any) => ({
        id: module.id,
        title: module.title,
        description: module.description,
        orderIndex: module.orderIndex,
        isPublished: module.isPublished,
        lessons: module.lessons.map((lesson: any) => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          type: lesson.type,
          content: lesson.content,
          duration: lesson.duration,
          isPreview: lesson.isPreview,
          orderIndex: lesson.orderIndex,
          isPublished: lesson.isPublished,
        })),
      })),
      // Statistics
      totalLessons: course.modules.reduce((sum: number, module: any) => sum + module.lessons.length, 0),
      totalStudents: course.enrollments.length,
      totalModules: course.modules.length,
      avgCompletion: course.enrollments.length > 0 
        ? course.enrollments.reduce((sum: number, e: any) => sum + Number(e.progress), 0) / course.enrollments.length
        : 0,
    };

    // Get related courses (same category/level)
    const relatedCourses = await prisma.course.findMany({
      where: {
        storeId: process.env.STORE_ID || 'default-edu-store',
        isPublished: true,
        category: course.category,
        id: {
          not: course.id,
        },
      },
      take: 4,
      include: {
        modules: {
          include: {
            lessons: true,
          },
        },
      },
    });

    const transformedRelated = relatedCourses.map((c: any) => ({
      id: c.id,
      title: c.title,
      thumbnailUrl: c.thumbnailUrl,
      level: c.level,
      duration: c.duration,
      price: Number(c.price),
      totalLessons: c.modules.reduce((sum: number, module: any) => sum + module.lessons.length, 0),
    }));

    return Response.json({
      course: transformedCourse,
      related: transformedRelated,
    });
  } catch (error) {
    console.error('Course detail API error:', error);
    return Response.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}