/**
 * Grocery - Expiration Tracking Page
 * Monitor product expiry dates and reduce waste
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, AlertTriangle, Calendar, Clock } from "lucide-react";

interface ExpiringProduct {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expirationDate: string;
  daysUntilExpiry: number;
  location: string;
  costValue: number;
}

export default function GroceryExpirationPage() {
  const router = useRouter();

  const products: ExpiringProduct[] = [
    { id: "1", sku: "GR-015", name: "Organic Milk 2%", category: "Dairy", quantity: 24, unit: "units", expirationDate: "2024-01-18", daysUntilExpiry: 2, location: "Cooler B-2", costValue: 95.76 },
    { id: "2", sku: "GR-023", name: "Fresh Strawberries", category: "Produce", quantity: 15, unit: "containers", expirationDate: "2024-01-17", daysUntilExpiry: 1, location: "Cooler A-3", costValue: 67.35 },
    { id: "3", sku: "GR-031", name: "Ground Turkey", category: "Meat", quantity: 18, unit: "lbs", expirationDate: "2024-01-19", daysUntilExpiry: 3, location: "Freezer C-1", costValue: 89.82 },
    { id: "4", sku: "GR-042", name: "Yogurt Greek Plain", category: "Dairy", quantity: 36, unit: "cups", expirationDate: "2024-01-20", daysUntilExpiry: 4, location: "Cooler B-4", costValue: 71.64 },
  ];

  const getUrgencyColor = (days: number) => {
    if (days <= 1) return "text-red-600 bg-red-50 border-red-200";
    if (days <= 3) return "text-orange-600 bg-orange-50 border-orange-200";
    if (days <= 7) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-green-600 bg-green-50 border-green-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/grocery")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Expiration Tracking</h1>
            <p className="text-muted-foreground">Monitor expiry dates and reduce waste</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/grocery/expirations/mark-down")}>
          <Calendar className="h-4 w-4 mr-2" />
          Mark Down Items
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expiring Today</p>
                <p className="text-2xl font-bold text-red-600">{products.filter(p => p.daysUntilExpiry === 0).length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expiring This Week</p>
                <p className="text-2xl font-bold text-orange-600">{products.filter(p => p.daysUntilExpiry <= 7).length}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">At Risk Value</p>
                <p className="text-2xl font-bold">$324.57</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Waste Reduction</p>
                <p className="text-2xl font-bold text-green-600">-18%</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Products Expiring Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b" scope="col">
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="py-3 px-4 font-medium" scope="col">SKU</th>
                  <th className="py-3 px-4 font-medium" scope="col">Product Name</th>
                  <th className="py-3 px-4 font-medium" scope="col">Category</th>
                  <th className="py-3 px-4 font-medium" scope="col">Quantity</th>
                  <th className="py-3 px-4 font-medium" scope="col">Expiration Date</th>
                  <th className="py-3 px-4 font-medium" scope="col">Days Left</th>
                  <th className="py-3 px-4 font-medium" scope="col">Location</th>
                  <th className="py-3 px-4 font-medium" scope="col">Value</th>
                  <th className="py-3 px-4 font-medium" scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className={`border-b ${getUrgencyColor(product.daysUntilExpiry)} hover:opacity-80`}>
                    <td className="py-3 px-4 font-mono text-sm">{product.sku}</td>
                    <td className="py-3 px-4 font-medium">{product.name}</td>
                    <td className="py-3 px-4">{product.category}</td>
                    <td className="py-3 px-4">{product.quantity} {product.unit}</td>
                    <td className="py-3 px-4 font-medium">{product.expirationDate}</td>
                    <td className="py-3 px-4">
                      <Badge variant={product.daysUntilExpiry <= 1 ? "destructive" : product.daysUntilExpiry <= 3 ? "secondary" : "outline"}>
                        {product.daysUntilExpiry} days
                      </Badge>
                    </td>
                    <td className="py-3 px-4"><Badge variant="outline">{product.location}</Badge></td>
                    <td className="py-3 px-4 font-medium">${product.costValue.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => router.push(`/dashboard/grocery/expiration/${product.id}`)}
                      >
                        Take Action
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
