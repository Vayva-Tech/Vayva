'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface UsageByEndpointChartProps {
  data: Array<{
    endpoint: string;
    calls: number;
    percentage: number;
  }>;
  className?: string;
}

const COLORS = ['#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE'];

export function UsageByEndpointChart({ data, className = '' }: UsageByEndpointChartProps) {
  return (
    <div className={`h-48 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis 
            type="number" 
            stroke="#64748B"
            fontSize={12}
            tickLine={false}
            tickFormatter={(value) => `${value}%`}
          />
          <YAxis 
            type="category" 
            dataKey="endpoint" 
            stroke="#64748B"
            fontSize={11}
            tickLine={false}
            width={100}
            tick={({ x, y, payload }) => (
              <text x={x} y={y} dy={4} textAnchor="end" fill="#64748B" fontSize={11}>
                {payload.value.split('/').pop()}
              </text>
            )}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            formatter={(value, _name, item) => {
              const pct =
                item && typeof item === 'object' && 'payload' in item
                  ? Number((item as { payload?: { percentage?: number } }).payload?.percentage ?? 0)
                  : 0;
              return [`${Number(value ?? 0).toLocaleString()} (${pct}%)`, 'Usage'];
            }}
          />
          <Bar 
            dataKey="percentage" 
            radius={[0, 4, 4, 0]}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
