import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlatformOverview } from './PlatformOverview';

describe('PlatformOverview', () => {
  const defaultProps = {
    platformName: 'Test SaaS',
    activeTenants: 500,
    uptime: 99.95,
    supportTickets: 5,
  };

  it('renders platform overview with correct data', () => {
    render(<PlatformOverview {...defaultProps} />);
    
    expect(screen.getByText('Platform Overview')).toBeInTheDocument();
    expect(screen.getByText(/Test SaaS/)).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('Active Tenants')).toBeInTheDocument();
    expect(screen.getByText('99.95%')).toBeInTheDocument();
    expect(screen.getByText('Uptime')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Support Tickets')).toBeInTheDocument();
  });

  it('calls onNewPlan callback when button clicked', () => {
    const onNewPlanMock = vi.fn();
    render(<PlatformOverview {...defaultProps} onNewPlan={onNewPlanMock} />);
    
    const newPlanButton = screen.getByRole('button', { name: /new plan/i });
    fireEvent.click(newPlanButton);
    
    expect(onNewPlanMock).toHaveBeenCalledTimes(1);
  });

  it('calls onMRRReport callback when button clicked', () => {
    const onMRRReportMock = vi.fn();
    render(<PlatformOverview {...defaultProps} onMRRReport={onMRRReportMock} />);
    
    const mrrButton = screen.getByRole('button', { name: /mrr report/i });
    fireEvent.click(mrrButton);
    
    expect(onMRRReportMock).toHaveBeenCalledTimes(1);
  });

  it('displays current month and year', () => {
    render(<PlatformOverview {...defaultProps} />);
    // Subtitle is the small paragraph only; ancestors would also match a naive textContent check
    expect(
      screen.getByText((_, el) => {
        if (!el || el.tagName.toLowerCase() !== 'p') return false;
        const t = el.textContent ?? '';
        return (
          t.includes(defaultProps.platformName) &&
          t.includes('|') &&
          /\d{4}/.test(t)
        );
      }),
    ).toBeInTheDocument();
  });

  it('uses default values when props not provided', () => {
    render(<PlatformOverview />);
    
    expect(screen.getByText('847')).toBeInTheDocument();
    expect(screen.getByText('99.98%')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });
});
