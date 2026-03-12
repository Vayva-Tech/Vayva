import React from "react";
import { useRouter } from "next/navigation";
import {
  UnifiedOrder,
  UnifiedOrderStatus,
  OrderType,
  logger,
  formatCurrency,
} from "@vayva/shared";
import { Drawer, Icon, cn, Button } from "@vayva/ui";

interface OrderDetailsDrawerProps {
  order: UnifiedOrder | null;
  onClose: () => void;
}

import { apiJson } from "@/lib/api-client-shared";

interface StatusUpdateResponse {
  success: boolean;
}

interface CancelResponse {
  success: boolean;
}

interface RefundResponse {
  success: boolean;
  refundId?: string;
}

export const OrderDetailsDrawer = ({
  order,
  onClose,
}: OrderDetailsDrawerProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [actionNote, setActionNote] = React.useState("");
  const [showCancel, setShowCancel] = React.useState(false);
  const [showRefund, setShowRefund] = React.useState(false);

  if (!order) return null;

  const handleStatusUpdate = async (nextStatus: UnifiedOrderStatus) => {
    setIsLoading(true);
    try {
      await apiJson<StatusUpdateResponse>(`/api/orders/${order.id}/status`, {
        method: "POST",
        body: JSON.stringify({ next_status: nextStatus }),
      });
      // Ideally trigger a refresh of the parent list here
      onClose();
    } catch (e: unknown) {
      const _errMsg = e instanceof Error ? e.message : String(e);
      logger.error("[ORDER_STATUS_UPDATE_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      await apiJson<CancelResponse>(`/api/orders/${order.id}/cancel`, {
        method: "POST",
        body: JSON.stringify({ reason: actionNote || "Merchant cancelled" }),
      });
      onClose();
    } catch (e: unknown) {
      const _errMsg = e instanceof Error ? e.message : String(e);
      logger.error("[ORDER_CANCEL_ERROR]", { error: _errMsg, app: "merchant" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefund = async () => {
    setIsLoading(true);
    try {
      await apiJson<RefundResponse>(`/api/refunds/request/${order.id}`, {
        method: "POST",
        body: JSON.stringify({
          amount: order.totalAmount,
          reason: actionNote || "Full refund",
        }),
      });
      onClose();
      router.refresh();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      logger.error("[ORDER_REFUND_ERROR]", { error: msg, app: "merchant" });
    } finally {
      setIsLoading(false);
    }
  };

  const renderActionButtons = () => {
    if (showCancel) {
      return (
        <div className="flex flex-col gap-3 w-full animate-in slide-in-from-bottom-5">
          <p className="text-sm font-bold text-text-primary mb-1">
            Confirm Cancellation?
          </p>
          <input
            className="w-full border border-border/60 rounded-xl p-2 text-sm bg-background/70 backdrop-blur-xl shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            placeholder="Reason for cancellation..."
            value={actionNote}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setActionNote(e.target.value)
            }
          />
          <div className="flex gap-2">
            <Button
              onClick={() => setShowCancel(false)}
              variant="secondary"
              className="flex-1 font-bold rounded-xl"
            >
              Back
            </Button>
            <Button
              onClick={handleCancel}
              disabled={isLoading}
              variant="destructive"
              className="flex-1 font-bold rounded-xl"
            >
              {isLoading ? "Processing..." : "Confirm Cancel"}
            </Button>
          </div>
        </div>
      );
    }

    if (showRefund) {
      return (
        <div className="flex flex-col gap-3 w-full animate-in slide-in-from-bottom-5">
          <p className="text-sm font-bold text-text-primary mb-1">
            Issue Full Refund?
          </p>
          <input
            className="w-full border border-border/60 rounded-xl p-2 text-sm bg-background/70 backdrop-blur-xl shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            placeholder="Reason for refund..."
            value={actionNote}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setActionNote(e.target.value)
            }
          />
          <div className="flex gap-2">
            <Button
              onClick={() => setShowRefund(false)}
              variant="secondary"
              className="flex-1 font-bold rounded-xl"
            >
              Back
            </Button>
            <Button
              onClick={handleRefund}
              disabled={isLoading}
              className="flex-1 bg-primary hover:bg-primary-hover text-text-inverse font-bold rounded-xl"
            >
              {isLoading
                ? "Processing..."
                : `Refund ${formatCurrency(order.totalAmount)}`}
            </Button>
          </div>
        </div>
      );
    }

    // Default Workflow Buttons
    return (
      <div className="flex flex-col gap-3 w-full">
        <div className="flex gap-2">
          {order.status === UnifiedOrderStatus.NEW && (
            <>
              <Button
                onClick={() =>
                  handleStatusUpdate(UnifiedOrderStatus.PROCESSING)
                }
                className="flex-1 rounded-xl font-bold"
              >
                Accept Order
              </Button>
              <Button
                onClick={() => setShowCancel(true)}
                variant="destructive" //Using destructive variant but overriding bg for softer look if needed, or stick to system destructive
                className="px-4 bg-red-50 text-red-600 hover:bg-red-100 border-none rounded-xl font-bold"
              >
                Reject
              </Button>
            </>
          )}

          {order.status === UnifiedOrderStatus.PROCESSING && (
            <Button
              onClick={() => handleStatusUpdate(UnifiedOrderStatus.READY)}
              className="flex-1 rounded-xl font-bold"
            >
              Mark Ready / Shipped
            </Button>
          )}

          {order.status === UnifiedOrderStatus.READY && (
            <Button
              onClick={() => handleStatusUpdate(UnifiedOrderStatus.COMPLETED)}
              className="flex-1 bg-primary hover:bg-primary-hover text-text-inverse rounded-xl font-bold"
            >
              Complete Order
            </Button>
          )}
        </div>

        {/* Secondary Actions */}
        {order.status !== UnifiedOrderStatus.CANCELLED &&
          order.status !== UnifiedOrderStatus.REFUNDED &&
          order.status !== UnifiedOrderStatus.NEW && (
            <div className="flex gap-2 justify-center pt-2">
              <Button
                variant="link"
                onClick={() => setShowCancel(true)}
                className="text-xs font-bold text-text-secondary hover:text-text-primary underline p-0 h-auto"
              >
                Cancel Order
              </Button>
              <span className="text-border">|</span>
              <Button
                variant="link"
                onClick={() => setShowRefund(true)}
                className="text-xs font-bold text-text-secondary hover:text-text-primary underline p-0 h-auto"
              >
                Issue Refund
              </Button>
            </div>
          )}
      </div>
    );
  };

  return (
    <Drawer
      isOpen={!!order}
      onClose={onClose}
      title={
        order.type === OrderType.SERVICE
          ? `Booking #${order.id.split("_")[1]}`
          : `Order #${order.id.split("_")[1]}`
      }
      className="md:max-w-md w-full"
    >
      <div className="p-6 space-y-8 pb-32">
        {/* Status Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-text-tertiary font-medium mb-1 uppercase tracking-wider">
              Status
            </p>
            <h2 className="text-xl font-bold capitalize">
              {order.status.replace("_", " ")}
            </h2>
          </div>
          <div
            className={cn(
              "px-4 py-2 rounded-full text-sm font-bold capitalize border",
              order.status === UnifiedOrderStatus.NEW
                ? "bg-primary/10 text-primary border-primary/20"
                : order.status === UnifiedOrderStatus.COMPLETED
                  ? "bg-primary/10 text-primary border-primary/20"
                  : order.status === UnifiedOrderStatus.CANCELLED
                    ? "bg-white/40 text-text-secondary border-border/60"
                    : "bg-white/40 text-text-secondary border-border/60",
            )}
          >
            {order.status.replace("_", " ").toLowerCase()}
          </div>
        </div>

        {/* Customer */}
        <div className="bg-background/60 rounded-[28px] p-4 border border-border/60 backdrop-blur-xl shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-white/40 border border-border/60 flex items-center justify-center font-bold text-text-secondary">
              {order.customer.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-text-primary">
                {order.customer.name}
              </h3>
              <p className="text-xs text-text-secondary font-mono">
                {order.customer.phone}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1 bg-primary hover:bg-primary-hover text-text-inverse rounded-xl font-bold gap-2">
              <Icon name="MessageCircle" size={16} /> WhatsApp
            </Button>
            <Button variant="outline" className="flex-1 rounded-xl font-bold">
              Call
            </Button>
          </div>
        </div>

        {/* Items */}
        <div>
          <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
            <Icon name="ShoppingBag" size={16} /> Items
          </h3>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div
                key={i}
                className="flex justify-between items-start py-2 border-b border-border/60 last:border-0"
              >
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded bg-white/40 border border-border/60 flex items-center justify-center text-xs font-bold text-text-secondary">
                    {item.quantity}x
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {item.name}
                    </p>
                    {item.modifiers && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.modifiers.map((m, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-white/40 text-text-secondary px-1.5 rounded border border-border/60"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <span className="font-mono text-sm font-medium text-text-primary">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
            <div className="flex justify-between pt-4 border-t border-border/60">
              <span className="font-bold text-text-primary">Total</span>
              <span className="font-bold text-xl text-text-primary">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        <div className="p-4 rounded-2xl border border-border/60 bg-background/60 backdrop-blur-xl shadow-card flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="CreditCard" size={18} className="text-text-tertiary" />
            <span className="text-sm font-medium text-text-secondary">
              Payment Status
            </span>
          </div>
          <span
            className={cn(
              "text-xs font-bold px-2 py-1 rounded uppercase border",
              order.paymentStatus === "paid"
                ? "bg-primary/10 text-primary border-primary/20"
                : "bg-white/40 text-text-secondary border-border/60",
            )}
          >
            {order.paymentStatus}
          </span>
        </div>
      </div>

      {/* Sticky Actions Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border/60 z-10">
        {renderActionButtons()}
      </div>
    </Drawer>
  );
};
