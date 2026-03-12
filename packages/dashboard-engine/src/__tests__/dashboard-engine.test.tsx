import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardEngine } from '../dashboard-engine';

// Mock the settings hook
const mockUseDashboardSettings = jest.fn();
jest.mock('@vayva/settings', () => ({
  useDashboardSettings: () => mockUseDashboardSettings(),
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('DashboardEngine', () => {
  const user = userEvent.setup();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ value: 12345, trend: 12 }),
    });
  });

  it('renders dashboard engine with widgets', () => {
    mockUseDashboardSettings.mockReturnValue({
      widgets: [
        {
          id: 'revenue-widget',
          type: 'metric-card',
          visible: true,
          position: { x: 0, y: 0, w: 6, h: 3 },
          title: 'Revenue',
          refreshInterval: 300,
          dataSource: '/api/revenue'
        }
      ],
      refreshInterval: 300,
      autoRefreshEnabled: true,
    });

    render(<DashboardEngine />);
    
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('12,345')).toBeInTheDocument();
  });

  it('handles loading state', () => {
    render(<DashboardEngine loading={true} />);
    
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('handles error state', () => {
    render(<DashboardEngine error="Something went wrong" />);
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('shows empty state when no widgets', () => {
    mockUseDashboardSettings.mockReturnValue({
      widgets: [],
      refreshInterval: 300,
      autoRefreshEnabled: true,
    });
    
    render(<DashboardEngine />);
    
    expect(screen.getByText('No Widgets Configured')).toBeInTheDocument();
  });

  it('respects widget visibility settings', () => {
    mockUseDashboardSettings.mockReturnValue({
      widgets: [
        {
          id: 'visible-widget',
          type: 'metric-card',
          visible: true,
          title: 'Visible Widget',
          dataSource: '/api/data'
        },
        {
          id: 'hidden-widget',
          type: 'metric-card',
          visible: false,
          title: 'Hidden Widget',
          dataSource: '/api/data'
        }
      ],
      refreshInterval: 300,
      autoRefreshEnabled: true,
    });

    render(<DashboardEngine />);
    
    expect(screen.getByText('Visible Widget')).toBeInTheDocument();
    expect(screen.queryByText('Hidden Widget')).not.toBeInTheDocument();
  });

  it('handles widget data fetching errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    mockUseDashboardSettings.mockReturnValue({
      widgets: [{
        id: 'error-widget',
        type: 'metric-card',
        visible: true,
        title: 'Error Widget',
        dataSource: '/api/broken-endpoint',
        refreshInterval: 0 // Disable auto-refresh for this test
      }],
      refreshInterval: 300,
      autoRefreshEnabled: false,
    });

    render(<DashboardEngine />);
    
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('supports different widget types with appropriate rendering', () => {
    mockUseDashboardSettings.mockReturnValue({
      widgets: [
        {
          id: 'metric-widget',
          type: 'metric-card',
          visible: true,
          title: 'Metric Card',
          dataSource: '/api/metrics'
        },
        {
          id: 'chart-widget',
          type: 'revenue-chart',
          visible: true,
          title: 'Revenue Chart',
          dataSource: '/api/charts'
        },
        {
          id: 'table-widget',
          type: 'recent-orders',
          visible: true,
          title: 'Recent Orders',
          dataSource: '/api/orders'
        }
      ],
      refreshInterval: 300,
      autoRefreshEnabled: true,
    });

    render(<DashboardEngine />);
    
    // All widget types should render their titles
    expect(screen.getByText('Metric Card')).toBeInTheDocument();
    expect(screen.getByText('Revenue Chart')).toBeInTheDocument();
    expect(screen.getByText('Recent Orders')).toBeInTheDocument();
  });

  it('calls onDataRefresh callback when data is fetched', async () => {
    const onDataRefresh = jest.fn();
    
    mockUseDashboardSettings.mockReturnValue({
      widgets: [{
        id: 'callback-widget',
        type: 'metric-card',
        visible: true,
        title: 'Callback Test',
        dataSource: '/api/callback-test'
      }],
      refreshInterval: 300,
      autoRefreshEnabled: false,
    });

    render(<DashboardEngine onDataRefresh={onDataRefresh} />);
    
    await waitFor(() => {
      expect(onDataRefresh).toHaveBeenCalledWith('callback-widget', expect.any(Object));
    });
  });

  it('applies custom CSS classes', () => {
    mockUseDashboardSettings.mockReturnValue({
      widgets: [{
        id: 'styled-widget',
        type: 'metric-card',
        visible: true,
        title: 'Styled Widget',
        dataSource: '/api/styled'
      }],
      refreshInterval: 300,
      autoRefreshEnabled: true,
    });

    render(<DashboardEngine className="custom-dashboard-class" />);
    
    const dashboardContainer = screen.getByText('Styled Widget').closest('.dashboard-engine');
    expect(dashboardContainer).toHaveClass('custom-dashboard-class');
  });

  it('handles real API endpoints correctly', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        value: 98765,
        trend: -5,
        timestamp: new Date().toISOString()
      }),
    });
    
    mockUseDashboardSettings.mockReturnValue({
      widgets: [{
        id: 'api-widget',
        type: 'metric-card',
        visible: true,
        title: 'API Test',
        dataSource: '/api/real-data',
        refreshInterval: 0
      }],
      refreshInterval: 300,
      autoRefreshEnabled: false,
    });

    render(<DashboardEngine />);
    
    await waitFor(() => {
      expect(screen.getByText('98,765')).toBeInTheDocument();
      expect(screen.getByText('↘ 5%')).toBeInTheDocument();
    });
  });
});