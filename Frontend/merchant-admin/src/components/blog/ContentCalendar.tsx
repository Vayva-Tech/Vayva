'use client';

import React from 'react';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

interface ContentCalendarProps {
  overview: {
    upcomingPosts: any[];
    publishingStreak: number;
    consistencyScore: number;
    editorialGoals: {
      target: number;
      completed: number;
      percentage: number;
    };
    pipelineStats: {
      ideas: number;
      drafts: number;
      editing: number;
      scheduled: number;
    };
  };
}

export function ContentCalendar({ overview }: ContentCalendarProps): React.JSX.Element {
  return (
    <div className="bg-background-secondary rounded-xl border border-border/40 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-text-primary">Content Calendar</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="h-8 px-3 text-xs">
            Full Calendar
          </Button>
          <Button size="sm" className="h-8 px-3 text-xs bg-accent-primary">
            Schedule Post
          </Button>
        </div>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-background-tertiary rounded-lg p-3">
          <p className="text-xs text-text-tertiary">Ideas</p>
          <p className="text-lg font-bold text-text-primary">{overview.pipelineStats.ideas}</p>
        </div>
        <div className="bg-background-tertiary rounded-lg p-3">
          <p className="text-xs text-text-tertiary">Drafts</p>
          <p className="text-lg font-bold text-text-primary">{overview.pipelineStats.drafts}</p>
        </div>
        <div className="bg-background-tertiary rounded-lg p-3">
          <p className="text-xs text-text-tertiary">Editing</p>
          <p className="text-lg font-bold text-text-primary">{overview.pipelineStats.editing}</p>
        </div>
        <div className="bg-background-tertiary rounded-lg p-3">
          <p className="text-xs text-text-tertiary">Scheduled</p>
          <p className="text-lg font-bold text-text-primary">{overview.pipelineStats.scheduled}</p>
        </div>
      </div>

      {/* Editorial Goals */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-text-secondary">March Target: {overview.editorialGoals.target} posts</p>
          <p className="text-sm font-bold text-text-primary">
            {overview.editorialGoals.completed}/{overview.editorialGoals.target} ({Math.round(overview.editorialGoals.percentage)}%)
          </p>
        </div>
        <div className="w-full h-2 bg-background-tertiary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary transition-all"
            style={{ width: `${overview.editorialGoals.percentage}%` }}
          />
        </div>
      </div>

      {/* Upcoming Posts Preview */}
      <div className="space-y-2">
        <p className="text-sm font-bold text-text-tertiary uppercase tracking-wider">Upcoming This Week</p>
        {overview.upcomingPosts.slice(0, 3).map((post, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-background-tertiary rounded-lg">
            <div className={`w-2 h-2 rounded-full ${
              post.status === 'published' ? 'bg-success' :
              post.status === 'scheduled' ? 'bg-accent-primary' :
              'bg-warning'
            }`} />
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary">{post.title}</p>
              <p className="text-xs text-text-tertiary">
                {new Date(post.scheduledDate).toLocaleDateString()}
              </p>
            </div>
            <Icon name="Calendar" size={16} className="text-text-tertiary" />
          </div>
        ))}
      </div>
    </div>
  );
}
