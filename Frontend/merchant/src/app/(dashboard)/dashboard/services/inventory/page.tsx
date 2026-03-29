/**
 * Services Industry - Inventory Management Page
 * Manage service inventory, supplies, and materials
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Package, Search, Plus, AlertTriangle, TrendingUp } from "lucide-react";
import { useState } from "react";

interface InventoryItem {
  id: string;
  name: string;
  category: "supplies" | "materials" | "equipment" | "tools" | "consumables";
  quantity: number;
  minLevel: number;
  unit: string;
  cost: number;
  supplier: string;
  lastRestocked: string;
  status: "in-stock" | "low" | "out";
}

export default function ServicesInventoryPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const inventory: InventoryItem[] = [
    { id: "1", name: "Office Supplies Pack", category: "supplies", quantity: 45, minLevel: 20, unit: "boxes", cost: 89.99, supplier: "Office Depot", lastRestocked: "2024-01-10", status: "in-stock" },
    { id: "2", name: "Marketing Materials", category: "materials", quantity: 12, minLevel: 15, unit: "sets", cost: 245.00, supplier: "Vistaprint", lastRestocked: "2024-01-05", status: "low" },
    { id: "3", name: "Presentation Equipment", category: "equipment", quantity: 8, minLevel: 5, unit: "units", cost: 1250.00, supplier: "B&H Photo", lastRestocked: "2024-01-12", status: "in-stock" },
    { id: "4", name: "Cleaning Supplies", category: "consumables", quantity: 5, minLevel: 10, unit: "kits", cost: 67.50, supplier: "Uline", lastRestocked: "2023-12-28", status: "low" },
    { id: "5", name: "Professional Tools Set", category: "tools", quantity: 15, minLevel: 8, unit: "sets", cost: 450.00, supplier: "Home Depot", lastRestocked: "2024-01-08", status: "in-stock" },
    { id: "6", name: "Paper Products", category: "consumables", quantity: 3, minLevel: 25, unit: "cases", cost: 125.00, supplier: "Staples", lastRestocked: "2023-12-20", status: "out" },
    { id: "7", name: "Tech Accessories", category: "equipment", quantity: 22, minLevel: 12, unit: "items", cost: 189.99, supplier: "Amazon Business", lastRestocked: "2024-01-11", status: "in-stock" },
    { id: "8", name: "Safety Equipment", category: "supplies", quantity: 18, minLevel: 10, unit: "kits", cost: 299.00, supplier: "Grainger", lastRestocked: "2024-01-09", status: "in-stock" },
  ];

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalItems: inventory.length,
    inStock: inventory.filter(i => i.status === "in-stock").length,
    lowStock: inventory.filter(i => i.status === "low").length,
    outOfStock: inventory.filter(i => i.status === "out").length,
    totalValue: inventory.reduce((sum, item) => sum + (item.cost * item.quantity), 0),
    restockNeeded: inventory.filter(i => i.status === "low" || i.status === "out").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard/services")} className="h-10 w-10 p-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Inventory Management
              </h1>
              <p className="text-muted-foreground mt-1">Track supplies, materials, and equipment</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Items</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalItems}</div>
              <p className="text-xs text-muted-foreground mt-1">Across all categories</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">In Stock</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.inStock}</div>
              <p className="text-xs text-muted-foreground mt-1">Items at optimal levels</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.lowStock}</div>
              <p className="text-xs text-muted-foreground mt-1">Need restocking soon</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Out of Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
              <p className="text-xs text-muted-foreground mt-1">Immediate action needed</p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Inventory Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${stats.totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Based on current stock</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Items to Restock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.restockNeeded}</div>
              <p className="text-xs text-muted-foreground mt-1">Low or out of stock</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Stock Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{((stats.inStock / stats.totalItems) * 100).toFixed(0)}%</div>
              <p className="text-xs text-muted-foreground mt-1">Items at optimal levels</p>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory by name, category, or supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Inventory Items ({filteredInventory.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead scope="col">
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Item Name</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Category</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Quantity</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Unit Cost</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Total Value</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Supplier</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Last Restocked</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Status</th>
                    <th className="text-left py-3 px-4 font-semibold" scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-medium">{item.name}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="capitalize">
                          {item.category}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span>{item.quantity} {item.unit}</span>
                          {item.status === "low" && <AlertTriangle className="h-3 w-3 text-yellow-600" />}
                          {item.status === "out" && <AlertTriangle className="h-3 w-3 text-red-600" />}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono">${item.cost.toFixed(2)}</td>
                      <td className="py-3 px-4 font-mono font-medium text-green-600">
                        ${(item.cost * item.quantity).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm">{item.supplier}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{item.lastRestocked}</td>
                      <td className="py-3 px-4">
                        <Badge variant={item.status === "in-stock" ? "default" : item.status === "low" ? "secondary" : "destructive"}>
                          {item.status.replace("-", " ")}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/services/inventory/${item.id}`)}>
                            View
                          </Button>
                          {item.status !== "in-stock" && (
                            <Button variant="outline" size="sm" className="text-blue-600">
                              Restock
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
