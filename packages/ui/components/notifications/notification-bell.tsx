'use client';

import React, { useState } from 'react';
import { cn } from '../../utils';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import { NotificationCenter } from './notification-center';
import { Button } from '../button';

interface NotificationBellProps {
  unreadCount: number;
  notifications: any[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  isLoading?: boolean;
  className?: string;
}

export const NotificationBell = ({
  unreadCount,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  isLoading = false,
  className
}: NotificationBellProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative p-2 rounded-full hover:bg-gray-100 transition-colors",
            className
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white font-medium">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        align="end" 
        className="w-auto p-0 border-0 shadow-none"
        sideOffset={8}
      >
        <NotificationCenter
          notifications={notifications}
          onMarkAsRead={onMarkAsRead}
          onMarkAllAsRead={onMarkAllAsRead}
          isLoading={isLoading}
          className="shadow-xl"
        />
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;