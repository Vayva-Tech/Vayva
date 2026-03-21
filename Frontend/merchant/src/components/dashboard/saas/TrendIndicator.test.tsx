import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TrendIndicator } from './TrendIndicator';

describe('TrendIndicator', () => {
  it('renders upward trend correctly', () => {
    render(<TrendIndicator trend="up" value={12.5} />);
    expect(screen.getByText('12.5%')).toBeInTheDocument();
    expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument();
  });

  it('renders downward trend correctly', () => {
    render(<TrendIndicator trend="down" value={-8.3} />);
    expect(screen.getByText('8.3%')).toBeInTheDocument();
    expect(screen.getByTestId('trending-down-icon')).toBeInTheDocument();
  });

  it('renders neutral trend correctly', () => {
    render(<TrendIndicator trend="neutral" value={0} />);
    expect(screen.getByText('0.0%')).toBeInTheDocument();
    expect(screen.getByTestId('minus-icon')).toBeInTheDocument();
  });

  it('applies correct color classes for trends', () => {
    const { rerender } = render(<TrendIndicator trend="up" value={10} />);
    expect(screen.getByText('10.0%')).toHaveClass('text-green-600');

    rerender(<TrendIndicator trend="down" value={-10} />);
    expect(screen.getByText('10.0%')).toHaveClass('text-error');

    rerender(<TrendIndicator trend="neutral" value={0} />);
    expect(screen.getByText('0.0%')).toHaveClass('text-gray-400');
  });

  it('displays absolute value regardless of sign', () => {
    render(<TrendIndicator trend="down" value={-15.7} />);
    expect(screen.getByText('15.7%')).toBeInTheDocument();
  });
});
