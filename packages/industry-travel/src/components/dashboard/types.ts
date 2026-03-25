// Dashboard Component Props Types

export interface TravelDashboardProps {
  theme?: 'ocean-breeze' | 'tropical-sunset' | 'mountain-retreat' | 'urban-chic' | 'coastal-luxury';
  className?: string;
}

export interface OccupancyOverviewProps {
  data: {
    todayCheckIns: number;
    tonightOccupancy: number;
    availableUnits: number;
    avgDailyRate: number;
    adrTrend: string;
    occupancyTrend: string;
  };
}

export interface PropertyMapProps {
  properties: Array<{
    id: string;
    name: string;
    lat: number;
    lng: number;
    status: 'full' | 'limited' | 'available' | 'event';
    type: string;
  }>;
}

export interface CalendarViewProps {
  currentDate?: Date;
  availabilityData?: Record<string, 'booked' | 'available' | 'maintenance'>;
}

export interface RevenueAnalyticsProps {
  data: {
    monthlyRevenue: number;
    adr: number;
    revpar: number;
    trendData: Array<{ month: string; revenue: number }>;
  };
}

export interface GuestDemographicsProps {
  data: {
    byCountry: Array<{ country: string; percentage: number; flag: string }>;
    repeatGuestRate: number;
    totalGuests: number;
  };
}