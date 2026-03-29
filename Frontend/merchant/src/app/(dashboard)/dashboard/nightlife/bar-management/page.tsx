/**
 * Nightlife - Bar Management Page
 * Manage bar inventory, stock levels, and supplier orders
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Wine, Search, AlertTriangle, Package } from "lucide-react";
import { useState } from "react";

interface BarStock {
  id: string;
  name: string;
  category: "spirit" | "liqueur" | "mixer" | "garnish" | "beer" | "wine";
  quantity: number;
  unit: string;
  minLevel: number;
  cost: number;
  supplier: string;
  status: "in-stock" | "low" | "out";
}

export default function NightlifeBarManagementPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const barStock: BarStock[] = [
    { id: "1", name: "Grey Goose Vodka", category: "spirit", quantity: 8, unit: "bottles", minLevel: 5, cost: 32, supplier: "Premium Spirits Co", status: "in-stock" },
    { id: "2", name: "Johnnie Walker Black", category: "spirit", quantity: 3, unit: "bottles", minLevel: 4, cost: 28, supplier: "Premium Spirits Co", status: "low" },
    { id: "3", name: "Triple Sec", category: "liqueur", quantity: 6, unit: "bottles", minLevel: 4, cost: 18, supplier: "Bar Essentials", status: "in-stock" },
    { id: "4", name: "Fresh Limes", category: "garnish", quantity: 15, unit: "lbs", minLevel: 20, cost: 3, supplier: "Fresh Produce Inc", status: "low" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/nightlife")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Bar Management</h1>
            <p className="text-muted-foreground">Manage bar inventory and stock</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/nightlife/bar-management/order")}>
          <Package className="h-4 w-4 mr-2" />
          Create Order
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search bar inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{barStock.length}</p>
              </div>
              <Wine className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Stock</p>
                <p className="text-2xl font-bold">{barStock.filter(s => s.status === "in-stock").length}</p>
              </div>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold">{barStock.filter(s => s.status === "low").length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inventory Value</p>
                <p className="text-2xl font-bold">${barStock.reduce((acc, item) => acc + (item.quantity * item.cost), 0).toLocaleString()}</p>
              </div>
              <Wine className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b" scope="col">
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="py-3 px-4 font-medium" scope="col">Item Name</th>
                  <th className="py-3 px-4 font-medium" scope="col">Category</th>
                  <th className="py-3 px-4 font-medium" scope="col">Quantity</th>
                  <th className="py-3 px-4 font-medium" scope="col">Min Level</th>
                  <th className="py-3 px-4 font-medium" scope="col">Cost/Unit</th>
                  <th className="py-3 px-4 font-medium" scope="col">Supplier</th>
                  <th className="py-3 px-4 font-medium" scope="col">Status</th>
                  <th className="py-3 px-4 font-medium" scope="col"></th>
                </tr>
              </thead>
              <tbody>
                {barStock.map((stock) => (
                  <tr key={stock.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-semibold">{stock.name}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="capitalize">{stock.category}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{stock.quantity}</span>
                        <span className="text-sm text-muted-foreground">{stock.unit}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{stock.minLevel} {stock.unit}</td>
                    <td className="py-3 px-4 font-bold">${stock.cost.toFixed(2)}</td>
                    <td className="py-3 px-4 text-sm">{stock.supplier}</td>
                    <td className="py-3 px-4">
                      <Badge variant={stock.status === "in-stock" ? "default" : stock.status === "low" ? "secondary" : "outline"}>
                        {stock.status === "low" && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {stock.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/nightlife/bar-management/${stock.id}`)}>
                        Edit
                      </Button>
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
