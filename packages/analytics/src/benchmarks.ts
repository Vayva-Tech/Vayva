/**
 * Industry Benchmarks Service
 * Compare merchant performance against industry averages
 */

// Note: prisma import would come from db package when available
const prisma = {
  order: {
    findMany: async () => [],
    count: async () => 0,
    groupBy: async () => [],
  },
} as unknown as {
  order: {
    findMany: (args: unknown) => Promise<Array<{ total: number; customerId: string }>>;
    count: (args: unknown) => Promise<number>;
    groupBy: (args: unknown) => Promise<Array<{ customerId: string; _count: { id: number } }>>;
  };
};

export type IndustryType = 'fashion' | 'restaurant' | 'realestate' | 'healthcare' | 'retail' | 'general';

export interface BenchmarkMetric {
  metric: string;
  label: string;
  merchantValue: number;
  industryAverage: number;
  industryTop25: number;
  unit: 'percent' | 'currency' | 'number' | 'duration';
  trend: 'up' | 'down' | 'neutral';
  trendValue: number;
}

export interface BenchmarkComparison {
  storeId: string;
  industry: IndustryType;
  period: string;
  metrics: BenchmarkMetric[];
  overallScore: number;
  percentile: number;
}

// Industry benchmark data (would come from aggregated analytics in production)
const industryBenchmarks: Record<IndustryType, Record<string, { avg: number; top25: number; unit: BenchmarkMetric['unit'] }>> = {
  fashion: {
    conversion_rate: { avg: 2.8, top25: 4.5, unit: 'percent' },
    average_order_value: { avg: 35000, top25: 55000, unit: 'currency' },
    return_rate: { avg: 18, top25: 8, unit: 'percent' },
    cart_abandonment: { avg: 72, top25: 55, unit: 'percent' },
    customer_lifetime_value: { avg: 150000, top25: 300000, unit: 'currency' },
    repeat_purchase_rate: { avg: 25, top25: 40, unit: 'percent' },
    sell_through_rate: { avg: 65, top25: 85, unit: 'percent' },
    size_stockout_rate: { avg: 12, top25: 5, unit: 'percent' },
  },
  restaurant: {
    table_turn_rate: { avg: 2.5, top25: 3.5, unit: 'number' },
    average_prep_time: { avg: 18, top25: 12, unit: 'duration' },
    food_cost_percentage: { avg: 32, top25: 28, unit: 'percent' },
    labor_cost_percentage: { avg: 30, top25: 25, unit: 'percent' },
    customer_satisfaction: { avg: 4.2, top25: 4.7, unit: 'number' },
    order_accuracy: { avg: 94, top25: 98, unit: 'percent' },
    average_ticket: { avg: 8500, top25: 12000, unit: 'currency' },
    reservation_no_show_rate: { avg: 15, top25: 8, unit: 'percent' },
  },
  realestate: {
    days_on_market: { avg: 45, top25: 20, unit: 'duration' },
    list_to_sale_ratio: { avg: 96, top25: 99, unit: 'percent' },
    showing_to_offer_ratio: { avg: 12, top25: 25, unit: 'percent' },
    lead_conversion_rate: { avg: 3.5, top25: 8, unit: 'percent' },
    average_commission: { avg: 5, top25: 6, unit: 'percent' },
    client_satisfaction: { avg: 4.4, top25: 4.8, unit: 'number' },
    listings_per_agent: { avg: 8, top25: 15, unit: 'number' },
  },
  healthcare: {
    patient_satisfaction: { avg: 4.3, top25: 4.8, unit: 'number' },
    appointment_no_show: { avg: 18, top25: 10, unit: 'percent' },
    average_wait_time: { avg: 22, top25: 12, unit: 'duration' },
    treatment_adherence: { avg: 75, top25: 90, unit: 'percent' },
    patient_retention: { avg: 68, top25: 85, unit: 'percent' },
    revenue_per_patient: { avg: 45000, top25: 75000, unit: 'currency' },
  },
  retail: {
    conversion_rate: { avg: 3.2, top25: 5.0, unit: 'percent' },
    average_order_value: { avg: 25000, top25: 40000, unit: 'currency' },
    customer_acquisition_cost: { avg: 3500, top25: 2000, unit: 'currency' },
    inventory_turnover: { avg: 6, top25: 10, unit: 'number' },
    gross_margin: { avg: 45, top25: 60, unit: 'percent' },
    repeat_customer_rate: { avg: 30, top25: 50, unit: 'percent' },
  },
  general: {
    conversion_rate: { avg: 3.0, top25: 4.8, unit: 'percent' },
    average_order_value: { avg: 28000, top25: 45000, unit: 'currency' },
    customer_lifetime_value: { avg: 120000, top25: 250000, unit: 'currency' },
    cart_abandonment: { avg: 70, top25: 55, unit: 'percent' },
    customer_satisfaction: { avg: 4.2, top25: 4.7, unit: 'number' },
    repeat_purchase_rate: { avg: 28, top25: 45, unit: 'percent' },
  },
};

