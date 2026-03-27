/**
 * Retail Industry - Dynamic Pricing Management Page
 * Manage pricing rules, discounts, and automated price optimization
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, DollarSign, Search, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";

interface PricingRule {
  id: string;
  productName: string;
  sku: string;
  currentPrice: number;
  newPrice: number;
  ruleType: "competitor-match" | "demand-based" | "clearance" | "promotional" | "seasonal";
  trigger: string;
  status: "active" | "scheduled" | "paused" | "expired";
  startDate: string;
  endDate?: string;
  impact: "high" | "medium" | "low";
  marginChange: number;
}

export default function RetailDynamicPricingPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const rules: PricingRule[] = [
    { id: "1", productName: "Wireless Headphones Pro", sku: "WH-001", currentPrice: 149.99, newPrice: 139.99, ruleType: "competitor-match", trigger: "Amazon: $139.99", status: "active", startDate: "2024-01-15", endDate: "2024-02-15", impact: "high", marginChange: -6.7 },
    { id: "2", productName: "Smart Watch Series 5", sku: "SW-045", currentPrice: 299.99, newPrice: 279.99, ruleType: "demand-based", trigger: "Low demand (-15%)", status: "active", startDate: "2024-01-18", endDate: "2024-01-31", impact: "medium", marginChange: -12.5 },
    { id: "3", productName: "Bluetooth Speaker Mini", sku: "BS-112", currentPrice: 79.99, newPrice: 59.99, ruleType: "clearance", trigger: "End of season", status: "active", startDate: "2024-01-10", endDate: "2024-01-31", impact: "high", marginChange: -25.0 },
    { id: "4", productName: "USB-C Hub 7-in-1", sku: "UH-789", currentPrice: 49.99, newPrice: 44.99, ruleType: "promotional", trigger: "Flash sale event", status: "scheduled", startDate: "2024-01-25", endDate: "2024-01-27", impact: "medium", marginChange: -10.0 },
    { id: "5", productName: "Laptop Stand Aluminum", sku: "LS-234", currentPrice: 89.99, newPrice: 94.99, ruleType: "demand-based", trigger: "High demand (+28%)", status: "active", startDate: "2024-01-12", impact: "low", marginChange: +8.3 },
    { id: "6", productName: "Phone Case Premium", sku: "PC-567", currentPrice: 39.99, newPrice: 34.99, ruleType: "seasonal", trigger: "Post-holiday sale", status: "paused", startDate: "2024-01-02", endDate: "2024-01-15", impact: "medium", marginChange: -12.5 },
    { id: "7", productName: "Wireless Charger Pad", sku: "WC-890", currentPrice: 29.99, newPrice: 24.99, ruleType: "competitor-match", trigger: "Best Buy: $24.99", status: "expired", startDate: "2023-12-15", endDate: "2024-01-10", impact: "low", marginChange: -16.7 },
  ];

  const filteredRules = rules.filter(rule =>
    rule.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.ruleType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: rules.length,
    active: rules.filter(r => r.status === "active").length,
    scheduled: rules.filter(r => r.status === "scheduled").length,
    highImpact: rules.filter(r => r.impact === "high").length,
    avgMarginChange: (rules.reduce((sum, r) => sum + r.marginChange, 0) / rules.length).toFixed(2),
    potentialRevenue: rules.filter(r => r.status === "active").reduce((sum, r) => sum + (r.newPrice - r.currentPrice), 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard/retail")} className="h-10 w-10 p-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Dynamic Pricing
              </h1>
              <p className="text-muted-foreground mt-1">Automated price optimization and rules</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Rule
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Rules</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.scheduled} scheduled</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">High Impact Changes</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.highImpact}</div>
              <p className="text-xs text-muted-foreground mt-1">Significant price adjustments</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Margin Change</CardTitle>
              <TrendingDown className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{parseFloat(stats.avgMarginChange) > 0 ? "+" : ""}{stats.avgMarginChange}%</div>
              <p className="text-xs text-muted-foreground mt-1">Average across all rules</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Revenue Impact</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">${stats.potentialRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">Per unit change</p>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by product, SKU, or rule type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing Rules Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Pricing Rules ({filteredRules.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Product</th>
                    <th className="text-left py-3 px-4 font-semibold">Current Price</th>
                    <th className="text-left py-3 px-4 font-semibold">New Price</th>
                    <th className="text-left py-3 px-4 font-semibold">Change</th>
                    <th className="text-left py-3 px-4 font-semibold">Rule Type</th>
                    <th className="text-left py-3 px-4 font-semibold">Trigger</th>
                    <th className="text-left py-3 px-4 font-semibold">Duration</th>
                    <th className="text-left py-3 px-4 font-semibold">Impact</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRules.map((rule) => (
                    <tr key={rule.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-semibold">{rule.productName}</p>
                          <p className="text-xs text-muted-foreground font-mono">{rule.sku}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono">${rule.currentPrice.toFixed(2)}</td>
                      <td className="py-3 px-4 font-mono font-bold text-green-600">${rule.newPrice.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <div className={`flex items-center ${rule.marginChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {rule.marginChange >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                          <span className="font-medium">{rule.marginChange >= 0 ? '+' : ''}{rule.marginChange.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="capitalize">
                          {rule.ruleType.replace("-", " ")}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm max-w-[200px] truncate">{rule.trigger}</td>
                      <td className="py-3 px-4 text-sm">
                        {rule.startDate} {rule.endDate && `→ ${rule.endDate}`}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={rule.impact === "high" ? "destructive" : rule.impact === "medium" ? "secondary" : "outline"} className="capitalize">
                          {rule.impact}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={rule.status === "active" ? "default" : rule.status === "scheduled" ? "secondary" : rule.status === "expired" ? "destructive" : "outline"}>
                          {rule.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/retail/pricing/${rule.id}`)}>
                            View
                          </Button>
                          {rule.status === "active" && (
                            <Button variant="outline" size="sm" className="text-orange-600">
                              Pause
                            </Button>
                          )}
                          {rule.status === "paused" && (
                            <Button variant="outline" size="sm" className="text-green-600">
                              Resume
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
