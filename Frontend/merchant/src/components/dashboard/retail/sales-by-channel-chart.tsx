'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ChannelData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface SalesByChannelChartProps {
  channels: ChannelData[];
  className?: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export function SalesByChannelChart({ channels, className }: SalesByChannelChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Sales by Channel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={channels}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, payload }) => {
                  const pct =
                    payload && typeof payload === 'object' && 'percentage' in payload
                      ? Number((payload as ChannelData).percentage)
                      : 0;
                  return `${name}: ${pct.toFixed(1)}%`;
                }}
                labelLine={false}
              >
                {channels.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [
                  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                    Number(value ?? 0),
                  ),
                  'Revenue',
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 space-y-2">
          {channels.map((channel, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: channel.color || COLORS[i % COLORS.length] }}
                />
                <span>{channel.name}</span>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(channel.value)}
                </div>
                <div className="text-gray-500">{channel.percentage.toFixed(1)}%</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
