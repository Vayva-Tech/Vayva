import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

/**
 * GET /api/nightlife/tables/status
 * Get table status with availability for a specific date
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const venueId = searchParams.get('venueId');
    const date = searchParams.get('date');
    const eventId = searchParams.get('eventId');

    if (!venueId) {
      return NextResponse.json(
        { error: 'Venue ID required' },
        { status: 400 }
      );
    }

    // Get all tables for venue
    const tables = await (prisma as any).nightlifeTable?.findMany({
      where: { venueId },
      orderBy: [{ tableNumber: 'asc' }],
    });

    if (!tables || tables.length === 0) {
      return NextResponse.json({ tables: [], stats: {} });
    }

    // If date provided, check reservations for availability
    let availability: Record<string, boolean> = {};
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      const reservations = await (prisma as any).tableReservation?.findMany({
        where: {
          venueId,
          tableId: { in: tables.map((t: { id: string }) => t.id) },
          date: { gte: startDate, lt: endDate },
          status: { in: ['pending', 'confirmed'] },
        },
        select: { tableId: true },
      });

      const reservedIds = new Set(reservations.map((r: { tableId: string }) => r.tableId));
      availability = Object.fromEntries(
        tables.map((t: { id: string; status: string }) => [
          t.id,
          !reservedIds.has(t.id) && t.status === 'available',
        ])
      );
    }

    // Calculate revenue stats for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysReservations = await (prisma as any).tableReservation?.findMany({
      where: {
        venueId,
        date: { gte: today, lt: tomorrow },
        status: 'completed',
      },
      select: { totalAmount: true, tableName: true },
    });

    const revenueToday = todaysReservations?.reduce(
      (sum: number, r: { totalAmount: number }) => sum + r.totalAmount,
      0
    ) || 0;

    // Group by table type
    const stats = {
      total: tables.length,
      available: tables.filter((t: { status: string }) => t.status === 'available').length,
      reserved: tables.filter((t: { status: string }) => t.status === 'reserved').length,
      occupied: tables.filter((t: { status: string }) => t.status === 'occupied').length,
      offline: tables.filter((t: { status: string }) => t.status === 'offline').length,
      byType: {
        standard: tables.filter((t: { tableType: string }) => t.tableType === 'standard').length,
        vip: tables.filter((t: { tableType: string }) => t.tableType === 'vip').length,
        booth: tables.filter((t: { tableType: string }) => t.tableType === 'booth').length,
        stage_front: tables.filter((t: { tableType: string }) => t.tableType === 'stage_front').length,
        private_room: tables.filter((t: { tableType: string }) => t.tableType === 'private_room').length,
      },
      revenueToday,
    };

    // Add availability to tables
    const tablesWithAvailability = tables.map((t: any) => ({
      ...t,
      isAvailable: availability[t.id] ?? t.status === 'available',
    }));

    return NextResponse.json({
      tables: tablesWithAvailability,
      stats,
    });
  } catch (error) {
    const _errMsg = error instanceof Error ? error.message : String(error);
    logger.error('[NIGHTLIFE_TABLES_STATUS_ERROR]', {
      error: _errMsg,
      venueId: request.url,
      app: 'backend',
    });

    return NextResponse.json(
      { error: 'Failed to fetch table status' },
      { status: 500 }
    );
  }
}
