/**
 * Universal AI Insights Panel - Phase 4 Implementation
 * Production-ready predictive analytics and recommendations display
 * 
 * Features:
 * - Real-time AI-powered insights
 * - Predictive forecasts with confidence intervals
 * - Anomaly detection alerts
 * - Natural language query interface
 * - Actionable recommendations with one-click execution
 * 
 * @component AIInsightsPanelV2
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Target,
  Zap,
  Brain,
  RefreshCcw,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  MessageSquare,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Users,
  Package,
  ShoppingCart,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { apiJson } from '@/lib/api-client-shared';
import { toast } from 'sonner';
import type { IndustrySlug } from '@vayva/domain';

// ============================================================================
// Types
// ============================================================================

interface AIInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'info' | 'prediction' | 'recommendation' | 'anomaly';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  category: 'revenue' | 'inventory' | 'customer' | 'operations' | 'marketing' | 'financial';
  details?: string;
  recommendation?: string;
  predictedImpact?: string;
  actions?: Array<{ label: string; action: () => void; icon?: React.ReactNode }>;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

interface PredictiveForecast {
  metric: string;
  currentValue: number;
  predictedValue: number;
  changePercent: number;
  confidenceInterval: { low: number; high: number };
  timeframe: string;
  factors: string[];
  predictions?: Array<{ date: Date; value: number }>;
}

interface AnomalyDetectionResult {
  id: string;
  type: 'fraud' | 'irregularity' | 'outlier' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: Date;
  metric: string;
  expectedValue: number;
  actualValue: number;
  deviation: number;
  description: string;
  recommendedAction: string;
}

interface NLQueryResponse {
  answer: string;
  data: unknown;
  visualization?: 'chart' | 'table' | 'metric' | 'list';
  followUpQuestions?: string[];
}

interface APIResponse {
  insights: AIInsight[];
  forecasts: PredictiveForecast[];
  anomalies: AnomalyDetectionResult[];
  generatedAt: Date;
}

interface AIInsightsPanelProps {
  industry: IndustrySlug;
  storeId: string;
  planTier?: 'basic' | 'standard' | 'advanced' | 'pro' | 'pro_plus';
  onInsightAction?: (insight: AIInsight, action: string) => void;
  className?: string;
}

// ============================================================================
// Main Component
// ============================================================================

export const AIInsightsPanelV2: React.FC<AIInsightsPanelProps> = ({
  industry,
  storeId,
  planTier = 'standard',
  onInsightAction,
  className,
}) => {
  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'opportunities' | 'predictions' | 'alerts'>('all');
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [forecasts, setForecasts] = useState<PredictiveForecast[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyDetectionResult[]>([]);
  const [nlQuery, setNlQuery] = useState('');
  const [nlLoading, setNlLoading] = useState(false);
  const [nlResponse, setNlResponse] = useState<NLQueryResponse | null>(null);
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);

  // Fetch insights
  const fetchInsights = useCallback(async () => {
    try {
      const response = await apiJson<APIResponse>(
        `/api/ai/insights?industry=${industry}&storeId=${storeId}`
      );
      
      setInsights(response.insights || []);
      setForecasts(response.forecasts || []);
      setAnomalies(response.anomalies || []);
    } catch (error) {
      console.error('Failed to fetch AI insights:', error);
      toast.error('Failed to load AI insights');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [industry, storeId]);

  // Initial load
  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchInsights, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchInsights]);

  // Handle insight action
  const handleInsightAction = async (insight: AIInsight, action: string) => {
    try {
      await apiJson(`/api/ai/insights/${insight.id}/action`, {
        method: 'PUT',
        body: JSON.stringify({ id: insight.id, action }),
      });
      
      toast.success(`Action "${action}" executed successfully`);
      onInsightAction?.(insight, action);
      
      // Remove insight if it's a one-time action
      if (['completed', 'dismissed'].includes(action)) {
        setInsights(prev => prev.filter(i => i.id !== insight.id));
      }
    } catch (error) {
      console.error('Failed to execute action:', error);
      toast.error('Failed to execute action');
    }
  };

  // Handle natural language query
  const handleNLQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nlQuery.trim()) return;

    setNlLoading(true);
    setNlResponse(null);

    try {
      const response = await apiJson<NLQueryResponse>('/api/ai/natural-language-query', {
        method: 'POST',
        body: JSON.stringify({
          query: nlQuery,
          industry,
          context: { storeId },
        }),
      });

      setNlResponse(response);
      setNlQuery('');
    } catch (error) {
      console.error('Failed to process query:', error);
      toast.error('Failed to process query');
    } finally {
      setNlLoading(false);
    }
  };

  // Filter insights by tab
  const filteredInsights = insights.filter(insight => {
    switch (activeTab) {
      case 'opportunities':
        return insight.type === 'opportunity' || insight.type === 'recommendation';
      case 'predictions':
        return insight.type === 'prediction';
      case 'alerts':
        return insight.type === 'warning' || insight.type === 'anomaly';
      default:
        return true;
    }
  });

  // Get insight icon
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <Target className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'prediction':
        return <Sparkles className="w-5 h-5 text-purple-600" />;
      case 'recommendation':
        return <Lightbulb className="w-5 h-5 text-blue-600" />;
      case 'anomaly':
        return <Zap className="w-5 h-5 text-red-600" />;
      default:
        return <Brain className="w-5 h-5 text-gray-600" />;
    }
  };

  // Get impact badge color
  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  // Loading state
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <CardTitle>AI Insights</CardTitle>
              <CardDescription>Loading intelligent recommendations...</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                AI-Powered Insights
                {planTier !== 'basic' && (
                  <Badge variant="secondary" className="text-xs">
                    Pro
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Predictive analytics and smart recommendations
              </CardDescription>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={fetchInsights}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mt-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Natural Language Query */}
        {planTier !== 'basic' && (
          <form onSubmit={handleNLQuery} className="space-y-3">
            <div className="relative">
              <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={nlQuery}
                onChange={(e) => setNlQuery(e.target.value)}
                placeholder="Ask anything about your business... (e.g., 'Show me revenue trends')"
                className="pl-10 pr-24 py-6 text-sm"
                disabled={nlLoading}
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                disabled={nlLoading || !nlQuery.trim()}
              >
                {nlLoading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>

            {nlResponse && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200"
              >
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-purple-900 mb-2">{nlResponse.answer}</p>
                    {nlResponse.followUpQuestions && (
                      <div className="space-y-1">
                        <p className="text-xs text-purple-700 font-medium">Follow-up questions:</p>
                        {nlResponse.followUpQuestions.map((q, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setNlQuery(q)}
                            className="block text-xs text-purple-600 hover:text-purple-800 hover:underline text-left"
                          >
                            → {q}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </form>
        )}

        {/* Anomalies/Alerts */}
        {anomalies.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Critical Alerts
            </h3>
            {anomalies.map((anomaly) => (
              <Alert key={anomaly.id} variant="destructive" className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription>
                  <div className="font-medium">{anomaly.description}</div>
                  <div className="text-sm mt-1">{anomaly.recommendedAction}</div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Forecasts */}
        {forecasts.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              Predictive Forecasts
            </h3>
            {forecasts.map((forecast) => (
              <div
                key={forecast.metric}
                className="p-4 bg-gradient-to-br from-purple-50 to-green-50 rounded-lg border border-purple-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium capitalize">{forecast.metric}</span>
                  <Badge variant={forecast.changePercent >= 0 ? 'default' : 'destructive'}>
                    {forecast.changePercent >= 0 ? '+' : ''}{forecast.changePercent.toFixed(1)}%
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <div className="text-xs text-gray-500">Current</div>
                    <div className="text-lg font-bold">${forecast.currentValue.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Predicted</div>
                    <div className="text-lg font-bold text-green-600">
                      ${Math.round(forecast.predictedValue).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Confidence</div>
                    <div className="text-lg font-bold text-purple-600">
                      {forecast.accuracy?.toFixed(0) || 80}%
                    </div>
                  </div>
                </div>

                {forecast.predictions && forecast.predictions.length > 0 && (
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={forecast.predictions.map(p => ({
                        date: p.date.toLocaleDateString(),
                        value: p.value,
                      }))}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="date" hide />
                        <YAxis hide />
                        <Tooltip
                          formatter={(value: number) => `$${value.toLocaleString()}`}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <ReferenceLine y={forecast.currentValue} stroke="#6B7280" strokeDasharray="3 3" />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#8B5CF6"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorValue)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {forecast.factors && forecast.factors.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {forecast.factors.map((factor, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Insights Feed */}
        {filteredInsights.length > 0 ? (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredInsights.map((insight) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    className={`overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                      expandedInsight === insight.id ? 'ring-2 ring-purple-200' : ''
                    }`}
                    onClick={() => setExpandedInsight(expandedInsight === insight.id ? null : insight.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getInsightIcon(insight.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                            <Badge className={`${getImpactBadge(insight.impact)} text-xs`}>
                              {insight.impact} impact
                            </Badge>
                          </div>

                          <p className="text-sm text-gray-600 mb-2">{insight.description}</p>

                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full transition-all duration-300"
                                style={{ width: `${insight.confidence * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">
                              {(insight.confidence * 100).toFixed(0)}% confidence
                            </span>
                          </div>

                          {/* Expanded Details */}
                          {expandedInsight === insight.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="space-y-3 pt-3 border-t"
                            >
                              {insight.details && (
                                <div>
                                  <h5 className="font-medium text-sm mb-1">Details</h5>
                                  <p className="text-sm text-gray-600">{insight.details}</p>
                                </div>
                              )}

                              {insight.recommendation && (
                                <div>
                                  <h5 className="font-medium text-sm mb-1">Recommendation</h5>
                                  <p className="text-sm text-gray-600">{insight.recommendation}</p>
                                </div>
                              )}

                              {insight.predictedImpact && (
                                <div>
                                  <h5 className="font-medium text-sm mb-1">Predicted Impact</h5>
                                  <p className="text-sm font-semibold text-green-600">
                                    {insight.predictedImpact}
                                  </p>
                                </div>
                              )}

                              {insight.actions && insight.actions.length > 0 && (
                                <div className="flex gap-2 pt-2">
                                  {insight.actions.map((action, idx) => (
                                    <Button
                                      key={idx}
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleInsightAction(insight, action.label);
                                      }}
                                      className="text-xs"
                                    >
                                      {action.icon}
                                      <span className="ml-1">{action.label}</span>
                                    </Button>
                                  ))}
                                </div>
                              )}
                            </motion.div>
                          )}

                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <ChevronDown
                              className={`w-4 h-4 transition-transform ${
                                expandedInsight === insight.id ? 'rotate-180' : ''
                              }`}
                            />
                            <span>Click to {expandedInsight === insight.id ? 'collapse' : 'expand'}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No insights available at this time</p>
            <p className="text-sm mt-1">Check back later or refresh for new recommendations</p>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-purple-600" />
            <span>Powered by Vayva AI Analytics</span>
          </div>
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInsightsPanelV2;
