"use client";

import { useState, useEffect } from 'react';
import { Bell, X, BookOpen, CheckCircle, Clock, AlertTriangle, Award } from "lucide-react";

interface Notification {
  id: string;
  type: 'lesson_complete' | 'new_assignment' | 'deadline_warning' | 'achievement_unlocked' | 'course_update';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  courseId?: string;
  lessonId?: string;
}

export default function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "lesson_complete",
      title: "Lesson Completed!",
      message: "You've completed 'Interface Overview' in Blender 3D Fundamentals",
      timestamp: "5 minutes ago",
      read: false,
      courseId: "course-1",
      lessonId: "lesson-1"
    },
    {
      id: "2",
      type: "new_assignment",
      title: "New Assignment Available",
      message: "Assignment 1: Basic Modeling Challenge is now available",
      timestamp: "2 hours ago",
      read: false,
      courseId: "course-1"
    },
    {
      id: "3",
      type: "deadline_warning",
      title: "Assignment Deadline Approaching",
      message: "Submit your 'Procedural Materials' assignment by tomorrow",
      timestamp: "1 day ago",
      read: true,
      courseId: "course-2"
    },
    {
      id: "4",
      type: "achievement_unlocked",
      title: "Achievement Unlocked!",
      message: "Congratulations! You've earned the 'Quick Learner' badge",
      timestamp: "2 days ago",
      read: true
    }
  ]);

  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const clearNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'lesson_complete':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'new_assignment':
        return <BookOpen className="h-5 w-5 text-blue-500" />;
      case 'deadline_warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'achievement_unlocked':
        return <Award className="h-5 w-5 text-purple-500" />;
      case 'course_update':
        return <Clock className="h-5 w-5 text-gray-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTimeColor = (timestamp: string) => {
    if (timestamp.includes('minute')) return 'text-green-600';
    if (timestamp.includes('hour')) return 'text-blue-600';
    if (timestamp.includes('day')) return 'text-gray-500';
    return 'text-gray-400';
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={() => setShowNotifications(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 pt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className={`text-sm font-medium ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h4>
                        <button
                          onClick={() => clearNotification(notification.id)}
                          className="p-1 hover:bg-gray-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      
                      <p className={`text-sm mt-1 ${
                        !notification.read ? 'text-gray-700' : 'text-gray-500'
                      }`}>
                        {notification.message}
                      </p>
                      
                      <p className={`text-xs mt-2 ${getTimeColor(notification.timestamp)}`}>
                        {notification.timestamp}
                      </p>

                      {/* Action Button */}
                      {notification.courseId && (
                        <button className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium">
                          View Details →
                        </button>
                      )}
                    </div>

                    {/* Read indicator */}
                    {!notification.read && (
                      <div className="flex-shrink-0">
                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t bg-gray-50 rounded-b-xl">
            <button className="w-full text-sm text-gray-600 hover:text-gray-800 text-center">
              View all notifications
            </button>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
}