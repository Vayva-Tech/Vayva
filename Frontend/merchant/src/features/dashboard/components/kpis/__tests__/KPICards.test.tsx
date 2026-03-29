/**
 * KPICard Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KPICard, RevenueKPICard, OrdersKPICard } from '../KPICards';

describe('KPICard', () => {
  it('renders title and value correctly', () => {
    render(<KPICard title="Revenue" value={1234} />);
    
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('shows positive change with correct styling', () => {
    render(<KPICard title="Orders" value={50} change={15.5} />);
    
    expect(screen.getByText('+15.5%')).toBeInTheDocument();
    expect(screen.getByText('vs last period')).toBeInTheDocument();
  });

  it('shows negative change with correct styling', () => {
    render(<KPICard title="Customers" value={100} change={-5.2} />);
    
    const changeElement = screen.getByText('-5.2%');
    expect(changeElement).toHaveClass('text-red-600');
  });

  it('displays loading state', () => {
    render(<KPICard title="Revenue" value={0} loading={true} />);
    
    const skeleton = screen.getByTestId('kpi-value-skeleton');
    expect(skeleton).toHaveClass('animate-pulse');
  });

  it('formats currency correctly in RevenueKPICard', () => {
    render(<RevenueKPICard title="Total Revenue" value={5000} />);
    
    expect(screen.getByText('$5,000')).toBeInTheDocument();
  });

  it('displays icon when provided', () => {
    render(<KPICard title="Orders" value={25} icon="ShoppingCart" />);
    
    const icon = screen.getByTestId('icon-shopping-cart');
    expect(icon).toBeInTheDocument();
  });
});
