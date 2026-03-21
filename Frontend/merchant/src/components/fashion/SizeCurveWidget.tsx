"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface SizeCurveData {
  size: string;
  salesCount: number;
  returnCount: number;
  stockLevel: number;
  sellThroughRate: number;
  returnRate: number;
}

export const SizeCurveWidget: React.FC = () => {
  const { data, isLoading } = useQuery<SizeCurveData[]>({
    queryKey: ['size-curve'],
    queryFn: async () => {
      const res = await fetch('/api/fashion/analytics/size-curve');
      const data = await res.json();
      return data.curve || data.recommendations || [];
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Size Curve Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data?.map(item => ({
    size: item.size,
    Sales: item.salesCount,
    Returns: item.returnCount,
    Stock: item.stockLevel,
  })) || [];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Size Curve Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="size" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Sales" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Returns" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Stock" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p>No size data available</p>
              <p className="text-sm">Size curve will appear once products have sales</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
