import React from "react";
import { OrderCard } from "./OrderCard";
import { UnifiedOrderStatus } from "@vayva/shared";

interface Order {
  id: string;
  refCode?: string;
  customer: { name?: string; email?: string; phone?: string };
  total: number;
  status: UnifiedOrderStatus;
  createdAt?: string;
}

interface ServiceBookingsViewProps {
  orders: Order[];
  onSelect: (order: Order) => void;
}

export const ServiceBookingsView: React.FC<ServiceBookingsViewProps> = ({
  orders,
  onSelect,
}) => {
  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} onClick={onSelect} />
      ))}
    </div>
  );
};
