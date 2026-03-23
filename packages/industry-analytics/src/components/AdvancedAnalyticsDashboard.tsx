// @ts-nocheck
'use client';
/**
 * Advanced Analytics Dashboard with AI Insights
 * 
 * Comprehensive analytics dashboard featuring:
 * - Cross-industry benchmarking
 * - AI-powered forecasting
 * - Predictive insights
 * - Anomaly detection
 */

import React, { useEffect, useState } from 'react';
import { useAnalyticsEngine } from '../hooks/useAnalyticsEngine';

interface AdvancedAnalyticsDashboardProps {
  businessId: string;
  industry: string;
  metrics?: string[];
  showBenchmarking?: boolean;
  showForecasting?: boolean;
  forecastHorizon?: number;
}

interface BenchmarkData {
  metricName: string;
  businessValue: number;
  industryAverage: number;
  percentile: number;
  performance: 'excellent' | 'good' | 'average' | 'below_average' | 'poor';
}

interface ForecastData {
  metric: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  predictions: Array<{ date: string; value: number }>;
  confidence: number;
}

export function AdvancedAnalyticsDashboard({
  businessId,
  industry,
  metrics = ['revenue', 'conversion_rate', 'customer_lifetime_value'],
  showBenchmarking = true,
  showForecasting = true,
  forecastHorizon = 30,
}: AdvancedAnalyticsDashboardProps) {
  const engine = useAnalyticsEngine();
  const [loading, setLoading] = useState(true);
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkData[]>([]);
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [anomalies, setAnomalies] = useState<Array<{ metric: string; explanation: string }>>([]);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);

        // Load benchmarking data
        if (showBenchmarking) {
          const benchmarkService = engine.getService('cross-industry-benchmarking');
          const report = await benchmarkService?.generateBenchmarkReport(
            businessId,
            industry,
            metrics
          );

          if (report) {
            setBenchmarkData(
              report.metrics.map((m) => ({
                metricName: m.metricName,
                businessValue: m.businessValue,
                industryAverage: m.industryAverage,
                percentile: m.percentile,
                performance: m.performance,
              }))
            );
          }
        }

        // Load forecasting data
        if (showForecasting) {
          const predictiveService = engine.getService('ai-predictive-analytics');
          
          const forecasts = await Promise.all(
            metrics.map(async (metric) => {
              const forecast = await predictiveService?.generateForecast(
                businessId,
                metric,
                forecastHorizon
              );
              return forecast;
            })
          );

          setForecastData(
            forecasts.filter((f): f is NonNullable<typeof f> => f !== undefined).map((f) => ({
              metric: f.metric,
              trend: f.trend.direction,
              predictions: f.forecast.map((pred) => ({
                date: pred.timestamp.split('T')[0],
                value: pred.predictedValue,
              })),
              confidence: f.forecast[0]?.confidenceInterval.confidence || 0.95,
            }))
          );

          // Extract AI insights
          const allInsights = forecasts
            ?.filter((f): f is NonNullable<typeof f> => f !== undefined)
            .flatMap((f) => f.insights) || [];
          setAiInsights(allInsights);

          // Extract anomalies
          const allAnomalies = forecasts
            ?.filter((f): f is NonNullable<typeof f> => f !== undefined)
            .flatMap((f) =>
              (f.anomalies || []).map((a) => ({
                metric: f.metric,
                explanation: a.explanation || `Unusual ${f.metric} detected`,
              }))
            ) || [];
          setAnomalies(allAnomalies);
        }
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [businessId, industry, metrics, showBenchmarking, showForecasting, forecastHorizon, engine]);

  if (loading) {
    return (
      <div className="advanced-analytics-dashboard p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="advanced-analytics-dashboard p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Advanced Analytics & AI Insights
        </h2>
        <p className="text-gray-600 mt-1">
          Cross-industry benchmarking and AI-powered forecasting
        </p>
      </div>

      {/* AI Insights Banner */}
      {aiInsights.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 rounded">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">AI Insights</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  {aiInsights.map((insight, idx) => (
                    <li key={idx}>{insight}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Anomaly Alerts */}
      {anomalies.length > 0 && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Anomalies Detected</h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc list-inside space-y-1">
                  {anomalies.map((anomaly, idx) => (
                    <li key={idx}>
                      <strong>{anomaly.metric}:</strong> {anomaly.explanation}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Benchmarking Section */}
      {showBenchmarking && benchmarkData.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Industry Benchmarking</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benchmarkData.map((benchmark) => (
              <BenchmarkCard key={benchmark.metricName} data={benchmark} />
            ))}
          </div>
        </div>
      )}

      {/* Forecasting Section */}
      {showForecasting && forecastData.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">AI-Powered Forecasts</h3>
          <div className="space-y-6">
            {forecastData.map((forecast) => (
              <ForecastChart key={forecast.metric} data={forecast} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Benchmark Card Component
// ============================================================================

function BenchmarkCard({ data }: { data: BenchmarkData }) {
  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent':
        return 'bg-green-500';
      case 'good':
        return 'bg-blue-500';
      case 'average':
        return 'bg-yellow-500';
      case 'below_average':
        return 'bg-orange-500';
      case 'poor':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPerformanceLabel = (performance: string) => {
    return performance.replace('_', ' ').toUpperCase();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h4 className="text-sm font-medium text-gray-500 capitalize">
        {data.metricName.replace(/_/g, ' ')}
      </h4>
      
      <div className="mt-4 flex items-baseline">
        <span className="text-3xl font-bold text-gray-900">
          {data.businessValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </span>
        <span className="ml-2 text-sm text-gray-500">
          vs {data.industryAverage.toLocaleString(undefined, { maximumFractionDigits: 2 })} avg
        </span>
      </div>

      {/* Percentile Gauge */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Percentile Rank</span>
          <span>{data.percentile}th</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`${getPerformanceColor(data.performance)} h-2 rounded-full transition-all duration-500`}
            style={{ width: `${data.percentile}%` }}
          ></div>
        </div>
      </div>

      {/* Performance Badge */}
      <div className="mt-4">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            data.performance === 'excellent' || data.performance === 'good'
              ? 'bg-green-100 text-green-800'
              : data.performance === 'average'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {getPerformanceLabel(data.performance)}
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Forecast Chart Component
// ============================================================================

function ForecastChart({ data }: { data: ForecastData }) {
  // Simple line chart visualization
  const allValues = [
    ...data.predictions.map((p) => p.value),
  ];
  const maxValue = Math.max(...allValues);
  const minValue = Math.min(...allValues);
  const range = maxValue - minValue || 1;

  const getTrendIcon = () => {
    switch (data.trend) {
      case 'increasing':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'decreasing':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold capitalize">
          {data.metric.replace(/_/g, ' ')} Forecast
        </h4>
        <div className="flex items-center space-x-2">
          {getTrendIcon()}
          <span className="text-sm text-gray-600">
            {data.trend.charAt(0).toUpperCase() + data.trend.slice(1)}
          </span>
        </div>
      </div>

      {/* Simplified Chart Visualization */}
      <div className="h-48 relative">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="0.5"
            />
          ))}

          {/* Forecast line */}
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            points={data.predictions
              .map((p, i) => {
                const x = (i / (data.predictions.length - 1)) * 100;
                const y = 100 - ((p.value - minValue) / range) * 100;
                return `${x},${y}`;
              })
              .join(' ')}
          />

          {/* Confidence interval area (simplified) */}
          <path
            d={`M 0,${100 - ((data.predictions[0].value * 1.1 - minValue) / range) * 100} 
                L 100,${100 - ((data.predictions[data.predictions.length - 1].value * 1.1 - minValue) / range) * 100}`}
            stroke="#93c5fd"
            strokeWidth="4"
            fill="none"
            opacity="0.3"
          />
        </svg>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
          <span>Today</span>
          <span>{`+${Math.floor(data.predictions.length / 2)}d`}</span>
          <span>{`+${data.predictions.length}d`}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center space-x-6 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-1 bg-blue-500"></div>
          <span className="text-gray-600">Predicted Value</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-1 bg-blue-300 opacity-50"></div>
          <span className="text-gray-600">Confidence Interval</span>
        </div>
      </div>
    </div>
  );
}
