"use client";

import React from "react";
import { Brain, AlertTriangle, TrendingUp, Target } from "lucide-react";
import { formatCurrency } from "@vayva/ui";

interface AIInsightsPanelProps {
  data?: {
    eventId?: string;
    eventName?: string;
    overview?: {
      totalRevenue: number;
      totalTicketsSold: number;
      averageDailySales: number;
      salesTrend: string;
      capacityUtilization: number;
    };
    insights?: Array<{
      type: string;
      priority: "critical" | "high" | "medium" | "low";
      title: string;
      description: string;
      recommendation: string;
      predictedImpact?: any;
    }>;
  };
  loading?: boolean;
}

const PRIORITY_COLORS = {
  critical: "bg-red-50 border-red-300",
  high: "bg-orange-50 border-orange-300",
  medium: "bg-yellow-50 border-yellow-300",
  low: "bg-blue-50 border-blue-300",
};

export function AIInsightsPanel({ data, loading }: AIInsightsPanelProps) {
  if (loading) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-black rounded-xl p-6 shadow-[4px_4px_0px_#000000]">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      </div>
    );
  }

  if (!data || !data.insights?.length) return null;

  const { insights = [] } = data;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-black rounded-xl p-6 shadow-[4px_4px_0px_#000000]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center border-2 border-black">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">
            AI Insights
          </h3>
          <p className="text-xs text-gray-600">Powered by advanced analytics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights.map((insight, idx) => {
          const borderColor = PRIORITY_COLORS[insight.priority];
          
          return (
            <div
              key={idx}
              className={`p-4 border-2 rounded-lg ${borderColor}`}
            >
              <div className="flex items-start gap-2 mb-2">
                {insight.priority === "critical" && (
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                )}
                {insight.priority === "high" && (
                  <TrendingUp className="w-5 h-5 text-orange-600 shrink-0" />
                )}
                {(insight.priority === "medium" || insight.priority === "low") && (
                  <Target className="w-5 h-5 text-blue-600 shrink-0" />
                )}
                <div>
                  <p className="font-bold text-gray-900 text-sm">{insight.title}</p>
                  <span className={`text-xs font-bold uppercase ${
                    insight.priority === "critical" ? "text-red-700" :
                    insight.priority === "high" ? "text-orange-700" :
                    insight.priority === "medium" ? "text-yellow-700" :
                    "text-blue-700"
                  }`}>
                    {insight.priority}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-700 mb-2">{insight.description}</p>
              
              <div className="p-2 bg-white/60 rounded border border-gray-200">
                <p className="text-xs font-bold text-gray-900">💡 {insight.recommendation}</p>
              </div>

              {insight.predictedImpact && (
                <div className="mt-2 text-xs text-gray-600">
                  {insight.predictedImpact.additionalRevenue && (
                    <p>Predicted: +{formatCurrency(insight.predictedImpact.additionalRevenue)}</p>
                  )}
                  {insight.predictedImpact.confidence && (
                    <p>Confidence: {(insight.predictedImpact.confidence * 100).toFixed(0)}%</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
