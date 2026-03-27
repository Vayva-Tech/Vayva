/**
 * Wholesale - Pricing Tiers Management Page
 * Configure volume-based pricing and customer tier discounts
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, DollarSign, Plus, TrendingUp } from "lucide-react";

interface PricingTier {
  id: string;
  name: string;
  minQuantity: number;
  maxQuantity?: number;
  discountPercentage: number;
  applicableCustomers: number;
}

export default function WholesalePricingPage() {
  const router = useRouter();

  const tiers: PricingTier[] = [
    { id: "1", name: "Retail", minQuantity: 1, maxQuantity: 49, discountPercentage: 0, applicableCustomers: 125 },
    { id: "2", name: "Wholesale", minQuantity: 50, maxQuantity: 199, discountPercentage: 15, applicableCustomers: 78 },
    { id: "3", name: "Distributor", minQuantity: 200, maxQuantity: 499, discountPercentage: 25, applicableCustomers: 34 },
    { id: "4", name: "Partner", minQuantity: 500, discountPercentage: 35, applicableCustomers: 12 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/wholesale")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Pricing Tiers</h1>
            <p className="text-muted-foreground">Configure volume-based pricing and discounts</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/wholesale/pricing/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Tier
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {tiers.map((tier) => (
          <Card key={tier.id} className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-10 rounded-bl-full" />
            <CardHeader>
              <CardTitle className="text-xl">{tier.name}</CardTitle>
              <CardDescription>Volume Tier</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Quantity Range</p>
                <p className="text-2xl font-bold">
                  {tier.minQuantity} - {tier.maxQuantity ? `${tier.maxQuantity}+` : '∞'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Discount</p>
                <p className="text-3xl font-bold text-green-600">{tier.discountPercentage}% OFF</p>
              </div>
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Customers</span>
                  <Badge>{tier.applicableCustomers}</Badge>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={() => router.push(`/dashboard/wholesale/pricing/${tier.id}`)}>
                Configure Tier
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Pricing Strategy Overview</CardTitle>
          <CardDescription>Analytics and performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Average Discount</span>
              </div>
              <p className="text-2xl font-bold">18.5%</p>
              <p className="text-xs text-muted-foreground mt-1">Across all tiers</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">Total Revenue Impact</span>
              </div>
              <p className="text-2xl font-bold">$284,500</p>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium">Avg Order Value</span>
              </div>
              <p className="text-2xl font-bold">$8,450</p>
              <p className="text-xs text-muted-foreground mt-1">B2B orders only</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
