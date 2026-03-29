import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class ReturnService {
  constructor(private readonly db = prisma) {}

  async createRequest(
    storeId: string,
    orderId: string,
    customerId: string,
    payload: {
      reason: string;
      items?: Array<{ productId?: string; quantity?: number }>;
    }
  ) {
    const existing = await this.db.returnRequest.findFirst({
      where: { 
        orderId, 
        status: { not: 'CANCELLED' } 
      },
    });

    if (existing) {
      throw new Error('Return already active for this order');
    }

    const request = await this.db.returnRequest.create({
      data: {
        merchantId: storeId,
        storeId,
        orderId,
        customerId,
        reasonCode: 'OTHER',
        reasonText: payload.reason,
        resolutionType: 'REFUND',
        status: 'PENDING',
      },
    });

    logger.info('[ReturnService] Return request created', { 
      requestId: request.id, 
      orderId 
    });

    return request;
  }

  async getRequests(storeId: string) {
    return await this.db.returnRequest.findMany({
      where: { merchantId: storeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRequestById(requestId: string) {
    return await this.db.returnRequest.findUnique({
      where: { id: requestId },
    });
  }

  async updateStatus(
    requestId: string,
    status: string,
    actorId: string
  ) {
    const updates: Record<string, unknown> = {
      status,
    };

    if (status === 'APPROVED') {
      updates.approvedAt = new Date();
    }

    if (status === 'COMPLETED') {
      updates.completedAt = new Date();
    }

    const updated = await this.db.returnRequest.update({
      where: { id: requestId },
      data: updates,
    });

    logger.info('[ReturnService] Return status updated', {
      requestId,
      status,
      actorId,
    });

    return updated;
  }

  async cancelRequest(requestId: string) {
    return await this.db.returnRequest.update({
      where: { id: requestId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    });
  }
}
