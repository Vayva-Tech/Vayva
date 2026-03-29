/**
 * DashboardShell Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardShell } from '../core/DashboardShell';

// Mock child components
vi.mock('../core/DashboardHeader', () => ({
  DashboardHeader: ({ title }: { title?: string }) => <header data-testid="header">{title}</header>,
}));

vi.mock('../core/DashboardSidebar', () => ({
  DashboardSidebar: () => <aside data-testid="sidebar">Sidebar</aside>,
}));

vi.mock('../core/DashboardFooter', () => ({
  DashboardFooter: () => <footer data-testid="footer">Footer</footer>,
}));

vi.mock('../core/DashboardGrid', () => ({
  DashboardGrid: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="grid">{children}</div>
  ),
}));

describe('DashboardShell', () => {
  it('renders with all layout parts', () => {
    render(<DashboardShell children={<main>Content</main>} />);
    
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByTestId('grid')).toBeInTheDocument();
  });

  it('displays title and description when provided', () => {
    render(
      <DashboardShell 
        title="Dashboard" 
        description="Overview"
        children={<main>Content</main>} 
      />
    );
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Overview')).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(
      <DashboardShell 
        actions={<button>Refresh</button>}
        children={<main>Content</main>} 
      />
    );
    
    expect(screen.getByText('Refresh')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <DashboardShell 
        className="custom-class"
        children={<main>Content</main>} 
      />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
