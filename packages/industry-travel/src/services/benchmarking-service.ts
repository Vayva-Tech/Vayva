// Temporary workaround for Prisma client import
// In a real implementation, this would import from the correct path
const _PrismaClient: any = {};
import {
  TravelProperty as _TravelProperty,
  TravelBooking as _TravelBooking,
  TravelReview as _TravelReview
} from '../types';
import type { BenchmarkData } from './analytics-service';

export interface BenchmarkMetric {
  name: string;
  currentValue: number;
  industryAverage: number;
  industryMedian: number;
  percentile: number;
  trend: 'improving' | 'declining' | 'stable';
  recommendation?: string;
}

export interface PerformanceScore {
  overall: number; // 0-100
  categories: {
    financial: number;
    operational: number;
    guestExperience: number;
    marketPosition: number;
  };
  strengths: string[];
  weaknesses: string[];
  improvementAreas: Array<{
    area: string;
    currentScore: number;
    targetScore: number;
    actions: string[];
  }>;
}

export interface IndustryBenchmark {
  metric: string;
  segment: 'luxury' | 'mid-market' | 'budget' | 'resort' | 'hotel' | 'vacation-rental';
  average: number;
  median: number;
  stdDeviation: number;
  sampleSize: number;
  updatedAt: Date;
}

export class PerformanceBenchmarkingService {
  private prisma: any;

  constructor(prisma?: any) {
    this.prisma = prisma ?? {};
  }

  /**
   * Dashboard-friendly benchmark snapshot when full Prisma data is unavailable.
   */
  async getBenchmarkData(_tenantId?: string): Promise<BenchmarkData | null> {
    void _tenantId;
    return {
      occupancyRate: { property: 0, industry: 0, percentile: 50 },
      averageDailyRate: { property: 0, industry: 0, percentile: 50 },
      revenuePerAvailableRoom: { property: 0, industry: 0, percentile: 50 },
      guestSatisfaction: { property: 0, industry: 0, percentile: 50 },
    };
  }

  /**
   * Run comprehensive performance benchmark for a property
   */
  async runPropertyBenchmark(propertyId: string): Promise<PerformanceScore> {
    const property = await this.prisma.travelProperty.findUnique({
      where: { id: propertyId },
      include: {
        rooms: true,
        bookings: {
          where: {
            status: { in: ['CONFIRMED', 'CHECKED_IN', 'COMPLETED'] }
          }
        },
        reviews: true
      }
    });

    if (!property) {
      throw new Error('Property not found');
    }

    // Calculate all metrics
    const metrics = await this.calculateAllMetrics(property);
    
    // Score each category
    const financialScore = this.scoreFinancialMetrics(metrics);
    const operationalScore = this.scoreOperationalMetrics(metrics);
    const guestExperienceScore = this.scoreGuestExperienceMetrics(metrics);
    const marketPositionScore = this.scoreMarketPositionMetrics(metrics);

    // Calculate overall score
    const overall = Math.round(
      (financialScore * 0.3) + 
      (operationalScore * 0.25) + 
      (guestExperienceScore * 0.25) + 
      (marketPositionScore * 0.2)
    );

    // Identify strengths and weaknesses
    const scores = [
      { name: 'Financial Performance', score: financialScore },
      { name: 'Operational Efficiency', score: operationalScore },
      { name: 'Guest Experience', score: guestExperienceScore },
      { name: 'Market Position', score: marketPositionScore }
    ];

    const strengths = scores
      .filter(s => s.score >= 75)
      .map(s => s.name);
    
    const weaknesses = scores
      .filter(s => s.score < 60)
      .map(s => s.name);

    // Generate improvement recommendations
    const improvementAreas = this.generateImprovementRecommendations(metrics, scores);

    return {
      overall,
      categories: {
        financial: financialScore,
        operational: operationalScore,
        guestExperience: guestExperienceScore,
        marketPosition: marketPositionScore
      },
      strengths,
      weaknesses,
      improvementAreas
    };
  }

