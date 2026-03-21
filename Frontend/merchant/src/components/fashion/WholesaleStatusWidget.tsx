"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, ArrowRight, Package } from "lucide-react";

interface WholesaleOrder {
  id: string;
  buyer: {
    companyName: string;
    contactName: string;
  };
  total: number;
  status: string;
  items: Array<{
    quantity: number;
    product: {
      title: string;
    };
  }>;
  createdAt: string;
}

export const WholesaleStatusWidget: React.FC = () => {
  const { data: orders, isLoading } = useQuery<WholesaleOrder[]>({
    queryKey: ['wholesale-orders-pending'],
    queryFn: async () => {
      const res = await fetch('/api/fashion/wholesale/orders');
      const data = await res.json();
      return data.orders;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>B2B Orders Pending</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingCount = orders?.length || 0;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Users className="w-4 h-4" />
          B2B Orders Pending
        </CardTitle>
        {pendingCount > 0 && (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            {pendingCount} pending
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {orders && orders.length > 0 ? (
          <div className="space-y-3">
            {orders.slice(0, 3).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{order.buyer.companyName}</p>
                    <p className="text-xs text-gray-500">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)} items · ₦
                      {order.total.toLocaleString()}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="ghost">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {orders.length > 3 && (
              <Button variant="outline" className="w-full text-sm">
                View all {orders.length} orders
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No pending B2B orders</p>
            <p className="text-xs">Wholesale orders will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
