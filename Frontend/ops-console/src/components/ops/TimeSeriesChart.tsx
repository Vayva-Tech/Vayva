"use client";

import React from "react";

interface DataPoint {
  date: string;
  value: number;
  label: string;
}

interface TimeSeriesChartProps {
  data: DataPoint[];
  title: string;
  valuePrefix?: string;
  color?: string;
  height?: number;
}

export function TimeSeriesChart({
  data,
  title,
  valuePrefix = "",
  color = "#6366f1",
  height = 200,
}: TimeSeriesChartProps): React.JSX.Element {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-48 text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const minValue = Math.min(...data.map((d) => d.value), 0);
  const range = maxValue - minValue || 1;

  // Chart dimensions
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };
  const chartWidth = 600;
  const chartHeight = height;
  const width = chartWidth - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;

  // Calculate points
  const points = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1 || 1)) * width,
    y: padding.top + graphHeight - ((d.value - minValue) / range) * graphHeight,
    value: d.value,
    label: d.label,
  }));

  // Create path
  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  // Create area path
  const areaD = `${pathD} L ${points[points.length - 1]?.x || padding.left} ${
    padding.top + graphHeight
  } L ${padding.left} ${padding.top + graphHeight} Z`;

  // Y-axis ticks
  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) =>
    Math.round(minValue + (range / yTicks) * i)
  );

  // Format value
  const formatValue = (val: number) => {
    if (val >= 1000000) return `${valuePrefix}${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${valuePrefix}${(val / 1000).toFixed(1)}K`;
    return `${valuePrefix}${val.toLocaleString()}`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>

      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full"
        style={{ height: `${height}px` }}
      >
        {/* Grid lines */}
        {yTickValues.map((tick, i) => {
          const y = padding.top + graphHeight - ((tick - minValue) / range) * graphHeight;
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={padding.left + width}
                y2={y}
                stroke="#e5e7eb"
                strokeDasharray="4,4"
              />
              <text
                x={padding.left - 10}
                y={y + 4}
                textAnchor="end"
                className="text-xs fill-gray-500"
              >
                {formatValue(tick)}
              </text>
            </g>
          );
        })}

        {/* Area */}
        <path d={areaD} fill={color} opacity={0.1} />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={4} fill={color} stroke="white" strokeWidth={2} />
            <title>{`${p.label}: ${formatValue(p.value)}`}</title>
          </g>
        ))}

        {/* X-axis labels (show every Nth label to avoid crowding) */}
        {points.map((p, i) => {
          const showLabel = data.length <= 10 || i % Math.ceil(data.length / 10) === 0;
          if (!showLabel) return null;
          return (
            <text
              key={i}
              x={p.x}
              y={padding.top + graphHeight + 20}
              textAnchor="middle"
              className="text-xs fill-gray-500"
              transform={`rotate(-45, ${p.x}, ${padding.top + graphHeight + 20})`}
            >
              {p.label}
            </text>
          );
        })}

        {/* Axes */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + graphHeight}
          stroke="#9ca3af"
        />
        <line
          x1={padding.left}
          y1={padding.top + graphHeight}
          x2={padding.left + width}
          y2={padding.top + graphHeight}
          stroke="#9ca3af"
        />
      </svg>
    </div>
  );
}
