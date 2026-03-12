import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

/**
 * GET /api/nightlife/vip-list
 * Get VIP guest list for an event
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const category = searchParams.get('category');

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID required' },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { eventId };
    if (category) {
      where.category = category;
    }

    const guests = await (prisma as any).vIPGuest?.findMany({
      where,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    // Group by category
    const grouped = {
      celebrity: guests?.filter((g: { category: string }) => g.category === 'celebrity') || [],
      high_roller: guests?.filter((g: { category: string }) => g.category === 'high_roller') || [],
      special_occasion: guests?.filter((g: { category: string }) => g.category === 'special_occasion') || [],
      regular_vip: guests?.filter((g: { category: string }) => g.category === 'regular_vip') || [],
    };

    const stats = {
      total: guests?.length || 0,
      checkedIn: guests?.filter((g: { hasArrived: boolean }) => g.hasArrived).length || 0,
      pending: guests?.filter((g: { hasArrived: boolean }) => !g.hasArrived).length || 0,
    };

    return NextResponse.json({
      guests: guests || [],
      grouped,
      stats,
    });
  } catch (error) {
    const _errMsg = error instanceof Error ? error.message : String(error);
    logger.error('[NIGHTLIFE_VIP_LIST_ERROR]', {
      error: _errMsg,
      eventId: request.url,
      app: 'backend',
    });

    return NextResponse.json(
      { error: 'Failed to fetch VIP list' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/nightlife/vip-list
 * Add guest to VIP list
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const {
      eventId,
      name,
      phone,
      email,
      category,
      tableId,
      tableName,
      guestCount,
      minimumSpend,
      specialRequests,
      promoterId,
      occasion,
    } = body;

    if (!eventId || !name || !phone) {
      return NextResponse.json(
        { error: 'Event ID, name, and phone required' },
        { status: 400 }
      );
    }

    const guest = await (prisma as any).vIPGuest?.create({
      data: {
        eventId,
        name,
        phone,
        email,
        category: category || 'regular_vip',
        tableId,
        tableName,
        guestCount,
        minimumSpend,
        specialRequests,
        promoterId,
        occasion,
        isOnList: true,
        hasArrived: false,
      },
    });

    return NextResponse.json({ success: true, guest });
  } catch (error) {
    const _errMsg = error instanceof Error ? error.message : String(error);
    logger.error('[NIGHTLIFE_ADD_VIP_ERROR]', {
      error: _errMsg,
      app: 'backend',
    });

    return NextResponse.json(
      { error: 'Failed to add VIP guest' },
      { status: 500 }
    );
  }
}
