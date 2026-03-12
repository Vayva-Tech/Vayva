"use client";

import { Card, Button } from "@vayva/ui";

interface AIInsight {
  type: string;
  title: string;
  reason: string;
  predictedImpact?: string;
  actions: string[];
}

interface AIInsightsPanelProps {
  insights?: AIInsight[];
  isProTier?: boolean;
}

export function AIInsightsPanel({ insights = [], isProTier = false }: AIInsightsPanelProps) {
  if (!isProTier) return null;

  const defaultInsights: AIInsight[] = [
    {
      type: "recommendation",
      title: "Promote balayage for spring season",
      reason: "Based on: 45% increase in requests, seasonal trend",
      predictedImpact: "+$2,400 revenue in next 30 days",
      actions: ["Create Promotion", "View Details"],
    },
  ];

  const displayInsights = insights.length > 0 ? insights : defaultInsights;

  return (
    <Card className="glass-panel p-6 border border-rose-500/20">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">💡</span>
        <h3 className="text-lg font-semibold text-white">AI Insights (Pro Tier)</h3>
      </div>

      {displayInsights.map((insight, idx) => (
        <div key={idx} className="p-4 bg-white/5 rounded-lg mb-3 last:mb-0">
          <p className="text-white font-medium mb-2">{insight.title}</p>
          <p className="text-text-secondary text-sm mb-2">{insight.reason}</p>
          {insight.predictedImpact && (
            <p className="text-emerald-400 text-sm mb-3">
              Predicted impact: <span className="font-medium">{insight.predictedImpact}</span>
            </p>
          )}
          <div className="flex gap-2">
            {insight.actions.map((action, actionIdx) => (
              <Button
                key={actionIdx}
                variant="outline"
                size="sm"
                className="glass-button text-xs"
              >
                {action}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </Card>
  );
}
