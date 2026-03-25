"use client";
import { Button } from "@vayva/ui";

import React from "react";

interface Showing {
  id: string;
  property: {
    title: string;
    address: string;
  };
  scheduledAt: string;
  status: string;
  agent?: {
    name: string;
  };
}

export const UpcomingShowings: React.FC = () => {
  const showings: Showing[] = [
    {
      id: '1',
      property: { title: '123 Main St', address: '123 Main St, Downtown' },
      scheduledAt: '2026-03-11T10:00:00Z',
      status: 'confirmed',
      agent: { name: 'Sarah Johnson' }
    },
    {
      id: '2',
      property: { title: '456 Oak Ave', address: '456 Oak Ave, Suburbs' },
      scheduledAt: '2026-03-11T11:30:00Z',
      status: 'arrived',
      agent: { name: 'Michael Chen' }
    },
    {
      id: '3',
      property: { title: '789 Pine Rd', address: '789 Pine Rd, Heights' },
      scheduledAt: '2026-03-11T14:00:00Z',
      status: 'scheduled',
      agent: { name: 'Emily Rodriguez' }
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return '✓';
      case 'arrived': return '●';
      case 'scheduled': return '⏳';
      default: return '○';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-500';
      case 'arrived': return 'text-blue-500';
      case 'scheduled': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="glass-panel p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Upcoming Showings</h3>
        <div className="flex gap-2">
          <Button className="glass-card px-3 py-1 text-sm hover:text-white transition-colors">
            View Calendar
          </Button>
          <Button className="btn-gradient text-sm">
            Schedule Showing
          </Button>
        </div>
      </div>

      <div className="mb-3 text-sm text-[var(--re-text-secondary)]">
        Today's Schedule ({showings.length} showings):
      </div>

      <div className="space-y-3">
        {showings.map((showing) => (
          <div key={showing.id} className="glass-card p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-lg font-bold ${getStatusColor(showing.status)}`}>
                    {formatTime(showing.scheduledAt)}
                  </span>
                  <span className={`status-badge ${showing.status}`}>
                    {getStatusIcon(showing.status)} {showing.status}
                  </span>
                </div>
                
                <h4 className="font-semibold">{showing.property.title}</h4>
                <p className="text-sm text-[var(--re-text-secondary)] mt-1">
                  {showing.property.address}
                </p>
                
                <div className="flex gap-4 mt-2 text-xs text-[var(--re-text-tertiary)]">
                  <span>Agent: {showing.agent?.name}</span>
                  <span>•</span>
                  <span>Private Showing</span>
                </div>
              </div>

              <div className="flex gap-2">
                {showing.status === 'scheduled' && (
                  <>
                    <Button className="glass-card px-3 py-1 text-xs hover:text-white transition-colors">
                      Check-in
                    </Button>
                    <Button className="glass-card px-3 py-1 text-xs hover:text-white transition-colors">
                      Reschedule
                    </Button>
                  </>
                )}
                {showing.status === 'confirmed' && (
                  <>
                    <Button className="glass-card px-3 py-1 text-xs hover:text-white transition-colors">
                      Check-in
                    </Button>
                    <Button className="glass-card px-3 py-1 text-xs hover:text-white transition-colors">
                      Notes
                    </Button>
                  </>
                )}
                {showing.status === 'arrived' && (
                  <Button className="glass-card px-3 py-1 text-xs hover:text-white transition-colors">
                    Complete
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <Button className="glass-card px-4 py-2 text-sm flex-1 hover:text-white transition-colors">
          Send Reminders
        </Button>
        <Button className="glass-card px-4 py-2 text-sm flex-1 hover:text-white transition-colors">
          Export Schedule
        </Button>
      </div>
    </div>
  );
};

