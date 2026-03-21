/**
 * Campaign List Component
 * Shows all campaigns across connected platforms
 */

"use client";

import { useState } from "react";
import { Button, Badge } from "@vayva/ui";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Play,
  Pause,
  DotsThree as MoreHorizontal,
  TrendUp as TrendingUp,
  Eye,
  CursorClick as MousePointerClick,
  Wallet,
  Target,
  Trash,
} from "@phosphor-icons/react";
import type { Campaign, AdPlatform } from "@/types/ad-platforms";
import { PLATFORM_CONFIGS } from "@/services/ad-platforms/hub";

interface CampaignListProps {
  campaigns: Campaign[];
  onPause: (platform: AdPlatform, campaignId: string) => void;
  onResume: (platform: AdPlatform, campaignId: string) => void;
  onDelete: (platform: AdPlatform, campaignId: string) => void;
  onViewDetails: (campaign: Campaign) => void;
}

export function CampaignList({
  campaigns,
  onPause,
  onResume,
  onDelete,
  onViewDetails,
}: CampaignListProps) {
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);

  const getPlatformConfig = (platform: AdPlatform) => PLATFORM_CONFIGS[platform];

  const getStatusBadge = (status: Campaign["status"]) => {
    const variants: Record<Campaign["status"], { variant: string; label: string }> = {
      active: { variant: "default", label: "Active" },
      paused: { variant: "secondary", label: "Paused" },
      completed: { variant: "outline", label: "Completed" },
      draft: { variant: "ghost", label: "Draft" },
    };

    const { variant, label } = variants[status];
    return <Badge variant={variant as never}>{label}</Badge>;
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (campaigns.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Target className="h-6 w-6 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium mb-2">No campaigns yet</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mb-4">
            Connect an ad account and create your first campaign to start promoting your products.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Performance</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((campaign) => {
              const platformConfig = getPlatformConfig(campaign.platform);
              const performance = campaign.performance;

              return (
                <TableRow key={campaign.id} className="group">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{campaign.name}</span>
                      <span className="text-xs text-gray-500 capitalize">
                        {campaign.objective.replace("_", " ")}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: platformConfig.color }}
                      />
                      <span className="text-sm">{platformConfig.name}</span>
                    </div>
                  </TableCell>

                  <TableCell>{getStatusBadge(campaign.status)}</TableCell>

                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">
                        {formatCurrency(
                          campaign.budget.amount,
                          campaign.budget.currency,
                        )}
                      </span>
                      <span className="text-xs text-gray-500 capitalize">
                        {campaign.budget.type}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    {performance ? (
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1" title="Impressions">
                          <Eye className="h-3 w-3 text-gray-500" />
                          {formatNumber(performance.impressions)}
                        </div>
                        <div className="flex items-center gap-1" title="Clicks">
                          <MousePointerClick className="h-3 w-3 text-gray-500" />
                          {formatNumber(performance.clicks)}
                        </div>
                        <div className="flex items-center gap-1" title="Spend">
                          <Wallet className="h-3 w-3 text-gray-500" />
                          {formatCurrency(performance.spend, campaign.budget.currency)}
                        </div>
                        <div className="flex items-center gap-1" title="CTR">
                          <TrendingUp className="h-3 w-3 text-gray-500" />
                          {(performance.ctr * 100).toFixed(1)}%
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">No data</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1">
                      {campaign.status === "active" ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onPause(campaign.platform, campaign.id)}
                          title="Pause"
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                      ) : campaign.status === "paused" ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onResume(campaign.platform, campaign.id)}
                          title="Resume"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(campaign.platform, campaign.id)}
                        title="Delete"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
