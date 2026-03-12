import React from 'react';

export interface DonutChartProps {
  data: Array<{ label: string; value: number; color?: string }>;
  size?: number;
  showLabels?: boolean;
  showPercentage?: boolean;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  size = 200,
  showLabels = true,
  showPercentage = true,
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const center = size / 2;
  const radius = size * 0.4;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  const defaultColors = [
    '#E8B4B8', // Rose gold
    '#D4A5A5', // Soft rose
    '#F5E6E8', // Blush
    '#C89A9A', // Dusty rose
    '#B88A8A', // Mauve
    '#A87A7A', // Rose brown
  ];

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const slices = data.map((item, index) => {
    const percent = item.value / total;
    const startPercent = cumulativePercent;
    cumulativePercent += percent;

    const [startX, startY] = getCoordinatesForPercent(startPercent);
    const [endX, endY] = getCoordinatesForPercent(cumulativePercent);

    const largeArcFlag = percent > 0.5 ? 1 : 0;

    const pathData = [
      `M ${startX * radius} ${startY * radius}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX * radius} ${endY * radius}`,
      `L 0 0`,
    ].join(' ');

    return {
      pathData,
      color: item.color || defaultColors[index % defaultColors.length],
      label: item.label,
      percentage: (percent * 100).toFixed(1),
    };
  });

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size}
        viewBox={`-${size / 2} -${size / 2} ${size} ${size}`}
        className="transform -rotate-90"
      >
        {slices.map((slice, index) => (
          <path
            key={index}
            d={slice.pathData}
            fill={slice.color}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1"
            className="transition-all duration-300 hover:opacity-80"
          />
        ))}
        {/* Center circle for donut effect */}
        <circle
          cx="0"
          cy="0"
          r={radius * 0.6}
          fill="rgba(15, 15, 15, 0.8)"
        />
      </svg>

      {showLabels && (
        <div className="mt-4 grid grid-cols-2 gap-2 w-full">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: item.color || defaultColors[index % defaultColors.length],
                }}
              />
              <span className="text-white/90">{item.label}</span>
              {showPercentage && (
                <span className="text-white/60 ml-auto">
                  {((item.value / total) * 100).toFixed(1)}%
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DonutChart;
