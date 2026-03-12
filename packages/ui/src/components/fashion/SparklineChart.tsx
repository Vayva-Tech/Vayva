import React from 'react';

export interface SparklineChartProps {
  data: number[];
  color?: string;
  height?: number;
  showArea?: boolean;
}

export const SparklineChart: React.FC<SparklineChartProps> = ({
  data,
  color = '#E8B4B8',
  height = 40,
  showArea = true,
}) => {
  if (!data || data.length === 0) return null;

  const width = 120;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  // Normalize data points to SVG coordinates
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
    >
      {showArea && (
        <path
          d={areaD}
          fill={color}
          fillOpacity="0.2"
          stroke="none"
        />
      )}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default SparklineChart;
