'use client';
import { Button } from "@vayva/ui";
import React, { useState, useEffect } from 'react';
import { GlassPanel } from '@vayva/ui/fashion';
import { aiRecommendationEngine, type AIRecommendation as EngineAIRecommendation } from '../services/ai-recommendation-engine';

export interface AIRecommendation {
  id: string;
  type: 'inventory' | 'pricing' | 'marketing' | 'collection';
  title: string;
  description: string;
  predictedImpact: string;
  urgency: 'high' | 'medium' | 'low';
}

export interface AIInsightsPanelProps {
  recommendations?: AIRecommendation[];
  isProTier?: boolean;
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  recommendations = [],
  isProTier = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<EngineAIRecommendation[]>([]);

  // Fetch AI recommendations when component mounts or storeId changes
  useEffect(() => {
    if (!isProTier) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setLoading(true);
      void aiRecommendationEngine
        .getAllRecommendations("store-id-placeholder")
        .then((recs) => {
          if (!cancelled) {
            setAiRecommendations(recs);
            setLoading(false);
          }
        })
        .catch((error) => {
          console.error("Error fetching AI recommendations:", error);
          if (!cancelled) setLoading(false);
        });
    });
    return () => {
      cancelled = true;
    };
  }, [isProTier]);
  if (!isProTier) {
    return (
      <GlassPanel variant="elevated" className="p-6">
        <div className="text-center py-8">
          <span className="text-4xl mb-3 block">💡</span>
          <h3 className="text-lg font-semibold text-white mb-2">
            AI Insights (Pro Tier)
          </h3>
          <p className="text-sm text-white/60 mb-4">
            Upgrade to Pro to access AI-powered recommendations for inventory optimization, trend forecasting, and revenue growth.
          </p>
          <Button className="px-4 py-2 bg-rose-400 hover:bg-rose-500 text-white text-sm font-medium rounded-lg transition-colors">
            Upgrade to Pro
          </Button>
        </div>
      </GlassPanel>
    );
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'border-rose-400/50 bg-rose-500/10';
      case 'medium':
        return 'border-amber-400/50 bg-amber-500/10';
      case 'low':
        return 'border-emerald-400/50 bg-emerald-500/10';
      default:
        return 'border-white/10 bg-white/5';
    }
  };

  return (
    <GlassPanel variant="elevated" className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">💡</span>
        <div>
          <h2 className="text-xl font-semibold text-white">AI Recommendations</h2>
          <p className="text-xs text-white/50">Powered by Vayva AI Engine</p>
        </div>
      </div>

      {recommendations.length === 0 && aiRecommendations.length === 0 ? (
        // Loading state
        loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-400 mx-auto mb-3"></div>
            <p className="text-sm text-white/60">Analyzing your data...</p>
            <p className="text-xs text-white/40 mt-1">AI is generating personalized recommendations</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-white/60">
              No recommendations at this time. Check back later for AI-powered insights.
            </p>
            <Button
              onClick={() => {
                setLoading(true);
                aiRecommendationEngine
                  .getAllRecommendations('store-id-placeholder')
                  .then((recs) => {
                    setAiRecommendations(recs);
                    setLoading(false);
                  })
                  .catch((error) => {
                    console.error('Error refreshing recommendations:', error);
                    setLoading(false);
                  });
              }}
              className="mt-3 px-4 py-2 bg-white/10 hover:bg-white/20 text-rose-400 text-sm font-medium rounded-lg transition-colors"
            >
              Refresh Insights
            </Button>
          </div>
        )
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className={`p-4 rounded-xl border ${getUrgencyColor(rec.urgency)} transition-all`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">
                      {rec.type === 'inventory' && '📦'}
                      {rec.type === 'pricing' && '💰'}
                      {rec.type === 'marketing' && '📣'}
                      {rec.type === 'collection' && '👗'}
                    </span>
                    <h3 className="text-sm font-semibold text-white">
                      {rec.title}
                    </h3>
                  </div>
                  <p className="text-sm text-white/70 mb-3">{rec.description}</p>
                  <p className="text-xs text-emerald-400 font-medium">
                    Predicted impact: {rec.predictedImpact}
                  </p>
                </div>
                <Button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-lg transition-colors whitespace-nowrap">
                  Take Action
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TODO: Implement "Generate New Insights" feature using AI agent */}
      {/* TODO: Add integration with demand forecasting service for better recommendations */}
    </GlassPanel>
  );
};

export default AIInsightsPanel;