  /**
   * Get detailed benchmark metrics for a property
   */
  async getPropertyBenchmarks(propertyId: string): Promise<BenchmarkMetric[]> {
    const property = await this.prisma.travelProperty.findUnique({
      where: { id: propertyId },
      include: {
        rooms: true,
        bookings: {
          where: {
            status: { in: ['CONFIRMED', 'CHECKED_IN', 'COMPLETED'] }
          }
        },
        reviews: true
      }
    });

    if (!property) {
      throw new Error('Property not found');
    }

    const metrics = await this.calculateAllMetrics(property);
    const benchmarks = await this.getIndustryBenchmarks(property.type);

    return Object.entries(metrics).map(([key, value]) => {
      const benchmark = benchmarks.find(b => b.metric === key);
      if (!benchmark) {
        return {
          name: key,
          currentValue: value,
          industryAverage: 0,
          industryMedian: 0,
          percentile: 50,
          trend: 'stable' as const
        };
      }

      const percentile = this.calculatePercentile(value, benchmark);
      const trend = this.determineTrend(value, (benchmark as any).average);

      return {
        name: key,
        currentValue: parseFloat(value.toFixed(2)),
        industryAverage: parseFloat(benchmark.average.toFixed(2)),
        industryMedian: parseFloat(benchmark.median.toFixed(2)),
        percentile: parseFloat(percentile.toFixed(1)),
        trend
      };
    });
  }

  /**
   * Compare multiple properties performance
   */
  async compareProperties(propertyIds: string[]): Promise<any> {
    const properties = await this.prisma.travelProperty.findMany({
      where: { id: { in: propertyIds } },
      include: {
        rooms: true,
        bookings: {
          where: {
            status: { in: ['CONFIRMED', 'CHECKED_IN', 'COMPLETED'] }
          }
        },
        reviews: true
      }
    });

    const propertyScores = await Promise.all(
      properties.map(async (property: any) => {
        const score = await this.runPropertyBenchmark(property.id);
        return {
          propertyId: property.id,
          propertyName: property.name,
          score
        };
      })
    );

    return propertyScores.sort((a: any, b: any) => b.score.overall - a.score.overall);
  }

  /**
   * Get industry benchmarks by property type
   */
  async getIndustryBenchmarks(propertyType: string): Promise<IndustryBenchmark[]> {
    // In a real implementation, this would fetch from an external benchmark database
    // For now, we'll return simulated data based on property type
    
    const benchmarksByType: Record<string, Partial<IndustryBenchmark>[]> = {
      'HOTEL': [
        { metric: 'occupancyRate', average: 72.3, median: 70.1, stdDeviation: 12.5, sampleSize: 1250 },
        { metric: 'averageDailyRate', average: 185.50, median: 175.00, stdDeviation: 45.20, sampleSize: 1250 },
        { metric: 'revenuePerAvailableRoom', average: 133.85, median: 125.40, stdDeviation: 35.80, sampleSize: 1250 },
        { metric: 'guestSatisfaction', average: 4.2, median: 4.3, stdDeviation: 0.6, sampleSize: 1250 },
        { metric: 'bookingConversionRate', average: 3.8, median: 3.5, stdDeviation: 1.2, sampleSize: 1250 },
        { metric: 'averageStayLength', average: 2.8, median: 2.5, stdDeviation: 1.1, sampleSize: 1250 }
      ],
      'RESORT': [
        { metric: 'occupancyRate', average: 68.7, median: 67.2, stdDeviation: 15.3, sampleSize: 890 },
        { metric: 'averageDailyRate', average: 325.80, median: 310.00, stdDeviation: 85.40, sampleSize: 890 },
        { metric: 'revenuePerAvailableRoom', average: 224.32, median: 212.60, stdDeviation: 68.90, sampleSize: 890 },
        { metric: 'guestSatisfaction', average: 4.4, median: 4.5, stdDeviation: 0.5, sampleSize: 890 },
        { metric: 'bookingConversionRate', average: 4.2, median: 4.0, stdDeviation: 1.0, sampleSize: 890 },
        { metric: 'averageStayLength', average: 4.2, median: 4.0, stdDeviation: 1.8, sampleSize: 890 }
      ],
      'VACATION_RENTAL': [
        { metric: 'occupancyRate', average: 55.2, median: 52.8, stdDeviation: 18.7, sampleSize: 2100 },
        { metric: 'averageDailyRate', average: 245.30, median: 230.00, stdDeviation: 65.10, sampleSize: 2100 },
        { metric: 'revenuePerAvailableRoom', average: 135.26, median: 126.80, stdDeviation: 42.30, sampleSize: 2100 },
        { metric: 'guestSatisfaction', average: 4.6, median: 4.7, stdDeviation: 0.4, sampleSize: 2100 },
        { metric: 'bookingConversionRate', average: 5.1, median: 4.8, stdDeviation: 1.5, sampleSize: 2100 },
        { metric: 'averageStayLength', average: 5.8, median: 5.5, stdDeviation: 2.3, sampleSize: 2100 }
      ]
    };

    const typeKey = propertyType.toUpperCase();
    const baseBenchmarks = benchmarksByType[typeKey] || benchmarksByType['HOTEL'];

    return baseBenchmarks.map(benchmark => ({
      ...benchmark,
      segment: propertyType.toLowerCase() as any,
      updatedAt: new Date()
    })) as IndustryBenchmark[];
  }

