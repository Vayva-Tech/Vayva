import React from "react";
import { OrderCard } from "./OrderCard";
import { Icon } from "@vayva/ui";

interface ServiceBookingsViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  orders: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSelect: (order: any) => void;
}

export const ServiceBookingsView = ({
  orders,
  onSelect,
}: ServiceBookingsViewProps) => {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white/30 rounded-3xl border border-dashed border-border">
        <div className="w-12 h-12 bg-background rounded-xl flex items-center justify-center mb-4 shadow-sm">
          <Icon name="Calendar" size={20} className="text-text-tertiary" />
        </div>
        <h3 className="text-text-primary font-bold mb-1">No bookings found</h3>
        <p className="text-text-tertiary text-sm max-w-[200px] text-center">
          Try adjusting your filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="font-bold text-lg text-text-primary sticky top-0 bg-[#F8F9FA] py-2 z-10">
        Today
      </h3>
      <div className="space-y-3">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} onClick={onSelect} />
        ))}
      </div>
    </div>
  );
};
