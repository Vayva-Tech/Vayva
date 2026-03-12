import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

/**
 * GET /api/nightlife/staff
 * Get staff on duty
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const venueId = searchParams.get('venueId');
    const role = searchParams.get('role');

    if (!venueId) {
      return NextResponse.json(
        { error: 'Venue ID required' },
        { status: 400 }
      );
    }

    const now = new Date();

    const where: Record<string, unknown> = {
      venueId,
      shiftStart: { lte: now },
      shiftEnd: { gte: now },
    };

    if (role) {
      where.role = role;
    }

    const staff = await (prisma as any).staffShift?.findMany({
      where,
      orderBy: [{ role: 'asc' }, { staffName: 'asc' }],
    });

    // Count by role
    const byRole: Record<string, number> = {};
    staff?.forEach((s: any) => {
      byRole[s.role] = (byRole[s.role] || 0) + 1;
    });

    // Count on break
    const onBreak = staff?.filter((s: any) => s.isOnBreak).length || 0;

    const stats = {
      total: staff?.length || 0,
      onBreak,
      active: (staff?.length || 0) - onBreak,
      byRole,
    };

    return NextResponse.json({
      staff: staff || [],
      stats,
    });
  } catch (error) {
    const _errMsg = error instanceof Error ? error.message : String(error);
    logger.error('[NIGHTLIFE_STAFF_ERROR]', {
      error: _errMsg,
      app: 'backend',
    });

    return NextResponse.json(
      { error: 'Failed to fetch staff data' },
      { status: 500 }
    );
  }
}
