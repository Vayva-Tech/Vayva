"use client";

import { Button, Card, StatusChip } from "@vayva/ui";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle,
  Clock,
  Spinner as Loader2,
} from "@phosphor-icons/react/ssr";
import { logger } from "@vayva/shared";
import { useState } from "react";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  title: string;
  quantity: number;
  // Notes/Metadata are not in current OrderItem schema, but we keep the optional field for future use if extended
  notes?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  createdAt: string; // Serialized date
  fulfillmentStatus: string;
  customerNote?: string;
}

interface KitchenTicketProps {
  order: Order;
  onStatusChange: () => void;
}

import { apiJson } from "@/lib/api-client-shared";

interface UpdateStatusResponse {
  success: boolean;
}

export function KitchenTicket({ order, onStatusChange }: KitchenTicketProps) {
  const [isLoading, setIsLoading] = useState(false);

  const updateStatus = async (status: string) => {
    setIsLoading(true);
    try {
      await apiJson<UpdateStatusResponse>(
        `/api/kitchen/orders/${order.id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        },
      );
      toast.success(`Order marked as ${status}`);
      onStatusChange();
    } catch (e: any) {
      const _errMsg = e instanceof Error ? e.message : String(e);
      logger.error("[UPDATE_KITCHEN_ORDER_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error("Failed to update status");
    } finally {
      setIsLoading(false);
    }
  };

  const isPreparing = order.fulfillmentStatus === "PREPARING";

  return (
    <Card
      className={`flex flex-col h-full overflow-hidden border-2 ${isPreparing ? "border-warning bg-warning/10" : "border-border"}`}
    >
      {/* Header */}
      <div className="p-4 border-b bg-white/40 flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-text-primary">
            #{order.orderNumber}
          </h3>
          <p className="text-xs text-text-tertiary mt-1 flex items-center gap-1">
            <Clock size={12} />
            {formatDistanceToNow(new Date(order.createdAt))} ago
          </p>
        </div>
        <StatusChip status={order.fulfillmentStatus} />
      </div>

      {/* Items */}
      <div className="p-4 flex-1 space-y-3">
        {order.items.map((item: OrderItem) => (
          <div key={item.id} className="flex justify-between items-start">
            <div className="flex gap-2">
              <span className="font-bold text-text-primary w-6">
                {item.quantity}x
              </span>
              <div>
                <p className="font-medium text-text-primary">{item.title}</p>
                {item.notes && (
                  <p className="text-xs text-warning italic mt-0.5">
                    Note: {item.notes}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}

        {order.customerNote && (
          <div className="mt-4 p-2 bg-accent/10 border border-accent/20 rounded text-xs text-accent-foreground">
            <span className="font-bold">Customer Note:</span>{" "}
            {order.customerNote}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t bg-white/30">
        {order.fulfillmentStatus === "UNFULFILLED" ? (
          <Button
            onClick={() => updateStatus("PREPARING")}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Start Preparing"
            )}
          </Button>
        ) : order.fulfillmentStatus === "PREPARING" ? (
          <Button
            onClick={() => updateStatus("READY_FOR_PICKUP")}
            className="w-full gap-2 bg-success hover:bg-success/90 text-success-foreground"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <CheckCircle size={18} /> Mark Ready
              </>
            )}
          </Button>
        ) : (
          <Button variant="outline" className="w-full" disabled>
            Completed
          </Button>
        )}
      </div>
    </Card>
  );
}
