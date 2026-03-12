import { z } from 'zod';

// ─── Advanced Customer Analytics Types ────────────────────────────────────────

export const CustomerSegment = z.enum([
  'new_customer',
  'regular_customer',
  'vip_customer',
  'at_risk_customer',
  'churned_customer',
  'seasonal_customer',
  'bulk_buyer',
  'impulse_shopper',
  'researcher',
  'loyal_advocate'
]);
export type CustomerSegment = z.infer<typeof CustomerSegment>;

export const BehavioralPattern = z.enum([
  'frequent_visitor',
  'cart_abandoner',
  'deal_seeker',
  'brand_lover',
  'price_sensitive',
  'convenience_focused',
  'social_influencer',
  'comparison_shopper',
  'repeat_purchaser',
  'high_lifetime_value'
]);
export type BehavioralPattern = z.infer<typeof BehavioralPattern>;

export const EngagementLevel = z.enum([
  'dormant',
  'low',
  'moderate',
  'high',
  'advocate'
]);
export type EngagementLevel = z.infer<typeof EngagementLevel>;

export const ChurnRiskLevel = z.enum([
  'very_low',
  'low',
  'medium',
  'high',
  'very_high',
  'imminent'
]);
export type ChurnRiskLevel = z.infer<typeof ChurnRiskLevel>;

export interface CustomerProfile {
  customerId: string;
  demographic: {
    age?: number;
    gender?: string;
    location?: string;
    incomeBracket?: string;
    occupation?: string;
    familyStatus?: string;
  };
  behavioral: {
    firstPurchaseDate: Date;
    lastPurchaseDate: Date;
    purchaseFrequency: number; // purchases per month
    averageOrderValue: number;
    totalSpent: number;
    preferredCategories: string[];
    preferredBrands: string[];
    preferredChannels: string[];
    browsingBehavior: string[];
    devicePreferences: string[];
  };
  engagement: {
    emailOpens: number;
    emailClicks: number;
    appSessions: number;
    websiteVisits: number;
    socialEngagement: number;
    supportTickets: number;
    reviewsWritten: number;
    referralsMade: number;
  };
  psychographic: {
    interests: string[];
    values: string[];
    lifestyle: string;
    personalityTraits: string[];
    shoppingMotivations: string[];
  };
  segments: CustomerSegment[];
  patterns: BehavioralPattern[];
  engagementLevel: EngagementLevel;
  lifetimeValue: number;
  predictedLifetimeValue: number;
  churnRisk: ChurnRiskLevel;
  churnProbability: number; // 0-1
  satisfactionScore?: number; // 1-100
  netPromoterScore?: number; // -100 to 100
  lastUpdated: Date;
}

export interface CustomerJourneyStage {
  stage: 'awareness' | 'consideration' | 'purchase' | 'retention' | 'advocacy' | 'dormant';
  entryDate: Date;
  exitDate?: Date;
  duration: number; // days
  touchpoints: Array<{
    channel: string;
    interactionType: string;
    date: Date;
    outcome: 'positive' | 'neutral' | 'negative';
  }>;
  conversionEvents: string[];
  obstacles: string[];
  successFactors: string[];
}

export interface CohortAnalysis {
  cohortId: string;
  cohortName: string;
  startDate: Date;
  endDate: Date;
  customers: string[];
  metrics: {
    size: number;
    retentionRate: number;
    averageLifetimeValue: number;
    churnRate: number;
    revenuePerCustomer: number;
    engagementScore: number;
  };
  timeSeries: Array<{
    period: Date;
    activeCustomers: number;
    newCustomers: number;
    churnedCustomers: number;
    revenue: number;
    retentionRate: number;
  }>;
  benchmarks: {
    industryAverage: number;
    topQuartile: number;
    improvementAreas: string[];
  };
}

export interface PredictiveCustomerInsight {
  insightId: string;
  customerId: string;
  type: 'churn_prediction' | 'upsell_opportunity' | 'cross_sell_opportunity' | 'lifetime_value_projection' | 'engagement_drop';
  confidence: number; // 1-100
  prediction: {
    likelihood: number; // 0-1 for probabilities
    timeframe: { start: Date; end: Date };
    expectedValue?: number; // monetary value when applicable
    impact: 'low' | 'medium' | 'high' | 'critical';
  };
  supportingEvidence: Array<{
    metric: string;
    currentValue: number | string;
    historicalTrend: 'increasing' | 'decreasing' | 'stable';
    significance: number; // 1-100
  }>;
  recommendedActions: string[];
  createdAt: Date;
  expiresAt?: Date;
}

