import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const search = searchParams.get('search');
    const instructorId = searchParams.get('instructorId');
    const isPublished = searchParams.get('isPublished');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build where clause
    const where: any = {
      storeId: process.env.STORE_ID || 'default-edu-store',
    };

    // Add filters
    if (category) {
      where.category = category;
    }

    if (level) {
      where.level = level as any;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    if (instructorId) {
      where.instructorId = instructorId;
    }

    if (isPublished !== null) {
      where.isPublished = isPublished === 'true';
    }

    // Fetch courses with relations
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          modules: {
            include: {
              lessons: true,
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
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.course.count({ where }),
    ]);

    // Transform to match template expectations
    const transformedCourses = courses.map(course => ({
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
      // Calculated fields
      totalLessons: course.modules.reduce((sum, module) => sum + module.lessons.length, 0),
      totalStudents: course.enrollments.length,
      totalModules: course.modules.length,
      // Module structure for navigation
      modules: course.modules.map(module => ({
        id: module.id,
        title: module.title,
        description: module.description,
        orderIndex: module.orderIndex,
        isPublished: module.isPublished,
        lessons: module.lessons.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          type: lesson.type,
          duration: lesson.duration,
          isPreview: lesson.isPreview,
          orderIndex: lesson.orderIndex,
          isPublished: lesson.isPublished,
        })).sort((a, b) => a.orderIndex - b.orderIndex),
      })).sort((a, b) => a.orderIndex - b.orderIndex),
    }));

    return Response.json({
      courses: transformedCourses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Courses API error:', error);
    return Response.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}