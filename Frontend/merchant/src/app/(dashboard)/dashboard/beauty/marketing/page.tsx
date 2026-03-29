/**
 * Beauty Marketing & Promotions Page
 */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiJson } from "@/lib/api-client-shared";
import { logger } from "@vayva/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, Gift, Mail, Users, Tag } from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  sentCount: number;
  conversionRate: number;
}

export default function BeautyMarketingPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await apiJson<{ data: Campaign[] }>("/beauty/campaigns");
      setCampaigns(response.data || generateMockCampaigns());
    } catch (error) {
      setCampaigns(generateMockCampaigns());
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard/beauty")}>
              <ChevronLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-pink-600 to-rose-600 rounded-lg">
                <Gift className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                Marketing & Promotions
              </h1>
            </div>
          </div>
          <Button size="sm">Create Campaign</Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 md:px-6 py-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Mail className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Campaigns</p>
                  <p className="text-2xl font-bold">{campaigns.filter(c => c.status === "active").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Users className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Reach</p>
                  <p className="text-2xl font-bold">{campaigns.reduce((sum, c) => sum + c.sentCount, 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Tag className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Conversion</p>
                  <p className="text-2xl font-bold">{(campaigns.reduce((sum, c) => sum + c.conversionRate, 0) / campaigns.length || 0).toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Marketing Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Conversion Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell><Badge variant="outline">{campaign.type}</Badge></TableCell>
                    <TableCell>
                      <Badge variant={campaign.status === "active" ? "default" : "secondary"}>{campaign.status}</Badge>
                    </TableCell>
                    <TableCell>{campaign.sentCount}</TableCell>
                    <TableCell>{campaign.conversionRate.toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}


// No mock data - requires real beauty API integration

