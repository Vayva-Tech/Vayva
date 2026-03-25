'use client';

import React, { useMemo, useState } from 'react';

export interface TrendChartDataPoint {
  /** Label for the data point (e.g., date, category) */
  label: string;
  /** Numeric value */
  value: number;
  /** Optional timestamp for time-series data */
  timestamp?: Date;
  /** Optional metadata */
  meta?: Record<string, unknown>;
}

export interface TrendChartProps {
  /** Array of data points to visualize */
  data: TrendChartDataPoint[];
  
  /** Type of chart to render */
  chartType?: 'line' | 'bar' | 'area' | 'sparkline';
  
  /** Primary color for the chart */
  color?: string;
  
  /** Height of the chart in pixels */
  height?: number;
  
  /** Show grid lines */
  showGrid?: boolean;
  
  /** Show axis labels */
  showLabels?: boolean;
  
  /** Show data point tooltips */
  showTooltip?: boolean;
  
  /** Enable gradient fill for area charts */
  gradient?: boolean;
  
  /** Minimum value for y-axis (null for auto) */
  minY?: number | null;
  
  /** Maximum value for y-axis (null for auto) */
  maxY?: number | null;
  
  /** Animation duration in milliseconds */
  animationDuration?: number;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Click handler for data points */
  onDataPointClick?: (point: TrendChartDataPoint, index: number) => void;
}

export function TrendChart({
  data,
  chartType = 'line',
  color = '#3B82F6',
  height = 200,
  showGrid = true,
  showLabels = true,
  showTooltip = false,
  gradient = true,
  minY = null,
  maxY = null,
  animationDuration = 300,
  className = '',
  onDataPointClick,
}: TrendChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Calculate min/max values
  const calculatedMin = useMemo(() => 
    minY !== null ? minY : Math.min(...data.map(d => d.value)), 
    [data, minY]
  );
  const calculatedMax = useMemo(() => 
    maxY !== null ? maxY : Math.max(...data.map(d => d.value)), 
    [data, maxY]
  );

  // Generate SVG path points
  const points = useMemo(() => {
    return data.map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((d.value - calculatedMin) / (calculatedMax - calculatedMin)) * 85;
      return { x, y, dataPoint: d, index: i };
    });
  }, [data, calculatedMin, calculatedMax]);

  const pathData = points.map(p => `${p.x},${p.y}`).join(' ');

  // Gradient definition for area charts
  const gradientId = `gradient-${color.replace('#', '')}`;

  // Handle point hover for tooltips
  const handlePointHover = (index: number | null) => {
    if (showTooltip) {
      setHoveredPoint(index);
    }
  };

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        {/* Gradient Definitions */}
        {gradient && (
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
        )}

        {/* Grid Lines */}
        {showGrid && (
          <>
            {[0, 25, 50, 75, 100].map(y => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke="#E5E7EB"
                strokeWidth="0.5"
              />
            ))}
            {[0, 25, 50, 75, 100].map(x => (
              <line
                key={x}
                x1={x}
                y1="0"
                x2={x}
                y2="100"
                stroke="#E5E7EB"
                strokeWidth="0.5"
              />
            ))}
          </>
        )}

        {/* Area Chart Fill */}
        {chartType === 'area' && gradient && (
          <polygon
            points={`0,100 ${pathData} 100,100`}
            fill={`url(#${gradientId})`}
            style={{
              transition: `all ${animationDuration}ms ease-in-out`,
            }}
          />
        )}

        {/* Line Chart */}
        {(chartType === 'line' || chartType === 'area') && (
          <polyline
            points={pathData}
            fill="none"
            stroke={color}
            strokeWidth="2"
            style={{
              transition: `all ${animationDuration}ms ease-in-out`,
            }}
          />
        )}

        {/* Bar Chart */}
        {chartType === 'bar' && points.map((point, i) => {
          const barWidth = 80 / data.length;
          const barHeight = ((point.dataPoint.value - calculatedMin) / (calculatedMax - calculatedMin)) * 80;
          const x = (i / data.length) * 100 + 10;
          const y = 100 - barHeight;
          
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={color}
              opacity={hoveredPoint === i ? 1 : 0.8}
              onMouseEnter={() => handlePointHover(i)}
              onMouseLeave={() => handlePointHover(null)}
              onClick={() => onDataPointClick?.(point.dataPoint, point.index)}
              style={{
                cursor: onDataPointClick ? 'pointer' : 'default',
                transition: `all ${animationDuration}ms ease-in-out`,
              }}
            />
          );
        })}

        {/* Data Points */}
        {(chartType === 'line' || chartType === 'area') && points.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={hoveredPoint === i ? 4 : 3}
            fill={color}
            stroke="white"
            strokeWidth="2"
            onMouseEnter={() => handlePointHover(i)}
            onMouseLeave={() => handlePointHover(null)}
            onClick={() => onDataPointClick?.(point.dataPoint, point.index)}
            style={{
              cursor: onDataPointClick ? 'pointer' : 'default',
              transition: `all ${animationDuration}ms ease-in-out`,
            }}
          />
        ))}

        {/* Sparkline Style (minimal) */}
        {chartType === 'sparkline' && (
          <polyline
            points={pathData}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
          />
        )}
      </svg>

      {/* Axis Labels */}
      {showLabels && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 mt-2">
          <span>{data[0]?.label}</span>
          <span>{data[Math.floor(data.length / 2)]?.label}</span>
          <span>{data[data.length - 1]?.label}</span>
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && hoveredPoint !== null && points[hoveredPoint] && (
        <div 
          className="absolute bg-gray-900 text-white text-xs rounded py-1 px-2 pointer-events-none whitespace-nowrap"
          style={{
            left: `${points[hoveredPoint].x}%`,
            top: `${points[hoveredPoint].y - 30}px`,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="font-medium">{points[hoveredPoint].dataPoint.label}</div>
          <div>{points[hoveredPoint].dataPoint.value.toLocaleString()}</div>
        </div>
      )}
    </div>
  );
}