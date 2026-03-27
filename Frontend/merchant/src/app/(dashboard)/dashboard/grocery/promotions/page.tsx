/**
 * Grocery - Promotions Management Page
 * Create and track sales, discounts, and marketing campaigns
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Tag, Plus, TrendingUp } from "lucide-react";

interface Promotion {
  id: string;
  name: string;
  type: "percentage" | "fixed" | "bogo" | "bundle";
  discountValue: number;
  productsCount: number;
  startDate: string;
  endDate: string;
  status: "active" | "scheduled" | "expired";
  revenueImpact: number;
}

export default function GroceryPromotionsPage() {
  const router = useRouter();

  const promotions: Promotion[] = [
    { id: "1", name: "Weekend Produce Sale", type: "percentage", discountValue: 20, productsCount: 15, startDate: "2024-01-13", endDate: "2024-01-15", status: "active", revenueImpact: 2450 },
    { id: "2", name: "Buy 1 Get 1 Free - Dairy", type: "bogo", discountValue: 50, productsCount: 8, startDate: "2024-01-10", endDate: "2024-01-20", status: "active", revenueImpact: 1875 },
    { id: "3", name: "$5 Off $50 Purchase", type: "fixed", discountValue: 5, productsCount: 120, startDate: "2024-01-15", endDate: "2024-01-22", status: "scheduled", revenueImpact: 0 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/grocery")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Promotions & Deals</h1>
            <p className="text-muted-foreground">Manage sales, discounts, and marketing campaigns</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/grocery/promotions/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Promotion
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Promotions</p>
                <p className="text-2xl font-bold">{promotions.filter(p => p.status === "active").length}</p>
              </div>
              <Tag className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue Impact</p>
                <p className="text-2xl font-bold">${promotions.reduce((sum, p) => sum + p.revenueImpact, 0).toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Products on Sale</p>
                <p className="text-2xl font-bold">{promotions.reduce((sum, p) => sum + p.productsCount, 0)}</p>
              </div>
              <Tag className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Promotions Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {promotions.map((promotion) => (
          <Card key={promotion.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 opacity-10 rounded-bl-full" />
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{promotion.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1 capitalize">{promotion.type} Deal</p>
                </div>
                <Badge variant={promotion.status === "active" ? "default" : promotion.status === "expired" ? "secondary" : "outline"}>
                  {promotion.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-green-600">{promotion.discountValue}{promotion.type === "percentage" ? '%' : '$'}</span>
                <span className="text-sm text-muted-foreground">OFF</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Products:</span>
                <span className="font-medium">{promotion.productsCount} items</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Period:</span>
                <span className="font-medium">{promotion.startDate} - {promotion.endDate}</span>
              </div>
              {promotion.revenueImpact > 0 && (
                <div className="pt-3 border-t">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Revenue Impact:</span>
                    <span className="font-bold text-green-600">${promotion.revenueImpact.toLocaleString()}</span>
                  </div>
                </div>
              )}
              <Button variant="outline" className="w-full" onClick={() => router.push(`/dashboard/grocery/promotions/${promotion.id}`)}>
                Edit Promotion
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
