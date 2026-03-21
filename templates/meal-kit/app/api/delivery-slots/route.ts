// ============================================================================
// Delivery Slots API Route
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/delivery-slots - Get available delivery slots
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const storeId = searchParams.get('storeId');
    const date = searchParams.get('date');
    const zipCode = searchParams.get('zipCode');

    if (!storeId) {
      return NextResponse.json({ error: 'storeId is required' }, { status: 400 });
    }

    const where: any = { storeId, isAvailable: true };

    if (date) {
      const targetDate = new Date(date);
      where.date = {
        gte: new Date(targetDate.setHours(0, 0, 0, 0)),
        lt: new Date(targetDate.setDate(targetDate.getDate() + 1)),
      };
    }

    if (zipCode) {
      where.zipCodes = {
        has: zipCode,
      };
    }

    const slots = await prisma.deliverySlot.findMany({
      where,
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    return NextResponse.json(slots);
  } catch (error) {
    console.error('Failed to fetch delivery slots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch delivery slots' },
      { status: 500 }
    );
  }
}

// POST /api/delivery-slots - Create delivery slot
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      storeId,
      date,
      startTime,
      endTime,
      maxCapacity,
      zipCodes,
    } = body;

    // Validate required fields
    if (!storeId || !date || !startTime || !endTime || !zipCodes) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const slot = await prisma.deliverySlot.create({
      data: {
        storeId,
        date: new Date(date),
        startTime,
        endTime,
        maxCapacity: maxCapacity || 20,
        bookedCount: 0,
        isAvailable: true,
        zipCodes,
      },
    });

    return NextResponse.json(slot, { status: 201 });
  } catch (error) {
    console.error('Failed to create delivery slot:', error);
    return NextResponse.json(
      { error: 'Failed to create delivery slot' },
      { status: 500 }
    );
  }
}

// PUT /api/delivery-slots - Book a delivery slot
export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const action = searchParams.get('action');

    if (!id) {
      return NextResponse.json({ error: 'Slot ID is required' }, { status: 400 });
    }

    const slot = await prisma.deliverySlot.findUnique({
      where: { id },
    });

    if (!slot) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
    }

    if (action === 'book') {
      if (!slot.isAvailable || slot.bookedCount >= slot.maxCapacity) {
        return NextResponse.json(
          { error: 'Slot is not available' },
          { status: 400 }
        );
      }

      const updated = await prisma.deliverySlot.update({
        where: { id },
        data: {
          bookedCount: { increment: 1 },
          isAvailable: slot.bookedCount + 1 < slot.maxCapacity,
        },
      });

      return NextResponse.json(updated);
    } else if (action === 'cancel') {
      if (slot.bookedCount <= 0) {
        return NextResponse.json(
          { error: 'No bookings to cancel' },
          { status: 400 }
        );
      }

      const updated = await prisma.deliverySlot.update({
        where: { id },
        data: {
          bookedCount: { decrement: 1 },
          isAvailable: true,
        },
      });

      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Failed to update delivery slot:', error);
    return NextResponse.json(
      { error: 'Failed to update delivery slot' },
      { status: 500 }
    );
  }
}

// DELETE /api/delivery-slots - Delete delivery slot
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Slot ID is required' }, { status: 400 });
    }

    await prisma.deliverySlot.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete delivery slot:', error);
    return NextResponse.json(
      { error: 'Failed to delete delivery slot' },
      { status: 500 }
    );
  }
}