export interface CustomerLifetimeValueProjection {
  customerId: string;
  currentLTV: number;
  projectedLTV: {
    '30_days': number;
    '90_days': number;
    '1_year': number;
    '3_years': number;
  };
  contributingFactors: Array<{
    factor: string;
    contribution: number; // percentage
    trend: 'positive' | 'negative' | 'stable';
  }>;
  confidenceIntervals: {
    '30_days': [number, number];
    '90_days': [number, number];
    '1_year': [number, number];
    '3_years': [number, number];
  };
  scenarios: {
    optimistic: number;
    realistic: number;
    pessimistic: number;
  };
}

export interface PersonalizationRecommendation {
  customerId: string;
  recommendations: Array<{
    type: 'product' | 'content' | 'offer' | 'channel' | 'timing';
    itemId: string;
    itemName: string;
    confidence: number; // 1-100
    rationale: string;
    expectedEngagement: number; // 1-100
    priority: 'high' | 'medium' | 'low';
  }>;
  personalizationScore: number; // 1-100
  lastUpdated: Date;
}

export interface CustomerHealthScore {
  customerId: string;
  overallScore: number; // 1-100
  components: {
    purchaseBehavior: number; // 1-100
    engagement: number; // 1-100
    satisfaction: number; // 1-100
    loyalty: number; // 1-100
    advocacy: number; // 1-100
  };
  riskFactors: string[];
  strengthFactors: string[];
  trend: 'improving' | 'declining' | 'stable';
  lastCalculated: Date;
}

export interface AttributionAnalysis {
  customerId: string;
  touchpointAttribution: Array<{
    touchpointId: string;
    channel: string;
    interactionType: string;
    date: Date;
    attributionWeight: number; // 0-1
    conversionInfluence: number; // 0-1
    revenueAttributed: number;
  }>;
  conversionPaths: Array<{
    pathId: string;
    touchpoints: string[];
    conversionDate: Date;
    totalValue: number;
    attributionModel: string;
  }>;
  channelEffectiveness: Array<{
    channel: string;
    totalAttribution: number;
    roi: number;
    conversionRate: number;
  }>;
}

export interface CustomerAnalyticsQuery {
  customerId?: string;
  segment?: CustomerSegment;
  engagementLevel?: EngagementLevel;
  churnRiskLevel?: ChurnRiskLevel;
  dateRange?: { from: Date; to: Date };
  metrics?: string[];
  sortBy?: 'ltv' | 'spending' | 'frequency' | 'recency' | 'engagement';
  limit?: number;
}

// ─── Advanced Customer Analytics Service ──────────────────────────────────────

export class AdvancedCustomerAnalyticsService {
  private db: any;
  private mlModels: any;
  private cache: Map<string, any>;

  constructor(db: any, mlModels: any) {
    this.db = db;
    this.mlModels = mlModels;
    this.cache = new Map();
  }

  /**
   * Generate comprehensive customer profiles with behavioral insights
   */
  async generateCustomerProfiles(options?: {
    includePredictions?: boolean;
    segmentCustomers?: boolean;
    calculateLTV?: boolean;
  }): Promise<CustomerProfile[]> {
    // Get raw customer data
    const customers = await this.getRawCustomerData();
    
    // Enrich with behavioral data
    const enrichedCustomers = await this.enrichWithBehavioralData(customers);
    
    // Calculate engagement metrics
    const customersWithEngagement = await this.calculateEngagementMetrics(enrichedCustomers);
    
    // Apply segmentation if requested
    let segmentedCustomers = customersWithEngagement;
    if (options?.segmentCustomers) {
      segmentedCustomers = await this.segmentCustomers(customersWithEngagement);
    }
    
    // Calculate LTV if requested
    let customersWithLTV = segmentedCustomers;
    if (options?.calculateLTV) {
      customersWithLTV = await this.calculateLifetimeValues(segmentedCustomers);
    }
    
    // Add predictions if requested
    let finalProfiles = customersWithLTV;
    if (options?.includePredictions) {
      finalProfiles = await this.addPredictiveInsights(customersWithLTV);
    }
    
    return finalProfiles;
  }

  /**
   * Analyze customer journey stages and transitions
   */
  async analyzeCustomerJourneys(customerId?: string): Promise<CustomerJourneyStage[]> {
    const customers = customerId 
      ? [customerId] 
      : await this.getAllCustomerIds();
    
    const journeys = await Promise.all(
      customers.map(id => this.analyzeIndividualJourney(id))
    );
    
    return journeys.flat();
  }

