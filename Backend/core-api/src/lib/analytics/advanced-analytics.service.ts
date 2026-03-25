import { prismaDelegates } from "@vayva/db";
import { logger } from "@vayva/shared";

// Advanced analytics service for enhanced business intelligence
export class AdvancedAnalyticsService {
  private static asSnapshot(value: unknown): {
    revenue: number;
    orders: number;
    customers: number;
    avgOrderValue: number;
  } {
    const v = value as Partial<Record<string, unknown>>;
    return {
      revenue: typeof v.revenue === "number" ? v.revenue : 0,
      orders: typeof v.orders === "number" ? v.orders : 0,
      customers: typeof v.customers === "number" ? v.customers : 0,
      avgOrderValue: typeof v.avgOrderValue === "number" ? v.avgOrderValue : 0,
    };
  }
  /**
   * Generate comprehensive business intelligence report
   */
  static async generateBusinessIntelligenceReport(storeId: string, options: {
    period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
    comparePeriod?: boolean;
    industries?: string[];
  } = {}) {
    const {
      period = 'month',
      comparePeriod = true,
      industries = []
    } = options;

    try {
      // Calculate date ranges
      const now = new Date();
      let startDate: Date, comparisonStartDate: Date, comparisonEndDate: Date;
      
      switch (period) {
        case 'day':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          comparisonStartDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
          comparisonEndDate = startDate;
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          comparisonStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
          comparisonEndDate = startDate;
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          comparisonStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          comparisonEndDate = startDate;
          break;
        case 'quarter': {
          const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
          startDate = new Date(now.getFullYear(), quarterStartMonth, 1);
          comparisonStartDate = new Date(now.getFullYear(), quarterStartMonth - 3, 1);
          comparisonEndDate = startDate;
          break;
        }
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          comparisonStartDate = new Date(now.getFullYear() - 1, 0, 1);
          comparisonEndDate = startDate;
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          comparisonStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          comparisonEndDate = startDate;
      }

      // Fetch data for all relevant industries
      const industryData = await this.fetchIndustryData(storeId, industries, startDate, now, comparePeriod, comparisonStartDate, comparisonEndDate);

      // Calculate comprehensive metrics
      const metrics = this.calculateAdvancedMetrics(industryData, period);

      // Generate predictive insights
      const insights = await this.generatePredictiveInsights(storeId, metrics, period);

      return {
        success: true,
        data: {
          overview: metrics.overview,
          trends: metrics.trends,
          predictions: insights.predictions,
          recommendations: insights.recommendations,
          industryBreakdown: metrics.industryBreakdown,
          kpiDashboard: metrics.kpiDashboard
        },
        meta: {
          generatedAt: new Date().toISOString(),
          period: {
            current: { start: startDate.toISOString(), end: now.toISOString() },
            comparison: comparePeriod ? {
              start: comparisonStartDate.toISOString(),
              end: comparisonEndDate.toISOString()
            } : null
          },
          industries: industries.length > 0 ? industries : 'all'
        }
      };
    } catch (error) {
      logger.error('[ADVANCED_ANALYTICS_ERROR]', { error, storeId, options });
      throw new Error('Failed to generate business intelligence report');
    }
  }

