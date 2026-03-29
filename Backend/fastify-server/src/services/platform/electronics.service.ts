import { prisma } from "@vayva/db";
import { logger } from "../../lib/logger";

/**
 * Electronics Service - Automotive and electronics industry features
 *
 * Provides:
 * - Vehicle history reports
 * - Trade-in valuations
 * - Lead scoring
 * - Market price analysis
 */

export interface TradeInValuation {
  id: string;
  storeId: string;
  customerId: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  condition: "excellent" | "good" | "fair" | "poor";
  vin?: string;
  estimatedValue: number;
  offerPrice?: number;
  status: "pending" | "reviewed" | "offered" | "accepted" | "rejected";
  vehicleId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeadScore {
  id: string;
  storeId: string;
  customerId: string;
  score: number;
  inquiryType: "purchase" | "trade-in" | "financing" | "service";
  factors: {
    visitCount: number;
    timeOnSite: number;
    pagesViewed: number;
    actionsTaken: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface WarrantyRecord {
  id: string;
  storeId: string;
  customerId: string;
  orderId: string;
  productId: string;
  productName: string;
  warrantyType: "manufacturer" | "extended" | "store";
  startDate: Date;
  endDate: Date;
  durationMonths: number;
  status: "active" | "expired" | "claimed" | "cancelled";
  renewalOffered: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ElectronicsService {
  // ==================== Vehicle History ====================

  async getVehicleHistory(vehicleId: string) {
    try {
      const history = await prisma.vehicleHistory.findFirst({
        where: { vehicleId },
        include: {
          vehicle: true,
        },
        orderBy: { createdAt: "desc" },
      });

      if (!history) return null;

      return {
        id: history.id,
        vehicleId: history.vehicleId,
        reportType: history.reportType,
        reportData: history.reportData as any,
        mileage: history.mileage ? Number(history.mileage) : null,
        serviceRecords: history.serviceRecords
          ? JSON.parse(history.serviceRecords as string)
          : null,
        accidentHistory: history.accidentHistory || false,
        numberOfOwners: history.numberOfOwners || 0,
        createdAt: history.createdAt,
        updatedAt: history.updatedAt,
      };
    } catch (error) {
      logger.error("[ElectronicsService] Failed to get vehicle history", {
        vehicleId,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  async createVehicleHistory(data: any) {
    try {
      const history = await prisma.vehicleHistory.create({
        data: {
          vehicleId: data.vehicleId,
          reportType: data.reportType,
          reportData: data.reportData ? JSON.stringify(data.reportData) : null,
          mileage: data.mileage,
          serviceRecords: data.serviceRecords
            ? JSON.stringify(data.serviceRecords)
            : null,
          accidentHistory: data.accidentHistory || false,
          numberOfOwners: data.numberOfOwners || 0,
        },
      });

      logger.info("[ElectronicsService] Vehicle history created", {
        historyId: history.id,
      });

      return {
        id: history.id,
        vehicleId: history.vehicleId,
        reportType: history.reportType,
        reportData: history.reportData
          ? JSON.parse(history.reportData as string)
          : null,
        mileage: history.mileage ? Number(history.mileage) : null,
        serviceRecords: history.serviceRecords
          ? JSON.parse(history.serviceRecords as string)
          : null,
        accidentHistory: history.accidentHistory,
        numberOfOwners: history.numberOfOwners,
        createdAt: history.createdAt,
        updatedAt: history.updatedAt,
      };
    } catch (error) {
      logger.error("[ElectronicsService] Failed to create vehicle history", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  // ==================== Trade-In Valuations ====================

  async getTradeInValuations(storeId: string, status?: string) {
    try {
      const where: any = { storeId };
      if (status) where.status = status;

      const valuations = await prisma.tradeInValuation.findMany({
        where,
        include: {
          customer: true,
          vehicle: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return valuations.map((v) => ({
        id: v.id,
        storeId: v.storeId,
        customerId: v.customerId,
        make: v.make,
        model: v.model,
        year: v.year,
        mileage: v.mileage,
        condition: v.condition as any,
        vin: v.vin,
        estimatedValue: Number(v.estimatedValue),
        offerPrice: v.offerPrice ? Number(v.offerPrice) : null,
        status: v.status as any,
        vehicleId: v.vehicleId,
        notes: v.notes,
        customer: v.customer,
        vehicle: v.vehicle,
        createdAt: v.createdAt,
        updatedAt: v.updatedAt,
      }));
    } catch (error) {
      logger.error("[ElectronicsService] Failed to get trade-in valuations", {
        storeId,
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  async getCustomerTradeIns(customerId: string) {
    try {
      const valuations = await prisma.tradeInValuation.findMany({
        where: { customerId },
        include: {
          vehicle: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return valuations.map((v) => ({
        id: v.id,
        storeId: v.storeId,
        customerId: v.customerId,
        make: v.make,
        model: v.model,
        year: v.year,
        mileage: v.mileage,
        condition: v.condition as any,
        vin: v.vin,
        estimatedValue: Number(v.estimatedValue),
        offerPrice: v.offerPrice ? Number(v.offerPrice) : null,
        status: v.status as any,
        vehicleId: v.vehicleId,
        notes: v.notes,
        vehicle: v.vehicle,
        createdAt: v.createdAt,
        updatedAt: v.updatedAt,
      }));
    } catch (error) {
      logger.error("[ElectronicsService] Failed to get customer trade-ins", {
        customerId,
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  async createTradeInValuation(data: any) {
    try {
      const valuation = await prisma.tradeInValuation.create({
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
          status: "pending",
          vehicleId: data.vehicleId,
          notes: data.notes,
        },
      });

      logger.info("[ElectronicsService] Trade-in valuation created", {
        valuationId: valuation.id,
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
        vin: valuation.vin,
        estimatedValue: Number(valuation.estimatedValue),
        offerPrice: valuation.offerPrice ? Number(valuation.offerPrice) : null,
        status: valuation.status as any,
        vehicleId: valuation.vehicleId,
        notes: valuation.notes,
        createdAt: valuation.createdAt,
        updatedAt: valuation.updatedAt,
      };
    } catch (error) {
      logger.error("[ElectronicsService] Failed to create trade-in valuation", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async updateTradeInOffer(
    id: string,
    storeId: string,
    offerPrice: number,
    notes?: string,
  ) {
    try {
      const valuation = await prisma.tradeInValuation.update({
        where: { id, storeId },
        data: {
          offerPrice,
          notes,
          status: "offered",
        },
      });

      logger.info("[ElectronicsService] Trade-in offer updated", {
        valuationId: id,
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
        vin: valuation.vin,
        estimatedValue: Number(valuation.estimatedValue),
        offerPrice: Number(valuation.offerPrice),
        status: valuation.status as any,
        vehicleId: valuation.vehicleId,
        notes: valuation.notes,
        createdAt: valuation.createdAt,
        updatedAt: valuation.updatedAt,
      };
    } catch (error) {
      logger.error("[ElectronicsService] Failed to update trade-in offer", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async acceptTradeInOffer(id: string, storeId: string) {
    try {
      const valuation = await prisma.tradeInValuation.update({
        where: { id, storeId },
        data: {
          status: "accepted",
        },
      });

      logger.info("[ElectronicsService] Trade-in offer accepted", {
        valuationId: id,
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
        vin: valuation.vin,
        estimatedValue: Number(valuation.estimatedValue),
        offerPrice: valuation.offerPrice ? Number(valuation.offerPrice) : null,
        status: valuation.status as any,
        vehicleId: valuation.vehicleId,
        notes: valuation.notes,
        createdAt: valuation.createdAt,
        updatedAt: valuation.updatedAt,
      };
    } catch (error) {
      logger.error("[ElectronicsService] Failed to accept trade-in offer", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  // ==================== Lead Scoring ====================

  async getLeadScore(storeId: string, customerId: string) {
    try {
      const leadScore = await prisma.leadScore.findFirst({
        where: { storeId, customerId },
        orderBy: { updatedAt: "desc" },
      });

      if (!leadScore) return null;

      return {
        id: leadScore.id,
        storeId: leadScore.storeId,
        customerId: leadScore.customerId,
        score: leadScore.score,
        inquiryType: leadScore.inquiryType as any,
        factors: leadScore.factors
          ? JSON.parse(leadScore.factors as string)
          : null,
        createdAt: leadScore.createdAt,
        updatedAt: leadScore.updatedAt,
      };
    } catch (error) {
      logger.error("[ElectronicsService] Failed to get lead score", {
        storeId,
        customerId,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  async updateLeadScore(storeId: string, customerId: string, data: any) {
    try {
      // Calculate score based on factors
      const score = this.calculateLeadScore(data.factors);

      const existingScore = await prisma.leadScore.findFirst({
        where: { storeId, customerId },
      });

      let leadScore;
      if (existingScore) {
        leadScore = await prisma.leadScore.update({
          where: { id: existingScore.id },
          data: {
            score,
            inquiryType: data.inquiryType,
            factors: JSON.stringify(data.factors),
          },
        });
      } else {
        leadScore = await prisma.leadScore.create({
          data: {
            storeId,
            customerId,
            score,
            inquiryType: data.inquiryType,
            factors: JSON.stringify(data.factors),
          },
        });
      }

      logger.info("[ElectronicsService] Lead score updated", {
        leadScoreId: leadScore.id,
        score,
      });

      return {
        id: leadScore.id,
        storeId: leadScore.storeId,
        customerId: leadScore.customerId,
        score: leadScore.score,
        inquiryType: leadScore.inquiryType as any,
        factors: leadScore.factors
          ? JSON.parse(leadScore.factors as string)
          : null,
        createdAt: leadScore.createdAt,
        updatedAt: leadScore.updatedAt,
      };
    } catch (error) {
      logger.error("[ElectronicsService] Failed to update lead score", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async getHighValueLeads(storeId: string, minScore: number = 70) {
    try {
      const leads = await prisma.leadScore.findMany({
        where: {
          storeId,
          score: { gte: minScore },
        },
        include: {
          customer: true,
        },
        orderBy: { score: "desc" },
      });

      return leads.map((l) => ({
        id: l.id,
        storeId: l.storeId,
        customerId: l.customerId,
        score: l.score,
        inquiryType: l.inquiryType as any,
        factors: l.factors ? JSON.parse(l.factors as string) : null,
        customer: l.customer,
        createdAt: l.createdAt,
        updatedAt: l.updatedAt,
      }));
    } catch (error) {
      logger.error("[ElectronicsService] Failed to get high-value leads", {
        storeId,
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  // ==================== Market Price Analysis ====================

  async getMarketPriceAnalysis(vehicleId: string) {
    try {
      const analysis = await prisma.marketAnalysis.findFirst({
        where: { vehicleId },
        orderBy: { createdAt: "desc" },
      });

      if (!analysis) return null;

      return {
        id: analysis.id,
        vehicleId: analysis.vehicleId,
        averageMarketPrice: Number(analysis.averageMarketPrice),
        lowMarketPrice: analysis.lowMarketPrice
          ? Number(analysis.lowMarketPrice)
          : null,
        highMarketPrice: analysis.highMarketPrice
          ? Number(analysis.highMarketPrice)
          : null,
        comparableVehicles: analysis.comparableVehicles
          ? JSON.parse(analysis.comparableVehicles as string)
          : null,
        priceConfidence: analysis.priceConfidence,
        dataSources: analysis.dataSources
          ? JSON.parse(analysis.dataSources as string)
          : null,
        createdAt: analysis.createdAt,
        updatedAt: analysis.updatedAt,
      };
    } catch (error) {
      logger.error("[ElectronicsService] Failed to get market price analysis", {
        vehicleId,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  // ==================== Helpers ====================

  private calculateLeadScore(factors: {
    visitCount: number;
    timeOnSite: number;
    pagesViewed: number;
    actionsTaken: number;
  }): number {
    let score = 0;

    // Visit count weight: 20 points max
    score += Math.min(factors.visitCount * 5, 20);

    // Time on site weight: 20 points max (in seconds)
    score += Math.min(Math.floor(factors.timeOnSite / 60), 20);

    // Pages viewed weight: 30 points max
    score += Math.min(factors.pagesViewed * 2, 30);

    // Actions taken weight: 30 points max
    score += Math.min(factors.actionsTaken * 5, 30);

    return Math.min(score, 100);
  }

  // ==================== Warranty Records ====================

  async getWarrantyByOrder(orderId: string) {
    try {
      const warranties = await prisma.warranty.findMany({
        where: { orderId },
        orderBy: { createdAt: "desc" },
      });

      return warranties.map((w) => ({
        id: w.id,
        storeId: w.storeId,
        customerId: w.customerId,
        orderId: w.orderId,
        productId: w.productId,
        productName: w.productName,
        warrantyType: w.warrantyType as any,
        startDate: w.startDate,
        endDate: w.endDate,
        durationMonths: w.durationMonths,
        status: w.status as any,
        renewalOffered: w.renewalOffered,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt,
      }));
    } catch (error) {
      logger.error("[ElectronicsService] Failed to get warranty by order", {
        orderId,
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  async getCustomerWarranties(customerId: string) {
    try {
      const warranties = await prisma.warranty.findMany({
        where: { customerId },
        orderBy: { endDate: "desc" },
      });

      return warranties.map((w) => ({
        id: w.id,
        storeId: w.storeId,
        customerId: w.customerId,
        orderId: w.orderId,
        productId: w.productId,
        productName: w.productName,
        warrantyType: w.warrantyType as any,
        startDate: w.startDate,
        endDate: w.endDate,
        durationMonths: w.durationMonths,
        status: w.status as any,
        renewalOffered: w.renewalOffered,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt,
      }));
    } catch (error) {
      logger.error("[ElectronicsService] Failed to get customer warranties", {
        customerId,
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  async createWarranty(data: any) {
    try {
      const warranty = await prisma.warranty.create({
        data: {
          storeId: data.storeId,
          customerId: data.customerId,
          orderId: data.orderId,
          productId: data.productId,
          productName: data.productName,
          warrantyType: data.warrantyType,
          startDate: data.startDate,
          endDate: data.endDate,
          durationMonths: data.durationMonths,
          status: "active",
          renewalOffered: false,
        },
      });

      logger.info("[ElectronicsService] Warranty created", {
        warrantyId: warranty.id,
      });

      return {
        id: warranty.id,
        storeId: warranty.storeId,
        customerId: warranty.customerId,
        orderId: warranty.orderId,
        productId: warranty.productId,
        productName: warranty.productName,
        warrantyType: warranty.warrantyType as any,
        startDate: warranty.startDate,
        endDate: warranty.endDate,
        durationMonths: warranty.durationMonths,
        status: warranty.status as any,
        renewalOffered: warranty.renewalOffered,
        createdAt: warranty.createdAt,
        updatedAt: warranty.updatedAt,
      };
    } catch (error) {
      logger.error("[ElectronicsService] Failed to create warranty", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async updateWarrantyStatus(id: string, storeId: string, status: string) {
    try {
      const warranty = await prisma.warranty.update({
        where: { id, storeId },
        data: { status },
      });

      logger.info("[ElectronicsService] Warranty status updated", {
        warrantyId: id,
        status,
      });

      return {
        id: warranty.id,
        storeId: warranty.storeId,
        customerId: warranty.customerId,
        orderId: warranty.orderId,
        productId: warranty.productId,
        productName: warranty.productName,
        warrantyType: warranty.warrantyType as any,
        startDate: warranty.startDate,
        endDate: warranty.endDate,
        durationMonths: warranty.durationMonths,
        status: warranty.status as any,
        renewalOffered: warranty.renewalOffered,
        createdAt: warranty.createdAt,
        updatedAt: warranty.updatedAt,
      };
    } catch (error) {
      logger.error("[ElectronicsService] Failed to update warranty status", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async getExpiringWarranties(storeId: string, daysThreshold: number = 30) {
    try {
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

      const warranties = await prisma.warranty.findMany({
        where: {
          storeId,
          endDate: {
            lte: thresholdDate,
          },
          status: "active",
        },
        orderBy: { endDate: "asc" },
      });

      return warranties.map((w) => ({
        id: w.id,
        storeId: w.storeId,
        customerId: w.customerId,
        orderId: w.orderId,
        productId: w.productId,
        productName: w.productName,
        warrantyType: w.warrantyType as any,
        startDate: w.startDate,
        endDate: w.endDate,
        durationMonths: w.durationMonths,
        status: w.status as any,
        renewalOffered: w.renewalOffered,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt,
      }));
    } catch (error) {
      logger.error("[ElectronicsService] Failed to get expiring warranties", {
        storeId,
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }
}
