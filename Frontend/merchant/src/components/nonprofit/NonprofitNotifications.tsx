"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Bell,
  Calendar,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Clock,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiJson } from "@/lib/api-client-shared";
import { logger, formatDate } from "@vayva/shared";

interface Notification {
  id: string;
  type: "deadline" | "achievement" | "reminder" | "alert";
  priority: "low" | "medium" | "high" | "urgent";
  title: string;
  message: string;
  entity?: {
    type: "grant" | "campaign" | "donation" | "volunteer" | "shift";
    id: string;
  };
  createdAt: string;
  read: boolean;
}

interface NonprofitNotificationsProps {
  onNotificationClick?: (notification: Notification) => void;
}

export function NonprofitNotifications({ onNotificationClick }: NonprofitNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    // Check for new notifications every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // Generate notifications from various sources
      const generatedNotifications = await generateNonprofitNotifications();
      setNotifications(generatedNotifications);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[FETCH_NOTIFICATIONS_ERROR]", { error: _errMsg });
    } finally {
      setLoading(false);
    }
  };

  const generateNonprofitNotifications = async (): Promise<Notification[]> => {
    const now = new Date();
    const generated: Notification[] = [];

    try {
      // Fetch grants and check deadlines
      const grantsRes = await apiJson<{ data: any[] }>("/api/nonprofit/grants?limit=100");
      const grants = grantsRes.data || [];

      grants.forEach((grant) => {
        if (grant.deadline) {
          const deadlineDate = new Date(grant.deadline);
          const daysUntilDeadline = Math.ceil(
            (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysUntilDeadline <= 3 && daysUntilDeadline > 0) {
            generated.push({
              id: `grant-${grant.id}-urgent`,
              type: "deadline",
              priority: "urgent",
              title: "Grant Deadline Approaching!",
              message: `${grant.title} is due in ${daysUntilDeadline} day${daysUntilDeadline === 1 ? "" : "s"}`,
              entity: { type: "grant", id: grant.id },
              createdAt: new Date().toISOString(),
              read: false,
            });
          } else if (daysUntilDeadline <= 7 && daysUntilDeadline > 3) {
            generated.push({
              id: `grant-${grant.id}-high`,
              type: "deadline",
              priority: "high",
              title: "Grant Deadline Soon",
              message: `${grant.title} is due in ${daysUntilDeadline} days`,
              entity: { type: "grant", id: grant.id },
              createdAt: new Date().toISOString(),
              read: false,
            });
          }
        }
      });

      // Fetch campaigns and check milestones
      const campaignsRes = await apiJson<{ data: any[] }>("/api/nonprofit/campaigns");
      const campaigns = campaignsRes.data || [];

      campaigns.forEach((campaign) => {
        if (campaign.goal && campaign.raised) {
          const progress = (campaign.raised / campaign.goal) * 100;

          if (progress >= 90 && progress < 100) {
            generated.push({
              id: `campaign-${campaign.id}-milestone`,
              type: "achievement",
              priority: "medium",
              title: "Campaign Almost at Goal!",
              message: `${campaign.title} has reached ${(progress).toFixed(0)}% of its goal`,
              entity: { type: "campaign", id: campaign.id },
              createdAt: new Date().toISOString(),
              read: false,
            });
          } else if (progress >= 50 && progress < 60) {
            generated.push({
              id: `campaign-${campaign.id}-halfway`,
              type: "achievement",
              priority: "low",
              title: "Campaign Milestone Reached",
              message: `${campaign.title} is halfway to its goal!`,
              entity: { type: "campaign", id: campaign.id },
              createdAt: new Date().toISOString(),
              read: false,
            });
          }
        }
      });

      // Fetch upcoming volunteer shifts
      const shiftsRes = await apiJson<{ data: any[] }>("/api/nonprofit/volunteers/shifts");
      const shifts = shiftsRes.data || [];

      shifts.forEach((shift: any) => {
        if (shift.startDate) {
          const shiftDate = new Date(shift.startDate);
          const hoursUntilShift = (shiftDate.getTime() - now.getTime()) / (1000 * 60 * 60);

          if (hoursUntilShift <= 24 && hoursUntilShift > 0) {
            generated.push({
              id: `shift-${shift.id}-reminder`,
              type: "reminder",
              priority: "medium",
              title: "Upcoming Volunteer Shift",
              message: `${shift.title} starts in ${Math.floor(hoursUntilShift)} hours`,
              entity: { type: "shift", id: shift.id },
              createdAt: new Date().toISOString(),
              read: false,
            });
          }
        }
      });

      // Sort by priority and date
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return generated.sort((a, b) => {
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    } catch (error) {
      logger.error("[GENERATE_NOTIFICATIONS_ERROR]", { error });
      return [];
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const handleDismiss = (notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.entity) {
      onNotificationClick?.(notification);
      handleMarkAsRead(notification.id);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      default:
        return "bg-blue-500";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "deadline":
        return <AlertCircle className="h-5 w-5" />;
      case "achievement":
        return <TrendingUp className="h-5 w-5" />;
      case "reminder":
        return <Clock className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-gray-500">
          <Bell className="h-12 w-12 mb-4 opacity-50" />
          <p>No notifications at this time</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge className="bg-red-500">{unreadCount}</Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
              }
            >
              Mark all read
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                notification.read
                  ? "bg-gray-50 border-gray-200"
                  : "bg-white border-blue-200 shadow-sm"
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-1 h-2 w-2 rounded-full ${getPriorityColor(
                    notification.priority
                  )}`}
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={!notification.read ? "font-semibold text-sm" : "text-sm"}
                      >
                        {notification.title}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {notification.type}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDismiss(notification.id);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(notification.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
