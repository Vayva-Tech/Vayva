import React from "react";
import { UnifiedOrderStatus, formatCurrency, formatDate } from "@vayva/shared";
import { Icon, cn, Button } from "@vayva/ui";

interface Order {
  id: string;
  refCode?: string | null;
  total: number;
  status: UnifiedOrderStatus;
  createdAt?: string | Date | null;
  customer: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  };
}

interface OrderCardProps {
  order: Order;
  onClick: (order: Order) => void;
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
        return "bg-primary/10 text-primary border-primary/20";
      case UnifiedOrderStatus.PROCESSING:
        return "bg-white/40 text-text-primary border-border/60";
      case UnifiedOrderStatus.READY:
      case UnifiedOrderStatus.CONFIRMED:
        return "bg-background/60 text-text-primary border-border/60";
      case UnifiedOrderStatus.COMPLETED:
        return "bg-primary/10 text-primary border-primary/20";
      default:
        return "bg-white/40 text-text-secondary border-border/60";
    }
  };

  if (variant === "kanban") {
    // Compact card for columns
    return (
      <div
        onClick={() => onClick(order)}
        className="bg-background/70 backdrop-blur-xl p-4 rounded-2xl border border-border/60 shadow-card hover:shadow-elevated cursor-pointer transition-all mb-3"
      >
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-mono text-text-tertiary">
            {order.refCode || order.id}
          </span>
          <span className="text-xs font-bold text-text-tertiary bg-white/40 px-1.5 py-0.5 rounded uppercase border border-border/60">
            {order.createdAt ? formatDate(order.createdAt) : ""}
          </span>
        </div>

        <h4 className="font-bold text-text-primary mb-1 line-clamp-2">
          {order.customer?.name || order.customer?.email || "Customer"}
        </h4>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/60">
          <span className="text-sm font-bold text-text-primary">
            {formatCurrency(order.total)}
          </span>
        </div>
      </div>
    );
  }

  // Default List / Agenda View
  return (
    <div
      onClick={() => onClick(order)}
      className="group bg-background/70 backdrop-blur-xl p-5 rounded-[28px] border border-border/60 hover:border-border hover:shadow-elevated cursor-pointer transition-all duration-300 flex flex-col md:flex-row md:items-center gap-4 animate-in fade-in slide-in-from-bottom-2"
    >
      {/* Left: Icon & ID */}
      <div className="flex items-center gap-4 min-w-[180px]">
        <div
          className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-xl transition-colors duration-300",
            "bg-white/40 text-text-secondary border border-border/60 group-hover:bg-primary group-hover:text-text-inverse",
          )}
        >
          <Icon name="ShoppingBag" size={24} />
        </div>
        <div>
          <p className="font-mono text-[10px] text-text-tertiary mb-1 uppercase tracking-widest font-bold">
            Ref: {order.refCode || order.id}
          </p>
          <h4 className="font-black text-text-primary text-lg group-hover:translate-x-1 transition-transform">
            {order.customer.name}
          </h4>
        </div>
      </div>

      {/* Middle: Details */}
      <div className="flex-1 md:border-l md:border-border/60 md:pl-6 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-text-tertiary font-medium uppercase tracking-wider mb-1">
            Items
          </p>
          <p
            className="text-sm font-medium text-text-secondary truncate max-w-[200px]"
            title={order.customer?.email || ""}
          >
            {order.customer?.email || order.customer?.phone || ""}
          </p>
        </div>
        <div>
          <p className="text-xs text-text-tertiary font-medium uppercase tracking-wider mb-1">
            Total
          </p>
          <p className="font-bold text-text-primary">
            {formatCurrency(order.total)}
          </p>
        </div>
      </div>

      {/* Right: Status & Action */}
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
          className="w-8 h-8 rounded-full bg-white/40 text-text-tertiary group-hover:bg-primary group-hover:text-text-inverse transition-colors p-0 border border-border/60"
        >
          <Icon name="ChevronRight" size={16} />
        </Button>
      </div>
    </div>
  );
};
