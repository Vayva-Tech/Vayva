import type { Vehicle } from '../types';

export interface FinancingScenarioParams {
  vehiclePrice: number;
  downPayment: number;
  tradeInValue: number;
  termMonths: number;
  creditScore: number;
  taxRate: number;
}

export interface FinancingCalculatorResult {
  vehiclePrice: number;
  downPayment: number;
  tradeInValue: number;
  taxRate: number;
  termMonths: number;
  interestRate: number;
  
  // Calculated values
  amountFinanced: number;
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  totalSavings?: number;
  
  // Amortization schedule (first 12 months)
  amortizationSchedule: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    remainingBalance: number;
  }>;
}

export interface VirtualExperienceScene {
  id: string;
  title: string;
  type: 'walkaround' | 'interior_tour' | 'engine_bay' | 'undercarriage' | 'dyno_test';
  imageUrl: string;
  hotspots: Array<{
    x: number;
    y: number;
    label: string;
    description: string;
  }>;
}

/**
 * DigitalRetailService - Powers online vehicle shopping experience
 * Handles financing calculators, virtual tours, and digital retail tools
 */
export class DigitalRetailService {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  /**
   * Advanced financing calculator with multiple scenarios
   */
  async calculateFinancingScenario(params: FinancingScenarioParams): Promise<FinancingCalculatorResult> {
    // Get interest rates based on credit score tiers
    const interestRate = this.getInterestRateByCreditScore(params.creditScore);

    const netVehiclePrice = params.vehiclePrice - params.tradeInValue;
    const amountFinanced = Math.max(0, netVehiclePrice - params.downPayment);
    const taxAmount = netVehiclePrice * (params.taxRate / 100);
    const totalAmountFinanced = amountFinanced + taxAmount;

    // Calculate monthly payment
    const monthlyRate = interestRate / 100 / 12;
    let monthlyPayment: number;

    if (monthlyRate === 0) {
      monthlyPayment = totalAmountFinanced / params.termMonths;
    } else {
      monthlyPayment = (totalAmountFinanced * monthlyRate * Math.pow(1 + monthlyRate, params.termMonths)) /
        (Math.pow(1 + monthlyRate, params.termMonths) - 1);
    }

    // Generate amortization schedule for first 12 months
    const amortizationSchedule = [];
    let remainingBalance = totalAmountFinanced;

    for (let month = 1; month <= Math.min(12, params.termMonths); month++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      remainingBalance -= principalPayment;

      amortizationSchedule.push({
        month,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        remainingBalance: Math.max(0, remainingBalance),
      });
    }

    const totalInterest = (monthlyPayment * params.termMonths) - totalAmountFinanced;
    const totalCost = params.downPayment + params.tradeInValue + (monthlyPayment * params.termMonths);

    return {
      vehiclePrice: params.vehiclePrice,
      downPayment: params.downPayment,
      tradeInValue: params.tradeInValue,
      taxRate: params.taxRate,
      termMonths: params.termMonths,
      interestRate,
      amountFinanced: totalAmountFinanced,
      monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
      totalInterest: parseFloat(totalInterest.toFixed(2)),
      totalCost: parseFloat(totalCost.toFixed(2)),
      amortizationSchedule,
    };
  }

  /**
   * Generate virtual walkaround experience for vehicle
   */
  async generateVirtualWalkaround(vehicleId: string): Promise<{
    tourId: string;
    scenes: VirtualExperienceScene[];
  }> {
    const vehicle = await this.db.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) throw new Error('Vehicle not found');

