'use client';

import React from 'react';
import { Icon } from '@/components/ui/icon';

interface TopPerformingPostsProps {
  posts: any[];
  categories: any[];
}

export function TopPerformingPosts({ posts, categories }: TopPerformingPostsProps): React.JSX.Element {
  return (
    <div className="bg-background-secondary rounded-xl border border-border/40 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-text-primary">Top Performing Posts</h3>
        <button className="text-sm text-accent-primary hover:underline">View All</button>
      </div>

      <div className="space-y-3">
        {posts.slice(0, 5).map((post, index) => (
          <div key={index} className="p-4 bg-background-tertiary rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-text-primary">{post.title}</h4>
                <p className="text-xs text-text-tertiary mt-1">
                  Published: {new Date(post.publishedAt || Date.now()).toLocaleDateString()}
                </p>
              </div>
              <Icon name="TrendingUp" size={16} className="text-success" />
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div>
                <p className="text-xs text-text-tertiary">Views</p>
                <p className="text-sm font-bold text-text-primary">{post.views?.toLocaleString() || 0}</p>
              </div>
              <div>
                <p className="text-xs text-text-tertiary">Avg Read</p>
                <p className="text-sm font-bold text-text-primary">
                  {Math.floor((post.avgTimeOnPage || 0) / 60)}.{Math.round((post.avgTimeOnPage || 0) % 60 / 60 * 10)} min
                </p>
              </div>
              <div>
                <p className="text-xs text-text-tertiary">Engagement</p>
                <p className="text-sm font-bold text-success">{post.engagementRate || 0}%</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 w-full h-1.5 bg-background-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary"
                style={{ width: `${Math.min(100, (post.views / 25000) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Categories */}
      <div className="mt-4 pt-4 border-t border-border/30">
        <p className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-3">Content Categories</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat, index) => (
            <div key={index} className="px-3 py-1.5 bg-background-tertiary rounded-lg">
              <p className="text-xs font-medium text-text-primary">{cat.name}</p>
              <p className="text-xs text-text-tertiary">{cat.count} posts</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
