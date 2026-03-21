"use client";

import { cn } from "@vayva/ui";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

export function DonutChart({
  data,
  legendStyle = "stacked_right",
}: {
  data: { name: string; value: number; color: string }[];
  legendStyle?: "inline" | "stacked_right";
}) {
  const total = data.reduce((sum: number, d) => sum + (d.value || 0), 0);

  return (
    <div className="w-full">
      <div
        className={cn(
          "grid grid-cols-1 gap-6 items-center",
          legendStyle === "stacked_right"
            ? "sm:grid-cols-[240px_1fr]"
            : "sm:grid-cols-1",
        )}
      >
        <div className="relative h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={86}
                paddingAngle={2}
                stroke="transparent"
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-background)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "14px",
                  boxShadow: "var(--)",
                }}
                itemStyle={{ color: "var(--color-text-green-500)", fontSize: 12, fontWeight: 600 }}
                labelStyle={{ color: "var(--color-text-secondary)", fontSize: 11, marginBottom: 6 }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-xs font-semibold text-gray-400">
              Total
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {Number(total || 0).toLocaleString()}
            </div>
          </div>
        </div>

        {legendStyle === "inline" ? (
          <div className="flex flex-wrap gap-2">
            {data.map((d) => (
              <div
                key={d.name}
                className="flex items-center gap-2 rounded-full border border-gray-100 bg-white px-3 py-1.5"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                <span className="text-xs font-semibold text-gray-500">
                  {d.name}
                </span>
                <span className="text-xs font-bold text-gray-900 tabular-nums">
                  {Number(d.value || 0).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {data.map((d) => (
              <div
                key={d.name}
                className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white px-4 py-3"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: d.color }}
                  />
                  <span className="text-sm font-semibold text-gray-500 truncate">
                    {d.name}
                  </span>
                </div>
                <div className="text-sm font-bold text-gray-900 tabular-nums">
                  {Number(d.value || 0).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
