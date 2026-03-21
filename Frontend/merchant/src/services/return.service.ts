import { db } from "@/lib/db";
import { Prisma } from "@vayva/db";
import type {
  ReturnPolicy,
  ReturnRequest,
  ReturnItem,
  CreateReturnPolicyInput,
  CreateReturnRequestInput,
  UpdateReturnStatusInput,
  ReturnStatus,
} from "@/types/phase1-commerce";
function toNumber(d: Prisma.Decimal | number): number {
  return typeof d === "number" ? d : d.toNumber();
}

export const ReturnService = {
  // ============================================================================
  // Return Policy Management
  // ============================================================================

  async getOrCreatePolicy(storeId: string): Promise<ReturnPolicy> {
    let policy = await db.returnPolicy?.findUnique({
      where: { storeId },
    });

    if (!policy) {
      policy = await db.returnPolicy?.create({
        data: {
          storeId,
          allowReturns: true,
          windowDays: 30,
          allowExchanges: true,
          allowStoreCredit: true,
          restockingFeePercent: 0,
          nonReturnableCategories: [],
          finalSaleTags: [],
          requireOriginalPackaging: false,
        },
      });
    }

    return this.mapReturnPolicy(policy);
  },

  async updatePolicy(
    storeId: string,
    input: CreateReturnPolicyInput
  ): Promise<ReturnPolicy> {
    const policy = await db.returnPolicy?.upsert({
      where: { storeId },
      create: {
        storeId,
        allowReturns: input.allowReturns ?? true,
        windowDays: input.windowDays ?? 30,
        allowExchanges: input.allowExchanges ?? true,
        allowStoreCredit: input.allowStoreCredit ?? true,
        restockingFeePercent: input.restockingFeePercent ?? 0,
        freeReturnsThreshold: input.freeReturnsThreshold,
        nonReturnableCategories: input.nonReturnableCategories ?? [],
        finalSaleTags: input.finalSaleTags ?? [],
        requireOriginalPackaging: input.requireOriginalPackaging ?? false,
      },
      update: {
        ...(input.allowReturns !== undefined && { allowReturns: input.allowReturns }),
        ...(input.windowDays !== undefined && { windowDays: input.windowDays }),
        ...(input.allowExchanges !== undefined && { allowExchanges: input.allowExchanges }),
        ...(input.allowStoreCredit !== undefined && { allowStoreCredit: input.allowStoreCredit }),
        ...(input.restockingFeePercent !== undefined && { restockingFeePercent: input.restockingFeePercent }),
        ...(input.freeReturnsThreshold !== undefined && { freeReturnsThreshold: input.freeReturnsThreshold }),
        ...(input.nonReturnableCategories !== undefined && { nonReturnableCategories: input.nonReturnableCategories }),
        ...(input.finalSaleTags !== undefined && { finalSaleTags: input.finalSaleTags }),
        ...(input.requireOriginalPackaging !== undefined && { requireOriginalPackaging: input.requireOriginalPackaging }),
      },
    });

    return this.mapReturnPolicy(policy);
  },

  // ============================================================================
  // Return Request Management
  // ============================================================================

  async createReturnRequest(
    storeId: string,
    merchantId: string,
    input: CreateReturnRequestInput
  ): Promise<ReturnRequest> {
    // Validate return window
    const policy = await this.getOrCreatePolicy(storeId);
    if (!policy.allowReturns) {
      throw new Error("Returns are not allowed for this store");
    }

    // Calculate totals
    const totalRefund = input.items?.reduce((sum: number, item: any) => sum + item.refundPrice * item.quantity, 0);
    const restockingFee = totalRefund * (policy.restockingFeePercent / 100);

    const returnRequest = await db.returnRequest?.create({
      data: {
        storeId,
        merchantId,
        orderId: input.orderId,
        customerId: input.customerId,
        reasonCode: input.reasonCode,
        reasonText: input.reasonText,
        resolutionType: input.resolutionType,
        status: "PENDING" as any,
        refundAmount: totalRefund - restockingFee,
        restockingFee,
        items: {
          create: input.items?.map((item: any) => ({
            orderItemId: item.orderItemId,
            productId: item.productId,
            quantity: item.quantity,
            reasonCode: item.reasonCode,
            refundPrice: item.refundPrice,
            restockingFee: item.refundPrice * (policy.restockingFeePercent / 100),
          })),
        },
      },
      include: { items: true },
    });

    return this.mapReturnRequest(returnRequest);
  },

  async getReturnRequest(returnId: string): Promise<ReturnRequest | null> {
    const returnRequest = await db.returnRequest?.findUnique({
      where: { id: returnId },
      include: { items: true },
    });

    if (!returnRequest) return null;
    return this.mapReturnRequest(returnRequest);
  },

  async getReturnRequests(
    storeId: string,
    options: { status?: ReturnStatus; limit?: number; offset?: number; customerId?: string } = {}
  ): Promise<{ returns: ReturnRequest[]; total: number }> {
    const where: Prisma.ReturnRequestWhereInput = { storeId };
    if ((options as any).status) {where.status = (options as any).status;
    }
    if (options.customerId) {
      where.customerId = options.customerId;
    }

    const [returns, total] = await Promise.all([
      db.returnRequest?.findMany({
        where,
        take: options.limit || 50,
        skip: options.offset || 0,
        orderBy: { createdAt: "desc" },
        include: { items: true },
      }),
      db.returnRequest?.count({ where }),
    ]);

    return { returns: returns.map((r: any) => this.mapReturnRequest(r as any)), total };
  },

  async updateReturnStatus(
    returnId: string,
    userId: string,
    input: UpdateReturnStatusInput
  ): Promise<ReturnRequest> {
    const data: Prisma.ReturnRequestUpdateInput = {
      status: (input as any).status,
    };

    // Update fields based on status change
    if ((input as any).status === "APPROVED") {
      data.approvedBy = userId;
      data.approvedAt = new Date();
    }

    if ((input as any).status === "IN_TRANSIT") {
      data.shippingLabel = input.shippingLabel;
      data.trackingNumber = input.trackingNumber;
    }

    if ((input as any).status === "RECEIVED") {
      data.receivedAt = new Date();
    }

    if ((input as any).status === "INSPECTED") {
      data.inspectedAt = new Date();
      data.inspectedBy = userId;
      data.inspectionNotes = input.inspectionNotes;
    }

    if ((input as any).status === "COMPLETED") {
      data.refundAmount = input.refundAmount;
      data.refundMethod = input.refundMethod;
      data.refundIssuedAt = new Date();
      data.exchangeOrderId = input.exchangeOrderId;
      data.restockingFee = input.restockingFee;
      data.returnShippingCost = input.returnShippingCost;
    }

    const returnRequest = await db.returnRequest?.update({
      where: { id: returnId },
      data,
      include: { items: true },
    });

    return this.mapReturnRequest(returnRequest);
  },

  async approveReturn(
    returnId: string,
    userId: string,
    shippingLabel?: string
  ): Promise<ReturnRequest> {
    return this.updateReturnStatus(returnId, userId, {
      status: "APPROVED",
      shippingLabel,
    });
  },

  async rejectReturn(
    returnId: string,
    userId: string,
    reason: string
  ): Promise<ReturnRequest> {
    const returnRequest = await db.returnRequest?.update({
      where: { id: returnId },
      data: {
        status: "REJECTED",
        inspectedBy: userId,
        inspectedAt: new Date(),
        inspectionNotes: reason,
      },
      include: { items: true },
    });

    return this.mapReturnRequest(returnRequest);
  },

  async markAsReceived(returnId: string): Promise<ReturnRequest> {
    const returnRequest = await db.returnRequest?.update({
      where: { id: returnId },
      data: {
        status: "RECEIVED",
        receivedAt: new Date(),
      },
      include: { items: true },
    });

    return this.mapReturnRequest(returnRequest);
  },

  async inspectReturn(
    returnId: string,
    userId: string,
    itemConditions: Array<{ itemId: string; condition: string; isResellable: boolean }>,
    notes?: string
  ): Promise<ReturnRequest> {
    // Update item conditions
    await Promise.all(
      itemConditions.map((item: any) =>
        db.returnItem?.update({
          where: { id: item.itemId },
          data: {
            condition: item.condition,
            isResellable: item.isResellable,
          },
        })
      )
    );

    const returnRequest = await db.returnRequest?.update({
      where: { id: returnId },
      data: {
        status: "INSPECTED",
        inspectedAt: new Date(),
        inspectedBy: userId,
        inspectionNotes: notes,
      },
      include: { items: true },
    });

    return this.mapReturnRequest(returnRequest);
  },

  async completeReturn(
    returnId: string,
    refundMethod: string,
    exchangeOrderId?: string
  ): Promise<ReturnRequest> {
    const returnRequest = await db.returnRequest?.findUnique({
      where: { id: returnId },
      include: { items: true },
    });

    if (!returnRequest) {
      throw new Error("Return request not found");
    }

    // Calculate final refund amount based on item conditions
    let totalRefund = 0;
    for (const item of returnRequest.items) {
      if (item.isResellable) {
        totalRefund += toNumber(item.refundPrice) * item.quantity;
      } else {
        // Apply restocking fee for non-resellable items
        totalRefund += toNumber(item.refundPrice) * item.quantity * 0.5;
      }
    }

    const updated = await db.returnRequest?.update({
      where: { id: returnId },
      data: {
        status: "COMPLETED",
        refundAmount: totalRefund - toNumber(returnRequest.restockingFee),
        refundMethod,
        refundIssuedAt: new Date(),
        exchangeOrderId,
      },
      include: { items: true },
    });

    return this.mapReturnRequest(updated);
  },

  // ============================================================================
  // Analytics
  // ============================================================================

  async getAnalytics(storeId: string): Promise<{
    totalReturns: number;
    returnsByStatus: Record<ReturnStatus, number>;
    totalRefundAmount: number;
    averageProcessingTime: number;
    returnRate: number;
    topReasons: Array<{ reason: string; count: number }>;
  }> {
    const [
      totalReturns,
      returnsByStatus,
      refundAgg,
      processingAgg,
    ] = await Promise.all([
      db.returnRequest?.count({ where: { storeId } }),
      db.returnRequest?.groupBy({
        by: ["status"],
        where: { storeId },
        _count: { id: true },
      }),
      db.returnRequest?.aggregate({
        where: { storeId, status: "COMPLETED" },
        _sum: { refundAmount: true },
      }),
      db.returnRequest?.findMany({
        where: { storeId, status: "COMPLETED", approvedAt: { not: null }, refundIssuedAt: { not: null } },
        select: { approvedAt: true, refundIssuedAt: true },
      }),
    ]);

    // Calculate average processing time
    let totalProcessingTime = 0;
    for (const r of processingAgg) {
      if (r.approvedAt && r.refundIssuedAt) {
        totalProcessingTime += r.refundIssuedAt?.getTime() - r.approvedAt?.getTime();
      }
    }
    const avgProcessingTime = processingAgg.length > 0
      ? totalProcessingTime / processingAgg.length / (24 * 60 * 60 * 1000) // Convert to days
      : 0;

    // Get top reasons
    const reasons = await db.returnRequest?.groupBy({
      by: ["reasonCode"],
      where: { storeId },
      _count: { id: true },
    });

    return {
      totalReturns,
      returnsByStatus: returnsByStatus.reduce((acc: Record<ReturnStatus, number>, item: any) => {
        acc[item.status as ReturnStatus] = item._count?.id;
        return acc;
      }, {} as Record<ReturnStatus, number>),
      totalRefundAmount: toNumber(refundAgg._sum?.refundAmount || 0),
      averageProcessingTime: avgProcessingTime,
      returnRate: 0, // Would need total orders to calculate
      topReasons: reasons.map((r: any) => ({ reason: r.reasonCode, count: r._count?.id })),
    };
  },

  // ============================================================================
  // Helper Methods
  // ============================================================================

  mapReturnPolicy(db: Prisma.ReturnPolicyGetPayload<object>): ReturnPolicy {
    return {
      id: db.id,
      storeId: db.storeId,
      allowReturns: db.allowReturns,
      windowDays: db.windowDays,
      allowExchanges: db.allowExchanges,
      allowStoreCredit: db.allowStoreCredit,
      restockingFeePercent: toNumber(db.restockingFeePercent),
      freeReturnsThreshold: db.freeReturnsThreshold ? toNumber(db.freeReturnsThreshold) : undefined,
      nonReturnableCategories: db.nonReturnableCategories,
      finalSaleTags: db.finalSaleTags,
      requireOriginalPackaging: db.requireOriginalPackaging,
      createdAt: db.createdAt?.toISOString(),
      updatedAt: db.updatedAt?.toISOString(),
    };
  },

  mapReturnRequest(db: Prisma.ReturnRequestGetPayload<{ include: { items: true } }>): ReturnRequest {
    return {
      id: db.id,
      storeId: db.storeId,
      merchantId: db.merchantId,
      orderId: db.orderId,
      customerId: db.customerId,
      reasonCode: db.reasonCode,
      reasonText: db.reasonText || undefined,
      resolutionType: db.resolutionType,
      status: (db as any).status,
      shippingLabel: db.shippingLabel || undefined,
      trackingNumber: db.trackingNumber || undefined,
      approvedBy: db.approvedBy || undefined,
      approvedAt: db.approvedAt?.toISOString(),
      receivedAt: db.receivedAt?.toISOString(),
      inspectedAt: db.inspectedAt?.toISOString(),
      inspectedBy: db.inspectedBy || undefined,
      inspectionNotes: db.inspectionNotes || undefined,
      refundAmount: db.refundAmount ? toNumber(db.refundAmount) : undefined,
      refundMethod: db.refundMethod || undefined,
      refundIssuedAt: db.refundIssuedAt?.toISOString(),
      exchangeOrderId: db.exchangeOrderId || undefined,
      returnShippingCost: toNumber(db.returnShippingCost),
      restockingFee: toNumber(db.restockingFee),
      createdAt: db.createdAt?.toISOString(),
      updatedAt: db.updatedAt?.toISOString(),
      items: db.items?.map((item: any) => this.mapReturnItem(item as any)),
    };
  },

  mapReturnItem(db: Prisma.ReturnItemGetPayload<object>): ReturnItem {
    return {
      id: db.id,
      returnId: db.returnId,
      orderItemId: db.orderItemId,
      productId: db.productId,
      quantity: db.quantity,
      reasonCode: db.reasonCode,
      condition: db.condition,
      refundPrice: toNumber(db.refundPrice),
      isResellable: db.isResellable,
      restockingFee: toNumber(db.restockingFee),
    };
  },
};
