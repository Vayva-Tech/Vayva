import { prisma } from '@/lib/prisma';
import type {
  VehicleHistoryReport,
  TradeInValuation,
  LeadScore,
  TradeInStatus,
} from '@/types/phase2-industry';

export class AutomotiveService {
  // ===== VEHICLE HISTORY =====

  async getVehicleHistory(vehicleId: string): Promise<VehicleHistoryReport | null> {
    const history = await prisma.vehicleHistoryReport?.findUnique({
      where: { vehicleId },
    });

    if (!history) return null;

    return {
      id: history.id,
      vehicleId: history.vehicleId,
      vin: history.vin,
      reportProvider: history.reportProvider,
      reportUrl: history.reportUrl,
      accidents: history.accidents,
      owners: history.owners,
      serviceRecords: history.serviceRecords,
      lastUpdated: history.lastUpdated,
      isClean: history.isClean,
      redFlags: history.redFlags,
      createdAt: history.createdAt,
    };
  }

  async createVehicleHistory(
    data: Omit<VehicleHistoryReport, 'id' | 'createdAt'>
  ): Promise<VehicleHistoryReport> {
    const history = await prisma.vehicleHistoryReport?.create({
      data: {
        vehicleId: data.vehicleId,
        vin: data.vin,
        reportProvider: data.reportProvider,
        reportUrl: data.reportUrl,
        accidents: data.accidents,
        owners: data.owners,
        serviceRecords: data.serviceRecords,
        lastUpdated: data.lastUpdated,
        isClean: data.isClean,
        redFlags: data.redFlags,
      },
    });

    return {
      id: history.id,
      vehicleId: history.vehicleId,
      vin: history.vin,
      reportProvider: history.reportProvider,
      reportUrl: history.reportUrl,
      accidents: history.accidents,
      owners: history.owners,
      serviceRecords: history.serviceRecords,
      lastUpdated: history.lastUpdated,
      isClean: history.isClean,
      redFlags: history.redFlags,
      createdAt: history.createdAt,
    };
  }

  // ===== TRADE-IN VALUATIONS =====

