// @ts-nocheck
// ============================================================================
// Kanban Widget
// ============================================================================
// For pipeline-based industries (Services, Creative, Education)
// ============================================================================

import React from "react";
// TEMPORARY: Commenting out UI component imports for Phase 6 cleanup
/*
import { Card, CardContent } from "@vayva/ui/components/card";
import { cn } from "@vayva/ui/lib/utils";
*/

// Temporary mock components
const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => 
  <div className={className}>{children}</div>;
const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => 
  <div className={className}>{children}</div>;

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: "low" | "medium" | "high";
  assignee?: string;
  dueDate?: Date;
  tags?: string[];
}

export interface KanbanColumn {
  id: string;
  title: string;
  color?: string;
}

export interface KanbanWidgetProps {
  columns: KanbanColumn[];
  cards: KanbanCard[];
  className?: string;
  designCategory?: "signature" | "glass" | "bold" | "dark" | "natural";
}

export function KanbanWidget({
  columns,
  cards,
  className,
  designCategory = "signature",
}: KanbanWidgetProps) {
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

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {columns.map((column) => {
          const columnCards = cards.filter((card) => card.status === column.id);

          return (
            <Card
              key={column.id}
              className={cn("bg-gradient-to-br", getGradientClass())}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">{column.title}</h3>
                  <span className="text-xs bg-muted px-2 py-1 rounded-full">
                    {columnCards.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {columnCards.map((card) => (
                    <div
                      key={card.id}
                      className="p-3 bg-background rounded-lg border shadow-sm space-y-2"
                    >
                      <h4 className="font-medium text-sm">{card.title}</h4>

                      {card.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {card.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between gap-2">
                        {card.priority && (
                          <span
                            className={cn(
                              "text-xs px-2 py-0.5 rounded-full",
                              getPriorityColor(card.priority)
                            )}
                          >
                            {card.priority}
                          </span>
                        )}

                        {card.dueDate && (
                          <span className="text-xs text-muted-foreground">
                            {card.dueDate.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        )}
                      </div>

                      {card.tags && card.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {card.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="text-xs bg-muted px-2 py-0.5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
