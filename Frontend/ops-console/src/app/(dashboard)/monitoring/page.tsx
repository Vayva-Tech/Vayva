/**
 * Monitoring Dashboard Page
 * Real-time system health and metrics visualization
 */

'use client';

import { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle, TrendingUp, Clock, Target } from 'lucide-react';

interface Metric {
  name: string;
  value: number;
  timestamp: Date;
}

interface Alert {
  id: string;
  name: string;
  severity: 'critical' | 'warning' | 'info';
  triggeredAt: Date;
}

export default function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch metrics
  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/monitoring/metrics');
      const data = await response.json();
      
      setMetrics(data.metrics || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and polling
  useEffect(() => {
    fetchMetrics();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  // Get metric color based on value
  const getMetricColor = (metricName: string, value: number): string => {
    const thresholds: Record<string, { good: number; warning: number; critical: number }> = {
      error_rate: { good: 1, warning: 5, critical: 10 },
      response_time_p95: { good: 500, warning: 1000, critical: 2000 },
      health_score_average: { good: 80, warning: 60, critical: 40 },
      nps_response_rate: { good: 30, warning: 20, critical: 10 },
      playbook_failure_rate: { good: 5, warning: 15, critical: 25 },
    };

    const threshold = thresholds[metricName];
    if (!threshold) return 'text-gray-900';

    // For metrics where higher is better (like health_score, nps_response_rate)
    if (['health_score_average', 'nps_response_rate'].includes(metricName)) {
      if (value >= threshold.good) return 'text-green-600';
      if (value >= threshold.warning) return 'text-yellow-600';
      return 'text-red-600';
    }

    // For metrics where lower is better (like error_rate, response_time)
    if (value <= threshold.good) return 'text-green-600';
    if (value <= threshold.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Format metric value for display
  const formatMetricValue = (metricName: string, value: number): string => {
    const formats: Record<string, string> = {
      error_rate: `${value.toFixed(2)}%`,
      response_time_p95: `${Math.round(value)}ms`,
      health_score_average: `${Math.round(value)}/100`,
      nps_response_rate: `${value.toFixed(1)}%`,
      playbook_failure_rate: `${value.toFixed(1)}%`,
    };

    return formats[metricName] || value.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-semibold text-gray-900">Loading Metrics...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            System Monitoring Dashboard
          </h1>
          <p className="text-gray-600">
            Real-time metrics and system health
            {lastUpdated && (
              <span className="ml-2 text-sm">
                • Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {metrics.map((metric) => (
            <div
              key={metric.name}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600 capitalize">
                  {metric.name.replace(/_/g, ' ')}
                </h3>
                <TrendingUp className={`w-5 h-5 ${getMetricColor(metric.name, metric.value)}`} />
              </div>
              
              <div className="flex items-baseline">
                <span className={`text-3xl font-bold ${getMetricColor(metric.name, metric.value)}`}>
                  {formatMetricValue(metric.name, metric.value)}
                </span>
              </div>

              <div className="mt-4 flex items-center text-xs text-gray-500">
                <Clock className="w-3 h-3 mr-1" />
                Updated: {new Date(metric.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>

        {/* Status Overview */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Status</h2>
          
          <div className="space-y-4">
            {metrics.map((metric) => {
              const status = getMetricColor(metric.name, metric.value).includes('green')
                ? 'healthy'
                : getMetricColor(metric.name, metric.value).includes('yellow')
                ? 'warning'
                : 'critical';

              return (
                <div key={metric.name} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center space-x-3">
                    {status === 'healthy' && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {status === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-600" />}
                    {status === 'critical' && <AlertTriangle className="w-5 h-5 text-red-600" />}
                    
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {metric.name.replace(/_/g, ' ')}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`text-sm font-semibold ${getMetricColor(metric.name, metric.value)}`}>
                      {formatMetricValue(metric.name, metric.value)}
                    </span>
                    
                    <span className="text-xs text-gray-500 w-20 text-right">
                      {status === 'healthy' && <span className="text-green-600">✓ Normal</span>}
                      {status === 'warning' && <span className="text-yellow-600">⚠ Warning</span>}
                      {status === 'critical' && <span className="text-red-600">✕ Critical</span>}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alerts Configuration */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Alert Thresholds
          </h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Metric</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Warning</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Critical</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 text-sm text-gray-900">Error Rate</td>
                  <td className="py-3 px-4 text-sm text-yellow-600">&gt; 5%</td>
                  <td className="py-3 px-4 text-sm text-red-600">&gt; 10%</td>
                  <td className="py-3 px-4 text-sm">
                    {metrics.find(m => m.name === 'error_rate')!.value > 10 ? (
                      <span className="text-red-600 font-semibold">Critical</span>
                    ) : metrics.find(m => m.name === 'error_rate')!.value > 5 ? (
                      <span className="text-yellow-600 font-semibold">Warning</span>
                    ) : (
                      <span className="text-green-600 font-semibold">OK</span>
                    )}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 text-sm text-gray-900">Response Time (P95)</td>
                  <td className="py-3 px-4 text-sm text-yellow-600">&gt; 1000ms</td>
                  <td className="py-3 px-4 text-sm text-red-600">&gt; 2000ms</td>
                  <td className="py-3 px-4 text-sm">
                    {metrics.find(m => m.name === 'response_time_p95')!.value > 2000 ? (
                      <span className="text-red-600 font-semibold">Critical</span>
                    ) : metrics.find(m => m.name === 'response_time_p95')!.value > 1000 ? (
                      <span className="text-yellow-600 font-semibold">Warning</span>
                    ) : (
                      <span className="text-green-600 font-semibold">OK</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-sm text-gray-900">Avg Health Score</td>
                  <td className="py-3 px-4 text-sm text-yellow-600">&lt; 60</td>
                  <td className="py-3 px-4 text-sm text-red-600">&lt; 40</td>
                  <td className="py-3 px-4 text-sm">
                    {metrics.find(m => m.name === 'health_score_average')!.value < 40 ? (
                      <span className="text-red-600 font-semibold">Critical</span>
                    ) : metrics.find(m => m.name === 'health_score_average')!.value < 60 ? (
                      <span className="text-yellow-600 font-semibold">Warning</span>
                    ) : (
                      <span className="text-green-600 font-semibold">OK</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
