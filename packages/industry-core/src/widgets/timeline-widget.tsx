// ============================================================================
// Timeline Widget
// ============================================================================
// For sequence-based industries (Events, Projects, Education)
// ============================================================================

import React from "react";
// TEMPORARY: Commenting out UI component imports for Phase 6 cleanup
/*
import { Card, CardContent, CardHeader } from "@vayva/ui/components/card";
import { cn } from "@vayva/ui/lib/utils";
*/

// Temporary mock components
const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => 
  <div className={className}>{children}</div>;
const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => 
  <div className={className}>{children}</div>;
const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => 
  <div className={className}>{children}</div>;

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

export interface TimelineEvent {
  id: string;
  title: string;
  date: Date;
  status: "completed" | "upcoming" | "in_progress";
  description?: string;
  icon?: string;
}

export interface TimelineWidgetProps {
  events: TimelineEvent[];
  className?: string;
  designCategory?: "signature" | "glass" | "bold" | "dark" | "natural";
}

export function TimelineWidget({
  events,
  className,
  designCategory = "signature",
}: TimelineWidgetProps) {
  // Sort events by date
  const sortedEvents = [...events].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500 border-green-600";
      case "in_progress":
        return "bg-blue-500 border-blue-600 animate-pulse";
      case "upcoming":
        return "bg-gray-300 border-gray-400";
      default:
        return "bg-gray-300 border-gray-400";
    }
  };

  const getGradientClass = () => {
    switch (designCategory) {
      case "signature":
        return "from-blue-50 to-white";
      case "glass":
        return "from-pink-100/50 to-purple-100/50 backdrop-blur";
      case "bold":
        return "from-orange-50 to-yellow-50";
      case "dark":
        return "from-gray-800 to-gray-900";
      case "natural":
        return "from-green-50 to-emerald-50";
      default:
        return "from-gray-50 to-white";
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className={cn("bg-gradient-to-br", getGradientClass(), className)}>
      <CardHeader>
        <h3 className="text-lg font-semibold">Timeline</h3>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-6">
            {sortedEvents.map((event) => (
              <div key={event.id} className="relative flex gap-4">
                {/* Dot on timeline */}
                <div
                  className={cn(
                    "relative z-10 w-12 h-12 rounded-full border-4 flex items-center justify-center shrink-0",
                    getStatusColor(event.status)
                  )}
                >
                  {event.icon && (
                    <span className="text-white text-sm">{event.icon}</span>
                  )}
                </div>

                {/* Event content */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-base">{event.title}</h4>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(event.date)}
                    </span>
                  </div>

                  {event.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {event.description}
                    </p>
                  )}

                  <div className="mt-2">
                    <span
                      className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        event.status === "completed" ? "bg-green-100 text-green-800" : "",
                        event.status === "in_progress" ? "bg-blue-100 text-blue-800" : "",
                        event.status === "upcoming" ? "bg-gray-100 text-gray-800" : ""
                      )}
                    >
                      {event.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
