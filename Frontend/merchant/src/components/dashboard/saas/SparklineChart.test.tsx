import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { SparklineChart } from './SparklineChart';

describe('SparklineChart', () => {
  const mockData = [10, 25, 18, 30, 45, 35, 50];

  let rectSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    rectSpy = vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(() => ({
      width: 120,
      height: 40,
      top: 0,
      left: 0,
      bottom: 40,
      right: 120,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }));
  });

  afterEach(() => {
    rectSpy.mockRestore();
  });

  const chartSurface = () => {
    const el = document.querySelector('.recharts-surface');
    if (!el) throw new Error('Expected .recharts-surface');
    return el;
  };

  it('renders null when no data provided', () => {
    const { container } = render(<SparklineChart data={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders SVG with correct dimensions', () => {
    render(
      <div style={{ width: 120, height: 40 }}>
        <SparklineChart data={mockData} />
      </div>,
    );
    const svg = chartSurface();
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '120');
    expect(svg).toHaveAttribute('height', '40');
  });

  it('uses custom color when provided', () => {
    render(
      <div style={{ width: 120, height: 40 }}>
        <SparklineChart data={mockData} color="#EF4444" />
      </div>,
    );
    const svg = chartSurface();
    expect(svg.innerHTML).toContain('#EF4444');
  });

  it('renders path elements for line chart', () => {
    render(
      <div style={{ width: 120, height: 40 }}>
        <SparklineChart data={mockData} />
      </div>,
    );
    const paths = chartSurface().querySelectorAll('path');
    expect(paths.length).toBeGreaterThanOrEqual(1);
  });

  it('applies custom className', () => {
    const { container } = render(
      <div style={{ width: 120, height: 40 }}>
        <SparklineChart data={mockData} className="custom-class" />
      </div>,
    );
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});
