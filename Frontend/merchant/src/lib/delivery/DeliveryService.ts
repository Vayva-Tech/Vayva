import { api } from '@/lib/api-client';

export interface DispatchResult {
  success: boolean;
  status: string;
  reason?: string;
  shipment?: any;
  providerJobId?: string;
  trackingUrl?: string;
}

export interface DeliveryReadinessResult {
  status: string;
  blockers: string[];
}

export class DeliveryService {
  /**
   * Check if order is ready for dispatch (calls backend API)
   */
  static async checkReadiness(orderId: string): Promise<DeliveryReadinessResult> {
    const result = await api.get(`/api/v1/delivery/${orderId}/readiness`);
    return result.data as DeliveryReadinessResult;
  }

  /**
   * Auto-dispatch order (calls backend API)
   */
  static async autoDispatch(orderId: string, channel: string): Promise<DispatchResult> {
    const result = await api.post(`/api/v1/delivery/${orderId}/dispatch`, { channel });
    return result.data as DispatchResult;
  }

  /**
   * Get delivery tracking info (calls backend API)
   */
  static async getTrackingInfo(shipmentId: string) {
    const result = await api.get(`/api/v1/delivery/shipments/${shipmentId}/tracking`);
    return result.data;
  }

  /**
   * Update delivery status (calls backend API)
   */
  static async updateStatus(shipmentId: string, status: string) {
    const result = await api.patch(`/api/v1/delivery/shipments/${shipmentId}/status`, { status });
    return result.data;
  }
}