export class BenchmarkService {
  /**
   * Get benchmark comparison for a store
   */
  async getBenchmarkComparison(
    storeId: string,
    industry: IndustryType,
    period: string = '30d'
  ): Promise<BenchmarkComparison> {
    const benchmarks = industryBenchmarks[industry] || industryBenchmarks.general;
    const metrics: BenchmarkMetric[] = [];

    // Calculate merchant metrics
    const merchantMetrics = await this.calculateMerchantMetrics(storeId, industry, period);

    for (const [key, benchmark] of Object.entries(benchmarks)) {
      const merchantValue = merchantMetrics[key] || 0;
      const trend = this.calculateTrend(merchantValue, benchmark.avg, benchmark.unit);

      metrics.push({
        metric: key,
        label: this.formatMetricLabel(key),
        merchantValue,
        industryAverage: benchmark.avg,
        industryTop25: benchmark.top25,
        unit: benchmark.unit,
        trend: trend.direction,
        trendValue: trend.value,
      });
    }

    // Calculate overall score
    const overallScore = this.calculateOverallScore(metrics);
    const percentile = this.calculatePercentile(overallScore);

    return {
      storeId,
      industry,
      period,
      metrics,
      overallScore,
      percentile,
    };
  }

  /**
   * Calculate merchant-specific metrics
   */
  private async calculateMerchantMetrics(
    storeId: string,
    industry: IndustryType,
    period: string
  ): Promise<Record<string, number>> {
    const days = parseInt(period);
    const since = new Date();
    since.setDate(since.getDate() - days);

    const metrics: Record<string, number> = {};

    // Common metrics for all industries
    const orders = await prisma.order.findMany({
      where: {
        storeId,
        createdAt: { gte: since },
        paymentStatus: 'PAID',
      },
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);

    if (totalOrders > 0) {
      metrics.average_order_value = totalRevenue / totalOrders;
    }

    // Industry-specific metrics
    switch (industry) {
      case 'fashion':
        metrics.conversion_rate = await this.calculateConversionRate(storeId, since);
        metrics.return_rate = await this.calculateReturnRate(storeId, since);
        metrics.cart_abandonment = await this.calculateCartAbandonment(storeId);
        break;

      case 'restaurant':
        metrics.average_prep_time = await this.calculateAveragePrepTime(storeId, since);
        metrics.average_ticket = metrics.average_order_value || 0;
        break;

      case 'realestate':
        metrics.days_on_market = await this.calculateDaysOnMarket(storeId);
        metrics.lead_conversion_rate = await this.calculateLeadConversion(storeId, since);
        break;

      case 'healthcare':
        metrics.appointment_no_show = await this.calculateNoShowRate(storeId, since);
        metrics.patient_satisfaction = await this.calculateSatisfaction(storeId);
        break;

      default:
        metrics.conversion_rate = await this.calculateConversionRate(storeId, since);
        metrics.repeat_purchase_rate = await this.calculateRepeatPurchaseRate(storeId, since);
    }

    return metrics;
  }

  /**
   * Calculate conversion rate
   */
  private async calculateConversionRate(storeId: string, since: Date): Promise<number> {
    // In production, this would track sessions vs orders
    // Mock calculation for now
    const orders = await prisma.order.count({
      where: { storeId, createdAt: { gte: since } },
    });
    
    // Assume 100 sessions for demo
    return orders > 0 ? (orders / 100) * 100 : 0;
  }

  /**
   * Calculate return rate
   */
  private async calculateReturnRate(storeId: string, since: Date): Promise<number> {
    // In production, track returns
    return 12; // Mock value
  }

  /**
   * Calculate cart abandonment
   */
  private async calculateCartAbandonment(storeId: string): Promise<number> {
    // In production, track cart events
    return 68; // Mock value
  }

  /**
   * Calculate average prep time (restaurant)
   */
  private async calculateAveragePrepTime(storeId: string, since: Date): Promise<number> {
    // In production, track order timestamps
    return 16; // Mock value in minutes
  }

  /**
   * Calculate days on market (real estate)
   */
  private async calculateDaysOnMarket(storeId: string): Promise<number> {
    // In production, track listing dates
    return 38; // Mock value
  }

  /**
   * Calculate lead conversion (real estate)
   */
  private async calculateLeadConversion(storeId: string, since: Date): Promise<number> {
    // In production, track leads vs conversions
    return 4.2; // Mock value
  }

  /**
   * Calculate no-show rate (healthcare)
   */
  private async calculateNoShowRate(storeId: string, since: Date): Promise<number> {
    // In production, track appointments
    return 15; // Mock value
  }

  /**
   * Calculate satisfaction score
   */
  private async calculateSatisfaction(storeId: string): Promise<number> {
    // In production, aggregate ratings
    return 4.4; // Mock value
  }

  /**
   * Calculate repeat purchase rate
   */
  private async calculateRepeatPurchaseRate(storeId: string, since: Date): Promise<number> {
    const customers = await prisma.order.groupBy({
      by: ['customerId'],
      where: { storeId, createdAt: { gte: since } },
      _count: { id: true },
    });

    const repeatCustomers = customers.filter(c => c._count.id > 1).length;
    const totalCustomers = customers.length;

    return totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;
  }

  /**
   * Calculate trend direction and value
   */
  private calculateTrend(
    merchantValue: number,
    industryAvg: number,
    unit: BenchmarkMetric['unit']
  ): { direction: 'up' | 'down' | 'neutral'; value: number } {
    const diff = merchantValue - industryAvg;
    const percentDiff = industryAvg > 0 ? (diff / industryAvg) * 100 : 0;

    // For metrics where lower is better (like return rate)
    const lowerIsBetter = ['return_rate', 'cart_abandonment', 'days_on_market', 'appointment_no_show'];
    
    let direction: 'up' | 'down' | 'neutral';
    
    if (Math.abs(percentDiff) < 5) {
      direction = 'neutral';
    } else if (lowerIsBetter.includes(unit)) {
      direction = diff < 0 ? 'up' : 'down';
    } else {
      direction = diff > 0 ? 'up' : 'down';
    }

    return { direction, value: Math.abs(percentDiff) };
  }

  /**
   * Calculate overall performance score
   */
  private calculateOverallScore(metrics: BenchmarkMetric[]): number {
    if (metrics.length === 0) return 0;

    let totalScore = 0;
    for (const metric of metrics) {
      const ratio = metric.merchantValue / metric.industryAverage;
      // Cap at 2x for scoring
      const cappedRatio = Math.min(ratio, 2);
      totalScore += (cappedRatio / 2) * 100;
    }

    return Math.round(totalScore / metrics.length);
  }

  /**
   * Calculate percentile ranking
   */
  private calculatePercentile(score: number): number {
    // Simple percentile calculation
    return Math.min(Math.round(score), 99);
  }

  /**
   * Format metric label
   */
  private formatMetricLabel(key: string): string {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Get available industries
   */
  getAvailableIndustries(): IndustryType[] {
    return Object.keys(industryBenchmarks) as IndustryType[];
  }

  /**
   * Get metrics for an industry
   */
  getIndustryMetrics(industry: IndustryType): string[] {
    return Object.keys(industryBenchmarks[industry] || industryBenchmarks.general);
  }
}

export const benchmarkService = new BenchmarkService();
export default BenchmarkService;
