import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const clockInSchema = z.object({
  staffId: z.string(),
  shiftType: z.enum(['opening', 'mid', 'closing', 'break']),
  location: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * POST /api/restaurant/staff/clock-in
 * Clock in/out staff members
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = clockInSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { staffId, shiftType, location, notes } = validation.data;

    // Create clock-in record
    const clockIn = await prisma.staffTimeClock.create({
      data: {
        staffId,
        businessId: session.user.id,
        shiftType,
        clockInTime: new Date(),
        location,
        notes,
      },
      include: {
        staff: {
          select: {
            id: true,
            name: true,
            role: true,
            hourlyRate: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: clockIn,
      message: 'Successfully clocked in',
    });
  } catch (error) {
    console.error('Clock-in error:', error);
    return NextResponse.json(
      { error: 'Failed to process clock-in' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/restaurant/staff/clock-in
 * Get recent clock-ins for today
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const startOfDay = new Date(`${date}T00:00:00Z`);
    const endOfDay = new Date(`${date}T23:59:59Z`);

    const clockIns = await prisma.staffTimeClock.findMany({
      where: {
        businessId: session.user.id,
        clockInTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        staff: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        clockInTime: 'desc',
      },
    });

    // Calculate total labor hours and cost
    const now = new Date();
    const laborSummary = clockIns.map((clockIn) => {
      const endTime = clockIn.clockOutTime || now;
      const hoursWorked = (endTime.getTime() - clockIn.clockInTime.getTime()) / (1000 * 60 * 60);
      const cost = hoursWorked * clockIn.staff.hourlyRate;

      return {
        staffId: clockIn.staffId,
        staffName: clockIn.staff.name,
        hoursWorked,
        cost,
        isClockedOut: !!clockIn.clockOutTime,
      };
    });

    const totalHours = laborSummary.reduce((sum, item) => sum + item.hoursWorked, 0);
    const totalCost = laborSummary.reduce((sum, item) => sum + item.cost, 0);

    return NextResponse.json({
      success: true,
      data: {
        clockIns,
        summary: {
          totalHours: Math.round(totalHours * 100) / 100,
          totalCost: Math.round(totalCost * 100) / 100,
          activeStaff: laborSummary.filter((item) => !item.isClockedOut).length,
        },
      },
    });
  } catch (error) {
    console.error('Get clock-ins error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clock-ins' },
      { status: 500 }
    );
  }
}
