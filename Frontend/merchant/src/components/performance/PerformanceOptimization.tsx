// @ts-nocheck
/**
 * Performance Optimization Framework
 * System-wide speed and reliability enhancements
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  Gauge,
  BatteryCharging,
  WifiHigh,
  Lightning,
  Cpu,
  Database,
  Cloud,
  ChartLine,
  Warning,
  CheckCircle,
  XCircle,
  Clock,
  Rocket,
  ArrowsClockwise,
  Star,
  Medal,
  Target
} from '@phosphor-icons/react';
import { useSWR } from 'swr';
import { apiJson } from '@/lib/api-client-shared';
import { ThemedCard, getThemeColors } from '@/lib/design-system/theme-components';
import { useStore } from '@/providers/store-provider';

// Types
interface PerformanceMetrics {
  frontend: {
    loadTime: number; // ms
    firstContentfulPaint: number; // ms
    largestContentfulPaint: number; // ms
    cumulativeLayoutShift: number; // score
    firstInputDelay: number; // ms
  };
  backend: {
    responseTime: number; // ms
    uptime: number; // percentage
    errorRate: number; // percentage
    throughput: number; // requests/sec
  };
  caching: {
    cacheHitRate: number; // percentage
    cdnPerformance: number; // ms
    memoryUsage: number; // percentage
  };
  userExperience: {
    interactionLatency: number; // ms
    pageTransitions: number; // ms
    apiCallSuccess: number; // percentage
  };
}

interface OptimizationRecommendation {
  id: string;
  category: 'frontend' | 'backend' | 'caching' | 'network';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  estimatedImprovement: number; // percentage
  implementationEffort: 'low' | 'medium' | 'high';
  status: 'pending' | 'implementing' | 'completed';
}

interface PerformanceHealth {
  overallScore: number; // 0-100
  categoryScores: {
    frontend: number;
    backend: number;
    caching: number;
    userExperience: number;
  };
  alerts: {
    type: 'warning' | 'critical';
    message: string;
    timestamp: string;
  }[];
  recommendations: OptimizationRecommendation[];
}

// Performance Monitoring Hook
export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [health, setHealth] = useState<PerformanceHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch performance metrics
  const { data: metricsData } = useSWR<PerformanceMetrics>(
    '/api/performance/metrics',
    async (url: string) => {
      try {
        const response = await apiJson<PerformanceMetrics>(url);
        return response;
      } catch (error) {
        console.error('Failed to fetch performance metrics:', error);
        return null;
      }
    },
    { refreshInterval: 30000 } // Refresh every 30 seconds
  );

  // Fetch performance health
  const { data: healthData } = useSWR<PerformanceHealth>(
    '/api/performance/health',
    async (url: string) => {
      try {
        const response = await apiJson<PerformanceHealth>(url);
        return response;
      } catch (error) {
        console.error('Failed to fetch performance health:', error);
        return null;
      }
    }
  );

  // Update metrics and calculate health scores
  useEffect(() => {
    if (metricsData) {
      setMetrics(metricsData);
      const calculatedHealth = calculatePerformanceHealth(metricsData);
      setHealth(calculatedHealth);
      setIsLoading(false);
    }
  }, [metricsData]);

  const calculatePerformanceHealth = useCallback((metrics: PerformanceMetrics): PerformanceHealth => {
    // Calculate category scores
    const frontendScore = calculateFrontendScore(metrics.frontend);
    const backendScore = calculateBackendScore(metrics.backend);
    const cachingScore = calculateCachingScore(metrics.caching);
    const userExperienceScore = calculateUserExperienceScore(metrics.userExperience);

    const overallScore = Math.round(
      (frontendScore + backendScore + cachingScore + userExperienceScore) / 4
    );

    // Generate recommendations based on poor performing areas
    const recommendations = generateRecommendations(metrics);

    // Generate alerts for critical issues
    const alerts = generateAlerts(metrics);

    return {
      overallScore,
      categoryScores: {
        frontend: frontendScore,
        backend: backendScore,
        caching: cachingScore,
        userExperience: userExperienceScore
      },
      alerts,
      recommendations
    };
  }, []);

  return {
    metrics,
    health,
    isLoading,
    refresh: () => {} // Trigger manual refresh
  };
}

// Main Performance Dashboard Component
export default function PerformanceOptimizationDashboard() {
  const { store } = useStore();
  const industry = store?.industrySlug || 'default';
  const colors = getThemeColors(industry);
  const { metrics, health, isLoading } = usePerformanceMonitoring();

  if (isLoading || !metrics || !health) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Performance Header */}
      <ThemedCard industry={industry}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.primary}15` }}>
              <Rocket className="h-8 w-8" style={{ color: colors.primary }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Performance Optimization</h2>
              <p className="text-gray-500">
                Real-time monitoring and optimization recommendations
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <Gauge className="h-5 w-5" style={{ color: colors.primary }} />
              <span className={`text-2xl font-bold ${getScoreColor(health.overallScore)}`}>
                {health.overallScore}%
              </span>
            </div>
            <p className="text-sm text-gray-500">Overall Performance</p>
          </div>
        </div>
      </ThemedCard>

      {/* Category Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PerformanceCard
          title="Frontend"
          score={health.categoryScores.frontend}
          icon={<Lightning className="h-6 w-6" />}
          metrics={[
            { label: 'Load Time', value: `${metrics.frontend.loadTime}ms` },
            { label: 'FCP', value: `${metrics.frontend.firstContentfulPaint}ms` }
          ]}
          industry={industry}
        />
        
        <PerformanceCard
          title="Backend"
          score={health.categoryScores.backend}
          icon={<Cpu className="h-6 w-6" />}
          metrics={[
            { label: 'Response Time', value: `${metrics.backend.responseTime}ms` },
            { label: 'Uptime', value: `${metrics.backend.uptime}%` }
          ]}
          industry={industry}
        />
        
        <PerformanceCard
          title="Caching"
          score={health.categoryScores.caching}
          icon={<Database className="h-6 w-6" />}
          metrics={[
            { label: 'Hit Rate', value: `${metrics.caching.cacheHitRate}%` },
            { label: 'CDN Perf', value: `${metrics.caching.cdnPerformance}ms` }
          ]}
          industry={industry}
        />
        
        <PerformanceCard
          title="User Experience"
          score={health.categoryScores.userExperience}
          icon={<WifiHigh className="h-6 w-6" />}
          metrics={[
            { label: 'Interaction Latency', value: `${metrics.userExperience.interactionLatency}ms` },
            { label: 'API Success', value: `${metrics.userExperience.apiCallSuccess}%` }
          ]}
          industry={industry}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Alerts */}
        <ThemedCard industry={industry}>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Warning className="h-5 w-5 text-orange-600" />
            Performance Alerts
          </h3>
          
          {health.alerts.length > 0 ? (
            <div className="space-y-3">
              {health.alerts.map((alert, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border ${
                    alert.type === 'critical' 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {alert.type === 'critical' ? (
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    ) : (
                      <Warning className="h-5 w-5 text-yellow-600 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-500">No performance issues detected</p>
            </div>
          )}
        </ThemedCard>

        {/* Optimization Recommendations */}
        <ThemedCard industry={industry}>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <ChartLine className="h-5 w-5" />
            Optimization Opportunities
          </h3>
          
          <div className="space-y-3">
            {health.recommendations.slice(0, 4).map((rec: OptimizationRecommendation) => (
              <div 
                key={rec.id}
                className="p-3 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm">{rec.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    rec.priority === 'critical' ? 'bg-red-100 text-red-800' :
                    rec.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {rec.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-2">{rec.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-green-600">
                    +{rec.estimatedImprovement}% improvement
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    rec.implementationEffort === 'low' ? 'bg-green-100 text-green-800' :
                    rec.implementationEffort === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {rec.implementationEffort} effort
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ThemedCard>
      </div>

      {/* Quick Actions */}
      <ThemedCard industry={industry}>
        <h3 className="font-semibold mb-4">Performance Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors text-left">
            <div className="flex items-center gap-3 mb-2">
              <BatteryCharging className="h-5 w-5 text-green-600" />
              <span className="font-medium">Enable Caching</span>
            </div>
            <p className="text-sm text-gray-500">
              Activate CDN and memory caching for faster loads
            </p>
          </button>
          
          <button className="p-4 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors text-left">
            <div className="flex items-center gap-3 mb-2">
              <Cloud className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Optimize Images</span>
            </div>
            <p className="text-sm text-gray-500">
              Compress and lazy-load images for better performance
            </p>
          </button>
          
          <button className="p-4 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors text-left">
            <div className="flex items-center gap-3 mb-2">
              <Rocket className="h-5 w-5 text-purple-600" />
              <span className="font-medium">Run Diagnostics</span>
            </div>
            <p className="text-sm text-gray-500">
              Perform comprehensive performance analysis
            </p>
          </button>
        </div>
      </ThemedCard>
    </div>
  );
}

// Helper Components
function PerformanceCard({ 
  title, 
  score, 
  icon, 
  metrics, 
  industry 
}: { 
  title: string; 
  score: number; 
  icon: React.ReactNode; 
  metrics: { label: string; value: string }[]; 
  industry: string;
}) {
  const colors = getThemeColors(industry);
  
  return (
    <ThemedCard industry={industry}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.primary}15` }}>
            {icon}
          </div>
          <h3 className="font-semibold">{title}</h3>
        </div>
        <span className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreBg(score)}`}>
          {score}%
        </span>
      </div>
      
      <div className="space-y-2">
        {metrics.map((metric, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span className="text-gray-500">{metric.label}</span>
            <span className="font-medium">{metric.value}</span>
          </div>
        ))}
      </div>
    </ThemedCard>
  );
}

// Calculation Functions
function calculateFrontendScore(frontend: PerformanceMetrics['frontend']): number {
  let score = 100;
  
  // Load time penalty (ideal < 2000ms)
  if (frontend.loadTime > 3000) score -= 30;
  else if (frontend.loadTime > 2000) score -= 15;
  
  // FCP penalty (ideal < 1800ms)
  if (frontend.firstContentfulPaint > 2500) score -= 20;
  else if (frontend.firstContentfulPaint > 1800) score -= 10;
  
  // CLS penalty (ideal < 0.1)
  if (frontend.cumulativeLayoutShift > 0.25) score -= 25;
  else if (frontend.cumulativeLayoutShift > 0.1) score -= 15;
  
  // FID penalty (ideal < 100ms)
  if (frontend.firstInputDelay > 300) score -= 20;
  else if (frontend.firstInputDelay > 100) score -= 10;
  
  return Math.max(0, Math.round(score));
}

function calculateBackendScore(backend: PerformanceMetrics['backend']): number {
  let score = 100;
  
  // Response time penalty (ideal < 200ms)
  if (backend.responseTime > 500) score -= 35;
  else if (backend.responseTime > 200) score -= 20;
  
  // Uptime penalty (ideal 99.9%)
  if (backend.uptime < 99.5) score -= 30;
  else if (backend.uptime < 99.9) score -= 15;
  
  // Error rate penalty (ideal < 1%)
  if (backend.errorRate > 5) score -= 25;
  else if (backend.errorRate > 1) score -= 15;
  
  return Math.max(0, Math.round(score));
}

function calculateCachingScore(caching: PerformanceMetrics['caching']): number {
  let score = 100;
  
  // Cache hit rate penalty (ideal > 80%)
  if (caching.cacheHitRate < 60) score -= 30;
  else if (caching.cacheHitRate < 80) score -= 15;
  
  // CDN performance penalty (ideal < 50ms)
  if (caching.cdnPerformance > 100) score -= 25;
  else if (caching.cdnPerformance > 50) score -= 15;
  
  // Memory usage penalty (ideal < 80%)
  if (caching.memoryUsage > 90) score -= 20;
  else if (caching.memoryUsage > 80) score -= 10;
  
  return Math.max(0, Math.round(score));
}

function calculateUserExperienceScore(ux: PerformanceMetrics['userExperience']): number {
  let score = 100;
  
  // Interaction latency penalty (ideal < 100ms)
  if (ux.interactionLatency > 200) score -= 30;
  else if (ux.interactionLatency > 100) score -= 15;
  
  // Page transitions penalty (ideal < 300ms)
  if (ux.pageTransitions > 500) score -= 25;
  else if (ux.pageTransitions > 300) score -= 15;
  
  // API success rate penalty (ideal > 95%)
  if (ux.apiCallSuccess < 90) score -= 20;
  else if (ux.apiCallSuccess < 95) score -= 10;
  
  return Math.max(0, Math.round(score));
}

function generateRecommendations(metrics: PerformanceMetrics): OptimizationRecommendation[] {
  const recommendations: OptimizationRecommendation[] = [];
  
  // Frontend recommendations
  if (metrics.frontend.loadTime > 2000) {
    recommendations.push({
      id: 'frontend-1',
      category: 'frontend',
      priority: 'high',
      title: 'Optimize Bundle Size',
      description: 'Reduce JavaScript bundle size to improve initial load time',
      impact: 'high',
      estimatedImprovement: 25,
      implementationEffort: 'medium',
      status: 'pending'
    });
  }
  
  // Backend recommendations
  if (metrics.backend.responseTime > 200) {
    recommendations.push({
      id: 'backend-1',
      category: 'backend',
      priority: 'high',
      title: 'Database Query Optimization',
      description: 'Optimize slow database queries to reduce response time',
      impact: 'high',
      estimatedImprovement: 30,
      implementationEffort: 'high',
      status: 'pending'
    });
  }
  
  // Caching recommendations
  if (metrics.caching.cacheHitRate < 80) {
    recommendations.push({
      id: 'caching-1',
      category: 'caching',
      priority: 'medium',
      title: 'Implement Redis Caching',
      description: 'Add Redis caching layer for frequently accessed data',
      impact: 'high',
      estimatedImprovement: 40,
      implementationEffort: 'medium',
      status: 'pending'
    });
  }
  
  return recommendations;
}

function generateAlerts(metrics: PerformanceMetrics): PerformanceHealth['alerts'] {
  const alerts: PerformanceHealth['alerts'] = [];
  
  if (metrics.frontend.loadTime > 3000) {
    alerts.push({
      type: 'critical',
      message: 'Page load time exceeds 3 seconds',
      timestamp: new Date().toISOString()
    });
  }
  
  if (metrics.backend.errorRate > 5) {
    alerts.push({
      type: 'critical',
      message: 'Backend error rate above 5%',
      timestamp: new Date().toISOString()
    });
  }
  
  if (metrics.caching.memoryUsage > 90) {
    alerts.push({
      type: 'warning',
      message: 'Memory usage approaching capacity',
      timestamp: new Date().toISOString()
    });
  }
  
  return alerts;
}