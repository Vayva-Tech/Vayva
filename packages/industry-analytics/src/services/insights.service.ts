/**
 * Insights Service
 * Business intelligence, KPI tracking, and actionable recommendations
 */

import { z } from 'zod';

export interface KPI {
  id: string;
  name: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  status: 'on-track' | 'at-risk' | 'off-track';
  trend: 'improving' | 'stable' | 'declining';
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'opportunity' | 'warning' | 'recommendation';
  priority: 'high' | 'medium' | 'low';
  impact: number;
  confidence: number;
  actionItems: string[];
}

export interface Benchmark {
  metric: string;
  yourValue: number;
  industryAverage: number;
  percentile: number;
  status: 'above' | 'at' | 'below';
}

const KPISchema = z.object({
  id: z.string(),
  name: z.string(),
  currentValue: z.number(),
  targetValue: z.number(),
  unit: z.string(),
  status: z.enum(['on-track', 'at-risk', 'off-track']),
  trend: z.enum(['improving', 'stable', 'declining']),
});

export class InsightsService {
  private kpis: Map<string, KPI>;
  private insights: Map<string, Insight>;
  private initialized: boolean;

  constructor() {
    this.kpis = new Map();
    this.insights = new Map();
    this.initialized = false;
  }

  async initialize(): Promise<void> {
    console.log('[INSIGHTS] Initializing service...');
    this.initializeSampleData();
    this.initialized = true;
    console.log('[INSIGHTS] Service initialized');
  }

  private initializeSampleData(): void {
    const sampleKPIs: KPI[] = [
      {
        id: 'revenue-growth',
        name: 'Revenue Growth',
        currentValue: 12.5,
        targetValue: 15.0,
        unit: '%',
        status: 'on-track',
        trend: 'improving',
      },
      {
        id: 'customer-retention',
        name: 'Customer Retention Rate',
        currentValue: 78.3,
        targetValue: 85.0,
        unit: '%',
        status: 'at-risk',
        trend: 'stable',
      },
      {
        id: 'cac',
        name: 'Customer Acquisition Cost',
        currentValue: 245,
        targetValue: 200,
        unit: '$',
        status: 'off-track',
        trend: 'declining',
      },
    ];

    sampleKPIs.forEach(kpi => this.kpis.set(kpi.id, kpi));
  }

  trackKPI(kpi: KPI): void {
    KPISchema.parse(kpi);
    this.kpis.set(kpi.id, kpi);
  }

  getKPI(kpiId: string): KPI | undefined {
    return this.kpis.get(kpiId);
  }

  getAllKPIs(): KPI[] {
    return Array.from(this.kpis.values());
  }

  calculateKPIStatus(kpiId: string): {
    achievement: number;
    projection: string;
    recommendation: string;
  } {
    const kpi = this.kpis.get(kpiId);
    if (!kpi) {
      throw new Error(`KPI ${kpiId} not found`);
    }

    const achievement = (kpi.currentValue / kpi.targetValue) * 100;
    let projection = '';
    let recommendation = '';

    if (achievement >= 100) {
      projection = 'Target will be met';
      recommendation = 'Maintain current strategy';
    } else if (achievement >= 80) {
      projection = 'Target likely achievable with minor adjustments';
      recommendation = 'Focus on key improvement areas';
    } else {
      projection = 'Target at risk - immediate action required';
      recommendation = 'Review and adjust strategy urgently';
    }

    return { achievement, projection, recommendation };
  }

  generateInsight(data: {
    metric: string;
    currentValue: number;
    historical: number[];
    benchmark: number;
  }): Insight {
    const { metric, currentValue, historical, benchmark } = data;
    
    const avgHistorical = historical.reduce((sum, val) => sum + val, 0) / historical.length;
    const changeFromAvg = ((currentValue - avgHistorical) / avgHistorical) * 100;
    const changeFromBenchmark = ((currentValue - benchmark) / benchmark) * 100;

    let type: Insight['type'] = 'recommendation';
    let priority: Insight['priority'] = 'medium';

    if (changeFromBenchmark < -20) {
      type = 'warning';
      priority = 'high';
    } else if (changeFromBenchmark > 20) {
      type = 'opportunity';
      priority = 'high';
    }

    const insight: Insight = {
      id: `insight_${Date.now()}`,
      title: `${metric} Performance Analysis`,
      description: `${metric} is ${changeFromBenchmark > 0 ? 'above' : 'below'} industry benchmark by ${Math.abs(changeFromBenchmark).toFixed(1)}%`,
      type,
      priority,
      impact: Math.abs(changeFromBenchmark),
      confidence: 0.85,
      actionItems: this.generateActionItems(type, metric, changeFromBenchmark),
    };

    this.insights.set(insight.id, insight);
    return insight;
  }

  getInsights(filters?: { type?: Insight['type']; priority?: Insight['priority'] }): Insight[] {
    let results = Array.from(this.insights.values());

    if (filters) {
      if (filters.type) {
        results = results.filter(i => i.type === filters.type);
      }
      if (filters.priority) {
        results = results.filter(i => i.priority === filters.priority);
      }
    }

    return results.sort((a, b) => b.impact - a.impact);
  }

  getBenchmarks(metric: string): Benchmark {
    // Simulated industry benchmarks
    const benchmarks: Record<string, number> = {
      'revenue-growth': 10.0,
      'customer-retention': 80.0,
      'conversion-rate': 2.5,
      'cac': 250,
    };

    const industryAvg = benchmarks[metric] || 0;
    const kpi = this.kpis.get(metric);
    
    if (!kpi) {
      throw new Error(`KPI ${metric} not found`);
    }

    const percentile = (kpi.currentValue / industryAvg) * 50;
    const status: Benchmark['status'] = 
      kpi.currentValue > industryAvg * 1.1 ? 'above' :
      kpi.currentValue < industryAvg * 0.9 ? 'below' : 'at';

    return {
      metric,
      yourValue: kpi.currentValue,
      industryAverage: industryAvg,
      percentile: Math.min(percentile, 99),
      status,
    };
  }

  private generateActionItems(
    type: Insight['type'],
    metric: string,
    changeFromBenchmark: number
  ): string[] {
    const items: string[] = [];

    if (type === 'warning') {
      items.push(`Conduct root cause analysis for ${metric} underperformance`);
      items.push('Review recent changes that may have impacted performance');
      items.push('Implement corrective measures within 2 weeks');
    } else if (type === 'opportunity') {
      items.push(`Analyze factors driving ${metric} outperformance`);
      items.push('Document best practices for replication');
      items.push('Consider scaling successful strategies');
    } else {
      items.push(`Monitor ${metric} trends closely`);
      items.push('Identify incremental improvement opportunities');
      items.push('Benchmark against top performers');
    }

    return items;
  }

  getStatus(): boolean {
    return this.initialized;
  }
}
