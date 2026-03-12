'use client';

import React from 'react';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

export function NewsletterCampaigns(): React.JSX.Element {
  const campaigns = [
    { name: 'Weekly Digest #142', sent: 'Mar 9', opened: 42, clicked: 18, revenue: 2840 },
    { name: 'New Post Alert', sent: 'Mar 5', opened: 48, clicked: 24, revenue: 3420 },
  ];

  return (
    <div className="bg-background-secondary rounded-xl border border-border/40 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-text-primary">Newsletter Campaigns</h3>
        <Button size="sm" className="h-8 px-3 text-xs bg-accent-primary">
          Create Campaign
        </Button>
      </div>

      <div className="mb-4">
        <p className="text-sm text-text-secondary mb-1">Total Subscribers: 12,847</p>
        <p className="text-xs text-success">Growth: +847 this month</p>
      </div>

      <div className="space-y-3">
        {campaigns.map((campaign, index) => (
          <div key={index} className="p-3 bg-background-tertiary rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-text-primary">{campaign.name}</p>
                <p className="text-xs text-text-tertiary">Sent: {campaign.sent}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div>
                <p className="text-xs text-text-tertiary">Opened</p>
                <p className="text-sm font-bold text-text-primary">{campaign.opened}%</p>
              </div>
              <div>
                <p className="text-xs text-text-tertiary">Clicked</p>
                <p className="text-sm font-bold text-text-primary">{campaign.clicked}%</p>
              </div>
              <div>
                <p className="text-xs text-text-tertiary">Revenue</p>
                <p className="text-sm font-bold text-success">${campaign.revenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border/30">
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-tertiary">Unsubscribes: 42 (0.3%)</p>
          <p className="text-xs text-text-tertiary">Bounce Rate: 1.2%</p>
        </div>
      </div>
    </div>
  );
}