  /**
   * Fetch data across all implemented industries
   */
  private static async fetchIndustryData(
    storeId: string,
    industries: string[],
    startDate: Date,
    endDate: Date,
    comparePeriod: boolean,
    comparisonStartDate?: Date,
    comparisonEndDate?: Date
  ) {
    const allIndustries = [
      'travel', 'nonprofit', 'wellness', 'grocery', 'kitchen', 
      'wholesale', 'creative', 'professional', 'legal'
    ];
    
    const targetIndustries = industries.length > 0 ? industries : allIndustries;

    const industryPromises = targetIndustries.map(async (industry) => {
      try {
        // Fetch current period data
        const currentData = await this.fetchIndustryMetrics(industry, storeId, startDate, endDate);
        
        // Fetch comparison period data if requested
        const comparisonData = comparePeriod && comparisonStartDate && comparisonEndDate
          ? await this.fetchIndustryMetrics(industry, storeId, comparisonStartDate, comparisonEndDate)
          : null;

        return {
          industry,
          current: currentData,
          comparison: comparisonData,
          trend: comparisonData ? this.calculateTrend(currentData, comparisonData) : null
        };
      } catch (error) {
        logger.warn(`[INDUSTRY_DATA_FETCH_WARNING] Failed to fetch ${industry} data`, { error });
        return {
          industry,
          current: { revenue: 0, orders: 0, customers: 0 },
          comparison: null,
          trend: null
        };
      }
    });

    return Promise.all(industryPromises);
  }

  /**
   * Fetch metrics for a specific industry
   */
  private static async fetchIndustryMetrics(
    industry: string,
    storeId: string,
    startDate: Date,
    endDate: Date
  ) {
    switch (industry) {
      case 'travel':
        return await this.fetchTravelMetrics(storeId, startDate, endDate);
      case 'nonprofit':
        return await this.fetchNonprofitMetrics(storeId, startDate, endDate);
      case 'wellness':
        return await this.fetchWellnessMetrics(storeId, startDate, endDate);
      case 'grocery':
        return await this.fetchGroceryMetrics(storeId, startDate, endDate);
      case 'kitchen':
        return await this.fetchKitchenMetrics(storeId, startDate, endDate);
      case 'wholesale':
        return await this.fetchWholesaleMetrics(storeId, startDate, endDate);
      case 'creative':
        return await this.fetchCreativeMetrics(storeId, startDate, endDate);
      case 'professional':
        return await this.fetchProfessionalMetrics(storeId, startDate, endDate);
      case 'legal':
        return await this.fetchLegalMetrics(storeId, startDate, endDate);
      default:
        return { revenue: 0, orders: 0, customers: 0, metrics: {} };
    }
  }

  // Individual industry metric fetchers
  private static async fetchTravelMetrics(storeId: string, startDate: Date, endDate: Date) {
    const [bookings, revenue, customers] = await Promise.all([
      prismaDelegates.travelBooking.count({
        where: { storeId, createdAt: { gte: startDate, lte: endDate } }
      }),
      prismaDelegates.travelBooking.aggregate({
        where: { storeId, createdAt: { gte: startDate, lte: endDate } },
        _sum: { totalAmount: true }
      }),
      prismaDelegates.travelCustomer.count({
        where: { storeId, createdAt: { gte: startDate, lte: endDate } }
      })
    ]);
    
    return {
      revenue: revenue._sum.totalAmount || 0,
      orders: bookings,
      customers,
      avgOrderValue: bookings > 0 ? (revenue._sum.totalAmount || 0) / bookings : 0,
      conversionRate: 0, // Would need booking funnel data
      cancellationRate: 0 // Would need cancellation data
    };
  }

  private static async fetchNonprofitMetrics(storeId: string, startDate: Date, endDate: Date) {
    const [donations, revenue, donors] = await Promise.all([
      prismaDelegates.nonprofitDonation.count({
        where: { storeId, createdAt: { gte: startDate, lte: endDate } }
      }),
      prismaDelegates.nonprofitDonation.aggregate({
        where: { storeId, createdAt: { gte: startDate, lte: endDate } },
        _sum: { amount: true }
      }),
      prismaDelegates.nonprofitDonor.count({
        where: { storeId, createdAt: { gte: startDate, lte: endDate } }
      })
    ]);
    
    return {
      revenue: revenue._sum.amount || 0,
      orders: donations,
      customers: donors,
      avgDonation: donors > 0 ? (revenue._sum.amount || 0) / donors : 0,
      recurringRate: 0, // Would need recurring donation data
      campaignSuccessRate: 0 // Would need campaign data
    };
  }

