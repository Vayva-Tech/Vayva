import React from "react";
import { Notification } from "@vayva/shared";
import { Button, Icon, cn } from "@vayva/ui";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
}

export const NotificationItem = ({
  notification,
  onRead,
}: NotificationItemProps) => {
  // Determine icon and color based on type
  const getIcon = () => {
    switch (notification.type) {
      case "critical":
        return { icon: "AlertTriangle", color: "text-red-500 bg-red-50" };
      case "action_required":
        return { icon: "AlertCircle", color: "text-amber-500 bg-amber-50" };
      case "success":
        return { icon: "Check", color: "text-green-500 bg-green-50" };
      case "insight":
        return { icon: "Star", color: "text-purple-500 bg-purple-50" };
      default:
        return { icon: "Info", color: "text-blue-500 bg-blue-50" };
    }
  };

  const { icon, color } = getIcon();

  const handleClick = () => {
    if (!notification.isRead) {
      onRead(notification.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "p-4 border-b border-border/40 hover:bg-white/40 transition-colors cursor-pointer group relative",
        !notification.isRead && "bg-blue-50/30",
      )}
    >
      <div className="flex gap-3 items-start">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
            color,
          )}
        >
          <Icon name={icon} size={14} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-0.5">
            <p
              className={cn(
                "text-sm font-medium pr-2 truncate",
                !notification.isRead
                  ? "text-text-primary"
                  : "text-text-secondary",
              )}
            >
              {notification.title}
            </p>
            <span className="text-[10px] text-text-tertiary shrink-0 whitespace-nowrap">
              {formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>

          <p className="text-xs text-text-tertiary line-clamp-2 leading-relaxed mb-2">
            {notification.message}
          </p>

          {notification.actionUrl && (
            <Link
              href={notification.actionUrl}
              className="inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline mt-1"
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.stopPropagation();
                onRead(notification.id);
              }}
            >
              {notification.actionLabel || "View Details"}{" "}
              <Icon name="ArrowRight" size={10} className="ml-1" />
            </Link>
          )}
        </div>

        {!notification.isRead && (
          <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full" />
        )}
      </div>
    </div>
  );
};
