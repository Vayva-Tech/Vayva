/**
 * Predictive Analytics Dashboard
 * Demand forecasting, churn prediction, and lifetime value modeling
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users,
  ShoppingCart,
  CurrencyDollar,
  Clock,
  Target,
  ChartLine,
  BarChart,
  PieChart,
  Calendar,
  Rocket,
  Warning,
  CheckCircle
} from '@phosphor-icons/react';
import { useSWR } from 'swr';
import { apiJson } from '@/lib/api-client-shared';
import { GradientHeader, ThemedCard, getThemeColors } from '@/lib/design-system/theme-components';
import { useStore } from '@/providers/store-provider';
import { toast } from 'sonner';

// Types
interface DemandForecast {
  date: string;
  predictedDemand: number;
  actualDemand?: number;
  confidence: number; // 0-100%
  seasonalityFactor: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface ChurnPrediction {
  customerId: string;
  customerName: string;
  churnProbability: number; // 0-100%
  riskLevel: 'high' | 'medium' | 'low';
  lastPurchase: string;
  daysSinceLastPurchase: number;
  predictedChurnDate: string;
  retentionActions: string[];
}

interface LifetimeValuePrediction {
  customerId: string;
  customerName: string;
  currentLTV: number;
  predictedLTV: number;
  confidence: number;
  timeframe: '30d' | '90d' | '1y';
  growthPotential: 'high' | 'medium' | 'low';
  recommendedActions: string[];
}

interface PredictiveSummary {
  totalCustomers: number;
  highRiskChurn: number;
  avgLTVGrowth: number;
  demandAccuracy: number;
  forecastHorizon: string;
}

// Main Predictive Analytics Dashboard
export default function PredictiveAnalyticsDashboard() {
  const { store } = useStore();
  const colors = getThemeColors(store?.industrySlug || 'default');
  const [activeTab, setActiveTab] = useState<'demand' | 'churn' | 'ltv'>('demand');
  const [timeframe, setTimeframe] = useState<'30d' | '90d' | '1y'>('90d');

  // Fetch predictive summary
  const { data: summary, isLoading: summaryLoading } = useSWR<PredictiveSummary>(
    '/api/predictive/summary',
    async (url: string) => {
      try {
        const response = await apiJson<PredictiveSummary>(url);
        return response;
      } catch (error) {
        console.error('Failed to fetch predictive summary:', error);
        toast.error('Failed to load predictive analytics');
        return null;
      }
    }
  );

  // Fetch demand forecasts
  const { data: demandForecasts, isLoading: demandLoading } = useSWR<DemandForecast[]>(
    `/api/predictive/demand?horizon=${timeframe}`,
    async (url: string) => {
      try {
        const response = await apiJson<{ forecasts: DemandForecast[] }>(url);
        return response.forecasts || [];
      } catch (error) {
        console.error('Failed to fetch demand forecasts:', error);
        return [];
      }
    }
  );

  // Fetch churn predictions
  const { data: churnPredictions, isLoading: churnLoading } = useSWR<ChurnPrediction[]>(
    `/api/predictive/churn?range=${timeframe}`,
    async (url: string) => {
      try {
        const response = await apiJson<{ predictions: ChurnPrediction[] }>(url);
        return response.predictions || [];
      } catch (error) {
        console.error('Failed to fetch churn predictions:', error);
        return [];
      }
    }
  );

  // Fetch LTV predictions
  const { data: ltvPredictions, isLoading: ltvLoading } = useSWR<LifetimeValuePrediction[]>(
    `/api/predictive/lifetime-value?range=${timeframe}`,
    async (url: string) => {
      try {
        const response = await apiJson<{ predictions: LifetimeValuePrediction[] }>(url);
        return response.predictions || [];
      } catch (error) {
        console.error('Failed to fetch LTV predictions:', error);
        return [];
      }
    }
  );

  const tabs = [
    { id: 'demand', label: 'Demand Forecast', icon: <ShoppingCart className="h-4 w-4" /> },
    { id: 'churn', label: 'Churn Prediction', icon: <Users className="h-4 w-4" /> },
    { id: 'ltv', label: 'Lifetime Value', icon: <CurrencyDollar className="h-4 w-4" /> }
  ];

  return (
    <div className="space-y-6">
      <GradientHeader
        title="Predictive Analytics"
        subtitle="Forecast demand, predict churn, and model customer lifetime value"
        industry={store?.industrySlug || 'default'}
        icon={<TrendingUp className="h-8 w-8" />}
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
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
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
          className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="30d">30 Days</option>
          <option value="90d">90 Days</option>
          <option value="1y">1 Year</option>
        </select>
      </div>

      {/* Overview Cards */}
      {!summaryLoading && summary && (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold" style={{ color: colors.primary }}>
                  {summary.totalCustomers?.toLocaleString() || '0'}
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.primary}15` }}>
                <Users className="h-6 w-6" style={{ color: colors.primary }} />
              </div>
            </div>
          </ThemedCard>
          
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Risk Churn</p>
                <p className="text-2xl font-bold" style={{ color: colors.secondary }}>
                  {summary.highRiskChurn}
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.secondary}15` }}>
                <Warning className="h-6 w-6" style={{ color: colors.secondary }} />
              </div>
            </div>
          </ThemedCard>
          
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg LTV Growth</p>
                <p className="text-2xl font-bold" style={{ color: colors.accent }}>
                  +{summary.avgLTVGrowth}%
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.accent}15` }}>
                <TrendingUp className="h-6 w-6" style={{ color: colors.accent }} />
              </div>
            </div>
          </ThemedCard>
          
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Forecast Accuracy</p>
                <p className="text-2xl font-bold" style={{ color: colors.primary }}>
                  {summary.demandAccuracy}%
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.primary}15` }}>
                <Target className="h-6 w-6" style={{ color: colors.primary }} />
              </div>
            </div>
          </ThemedCard>
        </motion.div>
      )}

      {/* Tab Content */}
      {activeTab === 'demand' && (
        <DemandForecastView 
          forecasts={demandForecasts || []}
          loading={demandLoading}
          timeframe={timeframe}
        />
      )}
      
      {activeTab === 'churn' && (
        <ChurnPredictionView 
          predictions={churnPredictions || []}
          loading={churnLoading}
        />
      )}
      
      {activeTab === 'ltv' && (
        <LifetimeValueView 
          predictions={ltvPredictions || []}
          loading={ltvLoading}
        />
      )}
    </div>
  );
}

