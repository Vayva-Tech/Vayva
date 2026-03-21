import React from "react";
import { UnifiedOrderStatus, formatCurrency, formatDate } from "@vayva/shared";
import { Icon, cn, Button } from "@vayva/ui";

interface OrderCustomer {
  name?: string;
  email?: string;
  phone?: string;
}

interface OrderData {
  id: string;
  refCode?: string;
  customer: OrderCustomer;
  total: number;
  status: UnifiedOrderStatus;
  createdAt?: string;
}

interface OrderCardProps {
  order: OrderData;
  onClick: (order: OrderData) => void;
  variant?: "list" | "kanban";
}

export const OrderCard = ({
  order,
  onClick,
  variant = "list",
}: OrderCardProps) => {
  const getStatusColor = (status: UnifiedOrderStatus) => {
    switch (status) {
      case UnifiedOrderStatus.NEW:
      case UnifiedOrderStatus.REQUESTED:
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case UnifiedOrderStatus.PROCESSING:
        return "bg-white/40 text-gray-900 border-gray-100";
      case UnifiedOrderStatus.READY:
      case UnifiedOrderStatus.CONFIRMED:
        return "bg-white text-gray-900 border-gray-100";
      case UnifiedOrderStatus.COMPLETED:
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "bg-white/40 text-gray-500 border-gray-100";
    }
  };

  if (variant === "kanban") {
    return (
      <div
        onClick={() => onClick(order)}
        className="bg-white  p-4 rounded-2xl border border-gray-100  hover:shadow-lg cursor-pointer transition-all mb-3"
      >
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-mono text-gray-400">
            {order.refCode || order.id}
          </span>
          <span className="text-xs font-bold text-gray-400 bg-white/40 px-1.5 py-0.5 rounded uppercase border border-gray-100">
            {order.createdAt ? formatDate(order.createdAt) : ""}
          </span>
        </div>

        <h4 className="font-bold text-gray-900 mb-1 line-clamp-2">
          {order.customer?.name || order.customer?.email || "Customer"}
        </h4>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
          <span className="text-sm font-bold text-gray-900">
            {formatCurrency(order.total)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onClick(order)}
      className="group bg-white  p-5 rounded-2xl border border-gray-100 hover:border-gray-100 hover:shadow-lg cursor-pointer transition-all duration-300 flex flex-col md:flex-row md:items-center gap-4 animate-in fade-in slide-in-from-bottom-2"
    >
      <div className="flex items-center gap-4 min-w-[180px]">
        <div
          className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-xl transition-colors duration-300",
            "bg-white/40 text-gray-500 border border-gray-100 group-hover:bg-green-500 group-hover:text-white",
          )}
        >
          <Icon name="ShoppingBag" size={24} />
        </div>
        <div>
          <p className="font-mono text-[10px] text-gray-400 mb-1 uppercase tracking-widest font-bold">
            Ref: {order.refCode || order.id}
          </p>
          <h4 className="font-black text-gray-900 text-lg group-hover:translate-x-1 transition-transform">
            {order.customer.name}
          </h4>
        </div>
      </div>

      <div className="flex-1 md:border-l md:border-gray-100 md:pl-6 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
            Items
          </p>
          <p
            className="text-sm font-medium text-gray-500 truncate max-w-[200px]"
            title={order.customer?.email || ""}
          >
            {order.customer?.email || order.customer?.phone || ""}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
            Total
          </p>
          <p className="font-bold text-gray-900">
            {formatCurrency(order.total)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between md:justify-end gap-4 min-w-[200px]">
        <div
          className={cn(
            "px-3 py-1.5 rounded-xl text-xs font-bold border capitalize",
            getStatusColor(order.status),
          )}
        >
          {order.status.replace("_", " ")}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 rounded-full bg-white/40 text-gray-400 group-hover:bg-green-500 group-hover:text-white transition-colors p-0 border border-gray-100"
        >
          <Icon name="ChevronRight" size={16} />
        </Button>
      </div>
    </div>
  );
};
