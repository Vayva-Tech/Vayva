// Temporary workaround for Prisma client import
// In a real implementation, this would import from the correct path
const PrismaClient: any = {};
import { 
  DateRange, 
  TravelProperty,
  TravelBooking
} from '../types';

export interface AnalyticsQueryOptions {
  dateRange?: DateRange;
  propertyIds?: string[];
  groupBy?: 'day' | 'week' | 'month' | 'property';
  filters?: Record<string, any>;
}

export interface OccupancyMetrics {
  currentRate: number;
  averageRate: number;
  peakRate: number;
  lowRate: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  byProperty: Array<{
    propertyId: string;
    propertyName: string;
    occupancyRate: number;
  }>;
}

export interface RevenueReport {
  totalRevenue: number;
  averageDailyRate: number;
  revenuePerAvailableRoom: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  dailyBreakdown?: Array<{
    date: Date;
    revenue: number;
    bookings: number;
  }>;
  byProperty?: Array<{
    propertyId: string;
    propertyName: string;
    revenue: number;
    adr: number;
  }>;
}

export interface GuestDemographics {
  byCountry: Array<{
    country: string;
    count: number;
    percentage: number;
  }>;
  byAgeGroup: Array<{
    ageGroup: string;
    count: number;
    percentage: number;
  }>;
  repeatGuests: number;
  newGuests: number;
  averageStayLength: number;
}

export interface BenchmarkData {
  occupancyRate: {
    property: number;
    industry: number;
    percentile: number;
  };
  averageDailyRate: {
    property: number;
    industry: number;
    percentile: number;
  };
  revenuePerAvailableRoom: {
    property: number;
    industry: number;
    percentile: number;
  };
  guestSatisfaction: {
    property: number;
    industry: number;
    percentile: number;
  };
}

export class TravelAnalyticsService {
  private prisma: any;

  constructor(prisma: any) {
    this.prisma = prisma;
  }

  /**
   * Get current occupancy metrics
   */
  async getOccupancyMetrics(options: AnalyticsQueryOptions = {}): Promise<OccupancyMetrics> {
    const { dateRange, propertyIds } = options;
    
    const today = new Date();
    const startDate = dateRange?.startDate || new Date(today.getFullYear(), today.getMonth(), 1);
    const endDate = dateRange?.endDate || new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Get all properties
    const properties = await this.prisma.travelProperty.findMany({
      where: propertyIds ? { id: { in: propertyIds } } : {},
      include: {
        rooms: true,
        bookings: {
          where: {
            checkInDate: { lte: endDate },
            checkOutDate: { gte: startDate },
            status: { in: ['CONFIRMED', 'CHECKED_IN'] }
          }
        }
      }
    });

    // Calculate occupancy rates
    const occupancyData = properties.map((property: any) => {
      const totalRooms = property.rooms.length;
      const occupiedRooms = property.bookings.length;
      const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

      return {
        propertyId: property.id,
        propertyName: property.name,
        occupancyRate: parseFloat(occupancyRate.toFixed(2))
      };
    });

    // Calculate overall metrics
    const currentRate = occupancyData.length > 0 
      ? occupancyData.reduce((sum: number, item: any) => sum + item.occupancyRate, 0) / occupancyData.length
      : 0;

    // Get historical data for trend analysis
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const historicalBookings = await this.prisma.travelBooking.findMany({
      where: {
        checkInDate: { gte: thirtyDaysAgo },
        status: { in: ['CONFIRMED', 'CHECKED_IN', 'COMPLETED'] }
      },
      include: { property: true }
    });

    const dailyRates = this.calculateDailyOccupancyRates(historicalBookings as any[], thirtyDaysAgo);
    const averageRate = dailyRates.length > 0 
      ? dailyRates.reduce((sum, rate) => sum + rate.rate, 0) / dailyRates.length
      : 0;
    
    const peakRate = dailyRates.length > 0 ? Math.max(...dailyRates.map(d => d.rate)) : 0;
    const lowRate = dailyRates.length > 0 ? Math.min(...dailyRates.map(d => d.rate)) : 0;

    // Determine trend
    const recentAverage = dailyRates.slice(-7).reduce((sum, day) => sum + day.rate, 0) / 7;
    const previousAverage = dailyRates.slice(-14, -7).reduce((sum, day) => sum + day.rate, 0) / 7;
    const trend = recentAverage > previousAverage ? 'increasing' : 
                  recentAverage < previousAverage ? 'decreasing' : 'stable';

    return {
      currentRate: parseFloat(currentRate.toFixed(2)),
      averageRate: parseFloat(averageRate.toFixed(2)),
      peakRate: parseFloat(peakRate.toFixed(2)),
      lowRate: parseFloat(lowRate.toFixed(2)),
      trend,
      byProperty: occupancyData
    };
  }

