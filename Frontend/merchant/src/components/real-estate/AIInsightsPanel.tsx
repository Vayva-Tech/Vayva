"use client";

import React from "react";

export const AIInsightsPanel: React.FC = () => {
  const insights = [
    {
      id: '1',
      type: 'pricing',
      icon: '💡',
      title: 'Pricing Recommendation',
      property: '123 Main St',
      recommendation: 'Should be listed at $435K',
      reasoning: 'Based on recent comps, market velocity, and seasonal trends',
      confidence: 92,
      predictedDOM: 28,
      actions: ['Generate CMA', 'Adjust Price']
    },
    {
      id: '2',
      type: 'opportunity',
      icon: '🎯',
      title: 'High-Value Lead',
      lead: 'John & Sarah Mitchell',
      recommendation: 'Priority follow-up recommended',
      reasoning: 'Pre-approved, budget matches 456 Oak Ave, timeline: 30 days',
      confidence: 88,
      predictedClose: '$680K',
      actions: ['Schedule Showing', 'Send Comps']
    },
    {
      id: '3',
      type: 'market',
      icon: '📈',
      title: 'Market Shift Alert',
      area: 'Downtown District',
      recommendation: 'Consider price reductions for active listings',
      reasoning: 'Inventory increased 15%, DOM trending up 8 days',
      confidence: 75,
      impact: '12 properties affected',
      actions: ['Review Listings', 'Contact Owners']
    }
  ];

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">✨</span>
        <div>
          <h3 className="text-xl font-bold">AI Insights</h3>
          <p className="text-xs text-[var(--re-text-secondary)]">Pro Tier - Powered by VAYVA AI</p>
        </div>
        <div className="ml-auto">
          <span className="status-badge new">Live</span>
        </div>
      </div>

      <div className="space-y-4">
        {insights.map((insight) => (
          <div key={insight.id} className="ai-insight-card">
            <div className="flex items-start gap-4">
              <div className="text-3xl">{insight.icon}</div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold">{insight.title}</h4>
                    <p className="text-sm text-[var(--re-text-secondary)] mt-1">
                      {insight.property || insight.lead || insight.area}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-[var(--re-accent-primary)]">
                      {insight.confidence}% Confidence
                    </div>
                    <div className="text-xs text-[var(--re-text-tertiary)]">
                      {insight.predictedDOM ? `Predicted DOM: ${insight.predictedDOM}` : 
                       insight.predictedClose ? `Est. Close: ${insight.predictedClose}` :
                       insight.impact || ''}
                    </div>
                  </div>
                </div>

                <div className="bg-[var(--re-bg-tertiary)] rounded-lg p-3 mb-3">
                  <p className="text-sm font-medium">{insight.recommendation}</p>
                  <p className="text-xs text-[var(--re-text-tertiary)] mt-2">
                    {insight.reasoning}
                  </p>
                </div>

                <div className="flex gap-2">
                  {insight.actions.map((action, index) => (
                    <button
                      key={index}
                      className="glass-card px-3 py-1 text-xs hover:border-[var(--re-accent-primary)] transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--re-accent-primary)]/20 flex justify-between items-center">
        <p className="text-xs text-[var(--re-text-secondary)]">
          AI insights are updated every 15 minutes based on real-time market data
        </p>
        <button className="glass-card px-4 py-2 text-xs hover:text-white transition-colors">
          Customize Insights
        </button>
      </div>
    </div>
  );
};
