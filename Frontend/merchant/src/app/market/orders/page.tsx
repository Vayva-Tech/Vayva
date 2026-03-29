"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MarketShell } from "@/components/market/market-shell";
import { Icon, Button, Badge } from "@vayva/ui";
import { apiJson } from "@/lib/api-client-shared";
import { toast } from "sonner";

interface MarketOrder {
  id: string;
  orderNumber: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  total: number;
  itemCount: number;
  createdAt: string;
  items: {
    product: { name: string; images: string[] };
    quantity: number;
    price: number;
  }[];
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function MarketOrdersPage() {
  const [orders, setOrders] = useState<MarketOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    void fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await apiJson<MarketOrder[]>("/market/orders");
      setOrders(data || []);
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = filter ? orders.filter(o => o.status === filter) : orders;

  return (
    <MarketShell>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Orders</h1>
          <Link href="/market">
            <Button variant="outline">Continue Shopping</Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button
            onClick={() => setFilter(null)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${!filter ? "bg-green-500 text-white" : "bg-gray-100"}`}
          >
            All Orders
          </Button>
          {["pending", "processing", "shipped", "delivered"].map((s) => (
            <Button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap capitalize ${filter === s ? "bg-green-500 text-white" : "bg-gray-100"}`}
            >
              {s}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-100 animate-pulse rounded-lg h-32" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <Icon name="Package" size={48} className="text-gray-500 mx-auto mb-4" />
            <h2 className="text-lg font-medium mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-4">Start shopping to see your orders here</p>
            <Link href="/market">
              <Button>Browse Marketplace</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium">Order #{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[order.status]}>{order.status}</Badge>
                    <Badge variant={order.paymentStatus === "paid" ? "default" : "outline"}>
                      {order.paymentStatus}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex gap-3 mb-3">
                  {order.items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                      {item.product.images[0] && (
                        <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-sm">
                      +{order.items.length - 3}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <p className="text-sm text-gray-500">{order.itemCount} items</p>
                  <div className="flex items-center gap-4">
                    <p className="font-semibold">₦{order.total.toLocaleString()}</p>
                    <Link href={`/market/orders/${order.id}`}>
                      <Button size="sm" variant="outline">View Details</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MarketShell>
  );
}
