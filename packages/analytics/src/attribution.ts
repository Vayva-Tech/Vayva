/**
 * Marketing Attribution Service
 * Track and attribute revenue to marketing touchpoints
 */

// Note: prisma import would come from db package when available
const prisma = {};

export type AttributionModel = 'first_touch' | 'last_touch' | 'linear' | 'time_decay' | 'position_based';

export interface Touchpoint {
  id: string;
  customerId: string;
  channel: string;
  source: string;
  medium: string;
  campaign?: string;
  timestamp: Date;
  orderId?: string;
  revenue?: number;
}

export interface AttributionResult {
  orderId: string;
  customerId: string;
  totalRevenue: number;
  model: AttributionModel;
  touchpoints: Array<{
    touchpointId: string;
    channel: string;
    attributedRevenue: number;
    percentage: number;
    timestamp: Date;
  }>;
}

export interface ChannelPerformance {
  channel: string;
  totalRevenue: number;
  attributedRevenue: number;
  conversions: number;
  touchpoints: number;
  avgTouchpointsPerConversion: number;
  conversionRate: number;
  roas: number; // Return on ad spend
}

export class AttributionService {
  /**
   * Attribute revenue using specified model
   */
  attributeRevenue(
    touchpoints: Touchpoint[],
    orderId: string,
    revenue: number,
    model: AttributionModel = 'last_touch'
  ): AttributionResult {
    const customerTouchpoints = touchpoints
      .filter(t => t.orderId === orderId || !t.orderId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    const attributedTouchpoints = this.applyAttributionModel(
      customerTouchpoints,
      revenue,
      model
    );

    return {
      orderId,
      customerId: customerTouchpoints[0]?.customerId || '',
      totalRevenue: revenue,
      model,
      touchpoints: attributedTouchpoints,
    };
  }

  /**
   * Apply attribution model
   */
  private applyAttributionModel(
    touchpoints: Touchpoint[],
    revenue: number,
    model: AttributionModel
  ): AttributionResult['touchpoints'] {
    if (touchpoints.length === 0) return [];
    if (touchpoints.length === 1) {
      return [{
        touchpointId: touchpoints[0].id,
        channel: touchpoints[0].channel,
        attributedRevenue: revenue,
        percentage: 100,
        timestamp: touchpoints[0].timestamp,
      }];
    }

    switch (model) {
      case 'first_touch':
        return this.firstTouchAttribution(touchpoints, revenue);
      case 'last_touch':
        return this.lastTouchAttribution(touchpoints, revenue);
      case 'linear':
        return this.linearAttribution(touchpoints, revenue);
      case 'time_decay':
        return this.timeDecayAttribution(touchpoints, revenue);
      case 'position_based':
        return this.positionBasedAttribution(touchpoints, revenue);
      default:
        return this.lastTouchAttribution(touchpoints, revenue);
    }
  }

  /**
   * First touch attribution - 100% to first interaction
   */
  private firstTouchAttribution(
    touchpoints: Touchpoint[],
    revenue: number
  ): AttributionResult['touchpoints'] {
    return touchpoints.map((t, index) => ({
      touchpointId: t.id,
      channel: t.channel,
      attributedRevenue: index === 0 ? revenue : 0,
      percentage: index === 0 ? 100 : 0,
      timestamp: t.timestamp,
    }));
  }

  /**
   * Last touch attribution - 100% to last interaction
   */
  private lastTouchAttribution(
    touchpoints: Touchpoint[],
    revenue: number
  ): AttributionResult['touchpoints'] {
    const lastIndex = touchpoints.length - 1;
    return touchpoints.map((t, index) => ({
      touchpointId: t.id,
      channel: t.channel,
      attributedRevenue: index === lastIndex ? revenue : 0,
      percentage: index === lastIndex ? 100 : 0,
      timestamp: t.timestamp,
    }));
  }

  /**
   * Linear attribution - Equal credit to all touchpoints
   */
  private linearAttribution(
    touchpoints: Touchpoint[],
    revenue: number
  ): AttributionResult['touchpoints'] {
    const share = revenue / touchpoints.length;
    const percentage = 100 / touchpoints.length;

    return touchpoints.map(t => ({
      touchpointId: t.id,
      channel: t.channel,
      attributedRevenue: share,
      percentage,
      timestamp: t.timestamp,
    }));
  }

  /**
   * Time decay attribution - More credit to recent touchpoints
   */
  private timeDecayAttribution(
    touchpoints: Touchpoint[],
    revenue: number
  ): AttributionResult['touchpoints'] {
    const decayFactor = 0.7; // 30% decay per step
    const weights: number[] = [];
    let totalWeight = 0;

    // Calculate weights (exponential decay from first touch)
    for (let i = 0; i < touchpoints.length; i++) {
      const weight = Math.pow(decayFactor, touchpoints.length - 1 - i);
      weights.push(weight);
      totalWeight += weight;
    }

    return touchpoints.map((t, index) => {
      const percentage = (weights[index] / totalWeight) * 100;
      return {
        touchpointId: t.id,
        channel: t.channel,
        attributedRevenue: (weights[index] / totalWeight) * revenue,
        percentage,
        timestamp: t.timestamp,
      };
    });
  }

  /**
   * Position based attribution (U-shaped) - 40% first, 40% last, 20% middle
   */
  private positionBasedAttribution(
    touchpoints: Touchpoint[],
    revenue: number
  ): AttributionResult['touchpoints'] {
    const firstShare = revenue * 0.4;
    const lastShare = revenue * 0.4;
    const middleShare = touchpoints.length > 2 
      ? (revenue * 0.2) / (touchpoints.length - 2) 
      : 0;

    return touchpoints.map((t, index) => {
      let attributedRevenue: number;
      let percentage: number;

      if (index === 0) {
        attributedRevenue = firstShare;
        percentage = 40;
      } else if (index === touchpoints.length - 1) {
        attributedRevenue = lastShare;
        percentage = 40;
      } else {
        attributedRevenue = middleShare;
        percentage = touchpoints.length > 2 ? 20 / (touchpoints.length - 2) : 0;
      }

      return {
        touchpointId: t.id,
        channel: t.channel,
        attributedRevenue,
        percentage,
        timestamp: t.timestamp,
      };
    });
  }

  /**
   * Get channel performance report
   */
  async getChannelPerformance(
    storeId: string,
    startDate: Date,
    endDate: Date,
    model: AttributionModel = 'last_touch'
  ): Promise<ChannelPerformance[]> {
    // In production, this would query touchpoint data
    // Mock data for demonstration
    const mockData: ChannelPerformance[] = [
      {
        channel: 'organic_search',
        totalRevenue: 2500000,
        attributedRevenue: 875000,
        conversions: 125,
        touchpoints: 850,
        avgTouchpointsPerConversion: 6.8,
        conversionRate: 14.7,
        roas: 4.2,
      },
      {
        channel: 'paid_social',
        totalRevenue: 1800000,
        attributedRevenue: 720000,
        conversions: 89,
        touchpoints: 620,
        avgTouchpointsPerConversion: 7.0,
        conversionRate: 14.4,
        roas: 3.8,
      },
      {
        channel: 'email',
        totalRevenue: 1200000,
        attributedRevenue: 480000,
        conversions: 156,
        touchpoints: 420,
        avgTouchpointsPerConversion: 2.7,
        conversionRate: 37.1,
        roas: 8.5,
      },
      {
        channel: 'direct',
        totalRevenue: 2100000,
        attributedRevenue: 630000,
        conversions: 142,
        touchpoints: 380,
        avgTouchpointsPerConversion: 2.7,
        conversionRate: 37.4,
        roas: 5.2,
      },
      {
        channel: 'referral',
        totalRevenue: 950000,
        attributedRevenue: 285000,
        conversions: 48,
        touchpoints: 195,
        avgTouchpointsPerConversion: 4.1,
        conversionRate: 24.6,
        roas: 6.8,
      },
    ];

    return mockData;
  }

  /**
   * Get customer journey
   */
  async getCustomerJourney(customerId: string): Promise<Touchpoint[]> {
    // In production, query touchpoint table
    // Mock data
    return [
      {
        id: 'tp_1',
        customerId,
        channel: 'organic_search',
        source: 'google',
        medium: 'organic',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'tp_2',
        customerId,
        channel: 'email',
        source: 'newsletter',
        medium: 'email',
        campaign: 'summer_sale',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'tp_3',
        customerId,
        channel: 'direct',
        source: 'direct',
        medium: 'none',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        orderId: 'ord_123',
        revenue: 45000,
      },
    ];
  }

  /**
   * Track touchpoint
   */
  async trackTouchpoint(touchpoint: Omit<Touchpoint, 'id'>): Promise<Touchpoint> {
    // In production, save to database
    return {
      ...touchpoint,
      id: `tp_${Date.now()}`,
    };
  }

  /**
   * Get attribution comparison across models
   */
  async compareAttributionModels(
    storeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Record<AttributionModel, ChannelPerformance[]>> {
    const models: AttributionModel[] = ['first_touch', 'last_touch', 'linear', 'time_decay', 'position_based'];
    const results: Partial<Record<AttributionModel, ChannelPerformance[]>> = {};

    for (const model of models) {
      results[model] = await this.getChannelPerformance(storeId, startDate, endDate, model);
    }

    return results as Record<AttributionModel, ChannelPerformance[]>;
  }
}

export const attributionService = new AttributionService();
export default AttributionService;