  async getTradeInValuations(
    storeId: string,
    status?: TradeInStatus
  ): Promise<TradeInValuation[]> {
    const valuations = await prisma.tradeInValuation?.findMany({
      where: {
        storeId,
        ...(status && { status }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return valuations.map((v: any) => ({
      id: v.id,
      storeId: v.storeId,
      customerId: v.customerId,
      make: v.make,
      model: v.model,
      year: v.year,
      mileage: v.mileage,
      condition: v.condition,
      vin: v.vin ?? undefined,
      estimatedValue: Number(v.estimatedValue),
      offerPrice: v.offerPrice ? Number(v.offerPrice) : undefined,
      status: (v as any).status as TradeInStatus,
      vehicleId: v.vehicleId ?? undefined,
      notes: v.notes ?? undefined,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    }));
  }

  async getCustomerTradeIns(customerId: string): Promise<TradeInValuation[]> {
    const valuations = await prisma.tradeInValuation?.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });

    return valuations.map((v: any) => ({
      id: v.id,
      storeId: v.storeId,
      customerId: v.customerId,
      make: v.make,
      model: v.model,
      year: v.year,
      mileage: v.mileage,
      condition: v.condition,
      vin: v.vin ?? undefined,
      estimatedValue: Number(v.estimatedValue),
      offerPrice: v.offerPrice ? Number(v.offerPrice) : undefined,
      status: (v as any).status as TradeInStatus,
      vehicleId: v.vehicleId ?? undefined,
      notes: v.notes ?? undefined,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    }));
  }

  async createTradeInValuation(
    data: Omit<TradeInValuation, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'offerPrice'>
  ): Promise<TradeInValuation> {
    const valuation = await prisma.tradeInValuation?.create({
      data: {
        storeId: data.storeId,
        customerId: data.customerId,
        make: data.make,
        model: data.model,
        year: data.year,
        mileage: data.mileage,
        condition: data.condition,
        vin: data.vin,
        estimatedValue: data.estimatedValue,
        status: 'pending',
        vehicleId: data.vehicleId,
        notes: data.notes,
      },
    });

    return {
      id: valuation.id,
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
    await prisma.tradeInValuation?.updateMany({
      where: { id, storeId },
      data: {
        offerPrice,
        status: 'reviewed',
        notes,
      },
    });
    const valuation = await prisma.tradeInValuation?.findFirst({
      where: { id, storeId },
    });
    if (!valuation) {
      throw new Error('Trade-in valuation not found');
    }

    return {
      id: valuation.id,
      storeId: valuation.storeId,
      customerId: valuation.customerId,
      make: valuation.make,
      model: valuation.model,
      year: valuation.year,
      mileage: valuation.mileage,
      condition: valuation.condition,
      vin: valuation.vin ?? undefined,
      estimatedValue: Number(valuation.estimatedValue),
      offerPrice: valuation.offerPrice ? Number(valuation.offerPrice) : undefined,
      status: (valuation as any).status as TradeInStatus,
      vehicleId: valuation.vehicleId ?? undefined,
      notes: valuation.notes ?? undefined,
      createdAt: valuation.createdAt,
      updatedAt: valuation.updatedAt,
    };
  }

  async acceptTradeInOffer(storeId: string, id: string): Promise<TradeInValuation> {
    await prisma.tradeInValuation?.updateMany({
      where: { id, storeId },
      data: { status: 'accepted' },
    });
    const valuation = await prisma.tradeInValuation?.findFirst({
      where: { id, storeId },
    });
    if (!valuation) {
      throw new Error('Trade-in valuation not found');
    }

    return {
      id: valuation.id,
      storeId: valuation.storeId,
      customerId: valuation.customerId,
      make: valuation.make,
      model: valuation.model,
      year: valuation.year,
      mileage: valuation.mileage,
      condition: valuation.condition,
      vin: valuation.vin ?? undefined,
      estimatedValue: Number(valuation.estimatedValue),
      offerPrice: valuation.offerPrice ? Number(valuation.offerPrice) : undefined,
      status: (valuation as any).status as TradeInStatus,
      vehicleId: valuation.vehicleId ?? undefined,
      notes: valuation.notes ?? undefined,
      createdAt: valuation.createdAt,
      updatedAt: valuation.updatedAt,
    };
  }

  // ===== LEAD SCORING =====

  async getLeadScore(
    storeId: string,
    customerId: string
  ): Promise<LeadScore | null> {
    const score = await prisma.leadScore?.findFirst({
      where: { storeId, customerId },
    });

    if (!score) return null;

    return {
      id: score.id,
      storeId: score.storeId,
      customerId: score.customerId,
      inquiryType: score.inquiryType as any,
      score: score.score,
      factors: score.factors as any,
      lastActivity: score.lastActivity,
    };
  }

  async updateLeadScore(
    storeId: string,
    customerId: string,
    data: {
      inquiryType: LeadScore['inquiryType'];
      factors: LeadScore['factors'];
    }
  ): Promise<LeadScore> {
    const score = await prisma.leadScore?.upsert({
      where: {
        storeId: storeId,
        customerId: customerId,
      } as any,
      update: {
        inquiryType: data.inquiryType,
        factors: data.factors as any,
        score: this.calculateLeadScore(data.factors),
        lastActivity: new Date(),
      },
      create: {
        storeId,
        customerId,
        inquiryType: data.inquiryType,
        factors: data.factors as any,
        score: this.calculateLeadScore(data.factors),
        lastActivity: new Date(),
      },
    });

    return {
      id: score.id,
      storeId: score.storeId,
      customerId: score.customerId,
      inquiryType: score.inquiryType as any,
      score: score.score,
      factors: score.factors as any,
      lastActivity: score.lastActivity,
    };
  }

  async getHighValueLeads(
    storeId: string,
    minScore: number = 70
  ): Promise<LeadScore[]> {
    const leads = await prisma.leadScore?.findMany({
      where: {
        storeId,
        score: { gte: minScore },
      },
      orderBy: { score: 'desc' },
    });

    return leads.map((l: any) => ({
      id: l.id,
      storeId: l.storeId,
      customerId: l.customerId,
      inquiryType: l.inquiryType as any,
      score: l.score,
      factors: l.factors as any,
      lastActivity: l.lastActivity,
    }));
  }

  // ===== MARKET PRICE ANALYSIS =====

  async getMarketPriceAnalysis(vehicleId: string): Promise<any> {
    const analysis = await prisma.marketPriceAnalysis?.findFirst({
      where: { vehicleId },
      orderBy: { lastUpdated: 'desc' },
    });

    if (!analysis) return null;

    return {
      id: analysis.id,
      vehicleId: analysis.vehicleId,
      make: analysis.make,
      model: analysis.model,
      year: analysis.year,
      localAvgPrice: Number(analysis.localAvgPrice),
      nationalAvgPrice: Number(analysis.nationalAvgPrice),
      pricePosition: analysis.pricePosition,
      percentDiff: Number(analysis.percentDiff),
      demandScore: analysis.demandScore,
      daysOnMarket: analysis.daysOnMarket ?? undefined,
      lastUpdated: analysis.lastUpdated,
    };
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
