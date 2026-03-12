/**
 * Event Analytics Service
 * Real-time analytics and insights for nightlife events
 */

import { z } from 'zod';

export interface AttendanceMetrics {
  timestamp: Date;
  currentAttendance: number;
  capacity: number;
  occupancyRate: number;
  checkInsLastHour: number;
  checkOutsLastHour: number;
  peakTime?: Date;
}

export interface RevenueMetrics {
  timestamp: Date;
  coverChargeRevenue: number;
  bottleServiceRevenue: number;
  barRevenue: number;
  totalRevenue: number;
  averageSpendPerHead: number;
}

export interface DemographicBreakdown {
  ageGroups: {
    '18-24': number;
    '25-34': number;
    '35-44': number;
    '45+': number;
  };
  genderRatio: {
    male: number;
    female: number;
    other: number;
  };
  vipPercentage: number;
}

export interface EventAnalyticsConfig {
  enableRealTimeTracking?: boolean;
  trackDemographics?: boolean;
  generateInsights?: boolean;
}

const AttendanceMetricsSchema = z.object({
  timestamp: z.date(),
  currentAttendance: z.number().min(0),
  capacity: z.number().min(0),
  occupancyRate: z.number().min(0).max(100),
  checkInsLastHour: z.number().min(0),
  checkOutsLastHour: z.number().min(0),
  peakTime: z.date().optional(),
});

export class EventAnalyticsService {
  private attendanceHistory: AttendanceMetrics[];
  private revenueHistory: RevenueMetrics[];
  private demographics: DemographicBreakdown;
  private config: EventAnalyticsConfig;

  constructor(config: EventAnalyticsConfig = {}) {
    this.config = {
      enableRealTimeTracking: true,
      trackDemographics: true,
      generateInsights: true,
      ...config,
    };
    this.attendanceHistory = [];
    this.revenueHistory = [];
    this.demographics = {
      ageGroups: { '18-24': 0, '25-34': 0, '35-44': 0, '45+': 0 },
      genderRatio: { male: 0, female: 0, other: 0 },
      vipPercentage: 0,
    };
  }

  async initialize(): Promise<void> {
    console.log('[EVENT_ANALYTICS] Initializing service...');
    
    // Initialize with sample data
    this.initializeSampleData();
    
    console.log('[EVENT_ANALYTICS] Service initialized');
  }

  private initializeSampleData(): void {
    const now = new Date();
    
    // Sample attendance metrics
    const sampleAttendance: AttendanceMetrics = {
      timestamp: now,
      currentAttendance: 245,
      capacity: 400,
      occupancyRate: 61.25,
      checkInsLastHour: 42,
      checkOutsLastHour: 15,
      peakTime: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    };

    // Sample revenue metrics
    const sampleRevenue: RevenueMetrics = {
      timestamp: now,
      coverChargeRevenue: 2450,
      bottleServiceRevenue: 8500,
      barRevenue: 3200,
      totalRevenue: 14150,
      averageSpendPerHead: 57.76,
    };

    this.attendanceHistory.push(sampleAttendance);
    this.revenueHistory.push(sampleRevenue);

    // Sample demographics
    this.demographics = {
      ageGroups: { '18-24': 35, '25-34': 45, '35-44': 15, '45+': 5 },
      genderRatio: { male: 48, female: 50, other: 2 },
      vipPercentage: 12,
    };
  }

  recordAttendance(metrics: Partial<AttendanceMetrics>): void {
    const newMetrics: AttendanceMetrics = {
      ...metrics,
      timestamp: metrics.timestamp || new Date(),
      occupancyRate: metrics.currentAttendance && metrics.capacity 
        ? (metrics.currentAttendance / metrics.capacity) * 100 
        : 0,
    } as AttendanceMetrics;

    AttendanceMetricsSchema.parse(newMetrics);
    this.attendanceHistory.push(newMetrics);
  }

  getCurrentMetrics(): {
    attendance: AttendanceMetrics | null;
    revenue: RevenueMetrics | null;
    demographics: DemographicBreakdown;
  } {
    return {
      attendance: this.attendanceHistory[this.attendanceHistory.length - 1] || null,
      revenue: this.revenueHistory[this.revenueHistory.length - 1] || null,
      demographics: this.demographics,
    };
  }

  getTrends(): {
    attendanceTrend: 'increasing' | 'decreasing' | 'stable';
    revenueTrend: 'increasing' | 'decreasing' | 'stable';
    busyHours: number[];
    projectedEndAttendance: number;
  } {
    if (this.attendanceHistory.length < 2) {
      return {
        attendanceTrend: 'stable',
        revenueTrend: 'stable',
        busyHours: [22, 23, 0, 1],
        projectedEndAttendance: 0,
      };
    }

    const latest = this.attendanceHistory[this.attendanceHistory.length - 1];
    const previous = this.attendanceHistory[this.attendanceHistory.length - 2];
    
    const attendanceChange = latest.currentAttendance - previous.currentAttendance;
    
    return {
      attendanceTrend: attendanceChange > 5 ? 'increasing' : attendanceChange < -5 ? 'decreasing' : 'stable',
      revenueTrend: 'increasing',
      busyHours: [22, 23, 0, 1],
      projectedEndAttendance: Math.round(latest.currentAttendance * 1.15),
    };
  }

  generateInsights(): string[] {
    const insights: string[] = [];
    const metrics = this.getCurrentMetrics();

    if (metrics.attendance && metrics.attendance.occupancyRate > 80) {
      insights.push('🔥 High occupancy! Consider opening VIP section for additional capacity.');
    }

    if (metrics.revenue && metrics.revenue.averageSpendPerHead < 50) {
      insights.push('💡 Average spend is below target. Try promoting premium bottle packages.');
    }

    if (this.demographics.vipPercentage < 10) {
      insights.push('⭐ Low VIP attendance. Consider targeted VIP promotions.');
    }

    insights.push('📊 Peak hours predicted: 10 PM - 1 AM');
    insights.push('👥 Demographics skew 25-34 age group - tailor music accordingly');

    return insights;
  }
}
