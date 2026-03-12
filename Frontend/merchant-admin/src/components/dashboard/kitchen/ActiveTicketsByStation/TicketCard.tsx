'use client';

import React from 'react';
import { Ticket } from '@/types/kitchen';
import { TimerDisplay } from '../shared/TimerDisplay';
import { StatusBadge } from '../shared/StatusBadge';
import { CheckCircle, Clock, AlertTriangle, ChefHat } from 'lucide-react';

interface TicketCardProps {
  ticket: Ticket;
  variant?: 'default' | 'compact';
  showUrgencyIndicator?: boolean;
  onBump?: (ticketId: string) => void;
  onComplete?: (ticketId: string) => void;
  onVoid?: (ticketId: string, reason: string) => void;
}

/**
 * TicketCard Component
 * 
 * Displays individual kitchen ticket with timer and actions
 */
export function TicketCard({
  ticket,
  variant = 'default',
  showUrgencyIndicator = false,
  onBump,
  onComplete,
  onVoid,
}: TicketCardProps) {
  const isUrgent = ticket.priority === 'urgent' || ticket.status === 'overdue';
  const isCompact = variant === 'compact';

  return (
    <div
      className={`
        bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow
        ${isUrgent ? 'border-red-300 bg-red-50' : 'border-gray-200'}
        ${showUrgencyIndicator ? 'animate-pulse' : ''}
      `}
    >
      {/* Card Header */}
      <div className={`flex items-start justify-between ${isCompact ? 'p-3' : 'p-4'} border-b`}>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-lg">#{ticket.ticketNumber}</h4>
            <StatusBadge status={ticket.status} />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {ticket.type} • Table {ticket.tableNumber || 'N/A'}
          </p>
        </div>
        
        <TimerDisplay
          startTime={new Date(ticket.createdAt)}
          targetTime={new Date(ticket.targetTime)}
          size={isCompact ? 'small' : 'medium'}
        />
      </div>

      {/* Items List */}
      <div className={`${isCompact ? 'p-3' : 'p-4'}`}>
        <ul className="space-y-2">
          {ticket.items.map((item, index) => (
            <li key={item.id} className="flex items-start gap-2">
              <span className="font-semibold text-gray-700 min-w-[24px]">
                {item.quantity}x
              </span>
              <div className="flex-1">
                <p className="text-gray-900">{item.name}</p>
                {item.modifiers && item.modifiers.length > 0 && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.modifiers.map(m => m.value).join(', ')}
                  </p>
                )}
                {item.specialInstructions && (
                  <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {item.specialInstructions}
                  </p>
                )}
              </div>
              {item.status === 'completed' && (
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      {!isCompact && (
        <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gray-50 border-t rounded-b-lg">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onBump?.(ticket.id)}
              className="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Bump
            </button>
            <button
              onClick={() => onComplete?.(ticket.id)}
              className="px-3 py-1.5 text-sm font-medium bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Complete
            </button>
          </div>
          
          <button
            onClick={() => onVoid?.(ticket.id, 'Other')}
            className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors"
          >
            Void
          </button>
        </div>
      )}
    </div>
  );
}
