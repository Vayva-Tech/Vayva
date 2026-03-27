/**
 * Grocery - Deliveries Management Page
 * Track supplier deliveries and receiving
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Truck, Search } from "lucide-react";

interface Delivery {
  id: string;
  deliveryNumber: string;
  supplierName: string;
  status: "scheduled" | "in-transit" | "arrived" | "received" | "cancelled";
  scheduledDate: string;
  estimatedTime?: string;
  items: number;
  poNumber: string;
}

export default function GroceryDeliveriesPage() {
  const router = useRouter();

  const deliveries: Delivery[] = [
    { id: "1", deliveryNumber: "DEL-2024-001", supplierName: "Fresh Farms Inc.", status: "in-transit", scheduledDate: "2024-01-16", estimatedTime: "10:00 AM - 12:00 PM", items: 45, poNumber: "PO-2024-015" },
    { id: "2", deliveryNumber: "DEL-2024-002", supplierName: "Dairy Delights Co.", status: "scheduled", scheduledDate: "2024-01-16", estimatedTime: "2:00 PM - 4:00 PM", items: 28, poNumber: "PO-2024-016" },
    { id: "3", deliveryNumber: "DEL-2024-003", supplierName: "Premium Meats LLC", status: "arrived", scheduledDate: "2024-01-16", items: 32, poNumber: "PO-2024-014" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/grocery")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Deliveries</h1>
            <p className="text-muted-foreground">Track supplier deliveries and receiving</p>
          </div>
        </div>
        <Button variant="outline">
          <Search className="h-4 w-4 mr-2" />
          Track Delivery
        </Button>
      </div>

      <div className="space-y-4">
        {deliveries.map((delivery) => (
          <Card key={delivery.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Truck className={`h-5 w-5 ${delivery.status === "in-transit" ? 'text-blue-600' : delivery.status === "arrived" ? 'text-green-600' : 'text-muted-foreground'}`} />
                    <span className="font-semibold text-lg">{delivery.deliveryNumber}</span>
                    <Badge variant={delivery.status === "received" ? "default" : delivery.status === "cancelled" ? "destructive" : "secondary"}>
                      {delivery.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Supplier:</span>
                      <span className="ml-2 font-medium">{delivery.supplierName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Scheduled:</span>
                      <span className="ml-2 font-medium">{delivery.scheduledDate}</span>
                    </div>
                    {delivery.estimatedTime && (
                      <div>
                        <span className="text-muted-foreground">Time Window:</span>
                        <span className="ml-2 font-medium">{delivery.estimatedTime}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Items:</span>
                      <span className="ml-2 font-medium">{delivery.items}</span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    PO Reference: {delivery.poNumber}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/grocery/deliveries/${delivery.id}`)}>
                    View
                  </Button>
                  {delivery.status === "arrived" && (
                    <Button size="sm" onClick={() => router.push(`/dashboard/grocery/deliveries/${delivery.id}/receive`)}>
                      Receive
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
