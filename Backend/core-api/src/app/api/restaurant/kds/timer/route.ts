import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/restaurant/kds/timer
 * Real-time KDS ticket timer updates
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get('ticketId');

    if (ticketId) {
      // Get specific ticket timer
      const ticket = await prisma.kDSTicket.findUnique({
        where: { id: ticketId },
        include: {
          items: {
            select: {
              id: true,
              name: true,
              status: true,
              startedAt: true,
              completedAt: true,
            },
          },
        },
      });

      if (!ticket) {
        return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
      }

      const now = new Date();
      const elapsed = Math.floor((now.getTime() - ticket.createdAt.getTime()) / 1000);
      const targetTime = ticket.targetTime || 900; // 15 minutes default
      const isUrgent = elapsed > targetTime * 0.8;
      const isOverdue = elapsed > targetTime;

      return NextResponse.json({
        success: true,
        data: {
          ticketId: ticket.id,
          elapsedSeconds: elapsed,
          targetSeconds: targetTime,
          isUrgent,
          isOverdue,
          status: ticket.status,
          items: ticket.items.map(item => ({
            ...item,
            elapsedSeconds: item.startedAt 
              ? Math.floor((now.getTime() - item.startedAt.getTime()) / 1000)
              : 0,
          })),
        },
      });
    }

    // Get all active tickets with timers
    const tickets = await prisma.kDSTicket.findMany({
      where: {
        businessId: session.user.id,
        status: { in: ['pending', 'cooking', 'plating'] },
      },
      orderBy: { createdAt: 'asc' },
    });

    const now = new Date();
    const timers = tickets.map(ticket => {
      const elapsed = Math.floor((now.getTime() - ticket.createdAt.getTime()) / 1000);
      const targetTime = ticket.targetTime || 900;
      
      return {
        ticketId: ticket.id,
        orderNumber: ticket.orderNumber,
        elapsedSeconds: elapsed,
        targetSeconds: targetTime,
        isUrgent: elapsed > targetTime * 0.8,
        isOverdue: elapsed > targetTime,
        status: ticket.status,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        activeTickets: timers.length,
        overdueCount: timers.filter(t => t.isOverdue).length,
        urgentCount: timers.filter(t => t.isUrgent && !t.isOverdue).length,
        timers,
      },
    });
  } catch (error) {
    console.error('KDS timer error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch KDS timers' },
      { status: 500 }
    );
  }
}
