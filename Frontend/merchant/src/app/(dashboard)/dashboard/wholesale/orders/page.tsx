/**
 * Wholesale - Orders Management Page
 * Track and manage B2B orders, fulfillment, and shipping
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Package, Search, Filter, Eye, Truck, CheckCircle } from "lucide-react";
import { useState } from "react";

interface WholesaleOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  companyName: string;
  items: number;
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  orderDate: string;
  expectedDelivery?: string;
}

export default function WholesaleOrdersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");

  const orders: WholesaleOrder[] = [
    { id: "1", orderNumber: "WO-2024-001", customerName: "John Smith", companyName: "ABC Retailers", items: 150, totalAmount: 6897.50, status: "processing", orderDate: "2024-01-15", expectedDelivery: "2024-01-22" },
    { id: "2", orderNumber: "WO-2024-002", customerName: "Sarah Johnson", companyName: "XYZ Distributors", items: 500, totalAmount: 11750.00, status: "shipped", orderDate: "2024-01-14", expectedDelivery: "2024-01-20" },
    { id: "3", orderNumber: "WO-2024-003", customerName: "Mike Brown", companyName: "Quick Supply Co", items: 75, totalAmount: 3421.25, status: "pending", orderDate: "2024-01-16" },
  ];

  const filteredOrders = activeTab === "all" ? orders : orders.filter(o => o.status === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/wholesale")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Orders Management</h1>
            <p className="text-muted-foreground">Track B2B orders and fulfillment</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/wholesale/products")}>
          <Package className="h-4 w-4 mr-2" />
          New Order
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="shipped">Shipped</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
        </TabsList>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-lg">{order.orderNumber}</span>
                      <Badge variant={order.status === "delivered" ? "default" : order.status === "cancelled" ? "destructive" : "secondary"}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Customer:</span>
                        <span className="ml-2 font-medium">{order.customerName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Company:</span>
                        <span className="ml-2 font-medium">{order.companyName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Items:</span>
                        <span className="ml-2 font-medium">{order.items} units</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total:</span>
                        <span className="ml-2 font-medium">${order.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Order Date: {order.orderDate}</span>
                      {order.expectedDelivery && <span>Expected Delivery: {order.expectedDelivery}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/wholesale/orders/${order.id}`)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {order.status === "processing" && (
                      <Button size="sm" onClick={() => router.push(`/dashboard/wholesale/orders/${order.id}/ship`)}>
                        <Truck className="h-4 w-4 mr-2" />
                        Ship
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
