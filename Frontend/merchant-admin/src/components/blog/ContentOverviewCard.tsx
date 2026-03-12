'use client';

import React from 'react';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

interface ContentOverviewCardProps {
  totalPosts: number;
  subscribers: number;
  avgReadTime: number;
  postsThisMonth: number;
}

export function ContentOverviewCard({
  totalPosts,
  subscribers,
  avgReadTime,
  postsThisMonth,
}: ContentOverviewCardProps): React.JSX.Element {
  return (
    <div className="bg-gradient-to-br from-background-secondary to-background-primary rounded-2xl border border-border/40 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-text-primary">Content Overview</h2>
          <p className="text-sm text-text-secondary mt-1">
            Tech Insights Blog | March 2026
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="h-9 px-4 rounded-xl bg-accent-primary hover:bg-accent-primary/90">
            <Icon name="Plus" size={16} className="mr-2" />
            New Post
          </Button>
          <Button size="sm" variant="outline" className="h-9 px-4 rounded-xl border-border/60">
            <Icon name="BarChart3" size={16} className="mr-2" />
            Performance Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 pt-4 border-t border-border/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-primary/20 flex items-center justify-center">
            <Icon name="FileText" size={20} className="text-accent-primary" />
          </div>
          <div>
            <p className="text-xs text-text-tertiary font-medium">Published</p>
            <p className="text-lg font-bold text-text-primary">{totalPosts} posts</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-secondary/20 flex items-center justify-center">
            <Icon name="Users" size={20} className="text-accent-secondary" />
          </div>
          <div>
            <p className="text-xs text-text-tertiary font-medium">Subscribers</p>
            <p className="text-lg font-bold text-text-primary">{subscribers.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
            <Icon name="Clock" size={20} className="text-success" />
          </div>
          <div>
            <p className="text-xs text-text-tertiary font-medium">Avg. Reading Time</p>
            <p className="text-lg font-bold text-text-primary">{avgReadTime}.{Math.floor(avgReadTime * 0.6)} min</p>
          </div>
        </div>
      </div>
    </div>
  );
}
