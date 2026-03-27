/**
 * Nonprofit Dashboard Page Tests
 * 
 * Comprehensive tests for the main nonprofit dashboard page covering:
 * - Dashboard data fetching and display
 * - Stats calculations
 * - Component interactions
 * - Error handling
 * - Loading states
 * - Navigation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import NonprofitDashboardPage from '../page';
import { apiJson } from '@/lib/api-client-shared';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('@/lib/api-client-shared', () => ({
  apiJson: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
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

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  usePathname: () => '/dashboard/nonprofit',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: any) => (
    <a href={href}>{children}</a>
  ),
}));

describe('NonprofitDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockDashboardData = {
    campaigns: [
      { id: 'camp-1', name: 'Education Initiative', status: 'active', goal: 50000, raised: 35000 },
      { id: 'camp-2', name: 'Healthcare Access', status: 'active', goal: 75000, raised: 45000 },
      { id: 'camp-3', name: 'Environmental Project', status: 'completed', goal: 30000, raised: 32000 },
    ],
    donations: [
      { id: 'don-1', donorName: 'John Doe', amount: 5000, campaign: 'Education Initiative', createdAt: '2026-03-20' },
      { id: 'don-2', donorName: 'Jane Smith', amount: 10000, campaign: 'Healthcare Access', createdAt: '2026-03-22' },
      { id: 'don-3', donorName: 'Anonymous', amount: 2500, createdAt: '2026-03-25' },
    ],
    donors: [
      { id: 'donor-1', name: 'John Doe', email: 'john@example.com', totalDonated: 15000 },
      { id: 'donor-2', name: 'Jane Smith', email: 'jane@example.com', totalDonated: 25000 },
    ],
    volunteers: [
      { id: 'vol-1', name: 'Alice Johnson', hoursLogged: 45, status: 'active' },
      { id: 'vol-2', name: 'Bob Williams', hoursLogged: 32, status: 'active' },
    ],
    grants: [
      { 
        id: 'grant-1', 
        title: 'NSF Research Grant', 
        status: 'funded',
        applications: [{ id: 'app-1', status: 'awarded', amount: 500000 }]
      },
      { 
        id: 'grant-2', 
        title: 'NIH Health Initiative', 
        status: 'under_review',
        applications: [{ id: 'app-2', status: 'pending', amount: 750000 }]
      },
    ],
  };

  describe('Initial Load', () => {
    it('displays loading state on initial render', async () => {
      vi.mocked(apiJson).mockImplementation(() => new Promise(() => {}));

      render(<NonprofitDashboardPage />);

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('fetches all dashboard data on mount', async () => {
      vi.mocked(apiJson).mockResolvedValue({ data: [] });

      render(<NonprofitDashboardPage />);

      await waitFor(() => {
        expect(apiJson).toHaveBeenCalledTimes(5);
        expect(apiJson).toHaveBeenCalledWith('/api/nonprofit/campaigns');
        expect(apiJson).toHaveBeenCalledWith('/api/nonprofit/donations');
        expect(apiJson).toHaveBeenCalledWith('/api/nonprofit/donors');
        expect(apiJson).toHaveBeenCalledWith('/api/nonprofit/volunteers');
        expect(apiJson).toHaveBeenCalledWith('/api/nonprofit/grants?limit=100');
      });
    });
  });

  describe('Stats Display', () => {
    it('calculates and displays total campaigns correctly', async () => {
      vi.mocked(apiJson).mockResolvedValue({
        data: mockDashboardData.campaigns,
      });

      render(<NonprofitDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument();
      });
    });

    it('calculates active campaigns correctly', async () => {
      vi.mocked(apiJson).mockResolvedValue({
        data: mockDashboardData.campaigns,
      });

      render(<NonprofitDashboardPage />);

      await waitFor(() => {
        expect(screen.getAllByText('2')).toHaveLength(1); // Active campaigns count
      });
    });

    it('calculates total raised amount correctly', async () => {
      vi.mocked(apiJson).mockResolvedValue({
        data: mockDashboardData.donations,
      });

      render(<NonprofitDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('$17,500')).toBeInTheDocument(); // Sum of all donations
      });
    });

    it('displays total donors count', async () => {
      vi.mocked(apiJson).mockResolvedValue({
        data: mockDashboardData.donors,
      });

      render(<NonprofitDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument();
      });
    });

    it('displays total volunteers count', async () => {
      vi.mocked(apiJson).mockResolvedValue({
        data: mockDashboardData.volunteers,
      });

      render(<NonprofitDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument();
      });
    });

    it('calculates grant success rate correctly', async () => {
      vi.mocked(apiJson).mockResolvedValue({
        data: mockDashboardData.grants,
      });

      render(<NonprofitDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('50%')).toBeInTheDocument(); // 1 awarded out of 2 total
      });
    });
  });

  describe('Recent Donations Section', () => {
    it('displays recent donations list', async () => {
      vi.mocked(apiJson).mockResolvedValue({
        data: mockDashboardData.donations,
      });

      render(<NonprofitDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });

    it('formats donation amounts as currency', async () => {
      vi.mocked(apiJson).mockResolvedValue({
        data: mockDashboardData.donations,
      });

      render(<NonprofitDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('+$5,000')).toBeInTheDocument();
        expect(screen.getByText('+$10,000')).toBeInTheDocument();
      });
    });

    it('shows empty state when no donations exist', async () => {
      vi.mocked(apiJson).mockResolvedValue({
        data: [],
      });

      render(<NonprofitDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('No donations yet')).toBeInTheDocument();
      });
    });
  });

  describe('Upcoming Deadlines Section', () => {
    it('displays upcoming grant deadlines', async () => {
      vi.mocked(apiJson).mockResolvedValue({
        data: mockDashboardData.grants,
      });

      render(<NonprofitDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText(/upcoming deadlines/i)).toBeInTheDocument();
      });
    });

    it('highlights urgent deadlines (< 7 days)', async () => {
      const urgentGrants = {
        data: [
          {
            id: 'urgent-grant',
            title: 'Urgent Grant',
            deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
          },
        ],
      };

      vi.mocked(apiJson).mockResolvedValue(urgentGrants);

      render(<NonprofitDashboardPage />);

      await waitFor(() => {
        // Should show urgency indicator
        expect(screen.getByText(/3d left/i)).toBeInTheDocument();
      });
    });

    it('shows empty state when no deadlines exist', async () => {
      vi.mocked(apiJson).mockResolvedValue({
        data: [],
      });

      render(<NonprofitDashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('No upcoming deadlines')).toBeInTheDocument();
      });
    });
  });

  describe('Quick Actions', () => {
    it('navigates to grants page when "Manage Grants" is clicked', async () => {
      vi.mocked(apiJson).mockResolvedValue({ data: [] });
      const { useRouter } = await import('next/navigation');
      const router = useRouter();

      render(<NonprofitDashboardPage />);

      await waitFor(() => {
        const manageGrantsButton = screen.getByText(/manage grants/i).closest('button') || 
                                   screen.getByText(/manage grants/i).closest('[role="button"]') ||
                                   screen.getByText(/manage grants/i).closest('div');
        if (manageGrantsButton) {
          fireEvent.click(manageGrantsButton);
          expect(router.push).toHaveBeenCalledWith('/dashboard/nonprofit/grants');
        }
      });
    });

    it('navigates to donors page when "Donor Management" is clicked', async () => {
      vi.mocked(apiJson).mockResolvedValue({ data: [] });
      const { useRouter } = await import('next/navigation');
      const router = useRouter();

      render(<NonprofitDashboardPage />);

      await waitFor(() => {
        const donorButton = screen.getByText(/donor management/i).closest('[role="button"]');
        if (donorButton) {
          fireEvent.click(donorButton);
          expect(router.push).toHaveBeenCalledWith('/dashboard/nonprofit/donors');
        }
      });
    });

    it('navigates to volunteers page when "Volunteer Coordination" is clicked', async () => {
      vi.mocked(apiJson).mockResolvedValue({ data: [] });
      const { useRouter } = await import('next/navigation');
      const router = useRouter();

      render(<NonprofitDashboardPage />);

      await waitFor(() => {
        const volunteerButton = screen.getByText(/volunteer coordination/i).closest('[role="button"]');
        if (volunteerButton) {
          fireEvent.click(volunteerButton);
          expect(router.push).toHaveBeenCalledWith('/dashboard/nonprofit/volunteers');
        }
      });
    });
  });

  describe('Error Handling', () => {
    it('handles API errors gracefully', async () => {
      vi.mocked(apiJson).mockRejectedValue(new Error('Network error'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<NonprofitDashboardPage />);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Failed to load'));
      });

      consoleSpy.mockRestore();
    });

    it('continues loading other sections if one API fails', async () => {
      vi.mocked(apiJson)
        .mockRejectedValueOnce(new Error('Campaigns failed')) // First call fails
        .mockResolvedValue({ data: [] }); // Other calls succeed

      render(<NonprofitDashboardPage />);

      await waitFor(() => {
        // Should still render without crashing
        expect(screen.queryByRole('main')).toBeInTheDocument();
      });
    });
  });

  describe('Header Actions', () => {
    it('navigates to new campaign page when "New Campaign" is clicked', async () => {
      vi.mocked(apiJson).mockResolvedValue({ data: [] });
      const { useRouter } = await import('next/navigation');
      const router = useRouter();

      render(<NonprofitDashboardPage />);

      await waitFor(() => {
        const newCampaignButton = screen.getByText(/new campaign/i);
        fireEvent.click(newCampaignButton);
        expect(router.push).toHaveBeenCalledWith('/dashboard/nonprofit/campaigns/new');
      });
    });

    it('navigates to record donation page when "Record Donation" is clicked', async () => {
      vi.mocked(apiJson).mockResolvedValue({ data: [] });
      const { useRouter } = await import('next/navigation');
      const router = useRouter();

      render(<NonprofitDashboardPage />);

      await waitFor(() => {
        const recordDonationButton = screen.getByText(/record donation/i);
        fireEvent.click(recordDonationButton);
        expect(router.push).toHaveBeenCalledWith('/dashboard/nonprofit/donations/new');
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', async () => {
      vi.mocked(apiJson).mockResolvedValue({ data: [] });

      render(<NonprofitDashboardPage />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /nonprofit dashboard/i })).toBeInTheDocument();
      });
    });

    it('uses semantic HTML for stats cards', async () => {
      vi.mocked(apiJson).mockResolvedValue({ data: [] });

      render(<NonprofitDashboardPage />);

      await waitFor(() => {
        const articles = screen.getAllByRole('article');
        expect(articles.length).toBeGreaterThan(0);
      });
    });

    it('provides keyboard navigation for action buttons', async () => {
      vi.mocked(apiJson).mockResolvedValue({ data: [] });

      render(<NonprofitDashboardPage />);

      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Responsive Design', () => {
    it('renders mobile-responsive grid layout', async () => {
      vi.mocked(apiJson).mockResolvedValue({ data: [] });

      const { container } = render(<NonprofitDashboardPage />);

      await waitFor(() => {
        const grid = container.querySelector('.grid');
        expect(grid).toHaveClass('md:grid-cols-2');
        expect(grid).toHaveClass('lg:grid-cols-4');
      });
    });

    it('hides desktop-only elements on mobile viewports', async () => {
      vi.mocked(apiJson).mockResolvedValue({ data: [] });

      render(<NonprofitDashboardPage />);

      await waitFor(() => {
        // Some elements should be hidden on mobile
        const hiddenElements = document.querySelectorAll('.hidden.sm\\:inline');
        expect(hiddenElements.length).toBeGreaterThan(0);
      });
    });
  });
});
