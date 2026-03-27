/**
 * Price Optimization Component - Grocery Industry
 * Competitive price comparison and AI-powered pricing recommendations
 */

import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, TrendingUp, Shield, Tag } from 'lucide-react';
import { Button } from '@vayva/ui/components/ui/button';
import { Badge } from '@vayva/ui/components/ui/badge';

export interface CompetitorPrice {
  store: string;
  price: number;
  difference: number;
}

export interface PriceOptimizationSuggestion {
  productId: string;
  productName: string;
  currentPrice: number;
  competitorPrices: CompetitorPrice[];
  suggestedAction: 'match' | 'increase' | 'clearance';
  marginImpact: number;
  elasticityScore: number;
  category?: string;
  brand?: string;
  recommendedPrice?: number;
}

export interface PriceOptimizationProps {
  comparisons: Array<{
    productId: string;
    productName: string;
    ourPrice: number;
    competitorAvg: number;
    difference: number;
  }>;
  suggestions: PriceOptimizationSuggestion[];
}

export function PriceOptimization({ comparisons, suggestions }: Props) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'match': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'increase': return 'bg-green-100 text-green-700 border-green-200';
      case 'clearance': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'match': return <ArrowDownRight className="h-3 w-3" />;
      case 'increase': return <TrendingUp className="h-3 w-3" />;
      case 'clearance': return <Shield className="h-3 w-3" />;
    }
  };

  const getPriceChangeIndicator = (difference: number) => {
    if (difference > 0) {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <ArrowUpRight className="h-3 w-3" />
          <span className="text-xs font-semibold">+${Math.abs(difference).toFixed(2)}</span>
        </div>
      );
    } else if (difference < 0) {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <ArrowDownRight className="h-3 w-3" />
          <span className="text-xs font-semibold">-${Math.abs(difference).toFixed(2)}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-gray-400">
        <Minus className="h-3 w-3" />
        <span className="text-xs">Matched</span>
      </div>
    );
  };

  const handleApplyPrice = (productId: string, action: string) => {
    setSelectedAction(productId);
    setTimeout(() => setSelectedAction(null), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span>📊</span>
          Price Optimization
        </h3>
        <Badge variant="outline" className="text-xs">
          {comparisons.length} Products Tracked
        </Badge>
      </div>

      {/* Price Summary Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">Below Market</p>
          <p className="text-lg font-bold text-green-600">
            {comparisons.filter(c => c.difference < 0).length}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">At Market</p>
          <p className="text-lg font-bold text-blue-600">
            {comparisons.filter(c => c.difference === 0).length}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">Above Market</p>
          <p className="text-lg font-bold text-red-600">
            {comparisons.filter(c => c.difference > 0).length}
          </p>
        </div>
      </div>

      {/* Price Recommendations */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {suggestions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Tag className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>No price optimization opportunities</p>
            <p className="text-xs mt-1">All prices are competitive</p>
          </div>
        ) : (
          suggestions.slice(0, 5).map((suggestion) => (
            <div 
              key={suggestion.productId} 
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedAction === suggestion.productId 
                  ? 'bg-green-50 border-green-300' 
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{suggestion.productName}</p>
                  {suggestion.category && (
                    <p className="text-xs text-gray-600">{suggestion.category} {suggestion.brand && `• ${suggestion.brand}`}</p>
                  )}
                </div>
                <Badge className={`${getActionColor(suggestion.suggestedAction)} border`}>
                  {getActionIcon(suggestion.suggestedAction)}
                  <span className="ml-1 capitalize">{suggestion.suggestedAction}</span>
                </Badge>
              </div>
              
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Our Price</p>
                    <p className="text-sm font-bold text-gray-900">${suggestion.currentPrice.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Market Avg</p>
                    <p className="text-sm font-bold text-gray-700">
                      ${(suggestion.competitorPrices.reduce((sum, c) => sum + c.price, 0) / suggestion.competitorPrices.length).toFixed(2)}
                    </p>
                  </div>
                  {getPriceChangeIndicator(
                    suggestion.currentPrice - (suggestion.competitorPrices.reduce((sum, c) => sum + c.price, 0) / suggestion.competitorPrices.length)
                  )}
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-600 mb-1">Margin Impact</p>
                  <p className={`text-sm font-bold ${suggestion.marginImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {suggestion.marginImpact >= 0 ? '+' : ''}{suggestion.marginImpact.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Competitor Breakdown */}
              {suggestion.competitorPrices.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Competitor Prices:</p>
                  <div className="flex gap-2 flex-wrap">
                    {suggestion.competitorPrices.slice(0, 3).map((competitor, idx) => (
                      <div key={idx} className="px-2 py-1 bg-white rounded border border-gray-200">
                        <span className="text-xs font-medium text-gray-700">{competitor.store}: </span>
                        <span className="text-xs font-bold text-gray-900">${competitor.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button */}
              {suggestion.recommendedPrice && (
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-gray-600">
                    Recommended: <span className="font-bold text-green-600">${suggestion.recommendedPrice.toFixed(2)}</span>
                  </p>
                  <Button 
                    size="sm" 
                    variant={selectedAction === suggestion.productId ? 'default' : 'outline'}
                    onClick={() => handleApplyPrice(suggestion.productId, suggestion.suggestedAction)}
                    disabled={selectedAction !== null && selectedAction !== suggestion.productId}
                    className="h-7 text-xs"
                  >
                    {selectedAction === suggestion.productId ? '✓ Applied' : 'Apply'}
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Elasticity Insights */}
      {suggestions.some(s => s.elasticityScore > 0) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-600 mb-2">💡 Price Elasticity Insights:</p>
          <div className="space-y-1">
            {suggestions.filter(s => s.elasticityScore > 0.7).slice(0, 2).map(suggestion => (
              <p key={suggestion.productId} className="text-xs text-gray-700">
                <span className="font-semibold">{suggestion.productName}</span>: High elasticity ({suggestion.elasticityScore.toFixed(2)}) - small price changes significantly impact demand
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