  /**
   * Perform cohort analysis for customer groups
   */
  async performCohortAnalysis(cohortDefinition: {
    groupBy: 'signup_date' | 'first_purchase' | 'acquisition_channel' | 'demographic';
    period: 'weekly' | 'monthly' | 'quarterly';
    startDate: Date;
    endDate: Date;
  }): Promise<CohortAnalysis[]> {
    // Create cohorts based on definition
    const cohorts = await this.createCohorts(cohortDefinition);
    
    // Calculate cohort metrics
    const analyzedCohorts = await Promise.all(
      cohorts.map(cohort => this.analyzeCohort(cohort))
    );
    
    // Compare against benchmarks
    const benchmarkedCohorts = await this.addBenchmarkComparison(analyzedCohorts);
    
    return benchmarkedCohorts;
  }

  /**
   * Generate predictive customer insights and recommendations
   */
  async generatePredictiveInsights(
    customerId?: string,
    insightTypes?: PredictiveCustomerInsight['type'][]
  ): Promise<PredictiveCustomerInsight[]> {
    const customers = customerId 
      ? [customerId] 
      : await this.getAllCustomerIds();
    
    const allInsights: PredictiveCustomerInsight[] = [];
    
    for (const customer of customers) {
      const customerInsights = await this.generateCustomerInsights(customer, insightTypes);
      allInsights.push(...customerInsights);
    }
    
    // Prioritize insights by impact and confidence
    return this.prioritizeInsights(allInsights);
  }

  /**
   * Calculate and project customer lifetime value
   */
  async projectCustomerLifetimeValue(
    customerId?: string
  ): Promise<CustomerLifetimeValueProjection[]> {
    const customers = customerId 
      ? [customerId] 
      : await this.getActiveCustomerIds();
    
    const projections = await Promise.all(
      customers.map(customer => this.calculateLTVProjection(customer))
    );
    
    return projections;
  }

  /**
   * Generate personalization recommendations for customers
   */
  async generatePersonalizationRecommendations(
    customerId?: string
  ): Promise<PersonalizationRecommendation[]> {
    const customers = customerId 
      ? [customerId] 
      : await this.getAllCustomerIds();
    
    const recommendations = await Promise.all(
      customers.map(customer => this.createPersonalizationRecommendations(customer))
    );
    
    return recommendations;
  }

  /**
   * Calculate comprehensive customer health scores
   */
  async calculateCustomerHealthScores(
    customerId?: string
  ): Promise<CustomerHealthScore[]> {
    const customers = customerId 
      ? [customerId] 
      : await this.getAllCustomerIds();
    
    const healthScores = await Promise.all(
      customers.map(customer => this.calculateIndividualHealthScore(customer))
    );
    
    return healthScores;
  }

  /**
   * Perform multi-touch attribution analysis
   */
  async analyzeAttribution(customerId?: string): Promise<AttributionAnalysis[]> {
    const customers = customerId 
      ? [customerId] 
      : await this.getCustomerIdsWithInteractions();
    
    const analyses = await Promise.all(
      customers.map(customer => this.performAttributionAnalysis(customer))
    );
    
    return analyses;
  }

  /**
   * Get real-time customer analytics dashboard data
   */
  async getAnalyticsDashboard(options: {
    timeRange: '24h' | '7d' | '30d' | '90d' | '1y';
    metrics: string[];
    segments?: CustomerSegment[];
  }): Promise<{
    overview: {
      totalCustomers: number;
      newCustomers: number;
      activeCustomers: number;
      churnedCustomers: number;
      avgLTV: number;
      avgEngagement: number;
    };
    trends: Array<{
      date: Date;
      metric: string;
      value: number;
      comparison: number; // % change from previous period
    }>;
    segments: Array<{
      segment: CustomerSegment;
      count: number;
      avgLTV: number;
      churnRate: number;
      engagementScore: number;
    }>;
    insights: PredictiveCustomerInsight[];
  }> {
    const timeRange = this.getTimeRangeDates(options.timeRange);
    
    const [overview, trends, segments, insights] = await Promise.all([
      this.getOverviewMetrics(timeRange, options.segments),
      this.getTrendData(timeRange, options.metrics),
      this.getSegmentData(timeRange, options.segments),
      this.getRecentInsights(timeRange)
    ]);
    
    return { overview, trends, segments, insights };
  }

  // ─── Private Helper Methods ─────────────────────────────────────────────────

