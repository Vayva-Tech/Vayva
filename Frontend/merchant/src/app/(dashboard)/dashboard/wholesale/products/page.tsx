/**
 * Wholesale - Products Management Page
 * Manage B2B product catalog, bulk pricing, and inventory
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, Search, Plus, Filter, MoreVertical } from "lucide-react";
import { useState } from "react";

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  basePrice: number;
  moq: number; // Minimum Order Quantity
  stockLevel: number;
  status: "active" | "inactive" | "discontinued";
}

export default function WholesaleProductsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - replace with actual API calls
  const products: Product[] = [
    { id: "1", sku: "WS-001", name: "Industrial Widget A1", category: "Components", basePrice: 45.99, moq: 100, stockLevel: 5000, status: "active" },
    { id: "2", sku: "WS-002", name: "Premium Fastener Set", category: "Hardware", basePrice: 23.50, moq: 500, stockLevel: 12000, status: "active" },
    { id: "3", sku: "WS-003", name: "Steel Bracket XL", category: "Components", basePrice: 12.75, moq: 200, stockLevel: 3500, status: "active" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/wholesale")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Products Catalog</h1>
            <p className="text-muted-foreground">Manage B2B products, pricing tiers, and MOQ</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by product name, SKU, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Products ({products.length})</CardTitle>
          <CardDescription>B2B product catalog with bulk pricing tiers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b" scope="col">
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="py-3 px-4 font-medium" scope="col">SKU</th>
                  <th className="py-3 px-4 font-medium" scope="col">Product Name</th>
                  <th className="py-3 px-4 font-medium" scope="col">Category</th>
                  <th className="py-3 px-4 font-medium" scope="col">Base Price</th>
                  <th className="py-3 px-4 font-medium" scope="col">MOQ</th>
                  <th className="py-3 px-4 font-medium" scope="col">Stock Level</th>
                  <th className="py-3 px-4 font-medium" scope="col">Status</th>
                  <th className="py-3 px-4 font-medium" scope="col"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-mono text-sm">{product.sku}</td>
                    <td className="py-3 px-4 font-medium">{product.name}</td>
                    <td className="py-3 px-4">{product.category}</td>
                    <td className="py-3 px-4">${product.basePrice.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{product.moq} units</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${product.stockLevel > 1000 ? 'bg-green-500' : product.stockLevel > 500 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(product.stockLevel / 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm">{product.stockLevel.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={product.status === "active" ? "default" : "secondary"}>
                        {product.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
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
