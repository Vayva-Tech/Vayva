// @ts-nocheck
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Brain, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface ForecastData {
  date: string;
  predicted: number;
  actual?: number;
  lowerBound?: number;
  upperBound?: number;
}

interface Insight {
  id: string;
  type: 'opportunity' | 'warning' | 'info';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
}

interface AIInsightsPanelProps {
  forecast?: ForecastData[];
  insights?: Insight[];
  accuracy?: number;
  className?: string;
}

export function AIInsightsPanel({ 
  forecast = [], 
  insights = [], 
  accuracy = 0.92,
  className 
}: AIInsightsPanelProps) {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default: return <Brain className="w-4 h-4 text-blue-600" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-amber-200 bg-orange-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-gray-100 text-gray-800';
    }
  };

  // Generate sample forecast data if none provided
  const sampleForecast = forecast.length > 0 ? forecast : generateSampleForecast();
  const sampleInsights = insights.length > 0 ? insights : generateSampleInsights();

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-green-500" />
            <CardTitle className="text-lg font-semibold">AI Insights & Forecasting</CardTitle>
          </div>
          <Badge variant="outline" className="flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-600" />
            {accuracy >= 0.95 ? 'Excellent' : accuracy >= 0.9 ? 'Very Good' : 'Good'} Accuracy
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Prediction Accuracy */}
        <div className="p-4 border rounded-lg bg-gradient-to-r from-green-500/5 to-green-500/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Model Accuracy</span>
            <span className="text-2xl font-bold text-green-500">{(accuracy * 100).toFixed(1)}%</span>
          </div>
          <div className="text-xs text-gray-500">
            Based on last 30 days predictions vs actual performance
          </div>
        </div>

        {/* Demand Forecast Chart */}
        <div>
          <h3 className="font-semibold text-sm mb-3">14-Day Demand Forecast</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sampleForecast}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [
                    `$${value.toLocaleString()}`,
                    'Predicted Revenue'
                  ]}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                />
                <Area 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                {sampleForecast.some(d => d.actual !== undefined) && (
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#10B981" 
                    strokeWidth={2} 
                    dot={false}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span>Predicted</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span>Actual</span>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">AI-Powered Insights</h3>
          {sampleInsights.map((insight) => (
            <div
              key={insight.id}
              className={`p-3 border rounded-lg ${getInsightColor(insight.type)} transition-all hover:shadow-md`}
            >
              <div className="flex items-start gap-3">
                {getInsightIcon(insight.type)}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{insight.title}</span>
                    <Badge className={`${getImpactBadge(insight.impact)} text-xs`}>
                      {insight.impact} impact
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{insight.description}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${insight.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {(insight.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper functions for sample data
function generateSampleForecast(): ForecastData[] {
  const today = new Date();
  const forecast: ForecastData[] = [];
  
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    forecast.push({
      date: date.toISOString().split('T')[0],
      predicted: Math.random() * 5000 + 3000,
      actual: i < 3 ? Math.random() * 5000 + 3000 : undefined,
    });
  }
  
  return forecast;
}

function generateSampleInsights(): Insight[] {
  return [
    {
      id: '1',
      type: 'opportunity',
      title: 'Weekend Sales Surge Expected',
      description: 'Based on historical patterns and current trends, expect 35% higher sales this weekend.',
      confidence: 0.87,
      impact: 'high',
    },
    {
      id: '2',
      type: 'warning',
      title: 'Low Stock Alert: Best Sellers',
      description: 'Top 3 products may run out of stock in 5-7 days based on current velocity.',
      confidence: 0.92,
      impact: 'high',
    },
    {
      id: '3',
      type: 'info',
      title: 'Optimal Reorder Time',
      description: 'Best time to restock inventory is Tuesday-Thursday for minimal disruption.',
      confidence: 0.78,
      impact: 'medium',
    },
  ];
}
