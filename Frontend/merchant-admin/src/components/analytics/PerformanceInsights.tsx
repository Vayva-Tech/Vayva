import React from "react";
import { Icon, cn, Button } from "@vayva/ui";
import { Insight, Recommendation } from "@/types/analytics";

export const PerformanceInsights = ({
  insights,
  recommendation,
}: {
  insights: Insight[];
  recommendation: Recommendation | null;
}) => {
  return (
    <div className="space-y-6">
      {/* Insights List */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <Icon name="Lightbulb" size={16} /> Key Insights
        </h4>
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={cn(
              "p-4 rounded-xl border flex items-start gap-3",
              insight.type === "positive"
                ? "bg-green-50 border-green-100"
                : insight.type === "warning"
                  ? "bg-yellow-50 border-yellow-100"
                  : "bg-red-50 border-red-100",
            )}
          >
            <div
              className={cn(
                "mt-0.5 shrink-0",
                insight.type === "positive"
                  ? "text-green-600"
                  : insight.type === "warning"
                    ? "text-yellow-600"
                    : "text-red-500",
              )}
            >
              <Icon
                name={
                  insight.type === "positive"
                    ? "CircleCheck"
                    : insight.type === "warning"
                      ? "TriangleAlert"
                      : "OctagonAlert"
                }
                size={16}
              />
            </div>
            <div className="flex-1">
              <p
                className={cn(
                  "text-sm font-medium mb-1",
                  insight.type === "positive"
                    ? "text-green-900"
                    : insight.type === "warning"
                      ? "text-yellow-900"
                      : "text-red-900",
                )}
              >
                {insight.message}
              </p>
              <Button
                variant="link"
                className={cn(
                  "text-xs font-bold underline decoration-dotted underline-offset-2 p-0 h-auto",
                  insight.type === "positive"
                    ? "text-green-700"
                    : insight.type === "warning"
                      ? "text-yellow-700"
                      : "text-red-700",
                )}
              >
                {insight.action}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* AI Recommendation */}
      {recommendation && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Icon name="Sparkles" size={64} className="text-indigo-500" />
          </div>

          <h4 className="text-sm font-bold text-indigo-900 mb-2 flex items-center gap-2">
            <Icon name="Sparkles" size={14} className="text-indigo-500" /> AI
            Recommendation
          </h4>

          <p className="text-indigo-800 text-sm mb-4 leading-relaxed">
            {recommendation.reason}
          </p>

          <div className="flex items-center gap-4">
            <div className="bg-background/60 rounded-lg px-3 py-1.5 backdrop-blur-sm border border-indigo-100">
              <span className="text-xs text-indigo-600 font-bold uppercase tracking-wide">
                Potential Uplift
              </span>
              <div className="text-indigo-900 font-bold">
                +{recommendation.potential_uplift.orders}% Orders
              </div>
            </div>
            <Button
              size="sm"
              className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors text-xs font-bold"
            >
              Preview Template
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
