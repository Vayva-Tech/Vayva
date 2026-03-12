'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface CustomerInsight {
  name: string;
  value: number;
  percentage: number;
}

interface CustomerInsightsChartProps {
  newCustomers: number;
  returningCustomers: number;
  churnRate: number;
  className?: string;
}

export function CustomerInsightsChart({ 
  newCustomers, 
  returningCustomers, 
  churnRate,
  className 
}: CustomerInsightsChartProps) {
  const total = newCustomers + returningCustomers;
  
  const data = [
    {
      name: 'New',
      value: newCustomers,
      percentage: (newCustomers / total) * 100,
      color: '#3B82F6'
    },
    {
      name: 'Returning',
      value: returningCustomers,
      percentage: (returningCustomers / total) * 100,
      color: '#10B981'
    }
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Customer Insights</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{newCustomers.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">New Customers</div>
          </div>
          <div className="text-center border-l">
            <div className="text-2xl font-bold text-green-600">{returningCustomers.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">Returning</div>
          </div>
          <div className="text-center border-l">
            <div className="text-2xl font-bold text-amber-600">{(churnRate * 100).toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground mt-1">Churn Rate</div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={80} />
              <Tooltip 
                formatter={(value: number, name: string, props: any) => [
                  `${value.toLocaleString()} (${props.payload.percentage.toFixed(1)}%)`,
                  'Customers'
                ]}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Retention Rate */}
        <div className="mt-4 p-3 bg-accent/50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Customer Retention Rate</span>
            <span className="text-lg font-bold text-green-600">
              {((returningCustomers / total) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-600 transition-all duration-300"
              style={{ width: `${(returningCustomers / total) * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
