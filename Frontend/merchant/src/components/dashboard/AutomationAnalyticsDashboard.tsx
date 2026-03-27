/**
 * Automation Analytics Dashboard
 * Monitor workflow performance, execution metrics, and ROI
 * 
 * Features:
 * - Execution volume trends
 * - Success/failure rates
 * - Average execution time
 * - Cost savings analysis
 * - Top performing workflows
 * - Error tracking
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  RefreshCcw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { apiJson } from '@/lib/api-client-shared';
import type { IndustrySlug } from '@vayva/domain';

// ============================================================================
// Types
// ============================================================================

interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'success' | 'failed' | 'running';
  startedAt: Date;
  completedAt?: Date;
  duration: number;
  nodesExecuted: number;
  error?: string;
}

interface WorkflowMetrics {
  totalExecutions: number;
  successRate: number;
  avgDuration: number;
  totalNodesExecuted: number;
  timeSaved: number; // hours
  costSavings: number; // dollars
  errorRate: number;
}

interface WorkflowPerformance {
  workflowId: string;
  workflowName: string;
  executions: number;
  avgDuration: number;
  successRate: number;
  roi: number;
}

interface AutomationAnalyticsProps {
  industry: IndustrySlug;
  storeId: string;
  planTier?: 'basic' | 'standard' | 'advanced' | 'pro' | 'pro_plus';
}

// ============================================================================
// Main Component
// ============================================================================

export const AutomationAnalyticsDashboard: React.FC<AutomationAnalyticsProps> = ({
  industry,
  storeId,
  planTier = 'standard',
}) => {
  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  
  // Data
  const [metrics, setMetrics] = useState<WorkflowMetrics | null>(null);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [performanceData, setPerformanceData] = useState<WorkflowPerformance[]>([]);
  const [trendData, setTrendData] = useState<Array<{
    date: string;
    executions: number;
    successes: number;
    failures: number;
    avgDuration: number;
  }>>([]);

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      const response = await apiJson<{
        metrics: WorkflowMetrics;
        executions: WorkflowExecution[];
        performance: WorkflowPerformance[];
        trend: Array<{ date: string; executions: number; successes: number; failures: number; avgDuration: number }>;
      }>(`/api/automation/analytics?industry=${industry}&storeId=${storeId}&timeRange=${timeRange}`);

      setMetrics(response.metrics || null);
      setExecutions(response.executions || []);
      setPerformanceData(response.performance || []);
      setTrendData(response.trend || []);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchAnalytics();
  }, [industry, storeId, timeRange]);

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-green-600" />
              Automation Analytics
            </CardTitle>
            <CardDescription>
              Track workflow performance and ROI
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTimeRange(timeRange === '7d' ? '30d' : timeRange === '30d' ? '90d' : '7d')}
            >
              {timeRange === '7d' ? 'Last 7 days' : timeRange === '30d' ? 'Last 30 days' : 'Last 90 days'}
            </Button>
            
            <Button variant="outline" size="sm" onClick={fetchAnalytics} disabled={refreshing}>
              <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Key Metrics */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Executions"
              value={metrics.totalExecutions.toLocaleString()}
              change="+12.5%"
              trend="up"
              icon={<Activity className="w-5 h-5 text-blue-600" />}
              description={`${timeRange} period`}
            />

            <MetricCard
              title="Success Rate"
              value={`${(metrics.successRate * 100).toFixed(1)}%`}
              change="+2.3%"
              trend="up"
              icon={<CheckCircle className="w-5 h-5 text-green-600" />}
              description={`${(metrics.errorRate * 100).toFixed(1)}% failure rate`}
            />

            <MetricCard
              title="Avg Duration"
              value={`${Math.round(metrics.avgDuration / 1000)}s`}
              change="-8.1%"
              trend="down"
              icon={<Clock className="w-5 h-5 text-purple-600" />}
              description="Per workflow"
            />

            <MetricCard
              title="Cost Savings"
              value={`$${metrics.costSavings.toLocaleString()}`}
              change="+18.2%"
              trend="up"
              icon={<DollarSign className="w-5 h-5 text-green-600" />}
              description={`${Math.round(metrics.timeSaved)} hours saved`}
            />
          </div>
        )}

        {/* Execution Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Execution Volume Trend</CardTitle>
              <CardDescription>Daily workflow executions over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorExecutions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="executions"
                    stroke="#22C55E"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorExecutions)"
                    name="Total Executions"
                  />
                  <Line type="monotone" dataKey="successes" stroke="#10B981" strokeWidth={2} name="Successes" />
                  <Line type="monotone" dataKey="failures" stroke="#EF4444" strokeWidth={2} name="Failures" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Performing Workflows</CardTitle>
              <CardDescription>By execution count and success rate</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="workflowName" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} tickFormatter={(value) => `${value}%`} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="executions" fill="#3B82F6" name="Executions" />
                  <Bar yAxisId="right" dataKey="successRate" fill="#10B981" name="Success Rate" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Executions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Executions</CardTitle>
            <CardDescription>Latest workflow runs across all automations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {executions.slice(0, 10).map((execution) => (
                <motion.div
                  key={execution.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {execution.status === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : execution.status === 'failed' ? (
                      <XCircle className="w-5 h-5 text-red-600" />
                    ) : (
                      <Activity className="w-5 h-5 text-blue-600 animate-pulse" />
                    )}
                    
                    <div>
                      <div className="font-medium text-sm">{execution.workflowName}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(execution.startedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Duration</div>
                      <div className="font-medium text-sm">{Math.round(execution.duration / 1000)}s</div>
                    </div>
                    
                    <Badge
                      variant={
                        execution.status === 'success' ? 'default' :
                        execution.status === 'failed' ? 'destructive' :
                        'secondary'
                      }
                      className="text-xs"
                    >
                      {execution.status}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ROI Analysis */}
        {planTier !== 'basic' && performanceData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                ROI Analysis
              </CardTitle>
              <CardDescription>
                Return on investment for automation workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {performanceData
                  .sort((a, b) => b.roi - a.roi)
                  .slice(0, 3)
                  .map((perf, index) => (
                    <div
                      key={perf.workflowId}
                      className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">#{index + 1}</span>
                        <Badge variant="secondary" className="text-xs">
                          {(perf.roi * 100).toFixed(0)}% ROI
                        </Badge>
                      </div>
                      <div className="font-semibold text-lg mb-1">{perf.workflowName}</div>
                      <div className="text-sm text-gray-600">
                        {perf.executions} executions • {(perf.successRate * 100).toFixed(1)}% success
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

// ============================================================================
// Helper Components
// ============================================================================

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
  description?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  trend,
  icon,
  description,
}) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
            {icon}
          </div>
          <div>
            <div className="text-sm text-gray-500">{title}</div>
            <div className="text-2xl font-bold">{value}</div>
          </div>
        </div>
        
        <Badge
          variant={trend === 'up' ? 'default' : 'destructive'}
          className="gap-1"
        >
          {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {change}
        </Badge>
      </div>
      
      {description && (
        <div className="text-xs text-gray-500">{description}</div>
      )}
    </CardContent>
  </Card>
);

export default AutomationAnalyticsDashboard;
