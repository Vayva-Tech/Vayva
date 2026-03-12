/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-empty */
"use client";

import { logger } from "@vayva/shared";
import React, { useState, useEffect } from "react";
import { Button, Drawer, Icon, cn } from "@vayva/ui";
import {
  BellSlash as BellOff,
  ShoppingBag,
  Robot as Bot,
  CreditCard,
  Info,
} from "@phosphor-icons/react/ssr";

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const TABS = ["All", "Orders", "WhatsApp AI", "Payments", "System"];

import { apiJson } from "@/lib/api-client-shared";

export const NotificationsDrawer = ({
  isOpen,
  onClose,
}: NotificationsDrawerProps) => {
  const [activeTab, setActiveTab] = useState("All");
  const [notifications, setNotifications] = useState<any[]>([]);

  React.useEffect(() => {
    if (isOpen) {
      const loadNotifications = async () => {
        try {
          const data = await apiJson<any[]>("/api/notifications");
          if (Array.isArray(data)) setNotifications(data);
        } catch (err: unknown) {
          const _errMsg = err instanceof Error ? err.message : String(err);
          logger.error("[LOAD_NOTIFICATIONS_ERROR]", {
            error: _errMsg,
            app: "merchant",
          });
        } finally {
        }
      };
      void loadNotifications();
    }
  }, [isOpen]);

  const filtered =
    activeTab === "All"
      ? notifications
      : notifications.filter((n) => {
          if (activeTab === "Orders") return n.type === "order";
          if (activeTab === "WhatsApp AI") return n.type === "ai";
          if (activeTab === "Payments") return n.type === "payment";
          return n.type === "system";
        });

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "order":
        return ShoppingBag;
      case "ai":
        return Bot;
      case "payment":
        return CreditCard;
      default:
        return Info;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "order":
        return "text-primary bg-primary/20";
      case "ai":
        return "text-purple-400 bg-purple-500/20";
      case "payment":
        return "text-blue-400 bg-blue-500/20";
      default:
        return "text-white bg-background/10";
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Notifications">
      <div className="flex flex-col h-full">
        {/* Controls */}
        <div className="px-6 py-4 flex flex-col gap-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">
              {notifications.filter((n) => n.unread).length} unread
            </span>
            <Button
              onClick={markAllRead}
              variant="link"
              size="sm"
              className="text-xs font-bold text-primary hover:underline h-auto p-0"
            >
              Mark all as read
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {TABS.map((tab) => (
              <Button
                key={tab}
                onClick={() => setActiveTab(tab)}
                variant="ghost"
                size="sm"
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors h-auto",
                  activeTab === tab
                    ? "bg-background text-background-dark"
                    : "bg-background/5 text-text-secondary hover:bg-background/10",
                )}
              >
                {tab}
              </Button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-text-secondary">
              <BellOff className="mb-2 opacity-50" size={32} />
              <p className="text-sm">You&apos;re all caught up.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filtered.map((item: any) => (
                <div
                  key={item.id}
                  className="p-4 flex gap-4 hover:bg-background/5 transition-colors cursor-pointer group"
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                      getColor(item.type),
                    )}
                  >
                    {React.createElement(getIcon(item.type), { size: 20 })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm mb-1 line-clamp-2",
                        item.unread
                          ? "text-white font-medium"
                          : "text-text-secondary",
                      )}
                    >
                      {item.title}
                    </p>
                    <span className="text-xs text-white/30">
                      {item.time} ago
                    </span>
                  </div>
                  {item.unread && (
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/5 text-center">
          <Button
            variant="ghost"
            className="text-xs text-text-secondary w-full"
          >
            Notification Settings
          </Button>
        </div>
      </div>
    </Drawer>
  );
};
