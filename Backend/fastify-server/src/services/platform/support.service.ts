import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class SupportService {
  constructor(private readonly db = prisma) {}

  async getSupportTickets(storeId: string, filters?: any) {
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 20, 100);
    const where: any = { storeId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.priority) {
      where.priority = filters.priority;
    }

    const [tickets, total] = await Promise.all([
      this.db.supportTicket.findMany({
        where,
        include: {
          createdBy: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          assignee: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.db.supportTicket.count({ where }),
    ]);

    return {
      tickets,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async createSupportTicket(storeId: string, userId: string, ticketData: any) {
    const { title, description, priority, category } = ticketData;

    if (!title || !description) {
      throw new Error('Title and description are required');
    }

    const ticket = await this.db.supportTicket.create({
      data: {
        id: `ticket-${Date.now()}`,
        storeId,
        title,
        description,
        priority: priority || 'MEDIUM',
        category: category || 'GENERAL',
        status: 'OPEN',
        createdById: userId,
        createdAt: new Date(),
      },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    logger.info(`[Support] Created ticket ${ticket.id}`);
    return ticket;
  }

  async updateTicketStatus(ticketId: string, storeId: string, status: string) {
    const ticket = await this.db.supportTicket.findFirst({
      where: { id: ticketId },
    });

    if (!ticket || ticket.storeId !== storeId) {
      throw new Error('Ticket not found');
    }

    const updated = await this.db.supportTicket.update({
      where: { id: ticketId },
      data: {
        status,
        resolvedAt: status === 'RESOLVED' ? new Date() : null,
      },
    });

    logger.info(`[Support] Updated ticket ${ticketId} status to ${status}`);
    return updated;
  }

  async addTicketComment(ticketId: string, userId: string, comment: string) {
    const ticketComment = await this.db.ticketComment.create({
      data: {
        id: `comment-${Date.now()}`,
        ticketId,
        userId,
        content: comment,
        createdAt: new Date(),
      },
    });

    logger.info(`[Support] Added comment to ticket ${ticketId}`);
    return ticketComment;
  }
}
