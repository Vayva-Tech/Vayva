/**
 * Wholesale - Purchase Orders Page
 * Manage supplier purchase orders and restocking
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FilePlus, Search } from "lucide-react";

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierName: string;
  totalAmount: number;
  status: "draft" | "pending" | "approved" | "received" | "cancelled";
  orderDate: string;
  expectedDelivery: string;
}

export default function WholesalePurchaseOrdersPage() {
  const router = useRouter();

  const pos: PurchaseOrder[] = [
    { id: "1", poNumber: "PO-2024-001", supplierName: "Global Manufacturing Inc", totalAmount: 45000.00, status: "pending", orderDate: "2024-01-12", expectedDelivery: "2024-01-26" },
    { id: "2", poNumber: "PO-2024-002", supplierName: "Premium Supplies Ltd", totalAmount: 28500.00, status: "approved", orderDate: "2024-01-10", expectedDelivery: "2024-01-24" },
    { id: "3", poNumber: "PO-2024-003", supplierName: "Industrial Parts Co", totalAmount: 15750.00, status: "received", orderDate: "2024-01-05", expectedDelivery: "2024-01-19" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/wholesale")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Purchase Orders</h1>
            <p className="text-muted-foreground">Manage supplier orders and restocking</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/wholesale/purchase-orders/new")}>
          <FilePlus className="h-4 w-4 mr-2" />
          Create PO
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pos.map((po) => (
              <div key={po.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-lg">{po.poNumber}</span>
                    <Badge variant={po.status === "received" ? "default" : po.status === "cancelled" ? "destructive" : "secondary"}>
                      {po.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Supplier:</span>
                      <span className="ml-2 font-medium">{po.supplierName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="ml-2 font-medium">${po.totalAmount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Order Date:</span>
                      <span className="ml-2 font-medium">{po.orderDate}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Expected:</span>
                      <span className="ml-2 font-medium">{po.expectedDelivery}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/wholesale/purchase-orders/${po.id}`)}>
                    View
                  </Button>
                  {po.status === "pending" && (
                    <Button size="sm">Approve</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
