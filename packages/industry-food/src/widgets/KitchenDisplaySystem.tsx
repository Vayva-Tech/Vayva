// @ts-nocheck
// ============================================================================
// Kitchen Display System (KDS) Component
// ============================================================================
// Real-time order queue management for restaurant kitchens
// ============================================================================

import React from "react";
import { Card, CardContent, CardHeader } from "@vayva/ui/components/card";
import { cn } from "@vayva/ui/lib/utils";

export interface KDSOrderItem {
  name: string;
  quantity: number;
  notes?: string;
  modifiers?: string[];
}

export interface KDSOrder {
  id: string;
  orderNumber: string;
  orderType: "dine-in" | "takeout" | "delivery";
  tableNumber?: string;
  items: KDSOrderItem[];
  createdAt: Date;
  status: "pending" | "preparing" | "ready" | "completed";
  prepTimeMinutes?: number;
  priority?: "normal" | "high" | "urgent";
}

export interface KDSBoardProps {
  orders: KDSOrder[];
  designCategory?: "signature" | "glass" | "bold" | "dark" | "natural";
  className?: string;
}

export function KitchenDisplaySystem({
  orders,
  designCategory = "bold",
  className,
}: KDSBoardProps) {
  // Group orders by status
  const pending = orders.filter((o) => o.status === "pending");
  const preparing = orders.filter((o) => o.status === "preparing");
  const ready = orders.filter((o) => o.status === "ready");

  const getGradientClass = () => {
    switch (designCategory) {
      case "signature":
        return "from-blue-50 to-white";
      case "glass":
        return "from-pink-100/50 to-purple-100/50 backdrop-blur";
      case "bold":
        return "from-orange-50 to-yellow-50";
      case "dark":
        return "from-gray-800 to-gray-900";
      case "natural":
        return "from-green-50 to-emerald-50";
      default:
        return "from-gray-50 to-white";
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pending Orders Column */}
        <OrderColumn
          title="Pending"
          orders={pending}
          color="yellow"
          designCategory={designCategory}
        />

        {/* Preparing Orders Column */}
        <OrderColumn
          title="Preparing"
          orders={preparing}
          color="orange"
          designCategory={designCategory}
        />

        {/* Ready Orders Column */}
        <OrderColumn
          title="Ready"
          orders={ready}
          color="green"
          designCategory={designCategory}
        />
      </div>
    </div>
  );
}

interface OrderColumnProps {
  title: string;
  orders: KDSOrder[];
  color: "yellow" | "orange" | "green";
  designCategory: string;
}

function OrderColumn({ title, orders, color, designCategory }: OrderColumnProps) {
  const bgColors = {
    yellow: "bg-yellow-50/50 border-yellow-200",
    orange: "bg-orange-50/50 border-orange-200",
    green: "bg-green-50/50 border-green-200",
  };

  const getGradientClass = () => {
    switch (designCategory) {
      case "signature":
        return "from-white to-gray-50";
      case "glass":
        return "backdrop-blur-sm bg-white/50";
      case "bold":
        return `from-white ${bgColors[color]}`;
      case "dark":
        return "from-gray-800 to-gray-700";
      case "natural":
        return "from-white to-stone-50";
      default:
        return "from-white to-gray-50";
    }
  };

  return (
    <Card className={cn("bg-gradient-to-br", getGradientClass(), "border-2")}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <span className="text-xs bg-muted px-2 py-1 rounded-full">
            {orders.length}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
        {orders.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-4">
            No orders
          </p>
        )}
      </CardContent>
    </Card>
  );
}

interface OrderCardProps {
  order: KDSOrder;
}

function OrderCard({ order }: OrderCardProps) {
  const getPriorityColor = () => {
    switch (order.priority) {
      case "urgent":
        return "border-l-red-500";
      case "high":
        return "border-l-orange-500";
      default:
        return "border-l-gray-300";
    }
  };

  const getOrderTypeIcon = () => {
    switch (order.orderType) {
      case "dine-in":
        return "🍽️";
      case "takeout":
        return "🥡";
      case "delivery":
        return "🚗";
      default:
        return "📦";
    }
  };

  const getTimeAgo = (date: Date) => {
    const minutes = Math.floor(
      (new Date().getTime() - date.getTime()) / 60000
    );
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m ago`;
  };

  return (
    <div
      className={cn(
        "p-3 rounded-lg border shadow-sm bg-background border-l-4",
        getPriorityColor()
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getOrderTypeIcon()}</span>
          <div>
            <div className="font-semibold">#{order.orderNumber}</div>
            {order.tableNumber && (
              <div className="text-xs text-muted-foreground">
                Table {order.tableNumber}
              </div>
            )}
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {getTimeAgo(order.createdAt)}
        </div>
      </div>

      <div className="space-y-1">
        {order.items.map((item, index) => (
          <div key={index} className="text-sm">
            <span className="font-medium">{item.quantity}x</span> {item.name}
            {item.notes && (
              <div className="text-xs text-muted-foreground mt-0.5">
                Note: {item.notes}
              </div>
            )}
          </div>
        ))}
      </div>

      {order.prepTimeMinutes && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Prep time:</span>
          <span className="font-medium">{order.prepTimeMinutes} min</span>
        </div>
      )}
    </div>
  );
}
