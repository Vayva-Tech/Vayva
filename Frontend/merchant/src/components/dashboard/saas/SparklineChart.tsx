'use client';

import React, { memo } from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

interface SparklineChartProps {
  data: number[];
  color?: string;
  height?: number;
  className?: string;
}

export const SparklineChart = memo(function SparklineChart({ 
  data, 
  color = '#3B82F6', 
  height = 40,
  className = ''
}: SparklineChartProps) {
  if (!data || data.length === 0) return null;

  // Convert array to chart data format
  const chartData = data.map((value, index) => ({
    index,
    value,
  }));

  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#gradient-${color})`}
            dot={false}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '12px',
              padding: '4px 8px'
            }}
            formatter={(value) => [Number(value ?? 0).toLocaleString(), 'Value']}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});
