import type {
  Vehicle,
  VehicleStatus,
  VehicleCondition,
  TestDrive,
  TestDriveStatus,
  FinancingApplication,
  FinancingStatus,
  ServiceAppointment,
  ServiceType,
  AutomotiveAnalytics,
  TradeInEvaluation,
  AcquisitionType,
} from '../types';
import { TradeInEvaluationSchema } from '../types/acquisition.types';

export interface VehicleFilters {
  condition?: VehicleCondition;
  status?: VehicleStatus;
  make?: string;
  model?: string;
  minYear?: number;
  maxYear?: number;
  minPrice?: number;
  maxPrice?: number;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
}

/**
 * VehicleAcquisitionService - Manages dealership vehicle acquisition and trade-ins
 * Handles purchasing, trade-in evaluations, and inventory intake
 */
export class VehicleAcquisitionService {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  /**
   * Evaluate trade-in vehicle with comprehensive inspection
   */
  async evaluateTradeIn(data: Omit<TradeInEvaluation, 'id' | 'createdAt' | 'overallRating' | 'tradeInValue'>): Promise<TradeInEvaluation> {
    // Calculate overall rating from individual assessments
    const overallRating = (data.exteriorRating + data.interiorRating + data.mechanicalRating) / 3;
    
    // Calculate trade-in value based on condition and market factors
    const depreciationFactor = this.calculateDepreciationFactor(data.vehicleId);
    const conditionMultiplier = overallRating / 10;
    const tradeInValue = data.marketValue * conditionMultiplier * depreciationFactor;
    
    const evaluation: TradeInEvaluation = {
      ...data,
      id: `eval_${Date.now()}`,
      overallRating,
      tradeInValue: Math.round(tradeInValue),
      createdAt: new Date(),
    };

    // Validate with Zod schema
    const validated = TradeInEvaluationSchema.parse(evaluation);
    
    await this.db.tradeInEvaluation.create({ data: validated });
    return validated;
  }

  /**
   * Process complete vehicle acquisition (purchase/trade-in/consignment)
   */
  async processVehicleAcquisition(
    acquisitionData: {
      type: AcquisitionType;
      vehicleData: Partial<Vehicle>;
      cost: number;
      vendorInfo: { name: string; contact: string };
      tradeInId?: string;
    }
  ): Promise<Vehicle> {
    const vehicle: Vehicle = {
      ...acquisitionData.vehicleData,
      id: `veh_${Date.now()}`,
      tenantId: acquisitionData.vehicleData.tenantId!,
      status: 'available',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.db.vehicle.create({ data: vehicle });

    // Create acquisition record
    await this.db.vehicleAcquisition.create({
      data: {
        id: `acq_${Date.now()}`,
        tenantId: vehicle.tenantId,
        vehicleId: vehicle.id,
        type: acquisitionData.type,
        cost: acquisitionData.cost,
        vendorName: acquisitionData.vendorInfo.name,
        vendorContact: acquisitionData.vendorInfo.contact,
        tradeInId: acquisitionData.tradeInId,
        date: new Date(),
      },
    });

    return vehicle;
  }

  /**
   * Calculate vehicle depreciation factor based on age and condition
   */
  private calculateDepreciationFactor(vehicleId: string): number {
    // In real implementation, this would query vehicle details
    // Simplified example based on typical depreciation curves
    const vehicleAgeYears = 3; // Would be calculated from vehicle.year
    const baseDepreciation = Math.pow(0.85, vehicleAgeYears); // 15% annual depreciation
    return Math.max(0.3, baseDepreciation); // Minimum 30% value retention
  }

  /**
   * Get acquisition analytics for reporting
   */
  async getAcquisitionAnalytics(tenantId: string, period: 'month' | 'quarter' | 'year'): Promise<{
    totalAcquired: number;
    byType: Record<AcquisitionType, number>;
    averageCost: number;
    tradeInValueCaptured: number;
  }> {
    const startDate = this.getPeriodStartDate(period);
    
    const acquisitions = await this.db.vehicleAcquisition.findMany({
      where: {
        tenantId,
        date: { gte: startDate },
      },
      include: { tradeInEvaluation: true },
    });

    const byType = {
      purchase: acquisitions.filter(a => a.type === 'purchase').length,
      trade_in: acquisitions.filter(a => a.type === 'trade_in').length,
      consignment: acquisitions.filter(a => a.type === 'consignment').length,
    };

    const totalCost = acquisitions.reduce((sum, acq) => sum + acq.cost, 0);
    const tradeInValues = acquisitions
      .filter(a => a.tradeInEvaluation)
      .reduce((sum, acq) => sum + (acq.tradeInEvaluation?.tradeInValue || 0), 0);

    return {
      totalAcquired: acquisitions.length,
      byType,
      averageCost: acquisitions.length > 0 ? totalCost / acquisitions.length : 0,
      tradeInValueCaptured: tradeInValues,
    };
  }

  private getPeriodStartDate(period: string): Date {
    const now = new Date();
    switch (period) {
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'quarter':
        const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
        return new Date(now.getFullYear(), quarterStartMonth, 1);
      case 'year':
        return new Date(now.getFullYear(), 0, 1);
      default:
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
  }
}