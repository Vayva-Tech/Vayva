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
    <div className="bg-gray-50 rounded-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Audience Engagement</h3>
        <Button size="sm" variant="outline" className="h-8 px-3 text-xs">
          Moderation Queue
        </Button>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-3">Comments Pending: {pendingComments.length}</p>
        
        <div className="space-y-2">
          {pendingComments.map((comment) => (
            <div key={comment.id} className="p-3 bg-white-tertiary rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{comment.author}</p>
                  <p className="text-xs text-gray-400">Post: {comment.post}</p>
                </div>
                <p className="text-xs text-gray-400">{comment.time}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="h-7 px-2 text-xs bg-green-500 hover:bg-green-50">
                  Approve
                </Button>
                <Button size="sm" variant="outline" className="h-7 px-2 text-xs border-gray-100">
                  Reply
                </Button>
                <Button size="sm" variant="outline" className="h-7 px-2 text-xs border-red-500/60 text-red-500 hover:bg-red-500">
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Top Commenters</p>
        <div className="space-y-2">
          {[
            { name: 'Mike Johnson', comments: 47 },
            { name: 'Lisa Park', comments: 38 },
            { name: 'David Brown', comments: 32 },
          ].map((user, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-50-primary/20 flex items-center justify-center">
                <span className="text-xs font-bold text-green-600-primary">{index + 1}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-400">{user.comments} comments</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
