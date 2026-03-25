"use client";

import React, { useState, useEffect } from "react";
import { Card, Button } from "@vayva/ui";
import { toast } from "sonner";
import { Wine, Warning as AlertTriangle, Clock } from "@phosphor-icons/react";
import type { BottleOrder } from "@/types/nightlife";
import { apiJson } from "@/lib/api-client-shared";

export function BottleService() {
  const [orders, setOrders] = useState<BottleOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const venueId = "venue_123";
      const data = await apiJson<{
        activeOrders: BottleOrder[];
      }>(`/api/nightlife/bottle-service/orders?venueId=${venueId}&status=active`);
      
      if (data?.activeOrders) {
        setOrders(data.activeOrders.slice(0, 5));
      }
    } catch (error: unknown) {
      console.error("[LOAD_BOTTLE_ORDERS_ERROR]", error);
      toast.error("Failed to load bottle service orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400';
      case 'preparing': return 'text-blue-400';
      case 'delivered': return 'text-green-400';
      default: return 'text-gray-500';
    }
  };

  return (
    <Card className="p-6 bg-[#252525] border-[#333333]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg text-gray-900">Bottle Service</h3>
          <p className="text-sm text-gray-500">Active Orders: {orders.length}</p>
        </div>
        <Button variant="outline" size="sm">New Order</Button>
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <div
            key={order.id}
            className="p-3 bg-[#1A1A1A] rounded-lg border border-[#333333]"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wine size={18} className="text-cyan-400" />
                <div>
                  <div className="font-medium text-gray-900">
                    {order.items[0]?.bottle.name} x{order.items[0]?.quantity}
                  </div>
                  <div className="text-xs text-gray-500">
                    Table {order.tableName} • ₦{order.totalAmount.toLocaleString()}
                  </div>
                </div>
              </div>
              <span className={`text-xs font-medium ${getStatusColor(order.status)}`}>
                {order.status.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" disabled={order.status === 'delivered'}>
                Add Mixer
              </Button>
              {order.status !== 'delivered' && (
                <Button size="sm">Complete</Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-[#333333]">
        <div className="flex items-center gap-2 text-xs text-yellow-400 mb-2">
          <AlertTriangle size={14} />
          <span>Low Inventory: Ace of Spades (3 left)</span>
        </div>
        <Button variant="outline" size="sm" className="w-full">
          View Inventory
        </Button>
      </div>
    </Card>
  );
}