  /**
   * Get revenue report
   */
  async getRevenueReport(
    period: 'daily' | 'weekly' | 'monthly' | 'custom' = 'monthly',
    options: AnalyticsQueryOptions = {}
  ): Promise<RevenueReport> {
    const { dateRange, propertyIds } = options;
    
    let startDate: Date;
    let endDate: Date = new Date();

    switch (period) {
      case 'daily':
        startDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() - 1);
        break;
      case 'weekly':
        startDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() - 7);
        break;
      case 'monthly':
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);
        break;
      case 'custom':
        startDate = dateRange?.startDate || new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);
        endDate = dateRange?.endDate || new Date();
        break;
    }

    // Get bookings in the period
    const bookings = await this.prisma.travelBooking.findMany({
      where: {
        checkInDate: { gte: startDate },
        checkOutDate: { lte: endDate },
        status: { in: ['CONFIRMED', 'CHECKED_IN', 'COMPLETED'] },
        ...(propertyIds && { propertyId: { in: propertyIds } })
      },
      include: {
        property: {
          include: { rooms: true }
        }
      }
    });

    // Calculate total revenue
    const totalRevenue = bookings.reduce((sum: number, booking: any) => sum + booking.totalAmount.toNumber(), 0);
    
    // Calculate ADR (Average Daily Rate)
    const totalRoomNights = bookings.reduce((sum: number, booking: any) => {
      const nights = Math.ceil((booking.checkOutDate.getTime() - booking.checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      return sum + nights;
    }, 0);
    
    const averageDailyRate = totalRoomNights > 0 ? totalRevenue / totalRoomNights : 0;

    // Calculate RevPAR (Revenue Per Available Room)
    const properties = await this.prisma.travelProperty.findMany({
      where: propertyIds ? { id: { in: propertyIds } } : {},
      include: { rooms: true }
    });

    const totalAvailableRooms = properties.reduce((sum: number, prop: any) => sum + prop.rooms.length, 0);
    const daysInPeriod = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalAvailableRoomNights = totalAvailableRooms * daysInPeriod;
    const revenuePerAvailableRoom = totalAvailableRoomNights > 0 ? totalRevenue / totalAvailableRoomNights : 0;

    // Determine trend
    const previousPeriodStart = new Date(startDate);
    const previousPeriodEnd = new Date(startDate);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - daysInPeriod);
    
    const previousBookings = await this.prisma.travelBooking.findMany({
      where: {
        checkInDate: { gte: previousPeriodStart, lte: previousPeriodEnd },
        status: { in: ['CONFIRMED', 'CHECKED_IN', 'COMPLETED'] }
      }
    });

    const previousRevenue = previousBookings.reduce((sum: number, booking: any) => sum + booking.totalAmount.toNumber(), 0);
    const trend = totalRevenue > previousRevenue ? 'increasing' : 
                  totalRevenue < previousRevenue ? 'decreasing' : 'stable';

    // Daily breakdown for charts
    let dailyBreakdown: RevenueReport['dailyBreakdown'] = [];
    if (period === 'daily' || period === 'weekly') {
      dailyBreakdown = this.calculateDailyRevenue(bookings, startDate, endDate);
    }

    // By property breakdown
    const byProperty = properties.map((property: any) => {
      const propertyBookings = bookings.filter((b: any) => b.propertyId === property.id);
      const propertyRevenue = propertyBookings.reduce((sum: number, b: any) => sum + b.totalAmount.toNumber(), 0);
      const propertyRoomNights = propertyBookings.reduce((sum: number, booking: any) => {
        const nights = Math.ceil((booking.checkOutDate.getTime() - booking.checkInDate.getTime()) / (1000 * 60 * 60 * 24));
        return sum + nights;
      }, 0);
      
      const adr = propertyRoomNights > 0 ? propertyRevenue / propertyRoomNights : 0;
      
      return {
        propertyId: property.id,
        propertyName: property.name,
        revenue: parseFloat(propertyRevenue.toFixed(2)),
        adr: parseFloat(adr.toFixed(2))
      };
    }).filter((p: any) => p.revenue > 0);

    return {
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      averageDailyRate: parseFloat(averageDailyRate.toFixed(2)),
      revenuePerAvailableRoom: parseFloat(revenuePerAvailableRoom.toFixed(2)),
      trend,
      dailyBreakdown,
      byProperty
    };
  }

  /**
   * Get guest demographics
   */
  async getGuestDemographics(options: AnalyticsQueryOptions = {}): Promise<GuestDemographics> {
    const { dateRange, propertyIds } = options;
    
    const startDate = dateRange?.startDate || new Date(new Date().getFullYear() - 1, 0, 1);
    const endDate = dateRange?.endDate || new Date();

    // Get bookings with guest information
    const bookings = await this.prisma.travelBooking.findMany({
      where: {
        checkInDate: { gte: startDate, lte: endDate },
        status: { in: ['CONFIRMED', 'CHECKED_IN', 'COMPLETED'] },
        ...(propertyIds && { propertyId: { in: propertyIds } })
      },
      include: {
        guestProfile: true
      }
    });

    // Group by country
    const countryMap = new Map<string, number>();
    bookings.forEach((booking: any) => {
      if (booking.guestProfile?.country) {
        countryMap.set(
          booking.guestProfile.country,
          (countryMap.get(booking.guestProfile.country) || 0) + 1
        );
      }
    });

    const byCountry = Array.from(countryMap.entries())
      .map(([country, count]) => ({
        country,
        count,
        percentage: parseFloat(((count / bookings.length) * 100).toFixed(2))
      }))
      .sort((a, b) => b.count - a.count);

    // Age group distribution (simulated for now)
    const ageGroups = [
      { range: '18-25', percentage: 15 },
      { range: '26-35', percentage: 35 },
      { range: '36-50', percentage: 30 },
      { range: '51+', percentage: 20 }
    ];

    const byAgeGroup = ageGroups.map(group => ({
      ageGroup: group.range,
      count: Math.round((group.percentage / 100) * bookings.length),
      percentage: group.percentage
    }));

    // Repeat vs new guests
    const guestCounts = new Map<string, number>();
    bookings.forEach((booking: any) => {
      const guestKey = `${booking.guestProfile?.firstName}-${booking.guestProfile?.lastName}`;
      guestCounts.set(guestKey, (guestCounts.get(guestKey) || 0) + 1);
    });

    const repeatGuests = Array.from(guestCounts.values()).filter(count => count > 1).length;
    const newGuests = guestCounts.size - repeatGuests;

    // Average stay length
    const totalNights = bookings.reduce((sum: number, booking: any) => {
      const nights = Math.ceil((booking.checkOutDate.getTime() - booking.checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      return sum + nights;
    }, 0);
    
    const averageStayLength = bookings.length > 0 ? totalNights / bookings.length : 0;

    return {
      byCountry,
      byAgeGroup,
      repeatGuests,
      newGuests,
      averageStayLength: parseFloat(averageStayLength.toFixed(1))
    };
  }

  /**
   * Get performance benchmark data
   */
  async getPerformanceBenchmark(propertyId: string): Promise<BenchmarkData> {
    const property = await this.prisma.travelProperty.findUnique({
      where: { id: propertyId },
      include: { 
        rooms: true,
        bookings: {
          where: {
            status: { in: ['CONFIRMED', 'CHECKED_IN', 'COMPLETED'] }
          }
        }
      }
    });

    if (!property) {
      throw new Error('Property not found');
    }

    // Calculate property metrics
    const totalRooms = property.rooms.length;
    const occupiedRooms = property.bookings.length;
    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

    const totalRevenue = property.bookings.reduce((sum: number, booking: any) => sum + booking.totalAmount.toNumber(), 0);
    const totalRoomNights = property.bookings.reduce((sum: number, booking: any) => {
      const nights = Math.ceil((booking.checkOutDate.getTime() - booking.checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      return sum + nights;
    }, 0);
    
    const averageDailyRate = totalRoomNights > 0 ? totalRevenue / totalRoomNights : 0;

    // Simulate industry benchmarks (in real implementation, this would come from external data)
    const industryBenchmarks = {
      occupancyRate: 72.3,
      averageDailyRate: 185.50,
      revenuePerAvailableRoom: 133.85,
      guestSatisfaction: 4.2
    };

    // Calculate percentiles (simplified simulation)
    const percentiles = {
      occupancyRate: Math.random() * 30 + 35, // 35-65th percentile
      averageDailyRate: Math.random() * 40 + 40, // 40-80th percentile
      revenuePerAvailableRoom: Math.random() * 35 + 45, // 45-80th percentile
      guestSatisfaction: Math.random() * 2 + 3 // 3-5 stars
    };

    return {
      occupancyRate: {
        property: parseFloat(occupancyRate.toFixed(2)),
        industry: industryBenchmarks.occupancyRate,
        percentile: parseFloat(percentiles.occupancyRate.toFixed(1))
      },
      averageDailyRate: {
        property: parseFloat(averageDailyRate.toFixed(2)),
        industry: industryBenchmarks.averageDailyRate,
        percentile: parseFloat(percentiles.averageDailyRate.toFixed(1))
      },
      revenuePerAvailableRoom: {
        property: parseFloat((averageDailyRate * (occupancyRate / 100)).toFixed(2)),
        industry: industryBenchmarks.revenuePerAvailableRoom,
        percentile: parseFloat(percentiles.revenuePerAvailableRoom.toFixed(1))
      },
      guestSatisfaction: {
        property: parseFloat(property.rating.toFixed(1)),
        industry: industryBenchmarks.guestSatisfaction,
        percentile: parseFloat(percentiles.guestSatisfaction.toFixed(1))
      }
    };
  }

  /**
   * Get booking conversion rates
   */
  async getBookingConversionRates(source?: string): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const totalInquiries = await this.prisma.travelBooking.count({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        ...(source && { source })
      }
    });

    const confirmedBookings = await this.prisma.travelBooking.count({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        status: { in: ['CONFIRMED', 'CHECKED_IN', 'COMPLETED'] },
        ...(source && { source })
      }
    });

    return totalInquiries > 0 ? parseFloat(((confirmedBookings / totalInquiries) * 100).toFixed(2)) : 0;
  }

  // Helper methods
  private calculateDailyOccupancyRates(bookings: any[], startDate: Date) {
    const dailyData: Array<{ date: Date; rate: number }> = [];
    const currentDate = new Date(startDate);

    while (currentDate <= new Date()) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayBookings = bookings.filter(booking => {
        const checkIn = booking.checkInDate.toISOString().split('T')[0];
        const checkOut = booking.checkOutDate.toISOString().split('T')[0];
        return dateStr >= checkIn && dateStr < checkOut;
      });

      const occupancyRate = bookings.length > 0 ? (dayBookings.length / bookings.length) * 100 : 0;
      dailyData.push({ date: new Date(currentDate), rate: occupancyRate });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dailyData;
  }

  private calculateDailyRevenue(bookings: any[], startDate: Date, endDate: Date) {
    const dailyData: Array<{ date: Date; revenue: number; bookings: number }> = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayBookings = bookings.filter(booking => {
        const checkIn = booking.checkInDate.toISOString().split('T')[0];
        return dateStr === checkIn;
      });

      const revenue = dayBookings.reduce((sum, booking) => sum + booking.totalAmount.toNumber(), 0);

      dailyData.push({
        date: new Date(currentDate),
        revenue: parseFloat(revenue.toFixed(2)),
        bookings: dayBookings.length
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dailyData;
  }
}