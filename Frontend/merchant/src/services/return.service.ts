import { api } from '@/lib/api-client';
import type {
  ReturnPolicy,
  ReturnRequest,
  ReturnItem,
  CreateReturnPolicyInput,
  CreateReturnRequestInput,
  UpdateReturnStatusInput,
  ReturnStatus,
} from "@/types/phase1-commerce";

export const ReturnService = {
  // ============================================================================
  // Return Policy Management
  // ============================================================================

  async getOrCreatePolicy(storeId: string): Promise<ReturnPolicy> {
    const response = await api.get(`/returns/${storeId}/policy`);
    return response.data || {};
  },

  async updatePolicy(
    storeId: string,
    input: CreateReturnPolicyInput
  ): Promise<ReturnPolicy> {
    const response = await api.put(`/returns/${storeId}/policy`, input);
    return response.data || {};
  },

  // ============================================================================
  // Return Request Management
  // ============================================================================

  async createReturnRequest(
    storeId: string,
    merchantId: string,
    input: CreateReturnRequestInput
  ): Promise<ReturnRequest> {
    const response = await api.post('/returns', {
      storeId,
      merchantId,
      ...input,
    });
    return response.data || {};
  },

  async getReturnRequest(returnId: string): Promise<ReturnRequest | null> {
    const response = await api.get(`/returns/${returnId}`);
    return response.data || null;
  },

  async getReturnRequests(
    storeId: string,
    options: { status?: ReturnStatus; limit?: number; offset?: number; customerId?: string } = {}
  ): Promise<{ returns: ReturnRequest[]; total: number }> {
    const response = await api.get('/returns', {
      storeId,
      status: options.status,
      limit: options.limit || 50,
      offset: options.offset || 0,
      customerId: options.customerId,
    });
    return response.data || { returns: [], total: 0 };
  },

  async updateReturnStatus(
    returnId: string,
    userId: string,
    input: UpdateReturnStatusInput
  ): Promise<ReturnRequest> {
    const response = await api.patch(`/returns/${returnId}/status`, {
      status: input.status,
      userId,
      ...input,
    });
    return response.data || {};
  },

  async approveReturn(
    returnId: string,
    userId: string,
    shippingLabel?: string
  ): Promise<ReturnRequest> {
    const response = await api.post(`/returns/${returnId}/approve`, { userId, shippingLabel });
    return response.data || {};
  },

  async rejectReturn(
    returnId: string,
    userId: string,
    reason: string
  ): Promise<ReturnRequest> {
    const response = await api.post(`/returns/${returnId}/reject`, { userId, reason });
    return response.data || {};
  },

  async markAsReceived(returnId: string): Promise<ReturnRequest> {
    const response = await api.post(`/returns/${returnId}/received`);
    return response.data || {};
  },

  async inspectReturn(
    returnId: string,
    userId: string,
    itemConditions: Array<{ itemId: string; condition: string; isResellable: boolean }>,
    notes?: string
  ): Promise<ReturnRequest> {
    const response = await api.post(`/returns/${returnId}/inspect`, {
      userId,
      itemConditions,
      notes,
    });
    return response.data || {};
  },

  async completeReturn(
    returnId: string,
    refundMethod: string,
    exchangeOrderId?: string
  ): Promise<ReturnRequest> {
    const response = await api.post(`/returns/${returnId}/complete`, {
      refundMethod,
      exchangeOrderId,
    });
    return response.data || {};
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
    topReasons: Array<{ reason: string; count }>;
  }> {
    const response = await api.get(`/returns/${storeId}/analytics`);
    return response.data || {};
  },
};
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
