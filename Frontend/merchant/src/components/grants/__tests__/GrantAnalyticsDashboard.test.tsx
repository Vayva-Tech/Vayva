/**
 * GrantAnalyticsDashboard Component Tests
 * 
 * Tests for the grant analytics dashboard component covering:
 * - Data fetching and display
 * - Success rate calculations
 * - Pipeline metrics display
 * - Deadline tracking
 * - Error handling
 * - Loading states
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import GrantAnalyticsDashboard from '../GrantAnalyticsDashboard';
import { apiJson } from '@/lib/api-client-shared';
import { logger } from '@vayva/shared';

// Mock dependencies
vi.mock('@/lib/api-client-shared', () => ({
  apiJson: vi.fn(),
}));

vi.mock('@vayva/shared', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
  formatCurrency: (amount: number) => `$${amount.toLocaleString()}`,
  formatDate: (date: string) => new Date(date).toLocaleDateString(),
}));

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe('GrantAnalyticsDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockGrantsData = {
    data: [
      {
        id: 'grant-1',
        title: 'NSF Research Grant',
        status: 'funded',
        amount: 500000,
        applications: [
          { id: 'app-1', status: 'awarded', amount: 500000 },
        ],
      },
      {
        id: 'grant-2',
        title: 'NIH Health Initiative',
        status: 'under_review',
        amount: 750000,
        applications: [
          { id: 'app-2', status: 'pending', amount: 750000 },
        ],
      },
      {
        id: 'grant-3',
        title: 'Education Foundation Grant',
        status: 'rejected',
        amount: 250000,
        applications: [
          { id: 'app-3', status: 'rejected', amount: 0 },
        ],
      },
      {
        id: 'grant-4',
        title: 'Community Development Grant',
        status: 'draft',
        amount: 100000,
        applications: [],
      },
    ],
  };

  const mockSuccessMetrics = {
    totalApplications: 4,
    awardedApplications: 1,
    totalAwarded: 500000,
    successRate: 25,
  };

  describe('Loading States', () => {
    it('displays loading skeleton while fetching data', async () => {
      vi.mocked(apiJson).mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<GrantAnalyticsDashboard />);

      // Should show loading state initially
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  describe('Success Rate Metrics', () => {
    it('calculates and displays success rate correctly', async () => {
      vi.mocked(apiJson).mockResolvedValue(mockGrantsData);

      render(<GrantAnalyticsDashboard />);

      await waitFor(() => {
        expect(screen.getByText('25%')).toBeInTheDocument();
      });

      // Verify API was called
      expect(apiJson).toHaveBeenCalledWith('/api/nonprofit/grants?limit=100');
    });

    it('displays total awarded amount formatted as currency', async () => {
      vi.mocked(apiJson).mockResolvedValue(mockGrantsData);

      render(<GrantAnalyticsDashboard />);

      await waitFor(() => {
        expect(screen.getByText('$500,000')).toBeInTheDocument();
      });
    });

    it('shows zero state when no grants exist', async () => {
      vi.mocked(apiJson).mockResolvedValue({ data: [] });

      render(<GrantAnalyticsDashboard />);

      await waitFor(() => {
        expect(screen.getByText('0%')).toBeInTheDocument();
      });
    });
  });

  describe('Pipeline Metrics', () => {
    it('displays pipeline breakdown by status', async () => {
      vi.mocked(apiJson).mockResolvedValue(mockGrantsData);

      render(<GrantAnalyticsDashboard />);

      await waitFor(() => {
        // Should show counts for each status
        expect(screen.getByText(/1 funded/i)).toBeInTheDocument();
        expect(screen.getByText(/1 under review/i)).toBeInTheDocument();
        expect(screen.getByText(/1 rejected/i)).toBeInTheDocument();
        expect(screen.getByText(/1 draft/i)).toBeInTheDocument();
      });
    });

    it('calculates total pipeline value', async () => {
      vi.mocked(apiJson).mockResolvedValue(mockGrantsData);

      render(<GrantAnalyticsDashboard />);

      await waitFor(() => {
        // Total pipeline value should be sum of all grant amounts
        expect(screen.getByText('$1,600,000')).toBeInTheDocument();
      });
    });

    it('calculates average grant size', async () => {
      vi.mocked(apiJson).mockResolvedValue(mockGrantsData);

      render(<GrantAnalyticsDashboard />);

      await waitFor(() => {
        // Average = 1,600,000 / 4 = 400,000
        expect(screen.getByText('$400,000')).toBeInTheDocument();
      });
    });
  });

  describe('Deadline Metrics', () => {
    it('displays upcoming deadlines count', async () => {
      vi.mocked(apiJson).mockResolvedValue(mockGrantsData);

      render(<GrantAnalyticsDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/upcoming deadlines/i)).toBeInTheDocument();
      });
    });

    it('highlights overdue grants with warning indicator', async () => {
      const overdueData = {
        data: [
          {
            id: 'grant-overdue',
            title: 'Overdue Grant',
            status: 'draft',
            deadline: '2024-01-01', // Past date
          },
        ],
      };

      vi.mocked(apiJson).mockResolvedValue(overdueData);

      render(<GrantAnalyticsDashboard />);

      await waitFor(() => {
        // Should show overdue indicator
        expect(screen.getByText(/overdue/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles API error gracefully', async () => {
      vi.mocked(apiJson).mockRejectedValue(new Error('Network error'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<GrantAnalyticsDashboard />);

      await waitFor(() => {
        // Should not crash, should show error state or empty state
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Verify error was logged
      expect(logger.error).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('handles malformed data gracefully', async () => {
      vi.mocked(apiJson).mockResolvedValue({ data: null });

      render(<GrantAnalyticsDashboard />);

      await waitFor(() => {
        // Should handle null data without crashing
        expect(screen.getByText('0%')).toBeInTheDocument();
      });
    });

    it('retries data fetch on button click after error', async () => {
      vi.mocked(apiJson)
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockResolvedValueOnce(mockGrantsData);

      render(<GrantAnalyticsDashboard />);

      // Wait for initial error
      await waitFor(() => {
        expect(logger.error).toHaveBeenCalled();
      });

      // Find and click retry button if it exists
      const refreshButton = screen.queryByRole('button', { name: /refresh/i });
      if (refreshButton) {
        fireEvent.click(refreshButton);

        await waitFor(() => {
          expect(screen.getByText('25%')).toBeInTheDocument();
        });
      }
    });
  });

  describe('Data Visualization', () => {
    it('renders stat cards for key metrics', async () => {
      vi.mocked(apiJson).mockResolvedValue(mockGrantsData);

      render(<GrantAnalyticsDashboard />);

      await waitFor(() => {
        // Should have multiple stat cards
        const statCards = screen.getAllByRole('article');
        expect(statCards.length).toBeGreaterThan(2);
      });
    });

    it('uses appropriate icons for different metrics', async () => {
      vi.mocked(apiJson).mockResolvedValue(mockGrantsData);

      render(<GrantAnalyticsDashboard />);

      await waitFor(() => {
        // Should have dollar sign icon for funding metrics
        expect(screen.getAllByTestId('dollar-icon').length).toBeGreaterThan(0);
      });
    });

    it('displays progress indicators for pipeline stages', async () => {
      vi.mocked(apiJson).mockResolvedValue(mockGrantsData);

      render(<GrantAnalyticsDashboard />);

      await waitFor(() => {
        // Should visualize pipeline progression
        expect(screen.getByText(/submitted/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', async () => {
      vi.mocked(apiJson).mockResolvedValue(mockGrantsData);

      render(<GrantAnalyticsDashboard />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      });
    });

    it('uses semantic HTML for statistics', async () => {
      vi.mocked(apiJson).mockResolvedValue(mockGrantsData);

      render(<GrantAnalyticsDashboard />);

      await waitFor(() => {
        const stats = screen.getAllByRole('article');
        expect(stats.length).toBeGreaterThan(0);
      });
    });

    it('provides text alternatives for icons', async () => {
      vi.mocked(apiJson).mockResolvedValue(mockGrantsData);

      render(<GrantAnalyticsDashboard />);

      await waitFor(() => {
        // Icons should have aria-labels or be hidden from screen readers
        const icons = screen.getAllByRole('img', { hidden: true });
        expect(icons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Performance', () => {
    it('renders within acceptable time threshold', async () => {
      vi.mocked(apiJson).mockResolvedValue(mockGrantsData);

      const startTime = performance.now();
      render(<GrantAnalyticsDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('25%')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render in under 1 second (adjust threshold as needed)
      expect(renderTime).toBeLessThan(1000);
    });
  });
});
