/**
 * Analytics Industry Engine
 * Provides data-driven decision making capabilities across all industries
 */

import { DashboardEngine } from '@vayva/industry-core';
import { DataAnalyticsService } from './services/data-analytics.service.js';
import { ReportingService } from './services/reporting.service.js';
import { InsightsService } from './services/insights.service.js';
import { PredictiveAnalyticsService } from './services/predictive-analytics.service.js';
import { CrossIndustryBenchmarkingService } from './services/cross-industry-benchmarking.service.js';
import { AIPredictiveAnalyticsService } from './services/ai-predictive-analytics.service.js';

export interface AnalyticsEngineConfig {
  dataAnalytics?: boolean;
  reporting?: boolean;
  insights?: boolean;
  predictiveAnalytics?: boolean;
  crossIndustryBenchmarking?: boolean;
  aiPredictiveAnalytics?: boolean;
}

export class AnalyticsEngine {
  private dashboardEngine: DashboardEngine;
  private config: AnalyticsEngineConfig;
  
  private dataAnalytics?: DataAnalyticsService;
  private reporting?: ReportingService;
  private insights?: InsightsService;
  private predictiveAnalytics?: PredictiveAnalyticsService;
  private crossIndustryBenchmarking?: CrossIndustryBenchmarkingService;
  private aiPredictiveAnalytics?: AIPredictiveAnalyticsService;

  constructor(config: AnalyticsEngineConfig = {}) {
    this.config = {
      dataAnalytics: true,
      reporting: true,
      insights: true,
      predictiveAnalytics: false,
      ...config,
    };
    this.dashboardEngine = new DashboardEngine();
  }

  async initialize(): Promise<void> {
    console.log('[ANALYTICS] Initializing engine...');
    
    if (this.config.dataAnalytics) {
      this.dataAnalytics = new DataAnalyticsService();
      await this.dataAnalytics.initialize();
      console.log('[ANALYTICS] Data Analytics Service initialized');
    }

    if (this.config.reporting) {
      this.reporting = new ReportingService();
      await this.reporting.initialize();
      console.log('[ANALYTICS] Reporting Service initialized');
    }

    if (this.config.insights) {
      this.insights = new InsightsService();
      await this.insights.initialize();
      console.log('[ANALYTICS] Insights Service initialized');
    }

    if (this.config.predictiveAnalytics) {
      this.predictiveAnalytics = new PredictiveAnalyticsService();
      await this.predictiveAnalytics.initialize();
      console.log('[ANALYTICS] Predictive Analytics Service initialized');
    }

    if (this.config.crossIndustryBenchmarking) {
      this.crossIndustryBenchmarking = new CrossIndustryBenchmarkingService();
      await this.crossIndustryBenchmarking.initialize();
      console.log('[ANALYTICS] Cross-Industry Benchmarking Service initialized');
    }

    if (this.config.aiPredictiveAnalytics) {
      this.aiPredictiveAnalytics = new AIPredictiveAnalyticsService();
      await this.aiPredictiveAnalytics.initialize();
      console.log('[ANALYTICS] AI Predictive Analytics Service initialized');
    }

    console.log('[ANALYTICS] Engine initialization complete');
  }

  getDashboardEngine(): DashboardEngine {
    return this.dashboardEngine;
  }

  getService<T>(name: string): T | undefined {
    const services: Record<string, any> = {
      'data-analytics': this.dataAnalytics,
      'reporting': this.reporting,
      'insights': this.insights,
      'predictive-analytics': this.predictiveAnalytics,
      'cross-industry-benchmarking': this.crossIndustryBenchmarking,
      'ai-predictive-analytics': this.aiPredictiveAnalytics,
    };
    return services[name] as T | undefined;
  }

  getStatus(): {
    engine: 'initialized' | 'not-initialized';
    services: {
      dataAnalytics: boolean;
      reporting: boolean;
      insights: boolean;
      predictiveAnalytics: boolean;
    };
  } {
    return {
      engine: this.dashboardEngine ? 'initialized' : 'not-initialized',
      services: {
        dataAnalytics: !!this.dataAnalytics,
        reporting: !!this.reporting,
        insights: !!this.insights,
        predictiveAnalytics: !!this.predictiveAnalytics,
      },
    };
  }
}
