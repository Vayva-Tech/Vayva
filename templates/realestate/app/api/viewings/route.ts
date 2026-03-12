import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const scheduleSchema = z.object({
  propertyId: z.string(),
  clientName: z.string().min(2),
  clientEmail: z.string().email(),
  clientPhone: z.string().min(10),
  scheduledDate: z.string(), // ISO date string
  scheduledTime: z.string(), // HH:mm format
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = scheduleSchema.parse(body);

    // Parse datetime
    const scheduledDateTime = new Date(`${validatedData.scheduledDate}T${validatedData.scheduledTime}`);

    // Check if property exists and is available
    const property = await prisma.property.findUnique({
      where: {
        id: validatedData.propertyId,
        storeId: process.env.STORE_ID || 'default-real-estate-store',
        status: 'available',
      },
    });

    if (!property) {
      return Response.json(
        { error: 'Property not found or not available' },
        { status: 404 }
      );
    }

    // Check for conflicting viewings (within 1 hour)
    const oneHourBefore = new Date(scheduledDateTime.getTime() - 60 * 60 * 1000);
    const oneHourAfter = new Date(scheduledDateTime.getTime() + 60 * 60 * 1000);

    const conflictingViewings = await prisma.viewing.count({
      where: {
        propertyId: validatedData.propertyId,
        scheduledAt: {
          gte: oneHourBefore,
          lte: oneHourAfter,
        },
        status: {
          not: 'cancelled',
        },
      },
    });

    if (conflictingViewings >= 3) {
      return Response.json(
        { error: 'Too many viewings scheduled for this time slot' },
        { status: 400 }
      );
    }

    // Create viewing
    const viewing = await prisma.viewing.create({
      data: {
        propertyId: validatedData.propertyId,
        clientName: validatedData.clientName,
        clientEmail: validatedData.clientEmail,
        clientPhone: validatedData.clientPhone,
        scheduledAt: scheduledDateTime,
        notes: validatedData.notes,
      },
    });

    return Response.json({
      success: true,
      viewing: {
        id: viewing.id,
        scheduledAt: viewing.scheduledAt,
        status: viewing.status,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Schedule viewing API error:', error);
    return Response.json(
      { error: 'Failed to schedule viewing' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const status = searchParams.get('status') || 'scheduled';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {
      status: status as any,
    };

    if (propertyId) {
      where.propertyId = propertyId;
    }

    const [viewings, total] = await Promise.all([
      prisma.viewing.findMany({
        where,
        include: {
          property: {
            select: {
              title: true,
              address: true,
              city: true,
            },
          },
        },
        orderBy: {
          scheduledAt: 'asc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.viewing.count({ where }),
    ]);

    const transformedViewings = viewings.map(viewing => ({
      id: viewing.id,
      propertyId: viewing.propertyId,
      propertyName: viewing.property.title,
      propertyAddress: `${viewing.property.address}, ${viewing.property.city}`,
      clientName: viewing.clientName,
      clientEmail: viewing.clientEmail,
      clientPhone: viewing.clientPhone,
      scheduledAt: viewing.scheduledAt,
      status: viewing.status,
      notes: viewing.notes,
      createdAt: viewing.createdAt,
    }));

    return Response.json({
      viewings: transformedViewings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Viewings API error:', error);
    return Response.json(
      { error: 'Failed to fetch viewings' },
      { status: 500 }
    );
  }
}