"use client";

import { logger } from "@vayva/shared";
import { useEffect, useState, useRef } from "react";
import { KitchenTicket } from "./KitchenTicket";
import { Button, Card, StatusChip } from "@vayva/ui";
import {
  Spinner as Loader2,
  ForkKnife as UtensilsCrossed,
} from "@phosphor-icons/react/ssr";

import { apiJson } from "@/lib/api-client-shared";

interface KitchenOrdersResponse {
  orders?: KitchenOrder[];
}

interface KitchenOrder {
  id: string;
  orderNumber: string;
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    notes?: string;
  }>;
  createdAt: string;
  fulfillmentStatus: string;
  customerNote?: string;
}

export function KitchenBoard() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchOrders = async () => {
    try {
      const data = await apiJson<KitchenOrder[] | KitchenOrdersResponse>(
        "/api/kitchen/orders",
      );
      // The API returns an array directly or { orders: [] }
      const orderList = Array.isArray(data) ? data : data.orders || [];
      setOrders(orderList);
      setError(null);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[FETCH_KITCHEN_ORDERS_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchOrders();

    // Poll every 15 seconds
    pollerRef.current = setInterval(() => void fetchOrders(), 15000); // 15s

    return () => {
      if (pollerRef.current) clearInterval(pollerRef.current);
    };
  }, []);

  const handleStatusChange = () => {
    fetchOrders(); // Identify immediate update
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 bg-red-500 border-2 border-dashed border-red-500/20 rounded-xl">
        <div className="p-4 bg-white rounded-full shadow-sm mb-4">
          <Loader2 size={48} className="text-red-500/30" />
        </div>
        <h2 className="text-xl font-semibold text-red-500">
          Oops! Something went wrong
        </h2>
        <p className="text-red-500/80 mt-2">{error}</p>
        <Button onClick={fetchOrders} className="mt-4" variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 bg-white/40 border-2 border-dashed border-gray-100 rounded-xl">
        <div className="p-4 bg-white rounded-full shadow-sm mb-4">
          <UtensilsCrossed size={48} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          All caught up!
        </h2>
        <p className="text-gray-400 mt-2">
          There are no active orders at the moment. Relax, Chef!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {orders.map((order) => (
        <KitchenTicket
          key={order.id}
          order={order}
          onStatusChange={handleStatusChange}
        />
      ))}
    </div>
  );
}
