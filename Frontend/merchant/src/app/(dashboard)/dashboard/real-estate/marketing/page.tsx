/**
 * Real Estate - Marketing & Advertising Page
 * Manage marketing campaigns, digital ads, and lead generation
 */

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Megaphone, Plus, Eye, MousePointer } from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  type: "digital" | "print" | "social" | "email" | "open-house";
  budget: number;
  spent: number;
  impressions: number;
  clicks?: number;
  leads: number;
  status: "active" | "paused" | "completed" | "draft";
  roi?: number;
}

export default function RealEstateMarketingPage() {
  const router = useRouter();

  const campaigns: Campaign[] = [
    { id: "1", name: "Beverly Hills Luxury Campaign", type: "digital", budget: 15000, spent: 8500, impressions: 125000, clicks: 3400, leads: 47, status: "active", roi: 285 },
    { id: "2", name: "Miami Beach Open House Series", type: "open-house", budget: 5000, spent: 3200, impressions: 8500, leads: 23, status: "active" },
    { id: "3", name: "Austin Tech Professionals", type: "social", budget: 8000, spent: 8000, impressions: 95000, clicks: 2800, leads: 35, status: "completed", roi: 175 },
    { id: "4", name: "Seattle Waterfront Email Blast", type: "email", budget: 2000, spent: 1500, impressions: 15000, clicks: 1200, leads: 18, status: "paused", roi: 120 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/real-estate")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Marketing & Advertising</h1>
            <p className="text-muted-foreground">Manage campaigns and lead generation</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/real-estate/marketing/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">${(campaigns.reduce((acc, c) => acc + c.budget, 0) / 1000).toFixed(0)}K</p>
              </div>
              <Megaphone className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Campaigns</p>
                <p className="text-2xl font-bold">{campaigns.filter(c => c.status === "active").length}</p>
              </div>
              <Megaphone className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold">{campaigns.reduce((acc, c) => acc + c.leads, 0)}</p>
              </div>
              <Megaphone className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg ROI</p>
                <p className="text-2xl font-bold">{Math.round(campaigns.filter(c => c.roi).reduce((acc, c) => acc + (c.roi || 0), 0) / campaigns.filter(c => c.roi).length)}%</p>
              </div>
              <Megaphone className="h-8 w-8 text-yellow-600" />
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
                  <th className="py-3 px-4 font-medium">Campaign</th>
                  <th className="py-3 px-4 font-medium">Type</th>
                  <th className="py-3 px-4 font-medium">Budget</th>
                  <th className="py-3 px-4 font-medium">Spent</th>
                  <th className="py-3 px-4 font-medium">Impressions</th>
                  <th className="py-3 px-4 font-medium">Leads</th>
                  <th className="py-3 px-4 font-medium">ROI</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-semibold">{campaign.name}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="capitalize">{campaign.type}</Badge>
                    </td>
                    <td className="py-3 px-4 font-medium">${campaign.budget.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span>${campaign.spent.toLocaleString()}</span>
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${campaign.spent / campaign.budget > 0.9 ? 'bg-red-500' : campaign.spent / campaign.budget > 0.7 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{campaign.impressions.toLocaleString()}</td>
                    <td className="py-3 px-4 font-bold">{campaign.leads}</td>
                    <td className="py-3 px-4">
                      {campaign.roi ? (
                        <Badge variant={campaign.roi > 200 ? "default" : campaign.roi > 100 ? "secondary" : "outline"}>
                          {campaign.roi}%
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={campaign.status === "active" ? "default" : campaign.status === "completed" ? "secondary" : "outline"}>
                        {campaign.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/real-estate/marketing/${campaign.id}`)}>
                        View
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
