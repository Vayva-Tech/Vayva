'use client';

import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';
// @ts-expect-error -- phase4-industry types are generated lazily and may not exist at compile time
import { Campaign, CampaignStatus, CampaignType } from '@/types/phase4-industry';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Target, DollarSign, Users, Calendar, Heart } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CreateCampaignDialog } from './CreateCampaignDialog';

const statusColors: Record<CampaignStatus, string> & { draft?: string } = {
  draft: 'bg-gray-500',
  active: 'bg-green-500',
  paused: 'bg-yellow-500',
  completed: 'bg-blue-500',
  cancelled: 'bg-red-500',
};

const typeIcons: Record<CampaignType, typeof Heart> = {
  annual_fund: DollarSign,
  emergency_appeal: Target,
  capital_campaign: DollarSign,
  event_fundraiser: Calendar,
  peer_to_peer: Users,
  recurring_giving: Heart,
  memorial: Heart,
  tribute: Heart,
  general: Heart,
};

export function CampaignsList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/nonprofit/campaigns');
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      logger.error('[CampaignsList] Failed to fetch:', { error });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCampaignClick = (campaignId: string) => {
    window.location.href = `/dashboard/nonprofit/campaigns/${campaignId}`;
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading campaigns...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Fundraising Campaigns</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: string) => setStatusFilter(value as CampaignStatus | 'all')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCampaigns.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Heart className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No campaigns found</p>
            </CardContent>
          </Card>
        ) : (
          filteredCampaigns.map((campaign) => {
            const Icon = typeIcons[campaign.type] || Heart;
            const progress = campaign.goal
              ? Math.round((campaign.amountRaised / campaign.goal) * 100)
              : 0;

            return (
              <Card 
                key={campaign.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleCampaignClick(campaign.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold line-clamp-1">{campaign.name}</h3>
                        <Badge className={statusColors[campaign.status as CampaignStatus]}>{campaign.status}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Raised:</span>
                      <span className="font-semibold">{formatCurrency(campaign.amountRaised)}</span>
                    </div>
                    {campaign.goal && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Goal:</span>
                          <span>{formatCurrency(campaign.goal)}</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-gray-500 text-right">{progress}% of goal</p>
                      </>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Donors
                      </span>
                      <span>{campaign.donorCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {campaign.endDate ? 'Ends' : 'Started'}
                      </span>
                      <span>{formatDate(campaign.endDate || campaign.createdAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <CreateCampaignDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={() => {
          setIsCreateDialogOpen(false);
          fetchCampaigns();
        }}
      />
    </div>
  );
}
