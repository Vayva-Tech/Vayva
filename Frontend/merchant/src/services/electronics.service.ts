import { api } from '@/lib/api-client';
import type {
  WarrantyRecord,
  ExtendedProtectionPlan,
  WarrantyStatus,
} from '@/types/phase2-industry';

export class ElectronicsService {
  // ===== WARRANTY RECORDS =====

  async getWarrantyByOrder(orderId: string): Promise<WarrantyRecord[]> {
    const response = await api.get(`/electronics/warranties/order/${orderId}`);
    return response.data || [];
  }

  async getCustomerWarranties(customerId: string): Promise<WarrantyRecord[]> {
    const response = await api.get(`/electronics/warranties/customer/${customerId}`);
    return response.data || [];
  }

  async createWarranty(
    data: Omit<WarrantyRecord, 'id' | 'createdAt' | 'status' | 'renewalOffered'>
  ): Promise<WarrantyRecord> {
    const response = await api.post('/electronics/warranties', {
      ...data,
    });
    return response.data || {};
  }

  async updateWarrantyStatus(
    storeId: string,
    id: string,
    status: WarrantyStatus
  ): Promise<WarrantyRecord> {
    const response = await api.put(`/electronics/warranties/${id}/status`, {
      storeId,
      status,
    });
    return response.data || {};
  }

  async getExpiringWarranties(
    storeId: string,
    daysThreshold: number = 30
  ): Promise<WarrantyRecord[]> {
    const response = await api.get(`/electronics/${storeId}/warranties/expiring`, {
      daysThreshold,
    });
    return response.data || [];
  }
      warrantyType: w.warrantyType as any,
      startDate: w.startDate,
      endDate: w.endDate,
      durationMonths: w.durationMonths,
      status: (w as any).status as WarrantyStatus,
      renewalOffered: w.renewalOffered,
      createdAt: w.createdAt,
    }));
  }

  // ===== EXTENDED PROTECTION PLANS =====

  async getProtectionPlans(storeId: string): Promise<ExtendedProtectionPlan[]> {
    const response = await api.get(`/electronics/${storeId}/protection-plans`);
    return response.data || [];
  }

  async createProtectionPlan(
    storeId: string,
    data: Omit<ExtendedProtectionPlan, 'id' | 'storeId' | 'createdAt' | 'updatedAt' | 'isActive'>
  ): Promise<ExtendedProtectionPlan> {
    const response = await api.post('/electronics/protection-plans', {
      storeId,
      ...data,
    });
    return response.data || {};
  }

  // ===== WARRANTY CLAIMS =====

  async createWarrantyClaim(
    warrantyId: string,
    data: {
      issue: string;
      description?: string;
    }
  ): Promise<any> {
    const response = await api.post(`/electronics/warranties/${warrantyId}/claims`, {
      warrantyId,
      ...data,
    });
    return response.data || {};
  }

  async getWarrantyClaims(warrantyId: string): Promise<any[]> {
    const response = await api.get(`/electronics/warranties/${warrantyId}/claims`);
    return response.data || [];
  }

  // ===== RENEWAL OFFERS =====

  async markRenewalOffered(storeId: string, id: string): Promise<WarrantyRecord> {
    const response = await api.post(`/electronics/warranties/${id}/mark-renewal-offered`, {
      storeId,
    });
    return response.data || {};
  }
}

export const electronicsService = new ElectronicsService();