  private static async fetchWellnessMetrics(storeId: string, startDate: Date, endDate: Date) {
    const [bookings, revenue, members] = await Promise.all([
      prismaDelegates.wellnessClassBooking.count({
        where: { storeId, createdAt: { gte: startDate, lte: endDate } }
      }),
      prismaDelegates.wellnessClassBooking.aggregate({
        where: { storeId, createdAt: { gte: startDate, lte: endDate } },
        _sum: { amount: true }
      }),
      prismaDelegates.wellnessMember.count({
        where: { storeId, createdAt: { gte: startDate, lte: endDate } }
      })
    ]);
    
    return {
      revenue: revenue._sum.amount || 0,
      orders: bookings,
      customers: members,
      avgBookingValue: bookings > 0 ? (revenue._sum.amount || 0) / bookings : 0,
      attendanceRate: 0, // Would need attendance data
      memberRetention: 0 // Would need retention data
    };
  }

  private static async fetchGroceryMetrics(storeId: string, startDate: Date, endDate: Date) {
    const [orders, revenue, customers] = await Promise.all([
      prismaDelegates.groceryOrder.count({
        where: { storeId, createdAt: { gte: startDate, lte: endDate } }
      }),
      prismaDelegates.groceryOrder.aggregate({
        where: { storeId, createdAt: { gte: startDate, lte: endDate } },
        _sum: { totalAmount: true }
      }),
      prismaDelegates.groceryCustomer.count({
        where: { storeId, createdAt: { gte: startDate, lte: endDate } }
      })
    ]);
    
    return {
      revenue: revenue._sum.totalAmount || 0,
      orders,
      customers,
      avgOrderValue: orders > 0 ? (revenue._sum.totalAmount || 0) / orders : 0,
      deliveryRate: 0, // Would need delivery data
      substitutionRate: 0 // Would need substitution data
    };
  }

  private static async fetchKitchenMetrics(storeId: string, startDate: Date, endDate: Date) {
    const [orders, revenue, _stations] = await Promise.all([
      prismaDelegates.kitchenOrder.count({
        where: { storeId, createdAt: { gte: startDate, lte: endDate } }
      }),
      prismaDelegates.kitchenOrder.aggregate({
        where: { storeId, createdAt: { gte: startDate, lte: endDate } },
        _sum: { totalAmount: true }
      }),
      prismaDelegates.kitchenStation.count({
        where: { storeId }
      })
    ]);
    
    return {
      revenue: revenue._sum.totalAmount || 0,
      orders,
      customers: 0, // KDS typically doesn't track individual customers
      avgOrderValue: orders > 0 ? (revenue._sum.totalAmount || 0) / orders : 0,
      fulfillmentTime: 0, // Would need timing data
      wastePercentage: 0 // Would need waste tracking data
    };
  }

  private static async fetchWholesaleMetrics(storeId: string, startDate: Date, endDate: Date) {
    const [orders, revenue, customers] = await Promise.all([
      prismaDelegates.wholesaleOrder.count({
        where: { storeId, createdAt: { gte: startDate, lte: endDate } }
      }),
      prismaDelegates.wholesaleOrder.aggregate({
        where: { storeId, createdAt: { gte: startDate, lte: endDate } },
        _sum: { totalAmount: true }
      }),
      prismaDelegates.wholesaleCustomer.count({
        where: { storeId, createdAt: { gte: startDate, lte: endDate } }
      })
    ]);
    
    return {
      revenue: revenue._sum.totalAmount || 0,
      orders,
      customers,
      avgOrderValue: orders > 0 ? (revenue._sum.totalAmount || 0) / orders : 0,
      creditUtilization: 0, // Would need credit term data
      supplierPerformance: 0 // Would need supplier metrics
    };
  }

