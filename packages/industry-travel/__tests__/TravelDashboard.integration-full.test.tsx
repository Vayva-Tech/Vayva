import { render, screen, waitFor } from '@testing-library/react';
import { useTravelDashboardData } from '../src/hooks/useTravelDashboardData';
import { TravelDashboard } from '../src/components/dashboard/TravelDashboard';

// Mock the services
jest.mock('../src/services/analytics-service');
jest.mock('../src/services/property-service');
jest.mock('../src/services/review-service');
jest.mock('../src/services/benchmarking-service');

// Mock service classes
const mockAnalyticsService = {
  getOccupancyMetrics: jest.fn(),
  getRevenueReport: jest.fn(),
  getGuestDemographics: jest.fn()
};

const mockPropertyService = {
  getProperties: jest.fn()
};

const mockReviewService = {
  getReviews: jest.fn()
};

const mockBenchmarkService = {
  getBenchmarkData: jest.fn()
};

describe('Travel Dashboard Full Integration', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup successful mock responses
    mockAnalyticsService.getOccupancyMetrics.mockResolvedValue({
      currentRate: 78.5,
      averageRate: 72.3,
      peakRate: 85.2,
      lowRate: 65.1,
      trend: 'increasing',
      byProperty: [
        { propertyId: '1', propertyName: 'Ocean Villa', occupancyRate: 82.5 },
        { propertyId: '2', propertyName: 'Mountain Lodge', occupancyRate: 74.8 }
      ]
    });

    mockAnalyticsService.getRevenueReport.mockResolvedValue({
      totalRevenue: 185670,
      averageDailyRate: 295.50,
      revenuePerAvailableRoom: 231.25,
      trend: 'increasing',
      dailyBreakdown: [
        { date: new Date('2024-03-01'), revenue: 6200, bookings: 21 },
        { date: new Date('2024-03-02'), revenue: 6800, bookings: 23 }
      ]
    });

    mockAnalyticsService.getGuestDemographics.mockResolvedValue({
      byCountry: [
        { country: 'USA', count: 128, percentage: 32.5 },
        { country: 'UK', count: 72, percentage: 18.3 },
        { country: 'Germany', count: 48, percentage: 12.2 }
      ],
      byAgeGroup: [
        { ageGroup: '26-35', count: 138, percentage: 35.1 },
        { ageGroup: '36-50', count: 118, percentage: 30.0 }
      ],
      repeatGuests: 134,
      newGuests: 260,
      averageStayLength: 4.2
    });

    mockPropertyService.getProperties.mockResolvedValue([
      {
        id: '1',
        tenantId: 'tenant-1',
        name: 'Ocean Villa Resort',
        type: 'resort',
        description: 'Luxury beachfront resort',
        address: '123 Beach Road',
        city: 'Miami',
        country: 'USA',
        rating: 4.8,
        reviewCount: 127,
        isPublished: true,
        isActive: true,
        amenities: ['pool', 'spa', 'wifi'],
        checkInTime: '15:00',
        checkOutTime: '11:00',
        images: ['villa1.jpg'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        tenantId: 'tenant-1',
        name: 'Mountain Retreat Lodge',
        type: 'luxury_lodge',
        description: 'Cozy mountain lodge',
        address: '456 Pine Street',
        city: 'Aspen',
        country: 'USA',
        rating: 4.9,
        reviewCount: 89,
        isPublished: true,
        isActive: true,
        amenities: ['fireplace', 'hot-tub', 'wifi'],
        checkInTime: '16:00',
        checkOutTime: '10:00',
        images: ['lodge1.jpg'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    mockReviewService.getReviews.mockResolvedValue({
      reviews: [
        {
          id: '1',
          propertyId: '1',
          bookingId: 'b1',
          guestName: 'John Smith',
          rating: 5,
          title: 'Amazing experience!',
          comment: 'Fantastic stay with great service',
          status: 'approved',
          sentimentScore: 0.8,
          sentimentLabel: 'positive',
          helpfulCount: 12,
          createdAt: new Date(Date.now() - 86400000),
          updatedAt: new Date()
        }
      ],
      totalCount: 1,
      hasNextPage: false
    });

    mockBenchmarkService.getBenchmarkData.mockResolvedValue({
      occupancyRate: {
        property: 78.5,
        industry: 65.2,
        percentile: 85
      },
      averageDailyRate: {
        property: 295.50,
        industry: 245.75,
        percentile: 78
      },
      revenuePerAvailableRoom: {
        property: 231.25,
        industry: 195.50,
        percentile: 82
      },
      guestSatisfaction: {
        property: 4.7,
        industry: 4.2,
        percentile: 88
      }
    });
  });

  test('full dashboard integration loads real data successfully', async () => {
    render(<TravelDashboard />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading dashboard data...')).not.toBeInTheDocument();
    });

    // Verify dashboard renders with real data
    expect(screen.getByText('VAYVA TRAVEL - Premium Glass Design')).toBeInTheDocument();
    
    // Verify KPI metrics from real services
    await waitFor(() => {
      expect(screen.getByText('78.5%')).toBeInTheDocument(); // Occupancy rate
      expect(screen.getByText('$295.5/night')).toBeInTheDocument(); // ADR
    });

    // Verify property data
    expect(screen.getByText('Ocean Villa Resort')).toBeInTheDocument();
    expect(screen.getByText('Mountain Retreat Lodge')).toBeInTheDocument();

    // Verify all services were called
    expect(mockAnalyticsService.getOccupancyMetrics).toHaveBeenCalledTimes(1);
    expect(mockAnalyticsService.getRevenueReport).toHaveBeenCalledTimes(1);
    expect(mockAnalyticsService.getGuestDemographics).toHaveBeenCalledTimes(1);
    expect(mockPropertyService.getProperties).toHaveBeenCalledTimes(1);
    expect(mockReviewService.getReviews).toHaveBeenCalledTimes(1);
    expect(mockBenchmarkService.getBenchmarkData).toHaveBeenCalledTimes(1);
  });

  test('handles service errors gracefully', async () => {
    // Setup one service to fail
    mockAnalyticsService.getOccupancyMetrics.mockRejectedValue(new Error('Network error'));

    render(<TravelDashboard />);

    // Should show error state
    await waitFor(() => {
      expect(screen.getByText('Error Loading Data')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    // Verify other services still attempted to load
    expect(mockPropertyService.getProperties).toHaveBeenCalledTimes(1);
    expect(mockReviewService.getReviews).toHaveBeenCalledTimes(1);
  });

  test('refresh functionality works correctly', async () => {
    render(<TravelDashboard />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('78.5%')).toBeInTheDocument();
    });

    // Find and click refresh button
    const refreshButton = screen.getByText('Refresh');
    refreshButton.click();

    // Verify services are called again
    await waitFor(() => {
      expect(mockAnalyticsService.getOccupancyMetrics).toHaveBeenCalledTimes(2);
      expect(mockPropertyService.getProperties).toHaveBeenCalledTimes(2);
    });
  });

  test('real-time updates subscription works', async () => {
    const { result } = renderHook(() => useTravelDashboardData());
    
    // Subscribe to updates
    const callback = jest.fn();
    const unsubscribe = result.current.subscribeToUpdates(callback);

    // Trigger an update
    await result.current.refreshAnalytics();

    // Verify callback was called
    expect(callback).toHaveBeenCalled();

    // Unsubscribe
    unsubscribe();
    
    // Trigger another update
    await result.current.refreshAnalytics();
    
    // Callback should not be called again
    expect(callback).toHaveBeenCalledTimes(1);
  });

  test('tenant filtering works correctly', async () => {
    const { result } = renderHook(() => useTravelDashboardData('specific-tenant'));
    
    await waitFor(() => {
      expect(result.current.properties).toHaveLength(2);
    });

    // Verify services were called with tenant filter
    expect(mockPropertyService.getProperties).toHaveBeenCalledWith({
      tenantId: 'specific-tenant'
    });
  });

  test('performance characteristics are maintained', async () => {
    const startTime = performance.now();
    
    render(<TravelDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('VAYVA TRAVEL - Premium Glass Design')).toBeInTheDocument();
    });
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render within reasonable time
    expect(renderTime).toBeLessThan(3000); // 3 seconds
  });
});

// Helper hook for testing
const renderHook = <T,>(hook: () => T) => {
  let result: { current: T } | null = null;
  
  const TestComponent: React.FC = () => {
    result = { current: hook() };
    return null;
  };
  
  render(<TestComponent />);
  
  if (!result) {
    throw new Error('Hook did not render');
  }
  
  return { result: result };
};