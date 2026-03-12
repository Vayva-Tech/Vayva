import type { Vehicle } from '../types';

/**
 * VehiclePricingService - Manages dynamic vehicle pricing and inventory optimization
 * Handles market-based pricing, automated repricing, and inventory value management
 */
export class VehiclePricingService {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  /**
   * Calculate optimal price based on market conditions, inventory levels, and demand
   */
  async calculateOptimalPrice(
    vehicleId: string,
    options: {
      targetProfitMargin?: number;
      competitorAnalysis?: boolean;
      seasonalAdjustment?: boolean;
    } = {}
  ): Promise<number> {
    const vehicle = await this.db.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) throw new Error('Vehicle not found');

    // Base pricing factors
    let basePrice = vehicle.price;
    let multiplier = 1.0;

    // Inventory aging adjustment
    const daysInInventory = Math.floor(
      (Date.now() - vehicle.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysInInventory > 90) {
      multiplier *= 0.95; // 5% discount for aged inventory
    } else if (daysInInventory > 180) {
      multiplier *= 0.90; // 10% discount for old inventory
    }

    // Demand-based pricing
    const demandScore = await this.calculateDemandScore(vehicleId);
    if (demandScore > 0.8) {
      multiplier *= 1.05; // Premium for high-demand vehicles
    } else if (demandScore < 0.3) {
      multiplier *= 0.95; // Discount for low-demand vehicles
    }

    // Competitor analysis (if enabled)
    if (options.competitorAnalysis) {
      const competitorPrice = await this.getCompetitorPrice(vehicle);
      if (competitorPrice) {
        const competitiveAdjustment = competitorPrice / basePrice;
        multiplier *= Math.min(competitiveAdjustment * 0.98, 1.02); // Stay within 2% of competition
      }
    }

    // Target profit margin adjustment
    if (options.targetProfitMargin) {
      const cost = await this.getVehicleCost(vehicleId);
      const targetPrice = cost * (1 + options.targetProfitMargin);
      multiplier *= targetPrice / basePrice;
    }

    return Math.round(basePrice * multiplier);
  }

  /**
   * Run automated repricing across entire inventory
   */
  async runAutoPricing(tenantId: string): Promise<{ updated: number; skipped: number }> {
    const vehicles = await this.db.vehicle.findMany({
      where: { tenantId, status: 'available' },
    });

    let updated = 0;
    let skipped = 0;

    for (const vehicle of vehicles) {
      try {
        const optimalPrice = await this.calculateOptimalPrice(vehicle.id, {
          targetProfitMargin: 0.15, // 15% target margin
          competitorAnalysis: true,
        });

        // Only update if price change is significant (>2%)
        const priceChangePercent = Math.abs(vehicle.price - optimalPrice) / vehicle.price;
        if (priceChangePercent > 0.02) {
          await this.db.vehicle.update({
            where: { id: vehicle.id },
            data: { price: optimalPrice, updatedAt: new Date() },
          });
          updated++;
        } else {
          skipped++;
        }
      } catch (error) {
        console.error(`Failed to price vehicle ${vehicle.id}:`, error);
        skipped++;
      }
    }

    return { updated, skipped };
  }

  /**
   * Get pricing analytics and recommendations
   */
  async getPricingAnalytics(tenantId: string): Promise<{
    avgPriceChange: number;
    vehiclesBelowMarket: number;
    vehiclesAboveMarket: number;
    recommendedRepricing: Array<{ vehicleId: string; currentPrice: number; recommendedPrice: number }>;
  }> {
    const vehicles = await this.db.vehicle.findMany({
      where: { tenantId, status: 'available' },
    });

    const analysis = await Promise.all(
      vehicles.map(async (vehicle) => {
        const optimalPrice = await this.calculateOptimalPrice(vehicle.id);
        const priceChange = ((optimalPrice - vehicle.price) / vehicle.price) * 100;
        return { vehicle, optimalPrice, priceChange };
      })
    );

    const totalChange = analysis.reduce((sum, item) => sum + item.priceChange, 0);
    const avgPriceChange = analysis.length > 0 ? totalChange / analysis.length : 0;

    const vehiclesBelowMarket = analysis.filter(item => item.priceChange > 2).length;
    const vehiclesAboveMarket = analysis.filter(item => item.priceChange < -2).length;

    const recommendedRepricing = analysis
      .filter(item => Math.abs(item.priceChange) > 2)
      .map(item => ({
        vehicleId: item.vehicle.id,
        currentPrice: item.vehicle.price,
        recommendedPrice: item.optimalPrice,
      }));

    return {
      avgPriceChange: parseFloat(avgPriceChange.toFixed(2)),
      vehiclesBelowMarket,
      vehiclesAboveMarket,
      recommendedRepricing,
    };
  }

  /**
   * Calculate demand score for a vehicle (0-1 scale)
   */
  private async calculateDemandScore(vehicleId: string): Promise<number> {
    // In real implementation, this would analyze:
    // - Search frequency for this vehicle/model
    // - Time to sell similar vehicles
    // - Market trends and seasonality
    // - Geographic demand factors
    
    // Simplified example based on vehicle characteristics
    const vehicle = await this.db.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) return 0.5;

    let score = 0.5; // Base score

    // Popular makes get higher scores
    const popularMakes = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan'];
    if (popularMakes.includes(vehicle.make)) {
      score += 0.1;
    }

    // Recent model years are more desirable
    const currentYear = new Date().getFullYear();
    const yearDifference = currentYear - vehicle.year;
    if (yearDifference <= 2) {
      score += 0.15;
    } else if (yearDifference <= 5) {
      score += 0.1;
    }

    // Reasonable mileage improves demand
    if (vehicle.mileage < 30000) {
      score += 0.1;
    } else if (vehicle.mileage < 60000) {
      score += 0.05;
    }

    return Math.min(1, Math.max(0, score));
  }

  /**
   * Get competitor pricing for similar vehicles
   */
  private async getCompetitorPrice(vehicle: Vehicle): Promise<number | null> {
    // In real implementation, this would:
    // - Query external APIs (KBB, Edmunds, AutoTrader)
    // - Scrape competitor websites
    // - Access industry pricing databases
    
    // Simplified mock implementation
    const similarVehicles = await this.db.vehicle.findMany({
      where: {
        make: vehicle.make,
        model: vehicle.model,
        year: { gte: vehicle.year - 1, lte: vehicle.year + 1 },
        status: 'available',
      },
    });

    if (similarVehicles.length === 0) return null;

    const avgPrice = similarVehicles.reduce((sum, v) => sum + v.price, 0) / similarVehicles.length;
    return avgPrice;
  }

  /**
   * Get actual cost basis for vehicle
   */
  private async getVehicleCost(vehicleId: string): Promise<number> {
    const acquisition = await this.db.vehicleAcquisition.findFirst({
      where: { vehicleId },
    });

    return acquisition?.cost || 0;
  }
}