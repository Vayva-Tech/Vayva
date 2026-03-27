/**
 * Grocery - Products Management Page
 * Manage product catalog, pricing, and promotions
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Plus, Filter, Tag } from "lucide-react";
import { useState } from "react";

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  salePrice?: number;
  stockLevel: number;
  status: "active" | "inactive" | "out-of-stock";
  hasPromotion: boolean;
}

export default function GroceryProductsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const products: Product[] = [
    { id: "1", sku: "GR-001", name: "Organic Bananas", category: "Produce", price: 0.99, salePrice: 0.79, stockLevel: 450, status: "active", hasPromotion: true },
    { id: "2", sku: "GR-002", name: "Whole Milk 1 Gallon", category: "Dairy", price: 4.49, stockLevel: 120, status: "active", hasPromotion: false },
    { id: "3", sku: "GR-003", name: "Sourdough Bread", category: "Bakery", price: 5.99, stockLevel: 45, status: "active", hasPromotion: false },
    { id: "4", sku: "GR-004", name: "Ground Beef 80/20", category: "Meat", price: 8.99, salePrice: 6.99, stockLevel: 85, status: "active", hasPromotion: true },
    { id: "5", sku: "GR-005", name: "Fresh Salmon Fillet", category: "Seafood", price: 12.99, stockLevel: 0, status: "out-of-stock", hasPromotion: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/grocery")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Products Catalog</h1>
            <p className="text-muted-foreground">Manage grocery items, pricing, and promotions</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button onClick={() => router.push("/dashboard/grocery/products/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products by name, SKU, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{product.category} • {product.sku}</p>
                </div>
                {product.hasPromotion && (
                  <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0">
                    <Tag className="h-3 w-3 mr-1" />
                    Sale
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${product.salePrice ? 'text-green-600' : ''}`}>
                  ${(product.salePrice || product.price).toFixed(2)}
                </span>
                {product.salePrice && (
                  <span className="text-sm line-through text-muted-foreground">${product.price.toFixed(2)}</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Stock Level</p>
                  <p className={`font-medium ${product.stockLevel === 0 ? 'text-red-600' : product.stockLevel < 50 ? 'text-orange-600' : 'text-green-600'}`}>
                    {product.stockLevel === 0 ? 'Out of Stock' : `${product.stockLevel} units`}
                  </p>
                </div>
                <Badge variant={product.status === "active" ? "default" : "secondary"}>
                  {product.status}
                </Badge>
              </div>
              <div className="flex gap-2 pt-3 border-t">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => router.push(`/dashboard/grocery/products/${product.id}`)}>
                  Edit
                </Button>
                <Button size="sm" className="flex-1" variant={product.hasPromotion ? "default" : "outline"}>
                  {product.hasPromotion ? 'Edit Promotion' : 'Add Promotion'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
