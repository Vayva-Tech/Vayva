import React from 'react';
import { GlassPanel } from '@vayva/ui/components/fashion';

export interface ActivityItem {
  id: string;
  type: 'order' | 'restock' | 'review' | 'lookbook' | 'wholesale';
  title: string;
  description: string;
  timestamp: string;
  icon?: string;
}

export interface RecentActivityFeedProps {
  activities: ActivityItem[];
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  activities,
}) => {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'order':
        return '🛒';
      case 'restock':
        return '📦';
      case 'review':
        return '⭐';
      case 'lookbook':
        return '🎨';
      case 'wholesale':
        return '💼';
      default:
        return '📌';
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'order':
        return 'bg-emerald-500/20 text-emerald-400';
      case 'restock':
        return 'bg-amber-500/20 text-amber-400';
      case 'review':
        return 'bg-rose-500/20 text-rose-400';
      case 'lookbook':
        return 'bg-purple-500/20 text-purple-400';
      case 'wholesale':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-white/10 text-white/60';
    }
  };

  return (
    <GlassPanel variant="elevated" className="p-6">
      <h2 className="text-xl font-semibold text-white mb-6">Recent Activity</h2>

      <div className="space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex gap-3 bg-white/3 rounded-lg p-3 border border-white/8 hover:border-rose-400/30 transition-all"
          >
            {/* Icon */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityColor(
                activity.type
              )}`}
            >
              <span className="text-lg">{activity.icon || getActivityIcon(activity.type)}</span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">{activity.title}</p>
              <p className="text-xs text-white/60 mt-0.5 line-clamp-2">
                {activity.description}
              </p>
              <p className="text-xs text-white/40 mt-1">{activity.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
};

export default RecentActivityFeed;
