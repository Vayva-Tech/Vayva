"use client";

import { logger, formatCurrency, formatDate } from "@vayva/shared";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { BackButton } from "@/components/ui/BackButton";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Button, cn, StatusChip, Card, Skeleton } from "@vayva/ui";
import {
  Truck,
  User,
  MapPin,
  Printer,
  Warning as AlertTriangle,
  ShoppingBag,
  ChatCircleText as MessageSquare,
} from "@phosphor-icons/react/ssr";
import { PrepTimeCard } from "@/components/orders/PrepTimeCard";

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  productVariant?: { image?: string; name?: string };
}

interface Order {
  id: string;
  orderNumber?: string;
  createdAt: string;
  total: number;
  currency: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  riskLevel?: string;
  riskReasons?: string[];
  isHeld?: boolean;
  customer?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
  };
  metadata?: { prepTimeMinutes?: number; [key: string]: any };
  shipment?: {
    status: string;
    trackingCode?: string;
  };
}

import { apiJson } from "@/lib/api-client-shared";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [shipping, setShipping] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await apiJson<Order>(`/api/orders/${id}`);
      if (!data) throw new Error("Order not found");
      setOrder(data);
    } catch (err: unknown) {
      const _errMsg = err instanceof Error ? err.message : String(err);
      logger.error("[FETCH_ORDER_ERROR]", {
        error: _errMsg,
        orderId: id,
        app: "merchant",
      });
      toast.error("Failed to load order");
      router.push("/dashboard/orders");
    } finally {
      setLoading(false);
    }
  };

  const handleShip = async () => {
    if (shipping) return;
    setShipping(true);
    try {
      await apiJson<{ success: boolean }>(`/api/orders/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "SHIPPED" }),
      });
      toast.success("Order marked as shipped!");
      void fetchOrder();
    } catch (err: unknown) {
      const _errMsg = err instanceof Error ? err.message : String(err);
      logger.error("[SHIP_ORDER_ERROR]", {
        error: _errMsg,
        orderId: id,
        app: "merchant",
      });
      toast.error("Failed to ship order");
    } finally {
      setShipping(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-4 w-48" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-6">
              <Skeleton className="h-8 w-40 mb-6" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-16 w-16" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-1/2" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          <div className="space-y-8">
            <Card className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 pb-20">
      {/* Live region for screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {shipping && <p>Processing shipping order...</p>}
        {order && <p>Order details loaded for order {order.orderNumber || order.id?.slice(0, 8)}</p>}
      </div>

      {/* Loading overlay during ship action */}
      {shipping && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-background rounded-xl p-6 shadow-lg border border-border flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <p className="text-sm font-medium text-text-secondary">
              Processing shipping...
            </p>
          </div>
        </div>
      )}

      <Breadcrumbs />
      {/* Risk Banner */}
      {order.riskLevel && order.riskLevel !== "LOW" && (
        <div
          className={cn(
            "p-4 rounded-2xl border flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500",
            order.riskLevel === "CRITICAL"
              ? "bg-destructive/10 border-destructive/20 text-destructive"
              : order.riskLevel === "HIGH"
                ? "bg-warning/10 border-warning/20 text-warning"
                : "bg-warning/5 border-warning/10 text-warning-foreground",
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-xl",
                order.riskLevel === "CRITICAL"
                  ? "bg-destructive/20"
                  : order.riskLevel === "HIGH"
                    ? "bg-warning/20"
                    : "bg-warning/10",
              )}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold flex items-center gap-2 uppercase tracking-wide text-xs">
                {order.riskLevel} Fraud Risk Detected
                {order.isHeld && (
                  <span className="bg-destructive text-destructive-foreground text-[10px] px-2 py-0.5 rounded-full">
                    HELD
                  </span>
                )}
              </h3>
              <p className="text-sm opacity-90 font-medium font-inter">
                Flagged for:{" "}
                {order.riskReasons?.join(", ") || "Suspicious activity"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <BackButton className="bg-background/70 backdrop-blur-xl border border-border/40 shadow-sm" />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-text-primary tracking-tight">
                Order #{order.orderNumber || order.id?.slice(0, 8)}
              </h1>
              <StatusChip status={order.fulfillmentStatus} />
            </div>
            <p className="text-text-tertiary font-medium font-inter mt-1">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="font-bold border-border">
            <Printer className="h-4 w-4 mr-2" /> Print Slip
          </Button>
          {order.fulfillmentStatus !== "FULFILLED" &&
            (order as any).status !== "CANCELLED" && (
              <Button
                onClick={handleShip}
                disabled={shipping}
                className="font-bold shadow-xl"
              >
                {shipping ? (
                  "Processing..."
                ) : (
                  <>
                    <Truck className="h-4 w-4 mr-2" /> Mark Shipped
                  </>
                )}
              </Button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Line Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-background/70 backdrop-blur-xl rounded-2xl border border-border/40 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border/40 bg-background/20">
              <h2 className="font-bold text-text-primary flex items-center gap-2 uppercase tracking-tighter text-xs">
                <ShoppingBag className="h-4 w-4 text-text-tertiary" /> Items
                Summary
              </h2>
            </div>
            <div className="divide-y divide-gray-50">
              {order?.items?.map((item) => (
                <div
                  key={item.id}
                  className="p-6 flex gap-4 hover:bg-background/20 transition-colors"
                >
                  <div className="h-16 w-16 bg-background/30 rounded-xl flex-shrink-0 overflow-hidden border border-border/40">
                    {item.productVariant?.image && (
                      <img
                        src={item?.productVariant?.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="font-bold text-text-primary">
                      {item.productName}
                    </h3>
                    <p className="text-xs font-bold text-text-tertiary uppercase">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right flex flex-col justify-center">
                    <p className="font-black text-text-primary font-mono">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                    <p className="text-[10px] text-text-tertiary font-bold">
                      {formatCurrency(item.price)} / unit
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-background/30 p-6 border-t border-border/40">
              <div className="flex justify-between items-center bg-background/70 backdrop-blur-xl p-4 rounded-xl border border-border/40 shadow-sm">
                <span className="font-bold text-text-tertiary uppercase text-xs tracking-wider">
                  Total Amount
                </span>
                <span className="font-black text-2xl text-text-primary font-mono">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Information */}
        <div className="space-y-6">
          {/* Status & Payment Card */}
          <div className="bg-background/70 backdrop-blur-xl p-6 rounded-2xl border border-border/40 shadow-sm space-y-6">
            <h2 className="font-bold text-text-primary uppercase tracking-tighter text-xs border-b border-border/20 pb-3">
              Payment & Fulfillment
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center group">
                <span className="text-sm font-bold text-text-tertiary group-hover:text-text-secondary transition-colors">
                  Payment
                </span>
                <StatusChip status={order.paymentStatus} />
              </div>
              <div className="flex justify-between items-center group">
                <span className="text-sm font-bold text-text-tertiary group-hover:text-text-secondary transition-colors">
                  Fulfillment
                </span>
                <StatusChip status={order.fulfillmentStatus} />
              </div>
            </div>
          </div>

          {/* Prep Time Card */}
          <PrepTimeCard
            orderId={order.id}
            currentPrepTime={order.metadata?.prepTimeMinutes}
            onUpdate={fetchOrder}
          />

          {/* Customer Card */}
          <div className="bg-background/70 backdrop-blur-xl p-6 rounded-2xl border border-border/40 shadow-sm space-y-4">
            <h2 className="font-bold text-text-primary uppercase tracking-tighter text-xs flex items-center gap-2">
              <User className="h-4 w-4 text-text-tertiary" /> Customer
            </h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-success text-success-foreground flex items-center justify-center font-black text-lg">
                {order.customer?.firstName?.charAt(0)}
              </div>
              <div>
                <p className="font-black text-text-primary leading-tight">
                  {order.customer?.firstName} {order.customer?.lastName}
                </p>
                <p className="text-xs font-bold text-text-tertiary">
                  {order.customer?.email}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 rounded-xl bg-success hover:bg-success/90 text-success-foreground font-bold h-11">
                <MessageSquare className="w-4 h-4 mr-2" /> WhatsApp
              </Button>
            </div>
          </div>

          {/* Shipping Card */}
          <div className="bg-background/70 backdrop-blur-xl p-6 rounded-2xl border border-border/40 shadow-sm space-y-4">
            <h2 className="font-bold text-text-primary uppercase tracking-tighter text-xs flex items-center gap-2">
              <MapPin className="h-4 w-4 text-text-tertiary" /> Delivery
            </h2>
            {order.shippingAddress ? (
              <div className="text-sm font-medium text-text-secondary leading-relaxed bg-background/30 p-4 rounded-xl border border-border/40">
                {order?.shippingAddress?.street}
                <br />
                {order?.shippingAddress?.city}, {order?.shippingAddress?.state}
              </div>
            ) : (
              <p className="text-sm text-text-tertiary italic">
                No address provided
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
