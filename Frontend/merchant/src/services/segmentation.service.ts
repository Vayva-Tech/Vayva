import { api } from '@/lib/api-client';
import type { CustomerSegment, CustomerSegmentMembership, RFMCustomer, SegmentOverview, RFMScores, SegmentCriteria } from "@/types/intelligence";

export class CustomerSegmentationService {
  // RFM Analysis Methods
  static async performRFMAnalysis(storeId: string): Promise<RFMCustomer[]> {
    const response = await api.get(`/segmentation/${storeId}/rfm`);
    return response.data || [];
  }

  // Segment Management Methods
  static async getSegments(storeId: string): Promise<CustomerSegment[]> {
    const response = await api.get('/segmentation/segments', {
      storeId,
    });
    return response.data || [];
  }
  
  static async createSegment(
    storeId: string,
    name: string,
    criteria: SegmentCriteria,
    description?: string,
    color?: string,
    icon?: string
  ): Promise<CustomerSegment> {
    const response = await api.post('/segmentation/segments', {
      storeId,
      name,
      criteria,
      description,
      color,
      icon,
    });
    return response.data || {};
  }

  static async updateSegment(
    segmentId: string,
    updates: Partial<Omit<CustomerSegment, "id" | "storeId" | "createdAt" | "updatedAt">>
  ): Promise<CustomerSegment> {
    const response = await api.patch(`/segmentation/segments/${segmentId}`, updates);
    return response.data || {};
  }

  static async deleteSegment(segmentId: string): Promise<void> {
    await api.delete(`/segmentation/segments/${segmentId}`);
  }

  // Customer Segment Assignment
  // Customer Segment Assignment
  static async assignCustomerToSegment(
    customerId: string,
    segmentId: string,
    score: number
  ): Promise<CustomerSegmentMembership> {
    const response = await api.post('/segmentation/memberships', {
      customerId,
      segmentId,
      score,
    });
    return response.data || {};
  }

  static async removeCustomerFromSegment(
    customerId: string,
    segmentId: string
  ): Promise<void> {
    await api.delete('/segmentation/memberships', {
      params: {
        customerId,
        segmentId,
      },
    });
  }

  static async getCustomerSegments(customerId: string): Promise<CustomerSegment[]> {
    const response = await api.get('/segmentation/customer-segments', {
      customerId,
    });
    return response.data || [];
  }

  static async getSegmentCustomers(segmentId: string): Promise<string[]> {
    const response = await api.get(`/segmentation/segments/${segmentId}/customers`);
    return response.data || [];
  }

  // Predefined Segments
  static async createPredefinedSegments(storeId: string): Promise<CustomerSegment[]> {
    const response = await api.post('/segmentation/predefined', {
      storeId,
    });
    return response.data || [];
  }

  // Overview and Stats
  static async getSegmentOverview(storeId: string): Promise<SegmentOverview> {
    const response = await api.get(`/segmentation/${storeId}/overview`);
    return response.data || {};
  }

  // Helper Methods - RFM scoring moved to backend
  private static normalizeRecencyScore(daysSinceLastOrder: number): number {
    console.warn('This method should not be called directly - use performRFMAnalysis API');
    return 0;
  }

  private static normalizeFrequencyScore(totalOrders: number): number {
    console.warn('This method should not be called directly - use performRFMAnalysis API');
    return 0;
  }

  private static normalizeMonetaryScore(avgOrderValue: number): number {
    console.warn('This method should not be called directly - use performRFMAnalysis API');
    return 0;
  }

  private static matchesCriteria(customer: RFMCustomer, criteria: SegmentCriteria): boolean {
    console.warn('This method should not be called directly - handled by backend');
    return false;
  }

  private static calculateRFMScore(customer: RFMCustomer): number {
    console.warn('This method should not be called directly - handled by backend');
    return 0;
  }
}
