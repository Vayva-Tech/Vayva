/**
 * Nightlife - Promotions & Events Marketing Page
 * Manage promotional campaigns, special events, and marketing initiatives
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, PartyPopper, Search, Plus, Calendar, TrendingUp } from "lucide-react";
import { useState } from "react";

interface Promotion {
  id: string;
  name: string;
  type: "happy-hour" | "themed-night" | "special-event" | "discount" | "loyalty";
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  revenue: number;
  status: "active" | "scheduled" | "completed";
}

export default function NightlifePromotionsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const promotions: Promotion[] = [
    { id: "1", name: "Happy Hour Special", type: "happy-hour", description: "50% off all cocktails 5-7 PM", startDate: "2024-01-15", endDate: "2024-03-31", budget: 5000, revenue: 18500, status: "active" },
    { id: "2", name: "Saturday Night DJ Event", type: "themed-night", description: "Live DJ performance + VIP packages", startDate: "2024-01-27", endDate: "2024-01-27", budget: 3000, revenue: 12000, status: "scheduled" },
    { id: "3", name: "New Year's Eve Gala", type: "special-event", description: "Premium NYE celebration", startDate: "2023-12-31", endDate: "2023-12-31", budget: 15000, revenue: 65000, status: "completed" },
    { id: "4", name: "Loyalty Member Discount", type: "loyalty", description: "20% off for loyalty members", startDate: "2024-01-01", endDate: "2024-12-31", budget: 8000, revenue: 32000, status: "active" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/nightlife")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Promotions & Events</h1>
            <p className="text-muted-foreground">Manage marketing campaigns and special events</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/nightlife/promotions/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Promotion
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search promotions..."
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
                <p className="text-sm text-muted-foreground">Active Promos</p>
                <p className="text-2xl font-bold">{promotions.filter(p => p.status === "active").length}</p>
              </div>
              <PartyPopper className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">${promotions.reduce((acc, p) => acc + p.budget, 0).toLocaleString()}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue Generated</p>
                <p className="text-2xl font-bold">${promotions.reduce((acc, p) => acc + p.revenue, 0).toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg ROI</p>
                <p className="text-2xl font-bold">{((promotions.reduce((acc, p) => acc + ((p.revenue - p.budget) / p.budget), 0) / promotions.length) * 100).toFixed(0)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="py-3 px-4 font-medium">Promotion Name</th>
                  <th className="py-3 px-4 font-medium">Type</th>
                  <th className="py-3 px-4 font-medium">Description</th>
                  <th className="py-3 px-4 font-medium">Duration</th>
                  <th className="py-3 px-4 font-medium">Budget</th>
                  <th className="py-3 px-4 font-medium">Revenue</th>
                  <th className="py-3 px-4 font-medium">ROI</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {promotions.map((promo) => (
                  <tr key={promo.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-semibold">{promo.name}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="capitalize">{promo.type.replace("-", " ")}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm truncate max-w-[250px]">{promo.description}</td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-bold">${promo.budget.toLocaleString()}</td>
                    <td className="py-3 px-4 font-bold text-green-600">${promo.revenue.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-green-600">+{(((promo.revenue - promo.budget) / promo.budget) * 100).toFixed(0)}%</span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={promo.status === "active" ? "default" : promo.status === "scheduled" ? "secondary" : "outline"}>
                        {promo.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/nightlife/promotions/${promo.id}`)}>
                        Details
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
