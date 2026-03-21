/* eslint-disable no-restricted-syntax */
"use client";

import React, { useState } from "react";
import { Button, Icon, cn, type IconName } from "@vayva/ui";
import { SoftCard } from "./SoftCard";

export interface TaskItem {
  id: string;
  title: string;
  category: string;
  status: "pending" | "completed";
  dueDate?: string;
}

export interface TaskBoardProps {
  tasks: TaskItem[];
  loading?: boolean;
  onAddTask?: () => void;
  onTaskClick?: (taskId: string) => void;
}

export function TaskBoard({ tasks, loading, onAddTask, onTaskClick }: TaskBoardProps) {
  const [activeTab, setActiveTab] = useState<"today" | "tomorrow">("today");

  // Filter tasks based on due date and active tab
  const filteredTasks = tasks.filter((task) => {
    if (!task.dueDate) return activeTab === "today"; // Tasks without due date show in "today"
    const taskDate = new Date(task.dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = taskDate.toDateString() === today.toDateString();
    const isTomorrow = taskDate.toDateString() === tomorrow.toDateString();

    return activeTab === "today" ? isToday : isTomorrow;
  });

  if (loading) {
    return (
      <SoftCard className="flex-1 flex flex-col" title="Today's Tasks">
        <div className="flex gap-4 border-b border-gray-100 mb-4">
          <div className="pb-2 h-5 w-16 bg-white-2 rounded animate-pulse" />
          <div className="pb-2 h-5 w-20 bg-white-2 rounded animate-pulse" />
        </div>
        <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-2xl">
              <div className="w-5 h-5 rounded-md bg-white-2 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-white-2 rounded animate-pulse" />
                <div className="h-3 w-1/3 bg-white-2 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </SoftCard>
    );
  }

  return (
    <SoftCard className="flex-1 flex flex-col" title="Today's Tasks">
      <div className="flex gap-4 border-b border-gray-100 mb-4">
        <Button
          onClick={() => setActiveTab("today")}
          className={cn(
            "pb-2 text-xs font-bold uppercase tracking-widest transition-colors border-b-2",
            activeTab === "today"
              ? "text-green-500 border-green-500"
              : "text-gray-400 border-transparent",
          )}
        >
          Today
        </Button>
        <Button
          onClick={() => setActiveTab("tomorrow")}
          className={cn(
            "pb-2 text-xs font-bold uppercase tracking-widest transition-colors border-b-2",
            activeTab === "tomorrow"
              ? "text-green-500 border-green-500"
              : "text-gray-400 border-transparent",
          )}
        >
          Tomorrow
        </Button>
      </div>

      <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            onClick={() => onTaskClick?.(task.id)}
            className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-gray-100 hover:bg-white transition-colors group cursor-pointer"
          >
            <div
              className={cn(
                "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors",
                task.status === "completed"
                  ? "bg-green-500 border-green-500 text-white"
                  : "border-gray-100 group-hover:border-green-500/50",
              )}
            >
              {task.status === "completed" && (
                <Icon name="Check" size={12} strokeWidth={4} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div
                className={cn(
                  "text-xs font-bold text-gray-900 truncate",
                  task.status === "completed" &&
                    "line-through text-gray-400",
                )}
              >
                {task.title}
              </div>
              <div className="text-[10px] text-gray-400 font-medium uppercase">
                {task.category}
              </div>
            </div>
          </div>
        ))}
        {filteredTasks.length === 0 && (
          <div className="py-10 text-center text-gray-400 text-xs italic">
            No tasks found for {activeTab}.
          </div>
        )}
      </div>

      <Button onClick={onAddTask} className="mt-auto">
        <Icon name="Plus" size={12} />
        Add New Task
      </Button>
    </SoftCard>
  );
}