  private static async fetchCreativeMetrics(storeId: string, startDate: Date, endDate: Date) {
    const [projects, revenue, clients] = await Promise.all([
      prismaDelegates.creativeProject.count({
        where: { storeId, createdAt: { gte: startDate, lte: endDate } }
      }),
      prismaDelegates.creativeInvoice.aggregate({
        where: { storeId, invoiceDate: { gte: startDate, lte: endDate } },
        _sum: { totalAmount: true }
      }),
      prismaDelegates.creativeClient.count({
        where: { storeId, createdAt: { gte: startDate, lte: endDate } }
      })
    ]);
    
    return {
      revenue: revenue._sum.totalAmount || 0,
      orders: projects,
      customers: clients,
      avgProjectValue: projects > 0 ? (revenue._sum.totalAmount || 0) / projects : 0,
      onTimeDelivery: 0, // Would need project timeline data
      clientRetention: 0 // Would need retention data
    };
  }

  private static async fetchProfessionalMetrics(storeId: string, startDate: Date, endDate: Date) {
    const [cases, revenue, clients] = await Promise.all([
      prismaDelegates.professionalCase.count({
        where: { storeId, createdAt: { gte: startDate, lte: endDate } }
      }),
      prismaDelegates.professionalTimesheet.aggregate({
        where: { storeId, date: { gte: startDate, lte: endDate }, billable: true },
        _sum: { hours: true }
      }),
      prismaDelegates.professionalClient.count({
        where: { storeId, createdAt: { gte: startDate, lte: endDate } }
      })
    ]);
    
    // Assuming $100/hour average rate for professional services
    const calculatedRevenue = (revenue._sum.hours || 0) * 100;
    
    return {
      revenue: calculatedRevenue,
      orders: cases,
      customers: clients,
      avgCaseValue: cases > 0 ? calculatedRevenue / cases : 0,
      utilizationRate: 0, // Would need capacity data
      caseClosureRate: 0 // Would need case outcome data
    };
  }

  private static async fetchLegalMetrics(storeId: string, startDate: Date, endDate: Date) {
    const [cases, revenue, clients] = await Promise.all([
      prismaDelegates.legalCase.count({
        where: { storeId, createdAt: { gte: startDate, lte: endDate } }
      }),
      prismaDelegates.legalTimesheet.aggregate({
        where: { storeId, date: { gte: startDate, lte: endDate }, billable: true },
        _sum: { hours: true }
      }),
      prismaDelegates.legalClient.count({
        where: { storeId, createdAt: { gte: startDate, lte: endDate } }
      })
    ]);
    
    // Assuming $200/hour average rate for legal services
    const calculatedRevenue = (revenue._sum.hours || 0) * 200;
    
    return {
      revenue: calculatedRevenue,
      orders: cases,
      customers: clients,
      avgCaseValue: cases > 0 ? calculatedRevenue / cases : 0,
      winRate: 0, // Would need case outcome data
      settlementRate: 0 // Would need settlement data
    };
  }

  /**
   * Calculate trend between current and comparison periods
   */
  private static calculateTrend(current: unknown, comparison: unknown) {
    const calculateChange = (currentVal: number, comparisonVal: number) => {
      if (comparisonVal === 0) return currentVal > 0 ? 100 : 0;
      return ((currentVal - comparisonVal) / comparisonVal) * 100;
    };

    const c = this.asSnapshot(current);
    const p = this.asSnapshot(comparison);
    return {
      revenueChange: calculateChange(c.revenue, p.revenue),
      orderChange: calculateChange(c.orders, p.orders),
      customerChange: calculateChange(c.customers, p.customers),
      avgOrderValueChange: calculateChange(c.avgOrderValue, p.avgOrderValue)
    };
  }

