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

interface RetailOrdersViewProps {
  orders: Order[];
  onSelect: (order: Order) => void;
}

export const RetailOrdersView: React.FC<RetailOrdersViewProps> = ({
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
