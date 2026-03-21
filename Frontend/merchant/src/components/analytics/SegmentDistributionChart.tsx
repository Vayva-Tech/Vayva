"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { CustomerSegment } from "@/types/intelligence";

interface SegmentDistributionChartProps {
  segments: CustomerSegment[];
}

export function SegmentDistributionChart({ segments }: SegmentDistributionChartProps) {
  const data = segments.map((segment) => ({
    name: segment.name,
    value: segment.customerCount,
    color: segment.color,
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-white p-3 shadow-sm">
                    <p className="font-medium">{payload[0].name}</p>
                    <p className="text-sm text-gray-500">
                      {payload[0].value} customers
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
