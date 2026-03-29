import { prisma } from '@vayva/db';
import { logger } from '@vayva/shared';

/**
 * Return Service - Manages product return requests
 * 
 * Provides:
 * - Create return requests
 * - Query return requests by store
 * - Update return status with state transitions
 * - Track approval and completion timestamps
 */

export interface CreateReturnRequestPayload {
  customerId?: string;
  reason?: string;
  [key: string]: unknown;
}

export class ReturnService {
  /**
   * Create a new return request
   */
  async createRequest(
    storeId: string,
    orderId: string,
    customerPhone: string,
    payload: CreateReturnRequestPayload
  ): Promise<any> {
    try {
      // Check if exists
      const existing = await prisma.returnRequest.findFirst({
        where: {
          orderId: orderId,
          status: { not: 'CANCELLED' },
        },
      });

      if (existing) {
        throw new Error('Return already active for this order');
      }

      const request = await prisma.returnRequest.create({
        data: {
          merchantId: storeId,
          storeId: storeId,
          orderId: orderId,
          customerId: payload.customerId || '',
          // customerPhone mapped to notes or ignored (schema doesn't have it)
          // reason mapped to reasonText (schema has reasonCode enum and optional reasonText)
          reasonCode: 'OTHER', // Defaulting as mapping 'reason' string to enum is complex without more logic
          reasonText: payload.reason,
          resolutionType: 'REFUND', // Defaulting
          status: 'PENDING',
          // items and logistics removed as they do not exist in schema
        },
      });

      logger.info('[ReturnService] Return request created', {
        requestId: request.id,
        orderId,
        storeId,
      });

      return request;
    } catch (error) {
      logger.error('[ReturnService] Failed to create return request', {
        storeId,
        orderId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Get all return requests for a store
   */
  async getRequests(storeId: string): Promise<any[]> {
    try {
      const requests = await prisma.returnRequest.findMany({
        where: { merchantId: storeId },
        orderBy: { createdAt: 'desc' },
        // include: { items: true, logistics: true } // Removed
      });

      return requests;
    } catch (error) {
      logger.error('[ReturnService] Failed to fetch return requests', {
        storeId,
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  /**
   * Update return request status
   */
  async updateStatus(
    requestId: string,
    status: string,
    actorId: string,
    data?: unknown
  ): Promise<void> {
    try {
      // Logic for specific status transitions
      await prisma.$transaction(async (tx) => {
        await tx.returnRequest.update({
          where: { id: requestId },
          data: {
            status: status,
            approvedAt: status === 'APPROVED' ? new Date() : undefined,
            completedAt: status === 'COMPLETED' ? new Date() : undefined,
          },
        });
      });

      logger.info('[ReturnService] Return status updated', {
        requestId,
        status,
        actorId,
      });
    } catch (error) {
      logger.error('[ReturnService] Failed to update return status', {
        requestId,
        status,
        actorId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Get a single return request by ID
   */
  async getRequestById(requestId: string): Promise<any | null> {
    try {
      const request = await prisma.returnRequest.findUnique({
        where: { id: requestId },
      });

      return request;
    } catch (error) {
      logger.error('[ReturnService] Failed to fetch return request', {
        requestId,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  /**
   * Cancel a return request
   */
  async cancelRequest(requestId: string, reason?: string): Promise<void> {
    try {
      await prisma.returnRequest.update({
        where: { id: requestId },
        data: {
          status: 'CANCELLED',
          reasonText: reason,
          cancelledAt: new Date(),
        },
      });

      logger.info('[ReturnService] Return request cancelled', {
        requestId,
        reason,
      });
    } catch (error) {
      logger.error('[ReturnService] Failed to cancel return request', {
        requestId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Approve a return request
   */
  async approveRequest(requestId: string, notes?: string): Promise<void> {
    try {
      await prisma.returnRequest.update({
        where: { id: requestId },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
          ...(notes && { reasonText: notes }),
        },
      });

      logger.info('[ReturnService] Return request approved', {
        requestId,
      });
    } catch (error) {
      logger.error('[ReturnService] Failed to approve return request', {
        requestId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Complete a return request
   */
  async completeRequest(requestId: string, notes?: string): Promise<void> {
    try {
      await prisma.returnRequest.update({
        where: { id: requestId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          ...(notes && { reasonText: notes }),
        },
      });

      logger.info('[ReturnService] Return request completed', {
        requestId,
      });
    } catch (error) {
      logger.error('[ReturnService] Failed to complete return request', {
        requestId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Get return statistics for a store
   */
  async getReturnStats(storeId: string): Promise<{
    total: number;
    pending: number;
    approved: number;
    completed: number;
    cancelled: number;
  }> {
    try {
      const [total, pending, approved, completed, cancelled] = await Promise.all([
        prisma.returnRequest.count({ where: { merchantId: storeId } }),
        prisma.returnRequest.count({
          where: { merchantId: storeId, status: 'PENDING' },
        }),
        prisma.returnRequest.count({
          where: { merchantId: storeId, status: 'APPROVED' },
        }),
        prisma.returnRequest.count({
          where: { merchantId: storeId, status: 'COMPLETED' },
        }),
        prisma.returnRequest.count({
          where: { merchantId: storeId, status: 'CANCELLED' },
        }),
      ]);

      return {
        total,
        pending,
        approved,
        completed,
        cancelled,
      };
    } catch (error) {
      logger.error('[ReturnService] Failed to fetch return stats', {
        storeId,
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        total: 0,
        pending: 0,
        approved: 0,
        completed: 0,
        cancelled: 0,
      };
    }
  }
}
