// @ts-nocheck
// ============================================================================
// 86 Board - Item Availability Tracker
// ============================================================================
// Restaurant industry term "86" means item is unavailable
// ============================================================================

import React from "react";
import { Card, CardContent, CardHeader } from "@vayva/ui/components/card";
import { Badge } from "@vayva/ui/components/badge";
import { cn } from "@vayva/ui/lib/utils";

export interface MenuItem86 {
  id: string;
  name: string;
  category: string;
  unavailable: boolean;
  reason?: "sold_out" | "paused" | "ingredient_shortage" | "seasonal";
  estimatedReturn?: Date;
  alternatives?: string[];
}

export interface EightySixBoardProps {
  items: MenuItem86[];
  designCategory?: "signature" | "glass" | "bold" | "dark" | "natural";
  className?: string;
}

export function EightySixBoard({
  items,
  designCategory = "bold",
  className,
}: EightySixBoardProps) {
  const unavailableItems = items.filter((i) => !i.unavailable);

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

  const getReasonBadge = (reason?: string) => {
    switch (reason) {
      case "sold_out":
        return <Badge variant="destructive">Sold Out</Badge>;
      case "paused":
        return <Badge variant="secondary">Paused</Badge>;
      case "ingredient_shortage":
        return <Badge variant="warning">Ingredient Shortage</Badge>;
      case "seasonal":
        return <Badge variant="outline">Seasonal</Badge>;
      default:
        return <Badge variant="secondary">Unavailable</Badge>;
    }
  };

  const formatEstimatedReturn = (date?: Date) => {
    if (!date) return null;
    const today = new Date();
    const diffDays = Math.ceil(
      (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return "Later today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 7) return `In ${diffDays} days`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className={cn("bg-gradient-to-br", getGradientClass(), className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">86 Board</h3>
          <Badge variant={unavailableItems.length > 0 ? "destructive" : "success"}>
            {unavailableItems.length} Unavailable
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {unavailableItems.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-muted-foreground">All items available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {unavailableItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-lg border bg-background space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.category}
                    </div>
                  </div>
                  {getReasonBadge(item.reason)}
                </div>

                {(item.estimatedReturn || item.alternatives) && (
                  <div className="pt-2 border-t space-y-1">
                    {item.estimatedReturn && (
                      <div className="text-xs">
                        <span className="text-muted-foreground">
                          Expected back:{" "}
                        </span>
                        {formatEstimatedReturn(item.estimatedReturn)}
                      </div>
                    )}

                    {item.alternatives && item.alternatives.length > 0 && (
                      <div className="text-xs">
                        <span className="text-muted-foreground">
                          Suggest:{" "}
                        </span>
                        {item.alternatives.join(", ")}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
