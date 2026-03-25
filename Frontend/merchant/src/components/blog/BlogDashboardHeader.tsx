'use client';
import React from 'react';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

interface BlogDashboardHeaderProps {
  timeRange: 'today' | 'week' | 'month';
  onTimeRangeChange: (range: 'today' | 'week' | 'month') => void;
}

export function BlogDashboardHeader({
  timeRange,
  onTimeRangeChange,
}: BlogDashboardHeaderProps): React.JSX.Element {
  return (
    <div className="bg-gradient-to-r from-background-secondary to-background-primary border-b border-gray-100">
      <div className="px-6 py-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Content Studio</h1>
            <p className="text-sm text-gray-500">
              Publish consistently and grow your audience
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Time Range Selector */}
            <div className="flex bg-white-tertiary rounded-lg p-1">
              {(['today', 'week', 'month'] as const).map((range) => (
                <Button
                  key={range}
                  onClick={() => onTimeRangeChange(range)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    timeRange === range
                      ? 'bg-green-50-primary text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </Button>
              ))}
            </div>

            {/* Actions */}
            <Button
              variant="outline"
              size="sm"
              className="h-10 px-4 border-gray-100 hover:bg-white"
            >
              <Icon name="FileText" size={16} className="mr-2" />
              New Post
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-10 px-4 border-gray-100 hover:bg-white"
            >
              <Icon name="BarChart3" size={16} className="mr-2" />
              Report
            </Button>

            {/* User Menu */}
            <div className="w-10 h-10 rounded-full bg-green-50-primary/20 flex items-center justify-center border border-accent-primary/40">
              <Icon name="User" size={18} className="text-green-600-primary" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-6 mt-4">
          {[
            { label: 'Dashboard', icon: 'LayoutDashboard', active: true },
            { label: 'Posts', icon: 'FileText' },
            { label: 'Calendar', icon: 'Calendar' },
            { label: 'Media', icon: 'Image' },
            { label: 'Comments', icon: 'MessageSquare' },
            { label: 'Newsletter', icon: 'Mail' },
            { label: 'Analytics', icon: 'BarChart3' },
          ].map((item) => (
            <Button
              key={item.label}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                item.active
                  ? 'text-green-600-primary'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon name={item.icon as any} size={16} />
              {item.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

