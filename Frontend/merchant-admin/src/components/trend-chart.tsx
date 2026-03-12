import React from "react";

export function TrendChart({
  data,
  color = "#46EC13",
  height = 200,
}: {
  data: number[];
  color?: string;
  height?: number;
}) {
  // Determine bounds
  const max = Math.max(...data);
  const min = 0;
  const range = max - min;

  // Create points
  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((val - min) / range) * 80; // keep 80% height to avoid clipping
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="w-full relative" style={{ height: `${height}px` }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full overflow-visible"
      >
        {/* Gradient Definition */}
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area Fill */}
        <path
          d={`M0,100 L0,${100 - ((data[0] - min) / range) * 80} ${points
            .split(" ")
            .map((p) => "L" + p)
            .join(" ")} L100,100 Z`}
          fill={`url(#gradient-${color})`}
        />

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* X-Axis Labels (Test) */}
      <div className="absolute bottom-0 inset-x-0 flex justify-between text-[10px] text-zinc-500 font-mono pt-2 border-t border-white/5 uppercase tracking-wider">
        <span>Oct 01</span>
        <span>Oct 08</span>
        <span>Oct 15</span>
        <span>Oct 22</span>
        <span>Oct 29</span>
      </div>
    </div>
  );
}
