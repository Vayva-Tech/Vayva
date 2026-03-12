import React from "react";
import { Icon, cn } from "@vayva/ui";
import { ComparisonData } from "@/types/analytics";

export const ComparisonTable = ({ data }: { data: ComparisonData[] }) => {
  return (
    <div className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-border/40 bg-white/30">
        <h3 className="font-bold text-text-primary text-sm">
          Template Comparison
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/40 text-text-tertiary font-medium">
            <tr>
              <th className="px-4 py-3">Template</th>
              <th className="px-4 py-3">Best For</th>
              <th className="px-4 py-3 text-right">Conv. Rate</th>
              <th className="px-4 py-3 text-right">Revenue</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {data.map((item: ComparisonData) => (
              <tr
                key={item.template_id}
                className={cn(
                  "hover:bg-white/40 transition-colors",
                  item.is_active && "bg-green-50/30",
                )}
              >
                <td className="px-4 py-3 font-medium text-text-primary">
                  {item.name}
                  {item.is_active && (
                    <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold uppercase">
                      Active
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-text-tertiary">
                  {item.best_for}
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {item.conversion_rate}%
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  ₦{(item.revenue / 1000).toFixed(1)}k
                </td>
                <td className="px-4 py-3">
                  {item.plan_required ? (
                    <div className="flex items-center gap-1 text-text-tertiary text-xs">
                      <Icon name="Lock" size={12} /> {item.plan_required}
                    </div>
                  ) : (
                    <span className="text-green-600 text-xs font-bold">
                      Available
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
