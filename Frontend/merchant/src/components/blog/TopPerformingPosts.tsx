'use client';
import { Button } from "@vayva/ui";

import React from 'react';
import { Icon } from '@/components/ui/icon';

interface TopPerformingPostsProps {
  posts: any[];
  categories: any[];
}

export function TopPerformingPosts({ posts, categories }: TopPerformingPostsProps): React.JSX.Element {
  return (
    <div className="bg-gray-50 rounded-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Top Performing Posts</h3>
        <Button className="text-sm text-green-600-primary hover:underline">View All</Button>
      </div>

      <div className="space-y-3">
        {posts.slice(0, 5).map((post, index) => (
          <div key={index} className="p-4 bg-white-tertiary rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">{post.title}</h4>
                <p className="text-xs text-gray-400 mt-1">
                  Published: {new Date(post.publishedAt || Date.now()).toLocaleDateString()}
                </p>
              </div>
              <Icon name="TrendingUp" size={16} className="text-green-600" />
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div>
                <p className="text-xs text-gray-400">Views</p>
                <p className="text-sm font-bold text-gray-900">{post.views?.toLocaleString() || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Avg Read</p>
                <p className="text-sm font-bold text-gray-900">
                  {Math.floor((post.avgTimeOnPage || 0) / 60)}.{Math.round((post.avgTimeOnPage || 0) % 60 / 60 * 10)} min
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Engagement</p>
                <p className="text-sm font-bold text-green-600">{post.engagementRate || 0}%</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary"
                style={{ width: `${Math.min(100, (post.views / 25000) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Categories */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Content Categories</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat, index) => (
            <div key={index} className="px-3 py-1.5 bg-white-tertiary rounded-lg">
              <p className="text-xs font-medium text-gray-900">{cat.name}</p>
              <p className="text-xs text-gray-400">{cat.count} posts</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

