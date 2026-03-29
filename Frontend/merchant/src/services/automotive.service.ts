import { api } from '@/lib/api-client';
import type {
  VehicleHistoryReport,
  TradeInValuation,
  LeadScore,
  TradeInStatus,
} from '@/types/phase2-industry';

export class AutomotiveService {
  // ===== VEHICLE HISTORY =====

  async getVehicleHistory(vehicleId: string): Promise<VehicleHistoryReport | null> {
    const response = await api.get(`/electronics/vehicles/${vehicleId}/history`);
    return response.data || null;
  }

  async createVehicleHistory(
    data: Omit<VehicleHistoryReport, 'id' | 'createdAt'>
  ): Promise<VehicleHistoryReport> {
    const response = await api.post('/electronics/vehicle-history', {
      ...data,
    });
    return response.data || {};
  }

  // ===== TRADE-IN VALUATIONS =====

  async getTradeInValuations(
    storeId: string,
    status?: TradeInStatus
  ): Promise<TradeInValuation[]> {
    const response = await api.get(`/electronics/${storeId}/trade-ins`, {
      status,
    });
    return response.data || [];
  }

  async getCustomerTradeIns(customerId: string): Promise<TradeInValuation[]> {
    const response = await api.get(`/electronics/trade-ins/customer/${customerId}`);
    return response.data || [];
  }

  async createTradeInValuation(
    data: Omit<TradeInValuation, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'offerPrice'>
  ): Promise<TradeInValuation> {
    const response = await api.post('/electronics/trade-ins', {
      ...data,
    });
    return response.data || {};
  }
      storeId: valuation.storeId,
      customerId: valuation.customerId,
      make: valuation.make,
      model: valuation.model,
      year: valuation.year,
      mileage: valuation.mileage,
      condition: valuation.condition,
      vin: valuation.vin ?? undefined,
      estimatedValue: Number(valuation.estimatedValue),
      status: (valuation as any).status as TradeInStatus,
      vehicleId: valuation.vehicleId ?? undefined,
      notes: valuation.notes ?? undefined,
      createdAt: valuation.createdAt,
      updatedAt: valuation.updatedAt,
    };
  }

  async updateTradeInOffer(
    storeId: string,
    id: string,
    offerPrice: number,
    notes?: string
  ): Promise<TradeInValuation> {
    const response = await api.put(`/electronics/trade-ins/${id}/offer`, {
      storeId,
      offerPrice,
      notes,
    });
    return response.data || {};
  }

  async acceptTradeInOffer(storeId: string, id: string): Promise<TradeInValuation> {
    const response = await api.post(`/electronics/trade-ins/${id}/accept`);
    return response.data || {};
  }

  // ===== LEAD SCORING =====

  async getLeadScore(
    storeId: string,
    customerId: string
  ): Promise<LeadScore | null> {
    const response = await api.get(`/electronics/${storeId}/customers/${customerId}/lead-score`);
    return response.data || null;
  }

  async updateLeadScore(
    storeId: string,
    customerId: string,
    data: {
      inquiryType: LeadScore['inquiryType'];
      factors: LeadScore['factors'];
    }
  ): Promise<LeadScore> {
    const response = await api.put(`/electronics/${storeId}/customers/${customerId}/lead-score`, {
      storeId,
      ...data,
    });
    return response.data || {};
  }

  async getHighValueLeads(
    storeId: string,
    minScore: number = 70
  ): Promise<LeadScore[]> {
    const response = await api.get(`/electronics/${storeId}/leads/high-value`, {
      minScore,
    });
    return response.data || [];
  }

  // ===== MARKET PRICE ANALYSIS =====

  async getMarketPriceAnalysis(vehicleId: string): Promise<any> {
    const response = await api.get(`/electronics/vehicles/${vehicleId}/market-analysis`);
    return response.data || null;
  }
  }

  // ===== HELPERS =====

  private calculateLeadScore(factors: LeadScore['factors']): number {
    let score = 0;

    // Visit count weight: 20 points max
    score += Math.min(factors.visitCount * 5, 20);

    // Time on site weight: 20 points max
    score += Math.min(Math.floor(factors.timeOnSite / 60), 20);

    // Pages viewed weight: 30 points max
    score += Math.min(factors.pagesViewed * 2, 30);

    // Actions weight: 30 points max
    score += Math.min(factors.actionsTaken * 5, 30);

    return Math.min(score, 100);
  }
}

export const automotiveService = new AutomotiveService();
