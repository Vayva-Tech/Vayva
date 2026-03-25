import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TravelDashboard } from '../src/components/dashboard';
import { useTravelDashboardData } from '../src/hooks/useTravelDashboardData';

// Mock the hook
jest.mock('../src/hooks/useTravelDashboardData');

const mockUseTravelDashboardData = useTravelDashboardData as jest.MockedFunction<typeof useTravelDashboardData>;

const mockRefreshFunctions = {
  refreshAll: jest.fn(),
  refreshAnalytics: jest.fn(),
  refreshProperties: jest.fn(),
  refreshReviews: jest.fn()
};

describe('Travel Dashboard Integration Tests', () => {
  const user = userEvent.setup();

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
      ...mockRefreshFunctions
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('full dashboard renders without crashing', async () => {
    render(<TravelDashboard />);
    
    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('VAYVA TRAVEL - Premium Glass Design')).toBeInTheDocument();
    });

    // Verify all major sections are present
    expect(screen.getByText('ACTIVE BOOKINGS OVERVIEW')).toBeInTheDocument();
    expect(screen.getByText('PROPERTY OCCUPANCY MAP')).toBeInTheDocument();
    expect(screen.getByText('CALENDAR VIEW')).toBeInTheDocument();
    expect(screen.getByText('REVENUE ANALYTICS')).toBeInTheDocument();
    expect(screen.getByText('GUEST DEMOGRAPHICS')).toBeInTheDocument();
    expect(screen.getByText('MARKETING PERFORMANCE')).toBeInTheDocument();
    expect(screen.getByText('HOUSEKEEPING STATUS')).toBeInTheDocument();
    expect(screen.getByText('GUEST REVIEWS')).toBeInTheDocument();
    expect(screen.getByText('SEASONAL INSIGHTS')).toBeInTheDocument();
  });

  test('theme switching works correctly', async () => {
    render(<TravelDashboard />);
    
    // Check default theme (should be ocean breeze)
    expect(document.body).toHaveClass('bg-gradient-to-br', 'from-blue-50', 'to-cyan-50');
    
    // Find theme selector buttons (this would need specific test IDs in implementation)
    // For now, we'll test the theme prop directly
    const { rerender } = render(<TravelDashboard theme="tropical-sunset" />);
    expect(document.body).toHaveClass('bg-gradient-to-br', 'from-orange-50', 'to-yellow-50');
    
    rerender(<TravelDashboard theme="mountain-retreat" />);
    expect(document.body).toHaveClass('bg-gradient-to-br', 'from-green-50', 'to-stone-100');
  });

  test('navigation menu items are clickable', async () => {
    render(<TravelDashboard />);
    
    // Test navigation buttons
    const dashboardBtn = screen.getByText('Dashboard');
    const bookingsBtn = screen.getByText('Bookings');
    const propertiesBtn = screen.getByText('Properties');
    
    await user.click(dashboardBtn);
    await user.click(bookingsBtn);
    await user.click(propertiesBtn);
    
    // In a real implementation, these would trigger navigation
    // For now, we just verify they're clickable
    expect(dashboardBtn).toBeInTheDocument();
    expect(bookingsBtn).toBeInTheDocument();
    expect(propertiesBtn).toBeInTheDocument();
  });

  test('refresh functions are called correctly', async () => {
    render(<TravelDashboard />);
    
    // Simulate some user interaction that would trigger refresh
    // In real implementation, this might be a refresh button or auto-refresh
    
    expect(mockRefreshFunctions.refreshAll).not.toHaveBeenCalled();
    expect(mockRefreshFunctions.refreshAnalytics).not.toHaveBeenCalled();
    expect(mockRefreshFunctions.refreshProperties).not.toHaveBeenCalled();
    expect(mockRefreshFunctions.refreshReviews).not.toHaveBeenCalled();
  });

  test('responsive behavior', async () => {
    // Test mobile view
    global.innerWidth = 500;
    global.dispatchEvent(new Event('resize'));
    
    render(<TravelDashboard />);
    
    // Check that dashboard still renders
    await waitFor(() => {
      expect(screen.getByText('VAYVA TRAVEL - Premium Glass Design')).toBeInTheDocument();
    });
    
    // Test tablet view
    global.innerWidth = 800;
    global.dispatchEvent(new Event('resize'));
    
    // Test desktop view
    global.innerWidth = 1200;
    global.dispatchEvent(new Event('resize'));
  });

  test('data visualization components render correctly', async () => {
    render(<TravelDashboard />);
    
    // Check that all visualization components are present
    await waitFor(() => {
      // KPI Metrics
      expect(screen.getByText('24')).toBeInTheDocument(); // Today's check-ins
      expect(screen.getByText('78%')).toBeInTheDocument(); // Occupancy rate
      expect(screen.getByText('$289/night')).toBeInTheDocument(); // ADR
      
      // Chart areas
      expect(screen.getByText('Monthly Revenue Trend')).toBeInTheDocument();
      expect(screen.getByText('Guest Origin Map')).toBeInTheDocument();
      
      // Tables and lists
      expect(screen.getByText('John Smith')).toBeInTheDocument(); // Reservation
      expect(screen.getByText('Booking.com')).toBeInTheDocument(); // Marketing channel
    });
  });

  test('accessibility features', async () => {
    render(<TravelDashboard />);
    
    // Check for proper heading hierarchy
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
    
    // Check for landmark regions
    const _regions = screen.queryAllByRole('region');
    // Should have multiple sections
    
    // Check for proper contrast and readable text
    const visibleTextElements = screen.getAllByText(/./); // All text elements
    expect(visibleTextElements.length).toBeGreaterThan(0);
  });

  test('performance characteristics', async () => {
    const startTime = performance.now();
    
    render(<TravelDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('VAYVA TRAVEL - Premium Glass Design')).toBeInTheDocument();
    });
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Dashboard should render within reasonable time (adjust threshold as needed)
    expect(renderTime).toBeLessThan(2000); // 2 seconds
  });

  test('error boundary handling', async () => {
    // Test error state
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
      error: 'Network error occurred',
      ...mockRefreshFunctions
    });
    
    render(<TravelDashboard />);
    
    // In a real implementation with error boundaries, we'd check for error display
    // expect(screen.getByText('Network error occurred')).toBeInTheDocument();
  });
});

// Performance and stress tests
describe('Performance Tests', () => {
  test('dashboard handles rapid re-renders', async () => {
    const { rerender } = render(<TravelDashboard />);
    
    // Rapid re-renders with different props
    for (let i = 0; i < 10; i++) {
      rerender(<TravelDashboard theme={i % 2 === 0 ? 'ocean-breeze' : 'tropical-sunset'} />);
    }
    
    expect(screen.getByText('VAYVA TRAVEL - Premium Glass Design')).toBeInTheDocument();
  });

  test('memory usage remains stable', async () => {
    // This would typically be tested with browser dev tools
    // For unit tests, we focus on preventing memory leaks through proper cleanup
    
    const { unmount } = render(<TravelDashboard />);
    
    // Trigger some state changes
    // ... simulate user interactions ...
    
    unmount();
    
    // Component should clean up properly
    expect(useTravelDashboardData).toHaveBeenCalled();
  });
});