  /**
   * Track performance trends over time
   */
  async getPerformanceTrends(propertyId: string, months: number = 12): Promise<any> {
    const property = await this.prisma.travelProperty.findUnique({
      where: { id: propertyId }
    });

    if (!property) {
      throw new Error('Property not found');
    }

    const _endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    // Get monthly data
    const monthlyData = [];
    for (let i = 0; i < months; i++) {
      const monthStart = new Date(startDate);
      monthStart.setMonth(startDate.getMonth() + i);
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

      const bookings = await this.prisma.travelBooking.findMany({
        where: {
          propertyId,
          checkInDate: { gte: monthStart, lte: monthEnd },
          status: { in: ['CONFIRMED', 'CHECKED_IN', 'COMPLETED'] }
        }
      });

      const reviews = await this.prisma.travelReview.findMany({
        where: {
          propertyId,
          createdAt: { gte: monthStart, lte: monthEnd }
        }
      });

      const totalRevenue = bookings.reduce((sum: number, b: any) => sum + b.totalAmount.toNumber(), 0);
      const totalRoomNights = bookings.reduce((sum: number, booking: any) => {
        const nights = Math.ceil((booking.checkOutDate.getTime() - booking.checkInDate.getTime()) / (1000 * 60 * 60 * 24));
        return sum + nights;
      }, 0);

      const occupancyRate = property.rooms.length > 0 
        ? (totalRoomNights / (property.rooms.length * monthEnd.getDate())) * 100
        : 0;

      const averageDailyRate = totalRoomNights > 0 ? totalRevenue / totalRoomNights : 0;
      const guestSatisfaction = reviews.length > 0 
        ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
        : 0;

      monthlyData.push({
        month: `${monthStart.getFullYear()}-${(monthStart.getMonth() + 1).toString().padStart(2, '0')}`,
        occupancyRate: parseFloat(occupancyRate.toFixed(2)),
        averageDailyRate: parseFloat(averageDailyRate.toFixed(2)),
        revenue: parseFloat(totalRevenue.toFixed(2)),
        guestSatisfaction: parseFloat(guestSatisfaction.toFixed(1)),
        bookings: bookings.length,
        reviews: reviews.length
      });
    }

    return monthlyData;
  }