// Demand Forecast View Component
function DemandForecastView({ forecasts, loading, timeframe }: { forecasts: DemandForecast[]; loading: boolean; timeframe: string }) {
  const { store } = useStore();

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="h-96 bg-muted rounded-xl animate-pulse" />
        </div>
        <div>
          <div className="space-y-6">
            {[1,2,3].map(i => (
              <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calculate trend statistics
  const trendData = forecasts.reduce((acc, forecast) => {
    acc.total += forecast.predictedDemand;
    if (forecast.trend === 'increasing') acc.increasing++;
    else if (forecast.trend === 'decreasing') acc.decreasing++;
    else acc.stable++;
    return acc;
  }, { total: 0, increasing: 0, decreasing: 0, stable: 0 });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Forecast Chart */}
      <div className="lg:col-span-2">
        <ThemedCard industry={store?.industrySlug || 'default'}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold flex items-center gap-2">
              <ChartLine className="h-5 w-5" />
              Demand Forecast ({timeframe})
            </h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Predicted</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Actual</span>
              </div>
            </div>
          </div>
          
          <div className="h-80 bg-gradient-to-br from-muted/20 to-muted/5 rounded-xl border border-border flex items-center justify-center">
            <div className="text-center">
              <BarChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="font-medium">Demand Forecast Visualization</p>
              <p className="text-sm text-muted-foreground mt-1">
                Total predicted demand: {trendData.total?.toLocaleString() || '0'} units
              </p>
            </div>
          </div>
        </ThemedCard>
      </div>

      {/* Forecast Insights */}
      <div className="space-y-6">
        <ThemedCard industry={store?.industrySlug || 'default'}>
          <h3 className="font-semibold mb-4">Forecast Insights</h3>
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Increasing Trends</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{trendData.increasing}</p>
              <p className="text-xs text-muted-foreground">Periods showing growth</p>
            </div>
            
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="font-medium">Stable Periods</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600">{trendData.stable}</p>
              <p className="text-xs text-muted-foreground">Consistent demand patterns</p>
            </div>
            
            <div className="p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
                <span className="font-medium">Decreasing Trends</span>
              </div>
              <p className="text-2xl font-bold text-red-600">{trendData.decreasing}</p>
              <p className="text-xs text-muted-foreground">Periods showing decline</p>
            </div>
          </div>
        </ThemedCard>

        <ThemedCard industry={store?.industrySlug || 'default'}>
          <h3 className="font-semibold mb-4">Seasonal Factors</h3>
          <div className="space-y-3">
            {forecasts.slice(0, 3).map((forecast, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm">{new Date(forecast.date).toLocaleDateString()}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{forecast.seasonalityFactor}x</span>
                  <div className="w-16 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${Math.min(100, forecast.seasonalityFactor * 25)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ThemedCard>
      </div>
    </div>
  );
}

// Churn Prediction View Component
function ChurnPredictionView({ predictions, loading }: { predictions: ChurnPrediction[]; loading: boolean }) {
  const { store } = useStore();

  if (loading) {
    return (
      <ThemedCard industry={store?.industrySlug || 'default'}>
        <div className="space-y-4">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </ThemedCard>
    );
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ThemedCard industry={store?.industrySlug || 'default'}>
      <h3 className="font-semibold mb-6 flex items-center gap-2">
        <Users className="h-5 w-5" />
        Churn Risk Analysis
      </h3>
      
      <div className="space-y-4">
        {predictions.map((prediction: ChurnPrediction, index: number) => (
          <motion.div
            key={prediction.customerId}
            className="p-4 border border-border rounded-xl hover:bg-muted/30 transition-colors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium">{prediction.customerName}</h4>
                <p className="text-sm text-muted-foreground">
                  Last purchase: {new Date(prediction.lastPurchase).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(prediction.riskLevel)}`}>
                  {prediction.riskLevel} risk
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  {prediction.daysSinceLastPurchase} days ago
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-muted-foreground">Churn Probability</p>
                <p className="font-bold text-lg">{prediction.churnProbability}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Predicted Churn</p>
                <p className="font-medium">{new Date(prediction.predictedChurnDate).toLocaleDateString()}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-muted-foreground">Recommended Actions</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {prediction.retentionActions.slice(0, 2).map((action, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                      {action}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full" 
                style={{ width: `${prediction.churnProbability}%` }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </ThemedCard>
  );
}

// Lifetime Value View Component
function LifetimeValueView({ predictions, loading }: { predictions: LifetimeValuePrediction[]; loading: boolean }) {
  const { store } = useStore();

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="h-40 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const getGrowthColor = (potential: string) => {
    switch (potential) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {predictions.map((prediction: LifetimeValuePrediction, index: number) => (
        <motion.div
          key={prediction.customerId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">{prediction.customerName}</h3>
              <span className={`px-2 py-1 rounded-full text-xs ${getGrowthColor(prediction.growthPotential)}`}>
                {prediction.growthPotential} potential
              </span>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Current LTV</span>
                <span className="font-medium">₦{prediction.currentLTV?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Predicted LTV</span>
                <span className="font-bold text-green-600">₦{prediction.predictedLTV?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Confidence</span>
                <span className="font-medium">{prediction.confidence}%</span>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span>Growth Potential</span>
                <span>+{(((prediction.predictedLTV - prediction.currentLTV) / prediction.currentLTV) * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ 
                    width: `${Math.min(100, ((prediction.predictedLTV - prediction.currentLTV) / prediction.currentLTV) * 100)}%` 
                  }}
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Recommended Actions:</p>
              <div className="flex flex-wrap gap-1">
                {prediction.recommendedActions.slice(0, 2).map((action, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 bg-muted rounded-full">
                    {action}
                  </span>
                ))}
              </div>
            </div>
          </ThemedCard>
        </motion.div>
      ))}
    </div>
  );
}