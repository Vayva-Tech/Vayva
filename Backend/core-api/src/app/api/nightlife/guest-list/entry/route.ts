import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

/**
 * POST /api/nightlife/guest-list/entry
 * Check-in a VIP guest
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { guestId, tableId } = body;

    if (!guestId) {
      return NextResponse.json(
        { error: 'Guest ID required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, any> = {
      hasArrived: true,
      checkedInAt: new Date(),
    };

    if (tableId) {
      updateData.tableId = tableId;
    }

    const guest = await (prisma as any).vIPGuest?.update({
      where: { id: guestId },
      data: updateData,
    });

    return NextResponse.json({ success: true, guest });
  } catch (error) {
    const _errMsg = error instanceof Error ? error.message : String(error);
    logger.error('[NIGHTLIFE_GUEST_CHECKIN_ERROR]', {
      error: _errMsg,
      guestId: request.url,
      app: 'backend',
    });

    return NextResponse.json(
      { error: 'Failed to check in guest' },
      { status: 500 }
    );
  }
}
