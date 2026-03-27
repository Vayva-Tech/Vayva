"use client";

/**
 * Travel Dashboard - Marketing Page
 * Promotions, campaigns, and loyalty programs
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Megaphone, Mail, Tag, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiJson } from "@/lib/api-client-shared";
import logger from "@/lib/logger";

interface Campaign {
  id: string;
  name: string;
  type: "email" | "social" | "promotion" | "loyalty";
  status: "active" | "scheduled" | "completed" | "draft";
  sentDate?: string;
  recipients: number;
  conversionRate?: number;
}

export default function TravelMarketingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await apiJson<{ data: Campaign[] }>("/api/travel/marketing/campaigns?limit=500");
      setCampaigns(response.data || []);
    } catch (error) {
      logger.warn("Failed to fetch marketing campaigns", error);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      email: "bg-blue-100 text-blue-800",
      social: "bg-purple-100 text-purple-800",
      promotion: "bg-red-100 text-red-800",
      loyalty: "bg-green-100 text-green-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "completed":
        return "secondary";
      case "scheduled":
        return "outline";
      case "draft":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-coral-50 p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Travel Marketing</h1>
          <p className="mt-1 text-gray-600">Manage promotions, campaigns, and loyalty programs</p>
        </div>
        <Button onClick={() => router.push("/dashboard/travel/marketing/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading campaigns...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-12">
          <Megaphone className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
          <p className="text-gray-600 mb-4">Create marketing campaigns to promote your travel services</p>
          <Button onClick={() => router.push("/dashboard/travel/marketing/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Create First Campaign
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{campaign.name}</CardTitle>
                    <CardDescription>
                      {campaign.sentDate && `Sent ${formatDate(campaign.sentDate)}`}
                    </CardDescription>
                  </div>
                  <Badge className={getTypeBadgeColor(campaign.type)}>
                    {campaign.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant={getStatusBadgeVariant(campaign.status)}>
                      {campaign.status}
                    </Badge>
                    <div className="text-sm text-gray-600">
                      {campaign.recipients.toLocaleString()} recipients
                    </div>
                  </div>
                  
                  {campaign.conversionRate !== undefined && (
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Conversion Rate</span>
                        <span className="font-semibold text-green-600">{campaign.conversionRate}%</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// API INTEGRATION:
// Required Endpoints:
// - GET /api/travel/marketing/campaigns - List campaigns
// - POST /api/travel/marketing/campaigns - Create campaign
// - PUT /api/travel/marketing/campaigns/:id - Update campaign
// - DELETE /api/travel/marketing/campaigns/:id - Remove campaign
