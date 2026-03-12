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
  const total = data.reduce((sum, d) => sum + (d.value || 0), 0);

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
                  backgroundColor: "rgba(255,255,255,0.92)",
                  border: "1px solid rgba(0,0,0,0.06)",
                  borderRadius: "14px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                }}
                itemStyle={{ color: "#0f172a", fontSize: 12, fontWeight: 600 }}
                labelStyle={{ color: "#64748b", fontSize: 11, marginBottom: 6 }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-xs font-semibold text-text-tertiary">
              Total
            </div>
            <div className="text-2xl font-bold text-text-primary">
              {Number(total || 0).toLocaleString()}
            </div>
          </div>
        </div>

        {legendStyle === "inline" ? (
          <div className="flex flex-wrap gap-2">
            {data.map((d) => (
              <div
                key={d.name}
                className="flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1.5"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                <span className="text-xs font-semibold text-text-secondary">
                  {d.name}
                </span>
                <span className="text-xs font-bold text-text-primary tabular-nums">
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
                className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-background/60 px-4 py-3"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: d.color }}
                  />
                  <span className="text-sm font-semibold text-text-secondary truncate">
                    {d.name}
                  </span>
                </div>
                <div className="text-sm font-bold text-text-primary tabular-nums">
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
