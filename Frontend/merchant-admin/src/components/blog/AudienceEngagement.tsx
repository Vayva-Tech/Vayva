'use client';

import React from 'react';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

interface AudienceEngagementProps {}

export function AudienceEngagement({}: AudienceEngagementProps): React.JSX.Element {
  // Mock data - would come from API in production
  const pendingComments = [
    { id: 1, author: 'John Smith', post: 'AI Trends in 2026', time: '2 hours ago' },
    { id: 2, author: 'Sarah Chen', post: 'React Hooks Guide', time: '5 hours ago' },
  ];

  return (
    <div className="bg-background-secondary rounded-xl border border-border/40 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-text-primary">Audience Engagement</h3>
        <Button size="sm" variant="outline" className="h-8 px-3 text-xs">
          Moderation Queue
        </Button>
      </div>

      <div className="mb-4">
        <p className="text-sm text-text-secondary mb-3">Comments Pending: {pendingComments.length}</p>
        
        <div className="space-y-2">
          {pendingComments.map((comment) => (
            <div key={comment.id} className="p-3 bg-background-tertiary rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-text-primary">{comment.author}</p>
                  <p className="text-xs text-text-tertiary">Post: {comment.post}</p>
                </div>
                <p className="text-xs text-text-tertiary">{comment.time}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="h-7 px-2 text-xs bg-success hover:bg-success/90">
                  Approve
                </Button>
                <Button size="sm" variant="outline" className="h-7 px-2 text-xs border-border/60">
                  Reply
                </Button>
                <Button size="sm" variant="outline" className="h-7 px-2 text-xs border-destructive/60 text-destructive hover:bg-destructive/10">
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-border/30">
        <p className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-3">Top Commenters</p>
        <div className="space-y-2">
          {[
            { name: 'Mike Johnson', comments: 47 },
            { name: 'Lisa Park', comments: 38 },
            { name: 'David Brown', comments: 32 },
          ].map((user, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center">
                <span className="text-xs font-bold text-accent-primary">{index + 1}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">{user.name}</p>
                <p className="text-xs text-text-tertiary">{user.comments} comments</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
