// @ts-nocheck
'use client';
/**
 * Event Timeline Dashboard Component
 * Visual timeline management for events
 */

'use client';

import React, { useState, useEffect } from 'react';
import { EventTimelineFeature } from '../features/event-timeline.feature';
import type { TimelineEvent, Milestone } from '../services/event-timeline.service';

interface EventTimelineDashboardProps {
  eventId: string;
  timelineFeature: EventTimelineFeature;
}

export const EventTimelineDashboard: React.FC<EventTimelineDashboardProps> = ({
  eventId,
  timelineFeature,
}) => {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimelineData();
  }, [eventId]);

  const loadTimelineData = async () => {
    try {
      setLoading(true);
      const [timelineData, milestoneData, statsData] = await Promise.all([
        timelineFeature.getTimeline(eventId),
        timelineFeature.getMilestones(eventId),
        timelineFeature.getStats(),
      ]);
      setTimeline(timelineData);
      setMilestones(milestoneData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load timeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'planned': return 'bg-gray-400';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const getCategoryIcon = (category: TimelineEvent['category']) => {
    const icons = {
      setup: '🔧',
      ceremony: '🎊',
      reception: '🥂',
      break: '☕',
      activity: '🎯',
      teardown: '📦',
    };
    return icons[category] || '📅';
  };

  if (loading) {
    return <div className="p-6 text-center">Loading timeline...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-lg shadow">
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <div className="text-sm text-gray-600">Total Events</div>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{stats.completedEvents}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{stats.upcomingEvents}</div>
            <div className="text-sm text-gray-600">Upcoming</div>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <div className="text-2xl font-bold">{stats.completedMilestones}/{stats.totalMilestones}</div>
            <div className="text-sm text-gray-600">Milestones</div>
          </div>
        </div>
      )}

      {/* Timeline Events */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Event Timeline</h3>
        <div className="space-y-3">
          {timeline.map((event) => (
            <div key={event.id} className="flex items-start gap-4 p-3 border rounded hover:bg-gray-50">
              <div className={`w-3 h-3 mt-1.5 rounded-full ${getStatusColor(event.status)}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getCategoryIcon(event.category)}</span>
                  <h4 className="font-semibold">{event.title}</h4>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {event.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {event.endTime && ` - ${event.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                  {event.location && ` • ${event.location}`}
                </div>
                {event.description && (
                  <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                )}
                {event.responsibleParty && (
                  <div className="text-xs text-gray-400 mt-1">
                    Responsible: {event.responsibleParty}
                  </div>
                )}
              </div>
              <div className="text-xs px-2 py-1 bg-gray-100 rounded capitalize">
                {event.status.replace('-', ' ')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Planning Milestones</h3>
        <div className="space-y-2">
          {milestones.map((milestone) => (
            <div key={milestone.id} className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={milestone.completed}
                  onChange={() => timelineFeature.completeMilestone(milestone.id)}
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium">{milestone.title}</div>
                  <div className="text-sm text-gray-500">
                    Due: {milestone.dueDate.toLocaleDateString()}
                    {milestone.completedAt && (
                      <span className="text-green-600 ml-2">
                        ✓ Completed {milestone.completedAt.toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {milestone.assignedTo && (
                <div className="text-sm text-gray-400">{milestone.assignedTo}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
