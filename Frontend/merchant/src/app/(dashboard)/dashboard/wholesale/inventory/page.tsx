/**
 * Wholesale - Inventory Management Page
 * Track warehouse stock, bulk inventory, and reorder points
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, AlertTriangle, TrendingUp } from "lucide-react";

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  reorderPoint: number;
  warehouseLocation: string;
  lastRestocked: string;
}

export default function WholesaleInventoryPage() {
  const router = useRouter();

  const inventory: InventoryItem[] = [
    { id: "1", sku: "WS-001", name: "Industrial Widget A1", quantity: 5000, reservedQuantity: 500, availableQuantity: 4500, reorderPoint: 1000, warehouseLocation: "A-12-3", lastRestocked: "2024-01-10" },
    { id: "2", sku: "WS-002", name: "Premium Fastener Set", quantity: 12000, reservedQuantity: 1200, availableQuantity: 10800, reorderPoint: 2000, warehouseLocation: "B-08-1", lastRestocked: "2024-01-12" },
    { id: "3", sku: "WS-003", name: "Steel Bracket XL", quantity: 800, reservedQuantity: 200, availableQuantity: 600, reorderPoint: 1000, warehouseLocation: "C-15-2", lastRestocked: "2023-12-20" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/wholesale")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Inventory Management</h1>
            <p className="text-muted-foreground">Track warehouse stock and reorder levels</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/wholesale/inventory/restock")}>
          <TrendingUp className="h-4 w-4 mr-2" />
          Restock
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total SKUs</p>
                <p className="text-2xl font-bold">{inventory.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">$284,500</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Items</p>
                <p className="text-2xl font-bold text-orange-600">{inventory.filter(i => i.availableQuantity <= i.reorderPoint).length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reserved</p>
                <p className="text-2xl font-bold">{inventory.reduce((sum, i) => sum + i.reservedQuantity, 0).toLocaleString()}</p>
              </div>
              <Package className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Warehouse Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b" scope="col">
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="py-3 px-4 font-medium" scope="col">SKU</th>
                  <th className="py-3 px-4 font-medium" scope="col">Product Name</th>
                  <th className="py-3 px-4 font-medium" scope="col">Available</th>
                  <th className="py-3 px-4 font-medium" scope="col">Reserved</th>
                  <th className="py-3 px-4 font-medium" scope="col">Total</th>
                  <th className="py-3 px-4 font-medium" scope="col">Reorder Point</th>
                  <th className="py-3 px-4 font-medium" scope="col">Location</th>
                  <th className="py-3 px-4 font-medium" scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-mono text-sm">{item.sku}</td>
                    <td className="py-3 px-4 font-medium">{item.name}</td>
                    <td className="py-3 px-4">
                      <span className={item.availableQuantity <= item.reorderPoint ? "text-red-600 font-medium" : ""}>
                        {item.availableQuantity.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">{item.reservedQuantity.toLocaleString()}</td>
                    <td className="py-3 px-4">{item.quantity.toLocaleString()}</td>
                    <td className="py-3 px-4">{item.reorderPoint.toLocaleString()}</td>
                    <td className="py-3 px-4"><Badge variant="outline">{item.warehouseLocation}</Badge></td>
                    <td className="py-3 px-4">
                      {item.availableQuantity <= item.reorderPoint ? (
                        <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" /> Low Stock</Badge>
                      ) : (
                        <Badge variant="default">In Stock</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
