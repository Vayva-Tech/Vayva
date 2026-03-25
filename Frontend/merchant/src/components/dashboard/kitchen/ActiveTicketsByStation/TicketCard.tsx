'use client';
import { Button } from "@vayva/ui";

import React from 'react';
import type { Ticket } from '@/types/kitchen';
import { TimerDisplay } from '../shared/TimerDisplay';
import { StatusBadge } from '../shared/StatusBadge';
import { CheckCircle, AlertTriangle } from 'lucide-react';

type BadgeTicketStatus = 'fresh' | 'cooking' | 'ready' | 'urgent' | 'overdue';

function mapKdsOrderToBadgeStatus(ticket: Ticket): BadgeTicketStatus {
  if (ticket.priority === 'rush') return 'urgent';
  const now = Date.now();
  if (
    ticket.promisedTime &&
    new Date(ticket.promisedTime).getTime() < now &&
    ticket.status !== 'ready' &&
    ticket.status !== 'served'
  ) {
    return 'overdue';
  }
  switch (ticket.status) {
    case 'pending':
      return 'fresh';
    case 'preparing':
      return 'cooking';
    case 'ready':
    case 'served':
    case 'bumped':
      return 'ready';
    default:
      return 'cooking';
  }
}

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
  const badgeStatus = mapKdsOrderToBadgeStatus(ticket);
  const isUrgent = badgeStatus === 'urgent' || badgeStatus === 'overdue';
  const isCompact = variant === 'compact';

  const startTime = new Date(ticket.receivedAt);
  const targetTime = ticket.promisedTime
    ? new Date(ticket.promisedTime)
    : new Date(startTime.getTime() + 30 * 60 * 1000);

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
            <h4 className="font-bold text-lg">#{ticket.orderNumber}</h4>
            <StatusBadge status={badgeStatus} />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {ticket.course} • Table {ticket.tableNumber || 'N/A'}
          </p>
        </div>

        <TimerDisplay startTime={startTime} targetTime={targetTime} size={isCompact ? 'small' : 'medium'} />
      </div>

      {/* Items List */}
      <div className={`${isCompact ? 'p-3' : 'p-4'}`}>
        <ul className="space-y-2">
          {ticket.items.map((item) => (
            <li key={item.id} className="flex items-start gap-2">
              <span className="font-semibold text-gray-700 min-w-[24px]">
                {item.quantity}x
              </span>
              <div className="flex-1">
                <p className="text-gray-900">{item.name}</p>
                {item.modifiers && item.modifiers.length > 0 && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.modifiers.map((m) => m.name).join(', ')}
                  </p>
                )}
                {item.notes && (
                  <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {item.notes}
                  </p>
                )}
              </div>
              {item.status === 'served' && (
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
            <Button
              type="button"
              onClick={() => onBump?.(ticket.id)}
              className="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Bump
            </Button>
            <Button
              type="button"
              onClick={() => onComplete?.(ticket.id)}
              className="px-3 py-1.5 text-sm font-medium bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Complete
            </Button>
          </div>

          <Button
            type="button"
            onClick={() => onVoid?.(ticket.id, 'Other')}
            className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors"
          >
            Void
          </Button>
        </div>
      )}
    </div>
  );
}

