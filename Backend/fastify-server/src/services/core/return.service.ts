import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class ReturnService {
  constructor(private readonly db = prisma) {}

  async getReturns(storeId: string, filters: any) {
    const limit = Math.min(filters.limit || 50, 100);
    const offset = filters.offset || 0;

    const where: any = { storeId };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.orderId) {
      where.orderId = filters.orderId;
    }

    if (filters.customerId) {
      where.customerId = filters.customerId;
    }

    const [returns, total] = await Promise.all([
      this.db.returnRequest.findMany({
        where,
        include: {
          items: true,
        },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.db.returnRequest.count({ where }),
    ]);

    return {
      returns: returns.map((r) => ({
        id: r.id,
        orderId: r.orderId,
        orderNumber: null,
        customerId: r.customerId,
        customer: null,
        reasonCode: r.reasonCode,
        reasonText: r.reasonText,
        resolutionType: r.resolutionType,
        status: r.status,
        shippingLabel: r.shippingLabel,
        trackingNumber: r.trackingNumber,
        approvedBy: r.approvedBy,
        approvedAt: r.approvedAt,
        receivedAt: r.receivedAt,
        inspectedAt: r.inspectedAt,
        inspectedBy: r.inspectedBy,
        inspectionNotes: r.inspectionNotes,
        refundAmount: r.refundAmount,
        refundMethod: r.refundMethod,
        refundIssuedAt: r.refundIssuedAt,
        exchangeOrderId: r.exchangeOrderId,
        returnShippingCost: r.returnShippingCost,
        restockingFee: r.restockingFee,
        items: r.items.map((item) => ({
          id: item.id,
          orderItemId: item.orderItemId,
          product: null,
          variant: null,
          quantity: item.quantity,
          reasonCode: item.reasonCode,
          condition: item.condition,
          refundPrice: item.refundPrice,
          isResellable: item.isResellable,
          restockingFee: item.restockingFee,
        })),
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
      pagination: {
        total,
        limit,
        offset,
      },
    };
  }

  async createReturn(storeId: string, returnData: any) {
    const {
      orderId,
      customerId,
      reasonCode,
      reasonText,
      resolutionType = 'REFUND',
      items,
    } = returnData;

    // Verify order exists
    const order = await this.db.order.findFirst({
      where: { id: orderId, storeId },
      include: { items: true },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Verify items
    for (const item of items) {
      const orderItem = order.items.find((oi) => oi.id === item.orderItemId);
      if (!orderItem) {
        throw new Error(`Order item ${item.orderItemId} not found`);
      }
      if (item.quantity > orderItem.quantity) {
        throw new Error(`Return quantity exceeds order quantity`);
      }
    }

    // Create return in transaction
    const result = await this.db.$transaction(async (tx) => {
      const returnRequest = await tx.returnRequest.create({
        data: {
          storeId,
          merchantId: storeId,
          orderId,
          customerId,
          reasonCode,
          reasonText: reasonText || null,
          resolutionType,
          status: 'REQUESTED',
        },
      });

      const returnItems = await Promise.all(
        items.map(async (item: any) => {
          const orderItem = order.items.find((oi) => oi.id === item.orderItemId);
          const refundPrice = orderItem?.price || 0;

          return tx.returnItem.create({
            data: {
              returnId: returnRequest.id,
              orderItemId: item.orderItemId,
              productId: orderItem?.productId || '',
              quantity: item.quantity,
              reasonCode: item.reasonCode,
              refundPrice,
            },
          });
        })
      );

      return { returnRequest, returnItems };
    });

    logger.info(`[Return] Created return request ${result.returnRequest.id}`);
    return result;
  }

  async processReturnAction(storeId: string, userId: string, returnId: string, action: string, data?: any) {
    const returnRequest = await this.db.returnRequest.findFirst({
      where: { id: returnId, storeId },
      include: { items: true },
    });

    if (!returnRequest) {
      throw new Error('Return request not found');
    }

    switch (action) {
      case 'approve':
        if (returnRequest.status !== 'REQUESTED') {
          throw new Error('Can only approve requested returns');
        }
        return await this.db.returnRequest.update({
          where: { id: returnId },
          data: {
            status: 'APPROVED',
            approvedBy: userId,
            approvedAt: new Date(),
            shippingLabel: data?.shippingLabel,
            trackingNumber: data?.trackingNumber,
          },
        });

      case 'reject':
        if (returnRequest.status !== 'REQUESTED') {
          throw new Error('Can only reject requested returns');
        }
        return await this.db.returnRequest.update({
          where: { id: returnId },
          data: {
            status: 'REJECTED',
            inspectionNotes: data?.notes || returnRequest.inspectionNotes,
          },
        });

      case 'mark_received':
        if (returnRequest.status !== 'IN_TRANSIT' && returnRequest.status !== 'APPROVED') {
          throw new Error('Return must be shipped before receiving');
        }
        return await this.db.returnRequest.update({
          where: { id: returnId },
          data: {
            status: 'RECEIVED',
            receivedAt: new Date(),
          },
        });

      case 'inspect': {
        if (returnRequest.status !== 'RECEIVED') {
          throw new Error('Return must be received before inspection');
        }

        if (data?.itemConditions) {
          await Promise.all(
            data.itemConditions.map((item: any) =>
              this.db.returnItem.update({
                where: { id: item.itemId },
                data: {
                  condition: item.condition,
                  isResellable: item.isResellable,
                  restockingFee: item.restockingFee || 0,
                },
              })
            )
          );
        }

        const updatedItems = await this.db.returnItem.findMany({
          where: { returnId },
        });
        const totalRestockingFee = updatedItems.reduce(
          (sum, item) => sum + Number(item.restockingFee),
          0
        );

        return await this.db.returnRequest.update({
          where: { id: returnId },
          data: {
            status: 'INSPECTED',
            inspectedAt: new Date(),
            inspectedBy: userId,
            inspectionNotes: data?.inspectionNotes,
            restockingFee: totalRestockingFee,
          },
        });
      }

      case 'refund': {
        if (returnRequest.status !== 'INSPECTED') {
          throw new Error('Return must be inspected before refund');
        }
        if (!data?.refundAmount) {
          throw new Error('Refund amount is required');
        }
        return await this.db.returnRequest.update({
          where: { id: returnId },
          data: {
            status: 'COMPLETED',
            refundAmount: data.refundAmount,
            refundMethod: data.refundMethod || 'original',
            refundIssuedAt: new Date(),
          },
        });
      }

      case 'exchange': {
        if (returnRequest.status !== 'INSPECTED') {
          throw new Error('Return must be inspected before exchange');
        }
        if (!data?.exchangeOrderId) {
          throw new Error('Exchange order ID is required');
        }
        return await this.db.returnRequest.update({
          where: { id: returnId },
          data: {
            status: 'COMPLETED',
            exchangeOrderId: data.exchangeOrderId,
          },
        });
      }

      default:
        throw new Error('Invalid action');
    }
  }
}
