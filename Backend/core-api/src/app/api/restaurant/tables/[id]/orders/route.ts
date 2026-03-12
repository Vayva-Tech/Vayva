import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/restaurant/tables/:id/orders
 * Get order history for a specific table
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const startOfDay = new Date(`${date}T00:00:00Z`);
    const endOfDay = new Date(`${date}T23:59:59Z`);

    // Get table orders for the specified date
    const orders = await prisma.order.findMany({
      where: {
        businessId: session.user.id,
        tableId: params.id,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        items: {
          include: {
            menuItem: {
              select: {
                name: true,
                price: true,
                category: true,
              },
            },
          },
        },
        payments: {
          select: {
            amount: true,
            method: true,
            status: true,
            paidAt: true,
          },
        },
        server: {
          select: {
            name: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate table metrics
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const totalItems = orders.reduce((sum, order) => 
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );

    const paymentStatus = {
      paid: orders.filter(o => o.paymentStatus === 'paid').length,
      pending: orders.filter(o => o.paymentStatus === 'pending').length,
      partial: orders.filter(o => o.paymentStatus === 'partial').length,
    };

    return NextResponse.json({
      success: true,
      data: {
        tableId: params.id,
        date,
        summary: {
          totalOrders,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          averageOrderValue: Math.round(averageOrderValue * 100) / 100,
          totalItems,
          paymentStatus,
        },
        orders: orders.map(order => ({
          id: order.id,
          orderNumber: order.orderNumber,
          createdAt: order.createdAt,
          total: order.total,
          itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
          status: order.status,
          paymentStatus: order.paymentStatus,
          serverName: order.server?.name,
          items: order.items.map(item => ({
            name: item.menuItem?.name || 'Unknown Item',
            quantity: item.quantity,
            price: item.price,
            category: item.menuItem?.category,
          })),
        })),
      },
    });
  } catch (error) {
    console.error('Table orders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch table orders' },
      { status: 500 }
    );
  }
}
