'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';

interface PlatformOverviewProps {
  platformName?: string;
  activeTenants?: number;
  uptime?: number;
  supportTickets?: number;
  onNewPlan?: () => void;
  onMRRReport?: () => void;
}

export function PlatformOverview({
  platformName = 'CloudTech SaaS',
  activeTenants = 847,
  uptime = 99.98,
  supportTickets = 12,
  onNewPlan,
  onMRRReport,
}: PlatformOverviewProps) {
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 rounded-xl border border-accent-primary/20 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-1">
            Platform Overview
          </h2>
          <p className="text-sm text-text-secondary">
            &quot;{platformName} | {currentMonth}&quot;
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onNewPlan}
            className="h-9 px-4"
          >
            <Icon name="Plus" size={16} className="mr-2" />
            New Plan
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onMRRReport}
            className="h-9 px-4"
          >
            <Icon name="BarChart3" size={16} className="mr-2" />
            MRR Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent-primary/20 flex items-center justify-center">
            <Icon name="Users" size={20} className="text-accent-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{activeTenants}</p>
            <p className="text-xs text-text-tertiary">Active Tenants</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
            <Icon name="Activity" size={20} className="text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{uptime}%</p>
            <p className="text-xs text-text-tertiary">Uptime</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
            <Icon name="MessageCircle" size={20} className="text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{supportTickets}</p>
            <p className="text-xs text-text-tertiary">Support Tickets</p>
          </div>
        </div>
      </div>
    </div>
  );
}
