"use client";

import { logger } from "@vayva/shared";
import React, { createContext, useContext, useEffect, useState } from "react";
import { KitchenOrder, KitchenMetrics, OrderStatus } from "@/types/kds";

interface KitchenContextType {
  orders: KitchenOrder[];
  metrics: KitchenMetrics;
  updateStatus: (id: string, status: OrderStatus) => void;
  refresh: () => void;
}

const KitchenContext = createContext<KitchenContextType | undefined>(undefined);

import { apiJson } from "@/lib/api-client-shared";

interface KitchenOrdersResponse {
  items: KitchenOrder[];
}

export function KitchenProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [metrics, _setMetrics] = useState<KitchenMetrics>({
    ordersToday: 0,
    ordersInQueue: 0,
    avgPrepTime: 0,
    throughput: 0,
  });

  useEffect(() => {
    // Note: Direct service calls from client will fail due to 'db' usage.
    // This context should ideally fetch from /api/kitchen/metrics
    const fetchMetrics = async () => {
      try {
        const data = await apiJson<KitchenOrdersResponse | KitchenOrder[]>(
          "/api/kitchen/orders",
        );
        const list = Array.isArray(data) ? data : data?.items;
        if (Array.isArray(list)) {
          setOrders(list);
        }
      } catch (_error: unknown) {
        const _errMsg =
          _error instanceof Error ? _error.message : String(_error);
        logger.error("[KITCHEN_METRICS_FETCH_ERROR]", {
          error: _errMsg,
          app: "merchant",
        });
      }
    };
    void fetchMetrics();
  }, []);

  const updateStatus = async (id: string, status: OrderStatus) => {
    try {
      await apiJson<{ success: boolean }>(`/api/kitchen/orders/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
    } catch (_error: unknown) {
      const _errMsg = _error instanceof Error ? _error.message : String(_error);
      logger.error("[KITCHEN_ORDER_STATUS_UPDATE_ERROR]", {
        error: _errMsg,
        orderId: id,
        status,
        app: "merchant",
      });
    }
  };

  const refresh = () => {
    // client-side refresh logic using fetch
  };

  return (
    <KitchenContext.Provider value={{ orders, metrics, updateStatus, refresh }}>
      {children}
    </KitchenContext.Provider>
  );
}

export const useKitchen = () => {
  const context = useContext(KitchenContext);
  if (!context)
    throw new Error("useKitchen must be used within KitchenProvider");
  return context;
};
