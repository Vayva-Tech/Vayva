"use client";

import React, { useState } from "react";
import { Icon, cn, Button } from "@vayva/ui";
import { SoftCard } from "./SoftCard";

export interface TaskItem {
  id: string;
  title: string;
  category: string;
  status: "pending" | "completed";
}

export interface TaskBoardProps {
  tasks: TaskItem[];
}

export function TaskBoard({ tasks }: TaskBoardProps) {
  const [activeTab, setActiveTab] = useState<"today" | "tomorrow">("today");

  return (
    <SoftCard className="flex-1 flex flex-col" title="Today's Tasks">
      <div className="flex gap-4 border-b border-border/40 mb-4">
        <Button
          variant="ghost"
          onClick={() => setActiveTab("today")}
          className={cn(
            "pb-2 text-xs font-bold uppercase tracking-widest transition-colors border-b-2 rounded-none h-auto hover:bg-transparent",
            activeTab === "today"
              ? "text-primary border-primary"
              : "text-text-tertiary border-transparent",
          )}
        >
          Today
        </Button>
        <Button
          variant="ghost"
          onClick={() => setActiveTab("tomorrow")}
          className={cn(
            "pb-2 text-xs font-bold uppercase tracking-widest transition-colors border-b-2 rounded-none h-auto hover:bg-transparent",
            activeTab === "tomorrow"
              ? "text-primary border-primary"
              : "text-text-tertiary border-transparent",
          )}
        >
          Tomorrow
        </Button>
      </div>

      <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 p-3 rounded-2xl bg-background/40 border border-border/40 hover:bg-background/60 transition-colors group cursor-pointer"
          >
            <div
              className={cn(
                "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors",
                task.status === "completed"
                  ? "bg-primary border-primary text-white"
                  : "border-border group-hover:border-primary/50",
              )}
            >
              {task.status === "completed" && (
                <Icon name="Check" size={12} strokeWidth={4} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div
                className={cn(
                  "text-xs font-bold text-text-primary truncate",
                  task.status === "completed" &&
                    "line-through text-text-tertiary",
                )}
              >
                {task.title}
              </div>
              <div className="text-[10px] text-text-tertiary font-medium uppercase">
                {task.category}
              </div>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="py-10 text-center text-text-tertiary text-xs italic">
            No tasks found for {activeTab}.
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        className="mt-auto pt-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-transparent hover:opacity-75 transition-opacity h-auto"
      >
        <Icon name="Plus" size={12} />
        Add New Task
      </Button>
    </SoftCard>
  );
}
