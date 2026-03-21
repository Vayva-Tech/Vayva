// @ts-nocheck
// Marketing Engine - Core business logic for marketing campaigns and promotions
import { apiJson } from "@/lib/api-client-shared";
import { logger } from "@vayva/shared";

export interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'whatsapp' | 'push' | 'social';
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
  audience: {
    segmentId?: string;
    filters?: Record<string, any>;
    manualList?: string[];
  };
  content: {
    subject?: string;
    body: string;
    templateId?: string;
  };
  schedule: {
    type: 'immediate' | 'scheduled' | 'recurring';
    dateTime?: string;
    timezone?: string;
    recurrence?: {
      frequency: 'daily' | 'weekly' | 'monthly';
      interval: number;
      endDate?: string;
    };
  };
  metrics?: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
  };
  budget?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Promotion {
  id: string;
  name: string;
  type: 'discount' | 'buy_x_get_y' | 'free_shipping' | 'bundle' | 'flash_sale';
  status: 'active' | 'scheduled' | 'expired' | 'disabled';
  discount: {
    type: 'percentage' | 'fixed_amount' | 'free_item';
    value: number;
    maxDiscount?: number;
  };
  applicability: {
    targetType: 'cart' | 'product' | 'category' | 'collection';
    targetIds?: string[];
    minimumAmount?: number;
    minimumQuantity?: number;
  };
  schedule: {
    startDate: string;
    endDate?: string;
    timezone: string;
  };
  usageLimits: {
    totalUses?: number;
    usesPerCustomer?: number;
    usedCount: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CustomerSegment {
  id: string;
  name: string;
  criteria: {
    filters: Array<{
      field: string;
      operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'between';
      value: any;
      value2?: any;
    }>;
    combination: 'and' | 'or';
  };
  customerCount: number;
  lastCalculatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export class MarketingEngine {
  // Campaign Management
  static async getAllCampaigns(filters?: {
    status?: Campaign['status'];
    type?: Campaign['type'];
    search?: string;
  }): Promise<Campaign[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.search) params.append('search', filters.search);

      const queryString = params.toString();
      const url = `/api/marketing/campaigns${queryString ? `?${queryString}` : ''}`;
      
      return await apiJson<Campaign[]>(url);
    } catch (error) {
      logger.error('[MARKETING_ENGINE_GET_CAMPAIGNS]', error);
      throw error;
    }
  }

  static async getCampaignById(id: string): Promise<Campaign> {
    try {
      return await apiJson<Campaign>(`/api/marketing/campaigns/${id}`);
    } catch (error) {
      logger.error('[MARKETING_ENGINE_GET_CAMPAIGN]', error);
      throw error;
    }
  }

  static async createCampaign(campaign: Omit<Campaign, 'id' | 'metrics' | 'createdAt' | 'updatedAt'>): Promise<Campaign> {
    try {
      return await apiJson<Campaign>('/api/marketing/campaigns', {
        method: 'POST',
        body: JSON.stringify(campaign),
      });
    } catch (error) {
      logger.error('[MARKETING_ENGINE_CREATE_CAMPAIGN]', error);
      throw error;
    }
  }

  static async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    try {
      return await apiJson<Campaign>(`/api/marketing/campaigns/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      logger.error('[MARKETING_ENGINE_UPDATE_CAMPAIGN]', error);
      throw error;
    }
  }

  static async deleteCampaign(id: string): Promise<void> {
    try {
      await apiJson(`/api/marketing/campaigns/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      logger.error('[MARKETING_ENGINE_DELETE_CAMPAIGN]', error);
      throw error;
    }
  }

  static async sendCampaign(id: string): Promise<Campaign> {
    try {
      return await apiJson<Campaign>(`/api/marketing/campaigns/${id}/send`, {
        method: 'POST',
      });
    } catch (error) {
      logger.error('[MARKETING_ENGINE_SEND_CAMPAIGN]', error);
      throw error;
    }
  }

  // Promotion Management
  static async getAllPromotions(filters?: {
    status?: Promotion['status'];
    type?: Promotion['type'];
    search?: string;
  }): Promise<Promotion[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.search) params.append('search', filters.search);

      const queryString = params.toString();
      const url = `/api/marketing/promotions${queryString ? `?${queryString}` : ''}`;
      
      return await apiJson<Promotion[]>(url);
    } catch (error) {
      logger.error('[MARKETING_ENGINE_GET_PROMOTIONS]', error);
      throw error;
    }
  }

  static async getPromotionById(id: string): Promise<Promotion> {
    try {
      return await apiJson<Promotion>(`/api/marketing/promotions/${id}`);
    } catch (error) {
      logger.error('[MARKETING_ENGINE_GET_PROMOTION]', error);
      throw error;
    }
  }

  static async createPromotion(promotion: Omit<Promotion, 'id' | 'usageLimits' | 'createdAt' | 'updatedAt'>): Promise<Promotion> {
    try {
      return await apiJson<Promotion>('/api/marketing/promotions', {
        method: 'POST',
        body: JSON.stringify({
          ...promotion,
          usageLimits: {
            usedCount: 0
          }
        }),
      });
    } catch (error) {
      logger.error('[MARKETING_ENGINE_CREATE_PROMOTION]', error);
      throw error;
    }
  }

  static async updatePromotion(id: string, updates: Partial<Promotion>): Promise<Promotion> {
    try {
      return await apiJson<Promotion>(`/api/marketing/promotions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      logger.error('[MARKETING_ENGINE_UPDATE_PROMOTION]', error);
      throw error;
    }
  }

  static async deletePromotion(id: string): Promise<void> {
    try {
      await apiJson(`/api/marketing/promotions/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      logger.error('[MARKETING_ENGINE_DELETE_PROMOTION]', error);
      throw error;
    }
  }

  // Customer Segments
  static async getAllSegments(): Promise<CustomerSegment[]> {
    try {
      return await apiJson<CustomerSegment[]>('/api/marketing/segments');
    } catch (error) {
      logger.error('[MARKETING_ENGINE_GET_SEGMENTS]', error);
      throw error;
    }
  }

  static async getSegmentById(id: string): Promise<CustomerSegment> {
    try {
      return await apiJson<CustomerSegment>(`/api/marketing/segments/${id}`);
    } catch (error) {
      logger.error('[MARKETING_ENGINE_GET_SEGMENT]', error);
      throw error;
    }
  }

  static async createSegment(segment: Omit<CustomerSegment, 'id' | 'customerCount' | 'lastCalculatedAt' | 'createdAt' | 'updatedAt'>): Promise<CustomerSegment> {
    try {
      return await apiJson<CustomerSegment>('/api/marketing/segments', {
        method: 'POST',
        body: JSON.stringify({
          ...segment,
          customerCount: 0,
          lastCalculatedAt: new Date().toISOString()
        }),
      });
    } catch (error) {
      logger.error('[MARKETING_ENGINE_CREATE_SEGMENT]', error);
      throw error;
    }
  }

  static async updateSegment(id: string, updates: Partial<CustomerSegment>): Promise<CustomerSegment> {
    try {
      return await apiJson<CustomerSegment>(`/api/marketing/segments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      logger.error('[MARKETING_ENGINE_UPDATE_SEGMENT]', error);
      throw error;
    }
  }

  static async deleteSegment(id: string): Promise<void> {
    try {
      await apiJson(`/api/marketing/segments/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      logger.error('[MARKETING_ENGINE_DELETE_SEGMENT]', error);
      throw error;
    }
  }

  static async calculateSegment(id: string): Promise<CustomerSegment> {
    try {
      return await apiJson<CustomerSegment>(`/api/marketing/segments/${id}/calculate`, {
        method: 'POST',
      });
    } catch (error) {
      logger.error('[MARKETING_ENGINE_CALCULATE_SEGMENT]', error);
      throw error;
    }
  }

  // Analytics
  static async getCampaignAnalytics(campaignId: string): Promise<{
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
    revenue: number;
    unsubscribed: number;
  }> {
    try {
      return await apiJson(`/api/marketing/campaigns/${campaignId}/analytics`);
    } catch (error) {
      logger.error('[MARKETING_ENGINE_CAMPAIGN_ANALYTICS]', error);
      throw error;
    }
  }

  static async getPromotionAnalytics(promotionId: string): Promise<{
    totalUses: number;
    revenueGenerated: number;
    ordersGenerated: number;
    averageOrderValue: number;
  }> {
    try {
      return await apiJson(`/api/marketing/promotions/${promotionId}/analytics`);
    } catch (error) {
      logger.error('[MARKETING_ENGINE_PROMOTION_ANALYTICS]', error);
      throw error;
    }
  }
}