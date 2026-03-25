import { Button } from "@vayva/ui";
/**
 * Event Timeline Builder Component
 */

import React from 'react';

interface TimelineEvent {
  id: string;
  name: string;
  date: Date;
  type: 'milestone' | 'task' | 'reminder' | 'deadline';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface EventTimelineBuilderProps {
  timeline?: {
    id: string;
    name: string;
    events: TimelineEvent[];
    progress: number;
  };
  onAddEvent?: (event: any) => void;
  onUpdateStatus?: (eventId: string, status: any) => void;
}

export const EventTimelineBuilder: React.FC<EventTimelineBuilderProps> = ({
  timeline,
  onAddEvent,
  onUpdateStatus,
}) => {
  const displayTimeline = timeline || {
    id: 'timeline-1',
    name: 'Wedding Planning Timeline',
    events: [
      { id: '1', name: 'Book Venue', date: new Date('2030-01-01T12:00:00Z'), type: 'milestone', status: 'completed', priority: 'high' },
      { id: '2', name: 'Send Invitations', date: new Date('2030-01-08T12:00:00Z'), type: 'task', status: 'in-progress', priority: 'high' },
      { id: '3', name: 'Final Fitting', date: new Date('2030-01-15T12:00:00Z'), type: 'reminder', status: 'pending', priority: 'medium' },
    ],
    progress: 45,
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'milestone': return 'bg-purple-100 text-purple-800';
      case 'task': return 'bg-blue-100 text-blue-800';
      case 'reminder': return 'bg-yellow-100 text-yellow-800';
      case 'deadline': return 'bg-red-100 text-red-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✓';
      case 'in-progress': return '⟳';
      case 'pending': return '○';
      case 'cancelled': return '✗';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 font-bold';
      case 'high': return 'text-orange-600 font-semibold';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold">{displayTimeline.name}</h3>
          <p className="text-sm text-gray-500">Event planning progress</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-blue-600">{displayTimeline.progress}%</p>
          <p className="text-xs text-gray-600">Complete</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
        <div 
          className="bg-blue-600 h-3 rounded-full transition-all"
          style={{ width: `${displayTimeline.progress}%` }}
        />
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {displayTimeline.events.map((event, index) => (
          <div 
            key={event.id}
            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Button
              onClick={() => onUpdateStatus?.(event.id, event.status === 'completed' ? 'pending' : 'completed')}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                event.status === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-300'
              }`}
            >
              {getStatusIcon(event.status)}
            </Button>

            <div className="flex-1">
              <h4 className="font-medium">{event.name}</h4>
              <div className="flex items-center gap-3 mt-1">
                <span className={`px-2 py-0.5 text-xs rounded-full ${getTypeColor(event.type)}`}>
                  {event.type}
                </span>
                <span className={`text-xs ${getPriorityColor(event.priority)}`}>
                  {event.priority}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(event.date).toLocaleDateString()}
                </span>
              </div>
            </div>

            {index < displayTimeline.events.length - 1 && (
              <div className="w-0.5 h-8 bg-gray-300" />
            )}
          </div>
        ))}
      </div>

      {onAddEvent && (
        <Button
          onClick={() => onAddEvent({ name: 'New Event', type: 'task', status: 'pending' })}
          className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Add Event
        </Button>
      )}
    </div>
  );
};