    // Generate 360° views for different angles
    const scenes: VirtualExperienceScene[] = [
      {
        id: 'exterior_front',
        title: 'Front View',
        type: 'walkaround',
        imageUrl: `/api/vehicles/${vehicleId}/media/360/front.jpg`,
        hotspots: [
          { x: 30, y: 40, label: 'LED Headlights', description: 'Energy-efficient LED lighting system' },
          { x: 70, y: 35, label: 'Grille', description: 'Chrome accent grille design' },
        ],
      },
      {
        id: 'interior_driver',
        title: 'Driver\'s Seat',
        type: 'interior_tour',
        imageUrl: `/api/vehicles/${vehicleId}/media/360/interior-driver.jpg`,
        hotspots: [
          { x: 50, y: 30, label: 'Infotainment System', description: '8-inch touchscreen with navigation' },
          { x: 40, y: 60, label: 'Leather Seats', description: 'Premium leather upholstery' },
        ],
      },
      {
        id: 'engine_bay',
        title: 'Engine Bay',
        type: 'engine_bay',
        imageUrl: `/api/vehicles/${vehicleId}/media/360/engine.jpg`,
        hotspots: [
          { x: 60, y: 40, label: 'Engine', description: 'Efficient 4-cylinder engine' },
          { x: 30, y: 50, label: 'Battery', description: 'Maintenance-free battery' },
        ],
      },
    ];

    const tourId = `tour_${vehicleId}_${Date.now()}`;

    // Store tour metadata
    await this.db.virtualTour.create({
      data: {
        id: tourId,
        vehicleId,
        scenes: scenes.map(s => ({ id: s.id, title: s.title, type: s.type })),
        createdAt: new Date(),
      },
    });

    return { tourId, scenes };
  }

  /**
   * Compare multiple financing scenarios
   */
  async compareFinancingScenarios(
    baseParams: Omit<FinancingScenarioParams, 'termMonths' | 'creditScore'>,
    scenarios: Array<{ termMonths: number; creditScore: number }>
  ): Promise<Array<FinancingCalculatorResult & { scenarioName: string }>> {
    const results = await Promise.all(
      scenarios.map(async (scenario, index) => {
        const result = await this.calculateFinancingScenario({
          ...baseParams,
          termMonths: scenario.termMonths,
          creditScore: scenario.creditScore,
        });

        const scenarioNames = [
          'Short Term (Best rates)',
          'Standard Term',
          'Extended Term (Lower payments)',
          'Long Term (Minimum payments)',
        ];

        return {
          ...result,
          scenarioName: scenarioNames[index] || `Scenario ${index + 1}`,
        };
      })
    );

    return results.sort((a, b) => a.monthlyPayment - b.monthlyPayment);
  }

  /**
   * Get interest rate based on credit score
   */
  private getInterestRateByCreditScore(creditScore: number): number {
    if (creditScore >= 781) return 3.5; // Excellent
    if (creditScore >= 721) return 4.2; // Good
    if (creditScore >= 661) return 5.8; // Fair
    if (creditScore >= 601) return 7.5; // Poor
    return 12.0; // Bad
  }

  /**
   * Generate digital vehicle brochure
   */
  async generateDigitalBrochure(vehicleId: string): Promise<{
    brochureId: string;
    sections: Array<{
      title: string;
      content: string;
      media?: string[];
    }>;
  }> {
    const vehicle = await this.db.vehicle.findUnique({ 
      where: { id: vehicleId },
      include: { images: true },
    });
    
    if (!vehicle) throw new Error('Vehicle not found');

    const sections = [
      {
        title: 'Overview',
        content: `${vehicle.year} ${vehicle.make} ${vehicle.model}\n${vehicle.description || 'Premium vehicle in excellent condition.'}`,
        media: vehicle.images.slice(0, 3).map((img: { url: string }) => img.url),
      },
      {
        title: 'Specifications',
        content: `Engine: ${vehicle.engineSize || 'N/A'}\nTransmission: ${vehicle.transmission}\nFuel Type: ${vehicle.fuelType}\nMileage: ${vehicle.mileage.toLocaleString()} miles`,
      },
      {
        title: 'Features',
        content: vehicle.features.join('\n'),
      },
      {
        title: 'Pricing',
        content: `MSRP: $${vehicle.price.toLocaleString()}\nNegotiable: ${vehicle.negotiable ? 'Yes' : 'No'}`,
      },
    ];

    const brochureId = `brochure_${vehicleId}_${Date.now()}`;

    return { brochureId, sections };
  }
}