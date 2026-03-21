// @ts-nocheck
/**
 * AI Insights Dashboard
 * Intelligent recommendations, predictions, and anomaly detection
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Lightbulb,
  TrendingUp,
  Warning,
  CheckCircle,
  XCircle,
  ChartLine,
  Brain,
  Target,
  Rocket,
  MagicWand,
  Clock,
  Users,
  ShoppingCart,
  CurrencyDollar
} from '@phosphor-icons/react';
import { useSWR } from 'swr';
import { apiJson } from '@/lib/api-client-shared';
import { GradientHeader, ThemedCard, getThemeColors } from '@/lib/design-system/theme-components';
import { useStore } from '@/providers/store-provider';
import { toast } from 'sonner';

// Types
interface AIRecommendation {
  id: string;
  type: 'opportunity' | 'risk' | 'optimization' | 'alert';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  confidence: number; // 0-100%
  impact: 'high' | 'medium' | 'low';
  action: string;
  relatedMetric?: string;
  timeframe?: string;
  createdAt: string;
}

interface PredictionModel {
  id: string;
  name: string;
  type: 'demand' | 'churn' | 'ltv' | 'conversion';
  status: 'active' | 'training' | 'paused';
  accuracy: number; // percentage
  lastTrained: string;
  nextTraining: string;
  predictions: {
    date: string;
    predicted: number;
    actual?: number;
    confidence: number;
  }[];
}

interface Anomaly {
  id: string;
  type: 'revenue' | 'traffic' | 'conversion' | 'inventory';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  currentValue: number;
  expectedValue: number;
  deviation: number; // percentage
  detectedAt: string;
  resolved: boolean;
  resolution?: string;
}

interface AISummary {
  recommendationsCount: number;
  activeModels: number;
  anomaliesDetected: number;
  avgConfidence: number;
  insightsGenerated: number;
}

// Main AI Insights Dashboard
export default function AIInsightsDashboard() {
  const { store } = useStore();
  const colors = getThemeColors(store?.industrySlug || 'default');
  const [activeTab, setActiveTab] = useState<'recommendations' | 'predictions' | 'anomalies'>('recommendations');
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('7d');

  // Fetch AI summary
  const { data: summary, isLoading: summaryLoading } = useSWR<AISummary>(
    '/api/ai-insights/summary',
    async (url: string) => {
      try {
        const response = await apiJson<AISummary>(url);
        return response;
      } catch (error) {
        console.error('Failed to fetch AI summary:', error);
        toast.error('Failed to load AI insights');
        return null;
      }
    }
  );

  // Fetch recommendations
  const { data: recommendations, isLoading: recLoading } = useSWR<AIRecommendation[]>(
    `/api/ai-insights/recommendations?range=${timeframe}`,
    async (url: string) => {
      try {
        const response = await apiJson<{ recommendations: AIRecommendation[] }>(url);
        return response.recommendations || [];
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
        return [];
      }
    }
  );

  // Fetch predictions
  const { data: predictions, isLoading: predLoading } = useSWR<PredictionModel[]>(
    '/api/ai-insights/predictions',
    async (url: string) => {
      try {
        const response = await apiJson<{ models: PredictionModel[] }>(url);
        return response.models || [];
      } catch (error) {
        console.error('Failed to fetch predictions:', error);
        return [];
      }
    }
  );

  // Fetch anomalies
  const { data: anomalies, isLoading: anomLoading } = useSWR<Anomaly[]>(
    `/api/ai-insights/anomalies?range=${timeframe}`,
    async (url: string) => {
      try {
        const response = await apiJson<{ anomalies: Anomaly[] }>(url);
        return response.anomalies || [];
      } catch (error) {
        console.error('Failed to fetch anomalies:', error);
        return [];
      }
    }
  );

  const tabs = [
    { id: 'recommendations', label: 'Recommendations', icon: <Lightbulb className="h-4 w-4" /> },
    { id: 'predictions', label: 'Predictions', icon: <ChartLine className="h-4 w-4" /> },
    { id: 'anomalies', label: 'Anomalies', icon: <Warning className="h-4 w-4" /> }
  ];

  return (
    <div className="space-y-6">
      <GradientHeader
        title="AI Insights Engine"
        subtitle="Intelligent recommendations, predictions, and anomaly detection"
        industry={store?.industrySlug || 'default'}
        icon={<Brain className="h-8 w-8" />}
      />

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-gray-100 hover:bg-gray-100 text-gray-500'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        
        <select 
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value as any)}
          className="px-4 py-2 border border-gray-100 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>

      {/* Overview Cards */}
      {!summaryLoading && summary && (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-5 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Recommendations</p>
                <p className="text-2xl font-bold" style={{ color: colors.primary }}>
                  {summary.recommendationsCount}
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.primary}15` }}>
                <Lightbulb className="h-6 w-6" style={{ color: colors.primary }} />
              </div>
            </div>
          </ThemedCard>
          
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Models</p>
                <p className="text-2xl font-bold" style={{ color: colors.secondary }}>
                  {summary.activeModels}
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.secondary}15` }}>
                <Brain className="h-6 w-6" style={{ color: colors.secondary }} />
              </div>
            </div>
          </ThemedCard>
          
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Anomalies</p>
                <p className="text-2xl font-bold" style={{ color: colors.accent }}>
                  {summary.anomaliesDetected}
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.accent}15` }}>
                <Warning className="h-6 w-6" style={{ color: colors.accent }} />
              </div>
            </div>
          </ThemedCard>
          
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Avg Confidence</p>
                <p className="text-2xl font-bold" style={{ color: colors.primary }}>
                  {summary.avgConfidence}%
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.primary}15` }}>
                <Target className="h-6 w-6" style={{ color: colors.primary }} />
              </div>
            </div>
          </ThemedCard>
          
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Insights Generated</p>
                <p className="text-2xl font-bold" style={{ color: colors.secondary }}>
                  {summary.insightsGenerated?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.secondary}15` }}>
                <Sparkles className="h-6 w-6" style={{ color: colors.secondary }} />
              </div>
            </div>
          </ThemedCard>
        </motion.div>
      )}

      {/* Tab Content */}
      {activeTab === 'recommendations' && (
        <RecommendationFeed 
          recommendations={recommendations || []}
          loading={recLoading}
        />
      )}
      
      {activeTab === 'predictions' && (
        <PredictionDashboard 
          predictions={predictions || []}
          loading={predLoading}
        />
      )}
      
      {activeTab === 'anomalies' && (
        <AnomalyDetection 
          anomalies={anomalies || []}
          loading={anomLoading}
        />
      )}
    </div>
  );
}

// Recommendation Feed Component
function RecommendationFeed({ recommendations, loading }: { recommendations: AIRecommendation[]; loading: boolean }) {
  const { store } = useStore();

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <Target className="h-5 w-5 text-green-600" />;
      case 'risk': return <Warning className="h-5 w-5 text-red-600" />;
      case 'optimization': return <MagicWand className="h-5 w-5 text-blue-600" />;
      case 'alert': return <Bell className="h-5 w-5 text-orange-600" />;
      default: return <Lightbulb className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {recommendations.map((rec: AIRecommendation, index: number) => (
        <motion.div
          key={rec.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {getTypeIcon(rec.type)}
                <div>
                  <h3 className="font-semibold">{rec.title}</h3>
                  <p className="text-sm text-gray-500">{rec.description}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                  {rec.priority} priority
                </span>
                <div className="flex items-center gap-1">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  <span className="text-xs text-gray-500">{rec.confidence}%</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4 text-sm">
                {rec.relatedMetric && (
                  <span className="px-2 py-1 bg-gray-100 rounded-full">
                    {rec.relatedMetric}
                  </span>
                )}
                {rec.timeframe && (
                  <span className="text-gray-500">{rec.timeframe}</span>
                )}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                rec.impact === 'high' ? 'bg-red-100 text-red-800' :
                rec.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {rec.impact} impact
              </span>
            </div>
            
            <button className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:opacity-90 transition-opacity font-medium">
              {rec.action}
            </button>
          </ThemedCard>
        </motion.div>
      ))}
    </div>
  );
}

// Prediction Dashboard Component
function PredictionDashboard({ predictions, loading }: { predictions: PredictionModel[]; loading: boolean }) {
  const { store } = useStore();

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1,2].map(i => (
          <div key={i} className="h-80 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'demand': return <ShoppingCart className="h-5 w-5 text-blue-600" />;
      case 'churn': return <Users className="h-5 w-5 text-red-600" />;
      case 'ltv': return <CurrencyDollar className="h-5 w-5 text-green-600" />;
      case 'conversion': return <TrendingUp className="h-5 w-5 text-purple-600" />;
      default: return <ChartLine className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {predictions.map((model: PredictionModel, index: number) => (
        <motion.div
          key={model.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {getTypeIcon(model.type)}
                <div>
                  <h3 className="font-semibold">{model.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{model.type} prediction</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  model.status === 'active' ? 'bg-green-100 text-green-800' :
                  model.status === 'training' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {model.status}
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  {model.accuracy}% accuracy
                </span>
              </div>
            </div>
            
            {/* Prediction Chart Visualization */}
            <div className="h-48 bg-gradient-to-br from-muted/20 to-muted/5 rounded-xl border border-gray-100 mb-4 flex items-center justify-center">
              <div className="text-center">
                <ChartLine className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                <p className="text-sm text-gray-500">Prediction trend visualization</p>
                <p className="text-xs text-gray-500 mt-1">
                  Accuracy: {model.accuracy}%
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Last Trained</p>
                <p className="font-medium">{new Date(model.lastTrained).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Next Training</p>
                <p className="font-medium">{new Date(model.nextTraining).toLocaleDateString()}</p>
              </div>
            </div>
          </ThemedCard>
        </motion.div>
      ))}
    </div>
  );
}

// Anomaly Detection Component
function AnomalyDetection({ anomalies, loading }: { anomalies: Anomaly[]; loading: boolean }) {
  const { store } = useStore();

  if (loading) {
    return (
      <ThemedCard industry={store?.industrySlug || 'default'}>
        <div className="space-y-4">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </ThemedCard>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning': return <Warning className="h-5 w-5 text-yellow-600" />;
      case 'info': return <Info className="h-5 w-5 text-blue-600" />;
      default: return <Warning className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <ThemedCard industry={store?.industrySlug || 'default'}>
      <h3 className="font-semibold mb-6 flex items-center gap-2">
        <Warning className="h-5 w-5" />
        Detected Anomalies
      </h3>
      
      <div className="space-y-4">
        {anomalies.map((anomaly: Anomaly, index: number) => (
          <motion.div
            key={anomaly.id}
            className={`p-4 border rounded-xl ${getSeverityColor(anomaly.severity)}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {getSeverityIcon(anomaly.severity)}
                <div>
                  <h4 className="font-medium">{anomaly.title}</h4>
                  <p className="text-sm opacity-80">{anomaly.description}</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(anomaly.severity)}`}>
                  {anomaly.severity}
                </span>
                {!anomaly.resolved && (
                  <button className="mt-2 px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:opacity-90 transition-opacity">
                    Resolve
                  </button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
              <div>
                <p className="text-gray-500">Current Value</p>
                <p className="font-medium">{anomaly.currentValue?.toLocaleString() || '0'}</p>
              </div>
              <div>
                <p className="text-gray-500">Expected Value</p>
                <p className="font-medium">{anomaly.expectedValue?.toLocaleString() || '0'}</p>
              </div>
              <div>
                <p className="text-gray-500">Deviation</p>
                <p className={`font-medium ${anomaly.deviation > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {anomaly.deviation > 0 ? '+' : ''}{anomaly.deviation}%
                </p>
              </div>
              <div>
                <p className="text-gray-500">Detected</p>
                <p className="font-medium">{new Date(anomaly.detectedAt).toLocaleTimeString()}</p>
              </div>
            </div>
            
            {anomaly.resolution && (
              <div className="p-3 bg-white/50 rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">Resolution:</span> {anomaly.resolution}
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </ThemedCard>
  );
}