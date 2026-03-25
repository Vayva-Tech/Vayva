import {
  VehicleSchema,
  type Vehicle,
  type VehicleStatus,
  type VehicleCondition,
  type TestDrive,
  type TestDriveStatus,
  type FinancingApplication,
  type FinancingStatus,
  type ServiceAppointment,
  type ServiceType,
  type AutomotiveAnalytics,
  type TradeInEvaluation,
  type AcquisitionType,
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
    const partial = acquisitionData.vehicleData;
    const vehicle = VehicleSchema.parse({
      id: `veh_${Date.now()}`,
      tenantId: partial.tenantId!,
      vin:
        partial.vin && partial.vin.length === 17
          ? partial.vin
          : '0'.repeat(17),
      make: partial.make ?? 'Unknown',
      model: partial.model ?? 'Unknown',
      year: partial.year ?? new Date().getFullYear(),
      trim: partial.trim,
      color: partial.color ?? 'unspecified',
      interiorColor: partial.interiorColor,
      condition: partial.condition ?? 'used',
      status: 'available',
      mileage: partial.mileage ?? 0,
      fuelType: partial.fuelType ?? 'petrol',
      transmission: partial.transmission ?? 'automatic',
      engineSize: partial.engineSize,
      horsepower: partial.horsepower,
      bodyType: partial.bodyType,
      price: partial.price ?? 0,
      negotiable: partial.negotiable ?? true,
      features: partial.features ?? [],
      imageUrls: partial.imageUrls ?? [],
      description: partial.description,
      warrantyMonths: partial.warrantyMonths ?? 0,
      inspectionReport: partial.inspectionReport,
      locationId: partial.locationId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

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
    
    const acquisitions = (await this.db.vehicleAcquisition.findMany({
      where: {
        tenantId,
        date: { gte: startDate },
      },
      include: { tradeInEvaluation: true },
    })) as Array<{
      type: AcquisitionType;
      cost: number;
      tradeInEvaluation?: { tradeInValue: number } | null;
    }>;

    const byType: Record<AcquisitionType, number> = {
      purchase: acquisitions.filter((a) => a.type === 'purchase').length,
      trade_in: acquisitions.filter((a) => a.type === 'trade_in').length,
      consignment: acquisitions.filter((a) => a.type === 'consignment').length,
    };

    const totalCost = acquisitions.reduce((sum: number, acq) => sum + acq.cost, 0);
    const tradeInValues = acquisitions
      .filter((a) => a.tradeInEvaluation)
      .reduce(
        (sum: number, acq) => sum + (acq.tradeInEvaluation?.tradeInValue ?? 0),
        0
      );

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
      case 'quarter': {
        const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
        return new Date(now.getFullYear(), quarterStartMonth, 1);
      }
      case 'year':
        return new Date(now.getFullYear(), 0, 1);
      default:
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
  }
}