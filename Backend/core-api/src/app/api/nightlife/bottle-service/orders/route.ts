import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

/**
 * GET /api/nightlife/bottle-service/orders
 * Get bottle service orders
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const venueId = searchParams.get('venueId');
    const tableId = searchParams.get('tableId');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (venueId) where.venueId = venueId;
    if (tableId) where.tableId = tableId;
    if (status) where.status = status;

    const orders = await (prisma as any).bottleOrder?.findMany({
      where,
      include: {
        items: true,
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    const activeOrders = orders?.filter((o: { status: string }) => 
      ['pending', 'preparing', 'delivered'].includes(o.status)
    ) || [];

    return NextResponse.json({
      orders: orders || [],
      activeOrders,
      stats: {
        total: orders?.length || 0,
        active: activeOrders.length,
        delivered: orders?.filter((o: { status: string }) => o.status === 'delivered').length || 0,
      },
    });
  } catch (error) {
    const _errMsg = error instanceof Error ? error.message : String(error);
    logger.error('[NIGHTLIFE_BOTTLE_ORDERS_ERROR]', {
      error: _errMsg,
      app: 'backend',
    });

    return NextResponse.json(
      { error: 'Failed to fetch bottle orders' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/nightlife/bottle-service/orders
 * Create new bottle order
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const {
      tableId,
      tableName,
      venueId,
      items,
      totalAmount,
      notes,
    } = body;

    if (!tableId || !tableName || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Table ID, table name, and items required' },
        { status: 400 }
      );
    }

    const order = await (prisma as any).bottleOrder?.create({
      data: {
        tableId,
        tableName,
        venueId,
        items: {
          create: items.map((item: any) => ({
            bottleId: item.bottleId,
            quantity: item.quantity,
            mixers: item.mixers || [],
          })),
        },
        totalAmount,
        notes,
        status: 'pending',
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    const _errMsg = error instanceof Error ? error.message : String(error);
    logger.error('[NIGHTLIFE_CREATE_BOTTLE_ORDER_ERROR]', {
      error: _errMsg,
      app: 'backend',
    });

    return NextResponse.json(
      { error: 'Failed to create bottle order' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/nightlife/bottle-service/orders/:id
 * Update bottle order status
 */
export async function PATCH(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Order ID and status required' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'preparing', 'delivered', 'completed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const updateData: Record<string, any> = { status };
    if (status === 'delivered') {
      updateData.deliveredAt = new Date();
    }

    const order = await (prisma as any).bottleOrder?.update({
      where: { id: orderId },
      data: updateData,
      include: {
        items: true,
      },
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    const _errMsg = error instanceof Error ? error.message : String(error);
    logger.error('[NIGHTLIFE_UPDATE_BOTTLE_ORDER_ERROR]', {
      error: _errMsg,
      app: 'backend',
    });

    return NextResponse.json(
      { error: 'Failed to update bottle order' },
      { status: 500 }
    );
  }
}
