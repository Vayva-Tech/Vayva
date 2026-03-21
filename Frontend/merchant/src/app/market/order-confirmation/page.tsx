// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MarketShell } from "@/components/market/market-shell";
import { Icon, Button, Badge } from "@vayva/ui";
import { apiJson } from "@/lib/api-client-shared";
import { toast } from "sonner";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
  };
  items: {
    product: { name: string; images: string[] };
    quantity: number;
    price: number;
  }[];
  createdAt: string;
}

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) void fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const data = await apiJson<Order>(`/api/market/orders/${orderId}`);
      setOrder(data);
    } catch {
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MarketShell>
        <div className="max-w-2xl mx-auto py-16 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-16 w-16 bg-gray-100 rounded-full mx-auto" />
            <div className="h-8 bg-gray-100 rounded w-1/2 mx-auto" />
          </div>
        </div>
      </MarketShell>
    );
  }

  if (!order) {
    return (
      <MarketShell>
        <div className="text-center py-16">
          <Icon name="AlertCircle" size={48} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Order not found</h1>
          <Link href="/market/orders">
            <Button>View My Orders</Button>
          </Link>
        </div>
      </MarketShell>
    );
  }

  return (
    <MarketShell>
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Icon name="CheckCircle2" size={40} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-gray-500">
            Thank you for your purchase. Your order has been received.
          </p>
        </div>

        {/* Order Details */}
        <div className="border rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Order Number</p>
              <p className="font-semibold">#{order.orderNumber}</p>
            </div>
            <Badge variant={order.paymentStatus === "paid" ? "default" : "outline"}>
              {order.paymentStatus}
            </Badge>
          </div>

          <div className="border-t pt-4 space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                  {item.product.images[0] && (
                    <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="font-medium">₦{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>

          <div className="border-t mt-4 pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₦{order.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg">
              <span>Total Paid</span>
              <span>₦{order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Shipping Info */}
        <div className="border rounded-lg p-6 mb-6">
          <h2 className="font-semibold mb-3">Shipping Address</h2>
          <p className="font-medium">{order.shippingAddress.fullName}</p>
          <p className="text-gray-500">{order.shippingAddress.street}</p>
          <p className="text-gray-500">{order.shippingAddress.city}, {order.shippingAddress.state}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link href="/market/orders" className="flex-1">
            <Button className="w-full">View Order Status</Button>
          </Link>
          <Link href="/market" className="flex-1">
            <Button variant="outline" className="w-full">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </MarketShell>
  );
}
