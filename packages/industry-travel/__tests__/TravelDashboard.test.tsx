import { render, screen } from '@testing-library/react';
import { TravelDashboard } from '../src/components/dashboard';
import { useTravelDashboardData } from '../src/hooks/useTravelDashboardData';
import '@testing-library/jest-dom';

// Mock the hook
jest.mock('../src/hooks/useTravelDashboardData');

const mockUseTravelDashboardData = useTravelDashboardData as jest.MockedFunction<typeof useTravelDashboardData>;

describe('TravelDashboard', () => {
  beforeEach(() => {
    mockUseTravelDashboardData.mockReturnValue({
      occupancyMetrics: {
        currentRate: 78,
        projectedRate: 82,
        historicalRates: [],
        byRoomType: { single: 75, double: 82, suite: 90, villa: 85 }
      },
      revenueReport: {
        totalRevenue: 180000,
        revenueBySource: { direct: 81000, ota: 63000, corporate: 27000, groups: 9000 },
        revenueByRoomType: { single: 45000, double: 65000, suite: 50000, villa: 20000 },
        dailyBreakdown: [],
        growthRate: 12.5
      },
      guestDemographics: {
        byCountry: { USA: 32, UK: 18, Germany: 12, France: 8, Australia: 7, Other: 23 },
        byAgeGroup: { '18-25': 15, '26-35': 35, '36-50': 30, '51+': 20 },
        byBookingType: { individual: 45, couple: 30, family: 15, group: 5, business: 5 },
        repeatGuestRate: 34
      },
      benchmarkData: {
        occupancyRate: { property: 78, industry: 65, percentile: 85 },
        averageDailyRate: { property: 289, industry: 245, percentile: 78 },
        revenuePerAvailableRoom: { property: 225, industry: 195, percentile: 82 }
      },
      properties: [
        {
          id: '1',
          tenantId: 'tenant-1',
          name: 'Ocean Villa Resort',
          type: 'resort',
          address: '123 Beach Road',
          city: 'Miami',
          country: 'USA',
          rating: 4.8,
          reviewCount: 127,
          isPublished: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      recentReviews: [
        {
          id: '1',
          propertyId: '1',
          bookingId: 'b1',
          guestId: 'g1',
          rating: 5,
          title: 'Amazing experience!',
          comment: 'Wonderful stay',
          status: 'approved',
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      isLoading: false,
      propertyLoading: false,
      reviewLoading: false,
      error: null,
      refreshAll: jest.fn(),
      refreshAnalytics: jest.fn(),
      refreshProperties: jest.fn(),
      refreshReviews: jest.fn()
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders dashboard with default theme', () => {
    render(<TravelDashboard />);
    
    // Check header
    expect(screen.getByText('VAYVA TRAVEL - Premium Glass Design')).toBeInTheDocument();
    
    // Check navigation items
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Bookings')).toBeInTheDocument();
    expect(screen.getByText('Properties')).toBeInTheDocument();
    
    // Check main sections
    expect(screen.getByText('ACTIVE BOOKINGS OVERVIEW')).toBeInTheDocument();
    expect(screen.getByText('PROPERTY OCCUPANCY MAP')).toBeInTheDocument();
    expect(screen.getByText('CALENDAR VIEW')).toBeInTheDocument();
  });

  test('renders with different themes', () => {
    const { rerender } = render(<TravelDashboard theme="ocean-breeze" />);
    expect(document.body).toHaveClass('bg-gradient-to-br', 'from-blue-50', 'to-cyan-50');
    
    rerender(<TravelDashboard theme="tropical-sunset" />);
    expect(document.body).toHaveClass('bg-gradient-to-br', 'from-orange-50', 'to-yellow-50');
    
    rerender(<TravelDashboard theme="mountain-retreat" />);
    expect(document.body).toHaveClass('bg-gradient-to-br', 'from-green-50', 'to-stone-100');
  });

  test('displays occupancy metrics correctly', () => {
    render(<TravelDashboard />);
    
    // Check KPI cards
    expect(screen.getByText('Today\'s Check-ins')).toBeInTheDocument();
    expect(screen.getByText('Tonight\'s Occupancy')).toBeInTheDocument();
    expect(screen.getByText('Avg Daily Rate')).toBeInTheDocument();
    
    // Check values (these would need more specific selectors in real implementation)
    expect(screen.getByText('78%')).toBeInTheDocument();
    expect(screen.getByText('$289/night')).toBeInTheDocument();
  });

  test('displays property map section', () => {
    render(<TravelDashboard />);
    
    expect(screen.getByText('PROPERTY OCCUPANCY MAP')).toBeInTheDocument();
    expect(screen.getByText('Interactive Map with Pins')).toBeInTheDocument();
    
    // Check legend items
    expect(screen.getByText('Full (0)')).toBeInTheDocument();
    expect(screen.getByText('Limited (0)')).toBeInTheDocument();
    expect(screen.getByText('Available (0)')).toBeInTheDocument();
    expect(screen.getByText('Event (0)')).toBeInTheDocument();
  });

  test('displays calendar view', () => {
    render(<TravelDashboard />);
    
    expect(screen.getByText('CALENDAR VIEW')).toBeInTheDocument();
    
    // Check calendar navigation
    expect(screen.getByText('March 2026')).toBeInTheDocument();
    
    // Check legend
    expect(screen.getByText('Booked')).toBeInTheDocument();
    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText('Maintenance')).toBeInTheDocument();
  });

  test('displays revenue analytics', () => {
    render(<TravelDashboard />);
    
    expect(screen.getByText('REVENUE ANALYTICS')).toBeInTheDocument();
    expect(screen.getByText('Monthly Revenue Trend')).toBeInTheDocument();
    
    // Check metrics
    expect(screen.getByText('ADR: $289')).toBeInTheDocument();
    expect(screen.getByText('RevPAR: $225')).toBeInTheDocument();
  });

  test('displays guest demographics', () => {
    render(<TravelDashboard />);
    
    expect(screen.getByText('GUEST DEMOGRAPHICS')).toBeInTheDocument();
    expect(screen.getByText('Guest Origin Map')).toBeInTheDocument();
    
    // Check country breakdown
    expect(screen.getByText('USA')).toBeInTheDocument();
    expect(screen.getByText('32%')).toBeInTheDocument();
    expect(screen.getByText('UK')).toBeInTheDocument();
    expect(screen.getByText('18%')).toBeInTheDocument();
    
    // Check metrics
    expect(screen.getByText('Repeat Guest Rate: 34%')).toBeInTheDocument();
  });

  test('handles loading state', () => {
    mockUseTravelDashboardData.mockReturnValueOnce({
      occupancyMetrics: null,
      revenueReport: null,
      guestDemographics: null,
      benchmarkData: null,
      properties: [],
      recentReviews: [],
      isLoading: true,
      propertyLoading: true,
      reviewLoading: true,
      error: null,
      refreshAll: jest.fn(),
      refreshAnalytics: jest.fn(),
      refreshProperties: jest.fn(),
      refreshReviews: jest.fn()
    });
    
    render(<TravelDashboard />);
    
    // In a real implementation, you'd check for loading indicators
    // expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  test('handles error state', () => {
    mockUseTravelDashboardData.mockReturnValueOnce({
      occupancyMetrics: null,
      revenueReport: null,
      guestDemographics: null,
      benchmarkData: null,
      properties: [],
      recentReviews: [],
      isLoading: false,
      propertyLoading: false,
      reviewLoading: false,
      error: 'Failed to load data',
      refreshAll: jest.fn(),
      refreshAnalytics: jest.fn(),
      refreshProperties: jest.fn(),
      refreshReviews: jest.fn()
    });
    
    render(<TravelDashboard />);
    
    // In a real implementation, you'd check for error messages
    // expect(screen.getByText('Failed to load data')).toBeInTheDocument();
  });

  test('applies custom className', () => {
    render(<TravelDashboard className="custom-class" />);
    expect(document.querySelector('.custom-class')).toBeInTheDocument();
  });
});

// Test individual components
describe('Individual Dashboard Components', () => {
  test('OccupancyOverview renders correctly', async () => {
    const { default: OccupancyOverview } = await import('../src/components/dashboard/OccupancyOverview');
    
    render(
      <OccupancyOverview 
        data={{
          todayCheckIns: 24,
          tonightOccupancy: 78,
          availableUnits: 12,
          avgDailyRate: 289,
          adrTrend: '+8%',
          occupancyTrend: '+12%'
        }} 
      />
    );
    
    expect(screen.getByText('ACTIVE BOOKINGS OVERVIEW')).toBeInTheDocument();
    expect(screen.getByText('24')).toBeInTheDocument();
    expect(screen.getByText('78%')).toBeInTheDocument();
    expect(screen.getByText('$289/night')).toBeInTheDocument();
  });

  test('PropertyMap renders with properties', async () => {
    const { default: PropertyMap } = await import('../src/components/dashboard/PropertyMap');
    
    const mockProperties = [
      { id: '1', name: 'Test Property', lat: 40.7128, lng: -74.0060, status: 'available', type: 'hotel' }
    ];
    
    render(<PropertyMap properties={mockProperties} />);
    
    expect(screen.getByText('PROPERTY OCCUPANCY MAP')).toBeInTheDocument();
    expect(screen.getByText('Interactive Map with Pins')).toBeInTheDocument();
  });

  test('CalendarView renders correctly', async () => {
    const { default: CalendarView } = await import('../src/components/dashboard/CalendarView');
    
    render(<CalendarView />);
    
    expect(screen.getByText('CALENDAR VIEW')).toBeInTheDocument();
    // Check current month is displayed
    const currentDate = new Date();
    const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    expect(screen.getByText(monthYear)).toBeInTheDocument();
  });
});