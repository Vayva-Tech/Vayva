import React from "react";
import { OrderCard } from "./OrderCard";
import { cn } from "@vayva/ui";

interface FoodOrdersKanbanProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  orders: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSelect: (order: any) => void;
}

export const FoodOrdersKanban = ({
  orders,
  onSelect,
}: FoodOrdersKanbanProps) => {
  const columns = [
    {
      id: "NEW",
      label: "New",
      color: "bg-blue-50 text-blue-700",
    },
    {
      id: "PROCESSING",
      label: "Cooking",
      color: "bg-orange-50 text-orange-700",
    },
    {
      id: "READY",
      label: "Ready",
      color: "bg-green-50 text-green-700",
    },
    {
      id: "COMPLETED",
      label: "Done",
      color: "bg-white/40 text-text-secondary",
    },
  ];

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-320px)] min-h-[500px]">
      {columns.map((col) => {
        const colOrders = orders.filter((o) => o.status === col.id);

        return (
          <div
            key={col.id}
            className="min-w-[280px] w-[300px] flex flex-col bg-white/30 rounded-2xl border border-border/40/50"
          >
            {/* Header */}
            <div className="p-3 sticky top-0 bg-white/30 backdrop-blur-sm z-10 rounded-t-2xl border-b border-border/40 flex justify-between items-center">
              <span className="font-bold text-sm text-text-tertiary uppercase tracking-wide">
                {col.label}
              </span>
              <span
                className={cn(
                  "text-xs font-bold px-2 py-0.5 rounded-full",
                  col.color,
                )}
              >
                {colOrders.length}
              </span>
            </div>

            {/* List */}
            <div className="p-3 overflow-y-auto flex-1 custom-scrollbar">
              {colOrders.length === 0 ? (
                <div className="h-24 flex items-center justify-center text-xs text-text-tertiary italic">
                  Empty
                </div>
              ) : (
                colOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onClick={onSelect}
                    variant="kanban"
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
