// @ts-nocheck
"use client";

import React from "react";
import { Card, Button } from "@vayva/ui";
import { Sparkle as Sparkles, TrendUp as TrendingUp, Users, WarningCircle as AlertCircle } from "@phosphor-icons/react";

interface InsightAction {
  label: string;
  icon: React.ReactNode;
}

interface Insight {
  id: string;
  type: 'alert' | 'warning' | 'info';
  icon: React.ReactNode;
  title: string;
  description: string;
  details: string;
  recommendation: string;
  predictedImpact: string;
  actions: InsightAction[];
}

interface AIInsightsPanelProps {
  planTier?: 'basic' | 'pro';
}

export function AIInsightsPanel({ planTier = 'basic' }: AIInsightsPanelProps) {
  // Mock insights - in production, these would come from AI analysis
  const insights: Insight[] = [
    {
      id: 'peak-time',
      type: 'alert',
      icon: <TrendingUp size={20} className="text-cyan-400" />,
      title: 'Peak Time Alert',
      description: 'Expected rush between 11:30 PM - 12:30 AM',
      details: 'Based on: Historical data, event calendar, weather',
      recommendation: 'Call in 2 additional bartenders, open VIP section',
      predictedImpact: '+₦8,500 revenue, reduced wait times',
      actions: [
        { label: 'Adjust Staffing', icon: <Users size={14} /> },
        { label: 'View Forecast', icon: <TrendingUp size={14} /> },
      ],
    },
    {
      id: 'inventory',
      type: 'warning',
      icon: <AlertCircle size={20} className="text-yellow-400" />,
      title: 'Inventory Alert',
      description: 'Ace of Spades running low (3 bottles)',
      details: 'Current consumption rate: 2.5 bottles/hour',
      recommendation: 'Restock from backup inventory',
      predictedImpact: 'Avoid service delays during peak hours',
      actions: [
        { label: 'Restock Now', icon: <Sparkles size={14} /> },
      ],
    },
  ];

  if (planTier !== 'pro') {
    return (
      <Card className="p-6 bg-gradient-to-r from-purple-950/30 to-cyan-950/30 border-purple-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Sparkles size={24} className="text-purple-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">AI Insights</h3>
            <p className="text-sm text-gray-500">Upgrade to Pro for intelligent recommendations</p>
          </div>
        </div>
        <Button variant="primary" className="w-full">
          Upgrade to Pro
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-r from-purple-950/30 to-cyan-950/30 border-purple-500/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Sparkles size={24} className="text-purple-400 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">AI Insights</h3>
            <p className="text-sm text-gray-500">Intelligent recommendations for tonight</p>
          </div>
        </div>
        <Button variant="outline" size="sm">Configure Alerts</Button>
      </div>

      <div className="space-y-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`p-4 rounded-lg border ${
              insight.type === 'alert'
                ? 'bg-cyan-950/20 border-cyan-500/30'
                : 'bg-yellow-950/20 border-yellow-500/30'
            }`}
          >
            <div className="flex items-start gap-3 mb-3">
              {insight.icon}
              <div className="flex-1">
                <h4 className="font-bold text-gray-900">{insight.title}</h4>
                <p className="text-sm text-gray-500 mt-1">{insight.description}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="text-gray-500">{insight.details}</div>
              <div className="flex items-start gap-2">
                <span className="text-purple-400 font-medium">💡 Recommendation:</span>
                <span className="text-gray-900">{insight.recommendation}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-400 font-medium">📈 Predicted Impact:</span>
                <span className="text-gray-900">{insight.predictedImpact}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
              {insight.actions.map((action, idx) => (
                <Button key={idx} variant="outline" size="sm">
                  {action.icon}
                  <span className="ml-2">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-white/10 text-xs text-gray-500">
        <div className="flex items-center justify-between">
          <span>Powered by Vayva AI Analytics</span>
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </Card>
  );
}