  private async getRawCustomerData(): Promise<any[]> {
    // Mock implementation - would fetch from customer database
    return [
      {
        customerId: 'cust_1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        createdAt: new Date('2023-01-15'),
        lastPurchase: new Date('2024-01-10')
      }
    ];
  }

  private async enrichWithBehavioralData(customers: any[]): Promise<any[]> {
    return customers.map(customer => ({
      ...customer,
      behavioral: {
        firstPurchaseDate: customer.createdAt,
        lastPurchaseDate: customer.lastPurchase,
        purchaseFrequency: 2.5,
        averageOrderValue: 150,
        totalSpent: 3750,
        preferredCategories: ['electronics', 'home'],
        preferredBrands: ['Brand A', 'Brand B'],
        preferredChannels: ['email', 'mobile_app'],
        browsingBehavior: ['frequent_visitor', 'researcher'],
        devicePreferences: ['mobile', 'desktop']
      }
    }));
  }

  private async calculateEngagementMetrics(customers: any[]): Promise<any[]> {
    return customers.map(customer => ({
      ...customer,
      engagement: {
        emailOpens: 45,
        emailClicks: 12,
        appSessions: 23,
        websiteVisits: 67,
        socialEngagement: 8,
        supportTickets: 1,
        reviewsWritten: 3,
        referralsMade: 2
      },
      engagementLevel: 'high' as EngagementLevel
    }));
  }

  private async segmentCustomers(customers: any[]): Promise<any[]> {
    return customers.map(customer => ({
      ...customer,
      segments: ['regular_customer', 'high_lifetime_value'],
      patterns: ['frequent_visitor', 'repeat_purchaser'],
      churnRisk: 'low' as ChurnRiskLevel,
      churnProbability: 0.15
    }));
  }

  private async calculateLifetimeValues(customers: any[]): Promise<any[]> {
    return customers.map(customer => ({
      ...customer,
      lifetimeValue: 3750,
      predictedLifetimeValue: 5200
    }));
  }

  private async addPredictiveInsights(customers: any[]): Promise<any[]> {
    return customers.map(customer => ({
      ...customer,
      satisfactionScore: 85,
      netPromoterScore: 72,
      lastUpdated: new Date()
    }));
  }

  private async getAllCustomerIds(): Promise<string[]> {
    return ['cust_1', 'cust_2', 'cust_3'];
  }

  private async analyzeIndividualJourney(customerId: string): Promise<CustomerJourneyStage[]> {
    return [
      {
        stage: 'awareness',
        entryDate: new Date('2023-01-01'),
        exitDate: new Date('2023-01-15'),
        duration: 14,
        touchpoints: [
          {
            channel: 'social_media',
            interactionType: 'ad_click',
            date: new Date('2023-01-05'),
            outcome: 'positive'
          }
        ],
        conversionEvents: ['email_signup'],
        obstacles: [],
        successFactors: ['compelling_ad_creative']
      }
    ];
  }

  private async createCohorts(definition: any): Promise<any[]> {
    return [{
      cohortId: 'cohort_1',
      cohortName: 'January 2023 Signups',
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-01-31'),
      customers: ['cust_1', 'cust_2']
    }];
  }

  private async analyzeCohort(cohort: any): Promise<CohortAnalysis> {
    return {
      ...cohort,
      metrics: {
        size: cohort.customers.length,
        retentionRate: 0.75,
        averageLifetimeValue: 4200,
        churnRate: 0.25,
        revenuePerCustomer: 3150,
        engagementScore: 78
      },
      timeSeries: [],
      benchmarks: {
        industryAverage: 65,
        topQuartile: 82,
        improvementAreas: ['email_engagement', 'cross_sell_rate']
      }
    };
  }

  private async addBenchmarkComparison(cohorts: CohortAnalysis[]): Promise<CohortAnalysis[]> {
    return cohorts;
  }

  private async generateCustomerInsights(
    customerId: string,
    insightTypes?: string[]
  ): Promise<PredictiveCustomerInsight[]> {
    return [
      {
        insightId: `insight_${customerId}_1`,
        customerId,
        type: 'upsell_opportunity',
        confidence: 85,
        prediction: {
          likelihood: 0.75,
          timeframe: {
            start: new Date(),
            end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          },
          expectedValue: 250,
          impact: 'high'
        },
        supportingEvidence: [
          {
            metric: 'purchase_frequency',
            currentValue: 2.5,
            historicalTrend: 'increasing',
            significance: 80
          }
        ],
        recommendedActions: ['offer_complementary_product', 'send_personalized_email'],
        createdAt: new Date()
      }
    ];
  }