  // Private helper methods
  private async calculateAllMetrics(property: any) {
    const totalRooms = property.rooms.length;
    const totalBookings = property.bookings.length;
    
    // Revenue calculations
    const totalRevenue = property.bookings.reduce((sum: number, b: any) => sum + b.totalAmount.toNumber(), 0);
    const totalRoomNights = property.bookings.reduce((sum: number, booking: any) => {
      const nights = Math.ceil((booking.checkOutDate.getTime() - booking.checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      return sum + nights;
    }, 0);

    const occupancyRate = totalRooms > 0 && totalRoomNights > 0
      ? (totalRoomNights / (totalRooms * 30)) * 100 // Monthly occupancy
      : 0;

    const averageDailyRate = totalRoomNights > 0 ? totalRevenue / totalRoomNights : 0;
    const revenuePerAvailableRoom = totalRooms > 0 ? totalRevenue / (totalRooms * 30) : 0;

    // Guest satisfaction
    const guestSatisfaction = property.reviews.length > 0
      ? property.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / property.reviews.length
      : property.rating; // Fallback to property rating

    // Booking conversion (simulated - would need inquiry data)
    const bookingConversionRate = 3.8 + (Math.random() * 2); // 3.8-5.8%

    // Average stay length
    const averageStayLength = totalBookings > 0
      ? totalRoomNights / totalBookings
      : 0;

    // Revenue per booking
    const revenuePerBooking = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    return {
      occupancyRate,
      averageDailyRate,
      revenuePerAvailableRoom,
      guestSatisfaction,
      bookingConversionRate,
      averageStayLength,
      revenuePerBooking,
      totalRevenue,
      totalBookings
    };
  }

  private scoreFinancialMetrics(metrics: any): number {
    // Weighted scoring based on industry benchmarks
    const occupancyScore = Math.min(100, Math.max(0, (metrics.occupancyRate / 80) * 100));
    const adrScore = Math.min(100, Math.max(0, (metrics.averageDailyRate / 200) * 100));
    const revparScore = Math.min(100, Math.max(0, (metrics.revenuePerAvailableRoom / 150) * 100));
    
    return Math.round((occupancyScore * 0.4) + (adrScore * 0.3) + (revparScore * 0.3));
  }

  private scoreOperationalMetrics(metrics: any): number {
    // Operational efficiency scoring
    const conversionScore = Math.min(100, Math.max(0, (metrics.bookingConversionRate / 5) * 100));
    const stayLengthScore = Math.min(100, Math.max(0, (metrics.averageStayLength / 4) * 100));
    
    return Math.round((conversionScore * 0.6) + (stayLengthScore * 0.4));
  }

  private scoreGuestExperienceMetrics(metrics: any): number {
    // Guest experience scoring
    const satisfactionScore = Math.min(100, Math.max(0, (metrics.guestSatisfaction / 5) * 100));
    const repeatGuestScore = 85; // Simulated - would need actual repeat guest data
    
    return Math.round((satisfactionScore * 0.7) + (repeatGuestScore * 0.3));
  }

  private scoreMarketPositionMetrics(metrics: any): number {
    // Market position scoring
    const revenueGrowthScore = 75; // Simulated - would need historical data
    const competitivePricingScore = Math.min(100, Math.max(0, 100 - Math.abs((metrics.averageDailyRate - 185.50) / 185.50) * 100));
    
    return Math.round((revenueGrowthScore * 0.5) + (competitivePricingScore * 0.5));
  }

  private generateImprovementRecommendations(metrics: any, scores: any[]): any[] {
    const recommendations = [];

    // Financial improvements
    if (scores.find(s => s.name === 'Financial Performance')?.score < 70) {
      recommendations.push({
        area: 'Revenue Optimization',
        currentScore: scores.find(s => s.name === 'Financial Performance')?.score,
        targetScore: 80,
        actions: [
          'Implement dynamic pricing strategies',
          'Optimize room inventory management',
          'Expand direct booking channels',
          'Analyze competitor pricing regularly'
        ]
      });
    }

    // Operational improvements
    if (scores.find(s => s.name === 'Operational Efficiency')?.score < 70) {
      recommendations.push({
        area: 'Operational Efficiency',
        currentScore: scores.find(s => s.name === 'Operational Efficiency')?.score,
        targetScore: 85,
        actions: [
          'Streamline booking confirmation process',
          'Implement automated guest communication',
          'Optimize housekeeping scheduling',
          'Reduce booking abandonment rate'
        ]
      });
    }

    // Guest experience improvements
    if (scores.find(s => s.name === 'Guest Experience')?.score < 70) {
      recommendations.push({
        area: 'Guest Experience Enhancement',
        currentScore: scores.find(s => s.name === 'Guest Experience')?.score,
        targetScore: 90,
        actions: [
          'Implement guest feedback collection system',
          'Train staff on customer service excellence',
          'Personalize guest communications',
          'Offer loyalty program benefits'
        ]
      });
    }

    return recommendations;
  }

  private calculatePercentile(value: number, benchmark: IndustryBenchmark): number {
    // Simplified percentile calculation
    if (value <= benchmark.average - benchmark.stdDeviation) return 15;
    if (value <= benchmark.average) return 35;
    if (value <= benchmark.average + benchmark.stdDeviation) return 65;
    return 85;
  }

  private determineTrend(currentValue: number, industryAverage: number): 'improving' | 'declining' | 'stable' {
    const difference = ((currentValue - industryAverage) / industryAverage) * 100;
    if (difference > 10) return 'improving';
    if (difference < -10) return 'declining';
    return 'stable';
  }
}