  /**
   * Calculate advanced metrics from industry data
   */
  private static calculateAdvancedMetrics(industryData: unknown[], _period: string) {
    // Overall totals
    const rows = industryData as Array<{
      industry: string;
      current: ReturnType<typeof AdvancedAnalyticsService.asSnapshot>;
      trend?: Record<string, unknown>;
    }>;
    const totalRevenue = rows.reduce((sum, industry) => sum + industry.current.revenue, 0);
    const totalOrders = rows.reduce((sum, industry) => sum + industry.current.orders, 0);
    const totalCustomers = rows.reduce((sum, industry) => sum + industry.current.customers, 0);
    
    // Industry breakdown
    const industryBreakdown = rows
      .map((industry) => ({
        industry: industry.industry,
        revenue: industry.current.revenue,
        revenueShare: totalRevenue > 0 ? (industry.current.revenue / totalRevenue) * 100 : 0,
        orders: industry.current.orders,
        customers: industry.current.customers,
        trend: industry.trend as unknown,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // KPI Dashboard
    const kpiDashboard = {
      totalRevenue,
      totalOrders,
      totalCustomers,
      avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      customerAcquisitionCost: 0, // Would need marketing spend data
      customerLifetimeValue: 0, // Would need retention data
      revenuePerEmployee: 0, // Would need employee data
      inventoryTurnover: 0 // Would need inventory data
    };

    // Trends analysis
    const trends = {
      revenueTrend: this.analyzeTrend(rows, 'revenue'),
      orderTrend: this.analyzeTrend(rows, 'orders'),
      customerTrend: this.analyzeTrend(rows, 'customers')
    };

    return {
      overview: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        topPerformingIndustry: industryBreakdown[0]?.industry || 'None'
      },
      trends,
      industryBreakdown,
      kpiDashboard
    };
  }

  /**
   * Analyze trends across industries
   */
  private static analyzeTrend(
    industryData: Array<{ trend?: Record<string, unknown> }>,
    metric: string,
  ) {
    const changes = industryData
      .filter((industry) => industry.trend)
      .map((industry) => {
        const v = industry.trend?.[`${metric}Change`];
        return typeof v === "number" ? v : 0;
      });
    
    if (changes.length === 0) return { direction: 'stable', average: 0 };
    
    const average = changes.reduce((sum, change) => sum + change, 0) / changes.length;
    const direction = average > 5 ? 'up' : average < -5 ? 'down' : 'stable';
    
    return { direction, average: Math.round(average * 100) / 100 };
  }

  /**
   * Generate predictive insights using basic trend analysis
   */
  private static async generatePredictiveInsights(
    storeId: string,
    metrics: {
      trends: { revenueTrend: { direction: string } };
      industryBreakdown: Array<{
        industry: string;
        revenueShare: number;
        trend?: unknown;
      }>;
    },
    _period: string,
  ) {
    const predictions = [];
    const recommendations = [];

    // Revenue prediction
    if (metrics.trends.revenueTrend.direction === 'up') {
      predictions.push({
        metric: 'revenue',
        prediction: 'Expected growth of 5-15% next period',
        confidence: 'medium'
      });
      recommendations.push({
        action: 'Scale successful initiatives',
        priority: 'high',
        rationale: 'Positive revenue momentum detected'
      });
    }

    // Customer acquisition insights
    const topIndustry = metrics.industryBreakdown[0];
    if (topIndustry && topIndustry.revenueShare > 40) {
      recommendations.push({
        action: 'Diversify revenue streams',
        priority: 'medium',
        rationale: `Over-dependence on ${topIndustry.industry} industry (${Math.round(topIndustry.revenueShare)}% of revenue)`
      });
    }

    // Performance recommendations
    metrics.industryBreakdown.forEach((industry) => {
      const trend =
        typeof industry.trend === "object" && industry.trend !== null
          ? (industry.trend as Record<string, unknown>)
          : {};
      const revenueChange =
        typeof trend.revenueChange === "number"
          ? (trend.revenueChange as number)
          : 0;
      if (revenueChange < -10) {
        recommendations.push({
          action: `Investigate ${industry.industry} decline`,
          priority: 'high',
          rationale: `Revenue declined ${Math.abs(Math.round(revenueChange))}%`
        });
      }
    });

    return { predictions, recommendations };
  }
}