  private prioritizeInsights(insights: PredictiveCustomerInsight[]): PredictiveCustomerInsight[] {
    return insights.sort((a, b) => {
      const scoreA = a.confidence * (a.prediction.likelihood * 100);
      const scoreB = b.confidence * (b.prediction.likelihood * 100);
      return scoreB - scoreA;
    });
  }

  private async calculateLTVProjection(customerId: string): Promise<CustomerLifetimeValueProjection> {
    return {
      customerId,
      currentLTV: 3750,
      projectedLTV: {
        '30_days': 3900,
        '90_days': 4200,
        '1_year': 5200,
        '3_years': 8500
      },
      contributingFactors: [
        {
          factor: 'purchase_frequency',
          contribution: 35,
          trend: 'positive'
        }
      ],
      confidenceIntervals: {
        '30_days': [3800, 4000],
        '90_days': [4000, 4400],
        '1_year': [4800, 5600],
        '3_years': [7500, 9500]
      },
      scenarios: {
        optimistic: 9500,
        realistic: 8500,
        pessimistic: 7000
      }
    };
  }

  private async createPersonalizationRecommendations(customerId: string): Promise<PersonalizationRecommendation> {
    return {
      customerId,
      recommendations: [
        {
          type: 'product',
          itemId: 'prod_123',
          itemName: 'Wireless Headphones',
          confidence: 88,
          rationale: 'Based on previous electronics purchases',
          expectedEngagement: 75,
          priority: 'high'
        }
      ],
      personalizationScore: 85,
      lastUpdated: new Date()
    };
  }

  private async calculateIndividualHealthScore(customerId: string): Promise<CustomerHealthScore> {
    return {
      customerId,
      overallScore: 82,
      components: {
        purchaseBehavior: 85,
        engagement: 78,
        satisfaction: 90,
        loyalty: 80,
        advocacy: 75
      },
      riskFactors: ['declining_email_opens'],
      strengthFactors: ['high_purchase_frequency', 'positive_nps'],
      trend: 'stable',
      lastCalculated: new Date()
    };
  }

  private async getCustomerIdsWithInteractions(): Promise<string[]> {
    return ['cust_1', 'cust_2'];
  }

  private async performAttributionAnalysis(customerId: string): Promise<AttributionAnalysis> {
    return {
      customerId,
      touchpointAttribution: [
        {
          touchpointId: 'tp_1',
          channel: 'email',
          interactionType: 'newsletter_open',
          date: new Date('2024-01-01'),
          attributionWeight: 0.3,
          conversionInfluence: 0.4,
          revenueAttributed: 150
        }
      ],
      conversionPaths: [
        {
          pathId: 'path_1',
          touchpoints: ['email', 'website', 'checkout'],
          conversionDate: new Date('2024-01-10'),
          totalValue: 300,
          attributionModel: 'linear'
        }
      ],
      channelEffectiveness: [
        {
          channel: 'email',
          totalAttribution: 1200,
          roi: 3.5,
          conversionRate: 0.08
        }
      ]
    };
  }

  private getTimeRangeDates(timeRange: string): { from: Date; to: Date } {
    const to = new Date();
    let from: Date;
    
    switch (timeRange) {
      case '24h':
        from = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        from = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        from = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }
    
    return { from, to };
  }

  private async getOverviewMetrics(timeRange: any, segments?: CustomerSegment[]): Promise<any> {
    return {
      totalCustomers: 1250,
      newCustomers: 45,
      activeCustomers: 890,
      churnedCustomers: 12,
      avgLTV: 4200,
      avgEngagement: 72
    };
  }

  private async getTrendData(timeRange: any, metrics: string[]): Promise<any[]> {
    return metrics.map(metric => ({
      date: new Date(),
      metric,
      value: Math.random() * 100,
      comparison: Math.random() * 20 - 10
    }));
  }

  private async getSegmentData(timeRange: any, segments?: CustomerSegment[]): Promise<any[]> {
    return [
      {
        segment: 'regular_customer' as CustomerSegment,
        count: 650,
        avgLTV: 3800,
        churnRate: 0.15,
        engagementScore: 68
      }
    ];
  }

  private async getRecentInsights(timeRange: any): Promise<PredictiveCustomerInsight[]> {
    return await this.generatePredictiveInsights(undefined, ['churn_prediction', 'upsell_opportunity']);
  }

  private async getActiveCustomerIds(): Promise<string[]> {
    return ['cust_1', 'cust_2', 'cust_3'];
  }
}

export const advancedCustomerAnalytics = new AdvancedCustomerAnalyticsService({} as any, {} as any);