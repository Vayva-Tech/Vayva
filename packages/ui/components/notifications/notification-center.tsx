'use client';
import React, { useState } from 'react';
import { cn } from '../../utils';
import { Button } from '../button';
import { Badge } from '../badge';
import { formatDistanceToNow } from 'date-fns';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'critical';
  category: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  actionUrl?: string;
  actionLabel?: string;
  channels: string[];
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onFilterChange?: (filter: 'all' | 'unread' | 'critical') => void;
  isLoading?: boolean;
  className?: string;
}

export const NotificationCenter = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onFilterChange,
  isLoading = false,
  className
}: NotificationCenterProps) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'critical'>('all');

  const filteredNotifications = notifications.filter(notification => {
    if (activeFilter === 'unread') return !notification.isRead;
    if (activeFilter === 'critical') return notification.type === 'critical';
    return true;
  });

  const getTypeConfig = (type: Notification['type']) => {
    switch (type) {
      case 'critical':
        return { 
          icon: '🚨', 
          color: 'text-red-500 bg-red-50 border-red-200',
          badge: 'bg-red-100 text-red-800'
        };
      case 'error':
        return { 
          icon: '❌', 
          color: 'text-red-500 bg-red-50 border-red-200',
          badge: 'bg-red-100 text-red-800'
        };
      case 'warning':
        return { 
          icon: '⚠️', 
          color: 'text-amber-500 bg-amber-50 border-amber-200',
          badge: 'bg-amber-100 text-amber-800'
        };
      case 'success':
        return { 
          icon: '✅', 
          color: 'text-green-500 bg-green-50 border-green-200',
          badge: 'bg-green-100 text-green-800'
        };
      default:
        return { 
          icon: 'ℹ️', 
          color: 'text-blue-500 bg-blue-50 border-blue-200',
          badge: 'bg-blue-100 text-blue-800'
        };
    }
  };

  const handleFilterChange = (filter: 'all' | 'unread' | 'critical') => {
    setActiveFilter(filter);
    onFilterChange?.(filter);
  };

  if (isLoading) {
    return (
      <div className={cn("w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200", className)}>
        <div className="p-4 border-b border-gray-200">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-100 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200", className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          {notifications.some(n => !n.isRead) && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={onMarkAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Mark all as read
            </Button>
          )}
        </div>
        
        {/* Filters */}
        <div className="flex gap-2">
          <Button
            onClick={() => handleFilterChange('all')}
            className={cn(
              "px-3 py-1 text-xs rounded-full transition-colors",
              activeFilter === 'all'
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            All
          </Button>
          <Button
            onClick={() => handleFilterChange('unread')}
            className={cn(
              "px-3 py-1 text-xs rounded-full transition-colors",
              activeFilter === 'unread'
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            Unread
          </Button>
          <Button
            onClick={() => handleFilterChange('critical')}
            className={cn(
              "px-3 py-1 text-xs rounded-full transition-colors",
              activeFilter === 'critical'
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            Critical
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 text-4xl mb-3">📭</div>
            <p className="text-gray-500 text-sm">
              {activeFilter === 'unread' 
                ? 'No unread notifications' 
                : activeFilter === 'critical'
                ? 'No critical notifications'
                : 'No notifications yet'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => {
              const config = getTypeConfig(notification.type);
              
              return (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 hover:bg-gray-50 transition-colors cursor-pointer group",
                    !notification.isRead && "bg-blue-50"
                  )}
                  onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border",
                      config.color
                    )}>
                      <span className="text-lg">{config.icon}</span>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className={cn(
                          "text-sm font-medium truncate",
                          notification.isRead ? "text-gray-600" : "text-gray-900"
                        )}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                          <Badge 
                            variant="secondary" 
                            className={cn("text-xs", config.badge)}
                          >
                            {notification.category}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className={cn(
                        "text-sm mb-2 line-clamp-2",
                        notification.isRead ? "text-gray-500" : "text-gray-700"
                      )}>
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                        
                        {notification.actionUrl && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-xs text-blue-600 hover:text-blue-800"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(notification.actionUrl, '_blank');
                            }}
                          >
                            {notification.actionLabel || 'View'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
