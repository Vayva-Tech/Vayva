/**
 * Grocery - Inventory Management Page
 * Track stock levels, expirations, and warehouse management
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, AlertTriangle, RefreshCcw } from "lucide-react";

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  minLevel: number;
  maxLevel: number;
  unit: string;
  location: string;
  lastRestocked: string;
}

export default function GroceryInventoryPage() {
  const router = useRouter();

  const inventory: InventoryItem[] = [
    { id: "1", sku: "GR-001", name: "Organic Bananas", category: "Produce", quantity: 450, minLevel: 200, maxLevel: 1000, unit: "lbs", location: "Cooler A-1", lastRestocked: "2024-01-15" },
    { id: "2", sku: "GR-002", name: "Whole Milk 1 Gallon", category: "Dairy", quantity: 120, minLevel: 100, maxLevel: 500, unit: "units", location: "Cooler B-3", lastRestocked: "2024-01-14" },
    { id: "3", sku: "GR-003", name: "Sourdough Bread", category: "Bakery", quantity: 45, minLevel: 50, maxLevel: 200, unit: "loaves", location: "Shelf C-2", lastRestocked: "2024-01-13" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/grocery")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Inventory Management</h1>
            <p className="text-muted-foreground">Track stock levels and warehouse organization</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/grocery/inventory/restock")}>
          <RefreshCcw className="h-4 w-4 mr-2" />
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
                <p className="text-sm text-muted-foreground">In Stock Value</p>
                <p className="text-2xl font-bold">$45,280</p>
              </div>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Items</p>
                <p className="text-2xl font-bold text-orange-600">{inventory.filter(i => i.quantity < i.minLevel).length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{inventory.filter(i => i.quantity === 0).length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Current Inventory Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="py-3 px-4 font-medium">SKU</th>
                  <th className="py-3 px-4 font-medium">Product Name</th>
                  <th className="py-3 px-4 font-medium">Category</th>
                  <th className="py-3 px-4 font-medium">Quantity</th>
                  <th className="py-3 px-4 font-medium">Min/Max</th>
                  <th className="py-3 px-4 font-medium">Location</th>
                  <th className="py-3 px-4 font-medium">Last Restocked</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-mono text-sm">{item.sku}</td>
                    <td className="py-3 px-4 font-medium">{item.name}</td>
                    <td className="py-3 px-4">{item.category}</td>
                    <td className="py-3 px-4">
                      <span className={item.quantity < item.minLevel ? 'text-orange-600 font-medium' : ''}>
                        {item.quantity} {item.unit}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {item.minLevel} / {item.maxLevel} {item.unit}
                    </td>
                    <td className="py-3 px-4"><Badge variant="outline">{item.location}</Badge></td>
                    <td className="py-3 px-4 text-sm">{item.lastRestocked}</td>
                    <td className="py-3 px-4">
                      {item.quantity === 0 ? (
                        <Badge variant="destructive">Out of Stock</Badge>
                      ) : item.quantity < item.minLevel ? (
                        <Badge variant="secondary"><AlertTriangle className="h-3 w-3 mr-1" /> Low Stock</Badge>
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
