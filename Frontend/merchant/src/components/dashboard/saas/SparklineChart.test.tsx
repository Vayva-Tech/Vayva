import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SparklineChart } from './SparklineChart';

describe('SparklineChart', () => {
  const mockData = [10, 25, 18, 30, 45, 35, 50];

  it('renders null when no data provided', () => {
    const { container } = render(<SparklineChart data={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders SVG with correct dimensions', () => {
    render(<SparklineChart data={mockData} />);
    const svg = screen.getByRole('img');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '120');
    expect(svg).toHaveAttribute('height', '40');
  });

  it('uses custom color when provided', () => {
    render(<SparklineChart data={mockData} color="#EF4444" />);
    const svg = screen.getByRole('img');
    expect(svg.innerHTML).toContain('#EF4444');
  });

  it('renders path elements for line chart', () => {
    render(<SparklineChart data={mockData} />);
    const paths = screen.getByRole('img').querySelectorAll('path');
    expect(paths).toHaveLength(2); // Area and line
  });

  it('applies custom className', () => {
    render(<SparklineChart data={mockData} className="custom-class" />);
    const svg = screen.getByRole('img');
    expect(svg).toHaveClass('custom-class');
  });
});
