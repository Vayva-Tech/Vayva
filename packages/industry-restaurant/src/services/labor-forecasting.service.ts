/**
 * Labor Forecasting AI Service
 * 
 * Provides demand-based staff optimization and labor cost forecasting
 * for restaurant operations
 */

import { BaseAIService } from '@vayva/ai-agent';

export interface LaborForecastInput {
  /** Forecast period */
  period: {
    start: string;
    end: string;
  };
  /** Historical sales and labor data */
  historicalData: Array<{
    date: string;
    sales: number;
    laborHours: number;
    covers: number;
    dayPart?: 'breakfast' | 'lunch' | 'dinner';
  }>;
  /** Upcoming reservations/bookings */
  reservations?: Array<{
    date: string;
    covers: number;
    time: string;
    partySize: number;
  }>;
  /** Special events or factors */
  specialFactors?: Array<{
    date: string;
    factor: string;
    expectedImpact: 'low' | 'medium' | 'high';
  }>;
  /** Labor constraints */
  constraints?: {
    targetLaborPercent?: number; // Target labor as % of sales
    minStaffPerShift?: number;
    maxHoursPerEmployee?: number;
    availableEmployees?: number;
  };
}

export class LaborForecastingService extends BaseAIService<LaborForecastInput, {
  forecastPeriod: {
    start: string;
    end: string;
  };
  predictedVolume: {
    totalSales: number;
    totalCovers: number;
    dailyBreakdown: Array<{ date: string; sales: number; covers: number }>;
    confidence: number;
  };
  staffingRecommendation: {
    totalLaborHours: number;
    laborCostPercentage: number;
    positions: Array<{
      role: string;
      hoursNeeded: number;
      skillLevel: 'entry' | 'experienced' | 'expert';
      notes?: string;
    }>;
  };
  optimizationOpportunities: Array<{
    type: 'schedule_consolidation' | 'cross_training' | 'shift_adjustment';
    description: string;
    estimatedSavings: number;
    impactOnService: 'positive' | 'neutral' | 'negative';
  }>;
}> {
  constructor() {
    super({
      model: 'restaurant-optimizer',
      temperature: 0.4, // Analytical with flexibility
      requireHumanValidation: true, // Schedule changes need manager approval
      confidenceThreshold: 0.75,
    });
  }

  protected async buildPrompt(input: LaborForecastInput): Promise<string> {
    const avgSales = input.historicalData.reduce((sum, h) => sum + h.sales, 0) / input.historicalData.length;
    const avgLaborPercent = input.historicalData.reduce((sum, h) => sum + (h.laborHours * 15 / h.sales), 0) / input.historicalData.length; // Assuming $15/hr avg

    const prompt = `You are an expert restaurant labor management consultant. Analyze the data and provide optimal staffing recommendations.

FORECAST PERIOD: ${input.period.start} to ${input.period.end}
TARGET LABOR PERCENT: ${input.constraints?.targetLaborPercent || 'Not specified'}%

HISTORICAL PERFORMANCE (${input.historicalData.length} periods):
${input.historicalData.map(h => `- ${h.date} (${h.dayPart || 'all-day'}): $${h.sales} sales | ${h.covers} covers | ${h.laborHours} hrs`).join('\n')}
Average Sales: $${avgSales.toFixed(2)}
Average Labor %: ${avgLaborPercent.toFixed(1)}%

UPCOMING RESERVATIONS:
${input.reservations?.length 
  ? input.reservations.map(r => `- ${r.date} ${r.time}: ${r.covers} covers (${r.partySize} party)`).join('\n')
  : 'No reservation data'}

SPECIAL FACTORS:
${input.specialFactors?.length
  ? input.specialFactors.map(f => `- ${f.date}: ${f.factor} (Impact: ${f.expectedImpact})`).join('\n')
  : 'None'}

CONSTRAINTS:
${input.constraints?.minStaffPerShift ? `- Minimum Staff Per Shift: ${input.constraints.minStaffPerShift}` : ''}
${input.constraints?.maxHoursPerEmployee ? `- Max Hours/Employee: ${input.constraints.maxHoursPerEmployee}` : ''}
${input.constraints?.availableEmployees ? `- Available Employees: ${input.constraints.availableEmployees}` : ''}

Please provide comprehensive labor forecasting including:
1. Predicted sales and covers for the forecast period
2. Optimal staffing levels by position
3. Labor cost projections
4. Optimization opportunities to reduce costs without impacting service

Format your response as JSON with this exact structure:
{
  "forecastPeriod": {
    "start": "YYYY-MM-DD",
    "end": "YYYY-MM-DD"
  },
  "predictedVolume": {
    "totalSales": total_sales,
    "totalCovers": total_covers,
    "dailyBreakdown": [
      {"date": "YYYY-MM-DD", "sales": sales_amount, "covers": covers_count}
    ],
    "confidence": 0.0-1.0
  },
  "staffingRecommendation": {
    "totalLaborHours": total_hours,
    "laborCostPercentage": labor_percent,
    "positions": [
      {
        "role": "position_name",
        "hoursNeeded": hours,
        "skillLevel": "entry|experienced|expert",
        "notes": "Additional notes"
      }
    ]
  },
  "optimizationOpportunities": [
    {
      "type": "schedule_consolidation|cross_training|shift_adjustment",
      "description": "What to optimize",
      "estimatedSavings": dollar_amount,
      "impactOnService": "positive|neutral|negative"
    }
  ]
}

Consider:
- Daypart-specific staffing needs
- Peak vs. off-peak coverage
- Employee skill mix and cross-training
- Legal requirements (breaks, overtime)
- Service level maintenance

Balance cost control with maintaining quality service.`;

    return prompt;
  }

  protected async parseResponse(rawResponse: string, input: LaborForecastInput): Promise<any> {
    try {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate required fields
      if (!parsed.predictedVolume) {
        throw new Error('Missing predicted volume');
      }

      if (!parsed.staffingRecommendation) {
        throw new Error('Missing staffing recommendation');
      }

      // Add validation rules
      this.addValidationRule({
        id: 'has_volume_forecast',
        validate: (data) => data.predictedVolume.totalSales > 0 && data.predictedVolume.totalCovers > 0,
        errorMessage: 'Invalid volume forecast',
        isCritical: true,
      });

      this.addValidationRule({
        id: 'has_staffing_plan',
        validate: (data) => data.staffingRecommendation.positions.length > 0,
        errorMessage: 'No staffing plan provided',
        isCritical: true,
      });

      this.addValidationRule({
        id: 'realistic_labor_percent',
        validate: (data) => 
          data.staffingRecommendation.laborCostPercentage >= 15 &&
          data.staffingRecommendation.laborCostPercentage <= 40,
        errorMessage: 'Labor percentage outside realistic range (15-40%)',
        isCritical: false,
      });

      this.addValidationRule({
        id: 'valid_skill_levels',
        validate: (data) => 
          data.staffingRecommendation.positions.every(p => 
            ['entry', 'experienced', 'expert'].includes(p.skillLevel)
          ),
        errorMessage: 'Invalid skill level',
        isCritical: false,
      });

      return {
        forecastPeriod: parsed.forecastPeriod || input.period,
        predictedVolume: parsed.predictedVolume,
        staffingRecommendation: parsed.staffingRecommendation,
        optimizationOpportunities: parsed.optimizationOpportunities || [],
      };
    } catch (error) {
      console.error('[LaborForecasting] Failed to parse response:', error);
      throw error;
    }
  }

  /**
   * Quick labor forecast based on sales projection
   */
  async forecastLaborForSales(
    projectedSales: number,
    targetLaborPercent: number = 30,
    avgHourlyWage: number = 15
  ): Promise<{
    recommendedHours: number;
    estimatedCost: number;
    laborPercent: number;
  }> {
    const estimatedCost = projectedSales * (targetLaborPercent / 100);
    const recommendedHours = estimatedCost / avgHourlyWage;

    return {
      recommendedHours: Math.round(recommendedHours),
      estimatedCost: Math.round(estimatedCost),
      laborPercent: targetLaborPercent,
    };
  }

  /**
   * Calculate optimal staff-to-guest ratio
   */
  calculateStaffToGuestRatio(
    covers: number,
    serviceStyle: 'fine_dining' | 'casual' | 'fast_casual' | 'quick_service'
  ): {
    recommendedServers: number;
    recommendedSupport: number;
    ratio: string;
  } {
    const ratios = {
      fine_dining: { server: 15, support: 30 }, // 1 server per 15 guests
      casual: { server: 25, support: 50 },
      fast_casual: { server: 40, support: 80 },
      quick_service: { server: 60, support: 100 },
    };

    const config = ratios[serviceStyle];
    const servers = Math.ceil(covers / config.server);
    const support = Math.ceil(covers / config.support);

    return {
      recommendedServers: servers,
      recommendedSupport: support,
      ratio: `1:${Math.floor(covers / (servers + support))}`,
    };
  }

  /**
   * Generate shift schedule template
   */
  generateShiftTemplate(
    totalHoursNeeded: number,
    operatingHours: { open: string; close: string },
    maxShiftLength: number = 8
  ): Array<{
    shiftName: string;
    startTime: string;
    endTime: string;
    hours: number;
    positions: number;
  }> {
    const shifts: Array<{
      shiftName: string;
      startTime: string;
      endTime: string;
      hours: number;
      positions: number;
    }> = [];

    // Simple shift generation logic
    const openHour = parseInt(operatingHours.open.split(':')[0]);
    const closeHour = parseInt(operatingHours.close.split(':')[0]);
    const totalOperatingHours = closeHour - openHour;

    const shiftsPerDay = Math.ceil(totalOperatingHours / maxShiftLength);
    const hoursPerShift = Math.ceil(totalOperatingHours / shiftsPerDay);

    for (let i = 0; i < shiftsPerDay; i++) {
      const start = openHour + (i * hoursPerShift);
      const end = Math.min(start + hoursPerShift, closeHour);
      
      shifts.push({
        shiftName: i === 0 ? 'Opening' : i === shiftsPerDay - 1 ? 'Closing' : `Mid-${i}`,
        startTime: `${start.toString().padStart(2, '0')}:00`,
        endTime: `${end.toString().padStart(2, '0')}:00`,
        hours: end - start,
        positions: Math.ceil(totalHoursNeeded / (hoursPerShift * shiftsPerDay)),
      });
    }

    return shifts;
  }
}
