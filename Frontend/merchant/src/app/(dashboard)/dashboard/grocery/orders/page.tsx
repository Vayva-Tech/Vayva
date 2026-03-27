/**
 * Grocery - Orders Management Page
 * Manage customer orders, pickups, and deliveries
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ShoppingBag, Search } from "lucide-react";
import { useState } from "react";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  items: number;
  totalAmount: number;
  status: "pending" | "processing" | "ready" | "completed" | "cancelled";
  fulfillmentType: "pickup" | "delivery";
  scheduledTime?: string;
  orderDate: string;
}

export default function GroceryOrdersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");

  const orders: Order[] = [
    { id: "1", orderNumber: "GO-2024-001", customerName: "John Smith", items: 12, totalAmount: 87.45, status: "ready", fulfillmentType: "pickup", scheduledTime: "2024-01-16 14:00", orderDate: "2024-01-15" },
    { id: "2", orderNumber: "GO-2024-002", customerName: "Sarah Johnson", items: 24, totalAmount: 156.30, status: "processing", fulfillmentType: "delivery", scheduledTime: "2024-01-16 16:00", orderDate: "2024-01-15" },
    { id: "3", orderNumber: "GO-2024-003", customerName: "Mike Brown", items: 8, totalAmount: 42.99, status: "pending", fulfillmentType: "pickup", orderDate: "2024-01-16" },
  ];

  const filteredOrders = activeTab === "all" ? orders : orders.filter(o => o.status === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/grocery")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Orders Management</h1>
            <p className="text-muted-foreground">Track and fulfill customer orders</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/grocery/orders/new")}>
          <ShoppingBag className="h-4 w-4 mr-2" />
          New Order
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="ready">Ready</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-lg">{order.orderNumber}</span>
                      <Badge variant={order.status === "completed" ? "default" : order.status === "cancelled" ? "destructive" : "secondary"}>
                        {order.status}
                      </Badge>
                      <Badge variant="outline">{order.fulfillmentType}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Customer:</span>
                        <span className="ml-2 font-medium">{order.customerName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Items:</span>
                        <span className="ml-2 font-medium">{order.items}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total:</span>
                        <span className="ml-2 font-medium">${order.totalAmount.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Order Date:</span>
                        <span className="ml-2 font-medium">{order.orderDate}</span>
                      </div>
                    </div>
                    {order.scheduledTime && (
                      <p className="text-xs text-muted-foreground mt-2">Scheduled: {order.scheduledTime}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/grocery/orders/${order.id}`)}>
                      View
                    </Button>
                    {order.status === "ready" && (
                      <Button size="sm" onClick={() => router.push(`/dashboard/grocery/orders/${order.id}/complete`)}>
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
