/**
 * Data Analytics Service
 * Handles data aggregation, processing, and trend analysis
 */

import { z } from 'zod';

export interface Metric {
  id: string;
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  timestamp: Date;
}

export interface TrendData {
  period: string;
  value: number;
  label: string;
}

export interface AnalyticsQuery {
  metrics: string[];
  timeRange: {
    start: Date;
    end: Date;
  };
  dimensions?: string[];
  filters?: Record<string, any>;
}

const MetricSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.number(),
  change: z.number(),
  trend: z.enum(['up', 'down', 'stable']),
  timestamp: z.date(),
});

export class DataAnalyticsService {
  private metrics: Map<string, Metric>;
  private initialized: boolean;

  constructor() {
    this.metrics = new Map();
    this.initialized = false;
  }

  async initialize(): Promise<void> {
    console.log('[DATA-ANALYTICS] Initializing service...');
    this.initializeSampleData();
    this.initialized = true;
    console.log('[DATA-ANALYTICS] Service initialized');
  }

  private initializeSampleData(): void {
    const sampleMetrics: Metric[] = [
      {
        id: 'revenue',
        name: 'Total Revenue',
        value: 125000,
        change: 12.5,
        trend: 'up',
        timestamp: new Date(),
      },
      {
        id: 'customers',
        name: 'Active Customers',
        value: 1250,
        change: 8.3,
        trend: 'up',
        timestamp: new Date(),
      },
      {
        id: 'conversion',
        name: 'Conversion Rate',
        value: 3.2,
        change: -0.5,
        trend: 'down',
        timestamp: new Date(),
      },
      {
        id: 'aov',
        name: 'Average Order Value',
        value: 85.50,
        change: 0,
        trend: 'stable',
        timestamp: new Date(),
      },
    ];

    sampleMetrics.forEach(metric => this.metrics.set(metric.id, metric));
  }

  getMetric(metricId: string): Metric | undefined {
    return this.metrics.get(metricId);
  }

  getAllMetrics(): Metric[] {
    return Array.from(this.metrics.values());
  }

  addMetric(metric: Metric): void {
    MetricSchema.parse(metric);
    this.metrics.set(metric.id, metric);
  }

  updateMetric(metricId: string, updates: Partial<Metric>): boolean {
    const metric = this.metrics.get(metricId);
    if (!metric) return false;

    Object.assign(metric, updates);
    return true;
  }

  calculateTrend(data: number[]): 'up' | 'down' | 'stable' {
    if (data.length < 2) return 'stable';
    
    const avg = data.reduce((sum, val) => sum + val, 0) / data.length;
    const lastValue = data[data.length - 1];
    const change = ((lastValue - avg) / avg) * 100;

    if (change > 5) return 'up';
    if (change < -5) return 'down';
    return 'stable';
  }

  aggregateData<T>(
    data: T[],
    groupBy: keyof T,
    aggregator: (items: T[]) => number
  ): Map<string, number> {
    const groups = new Map<string, T[]>();

    data.forEach(item => {
      const key = String(item[groupBy]);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(item);
    });

    const result = new Map<string, number>();
    groups.forEach((items, key) => {
      result.set(key, aggregator(items));
    });

    return result;
  }

  getStatus(): boolean {
    return this.initialized;
  }
}
