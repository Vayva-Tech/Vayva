'use client';

import React from 'react';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

export function SocialMedia(): React.JSX.Element {
  const platforms = [
    { name: 'Twitter', followers: '12.4K', posts: 847 },
    { name: 'LinkedIn', followers: '8.9K', posts: 624 },
    { name: 'YouTube', followers: '5.2K', posts: 142 },
    { name: 'Instagram', followers: '1.9K', posts: 384 },
  ];

  return (
    <div className="bg-background-secondary rounded-xl border border-border/40 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-text-primary">Social Media</h3>
        <Button size="sm" className="h-8 px-3 text-xs bg-accent-primary">
          Schedule Post
        </Button>
      </div>

      <div className="mb-4">
        <p className="text-sm text-text-secondary mb-1">Total Followers: 28,420</p>
        <p className="text-xs text-success">This Month: +1,247</p>
      </div>

      <div className="space-y-3">
        {platforms.map((platform, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-background-tertiary rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent-primary/20 flex items-center justify-center">
                <Icon name="Share2" size={18} className="text-accent-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">{platform.name}</p>
                <p className="text-xs text-text-tertiary">{platform.followers} followers</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-text-primary">{platform.posts}</p>
              <p className="text-xs text-text-tertiary">posts</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border/30">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-text-tertiary uppercase tracking-wider">Recent Performance</p>
          <p className="text-xs text-success">+28,420 visits</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-text-secondary">AI Trends post</p>
            <p className="text-xs text-text-tertiary">847 likes, 142 shares</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-text-secondary">TypeScript post</p>
            <p className="text-xs text-text-tertiary">624 likes, 98 shares</p>
          </div>
        </div>
      </div>
    </div>
  );
}
