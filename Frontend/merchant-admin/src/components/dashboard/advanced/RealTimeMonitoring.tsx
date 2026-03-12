'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Activity,
  Wifi,
  Database,
  Server,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DesignCategory } from '@/components/vayva-ui/VayvaThemeProvider';

interface SystemStatus {
  id: string;
  service: string;
  status: 'operational' | 'degraded' | 'down' | 'maintenance';
  responseTime: number;
  uptime: number;
  lastChecked: Date;
  metrics: {
    cpu?: number;
    memory?: number;
    requests?: number;
    errors?: number;
  };
}

interface RealTimeMonitoringProps {
  industry: string;
  designCategory: DesignCategory;
  planTier: string;
  loading?: boolean;
  className?: string;
}

/**
 * RealTimeMonitoring - Live system health and performance monitoring
 * Tracks infrastructure, APIs, and business-critical services
 */
export function RealTimeMonitoring({
  industry,
  designCategory,
  planTier,
  loading = false,
  className
}: RealTimeMonitoringProps) {
  const [statuses, setStatuses] = useState<SystemStatus[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Mock system status data - would come from monitoring service
  useEffect(() => {
    if (!loading) {
      const mockStatuses: SystemStatus[] = [
        {
          id: '1',
          service: 'API Gateway',
          status: 'operational',
          responseTime: 45,
          uptime: 99.98,
          lastChecked: new Date(),
          metrics: { requests: 1247, errors: 3 }
        },
        {
          id: '2',
          service: 'Database Cluster',
          status: 'operational',
          responseTime: 12,
          uptime: 99.99,
          lastChecked: new Date(),
          metrics: { cpu: 65, memory: 78 }
        },
        {
          id: '3',
          service: 'Payment Processing',
          status: 'degraded',
          responseTime: 156,
          uptime: 98.7,
          lastChecked: new Date(),
          metrics: { requests: 89, errors: 12 }
        },
        {
          id: '4',
          service: 'Email Service',
          status: 'operational',
          responseTime: 23,
          uptime: 99.95,
          lastChecked: new Date(),
          metrics: { requests: 456, errors: 1 }
        },
        {
          id: '5',
          service: 'Storage CDN',
          status: 'operational',
          responseTime: 8,
          uptime: 100,
          lastChecked: new Date(),
          metrics: { requests: 3456, errors: 0 }
        }
      ];
      setStatuses(mockStatuses);
    }

    // Simulate real-time updates
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [loading, industry]);

  const getStatusConfig = (status: SystemStatus['status']) => {
    const configs = {
      operational: {
        icon: <CheckCircle className="h-4 w-4" />,
        label: 'Operational',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        textClass: 'text-emerald-600'
      },
      degraded: {
        icon: <AlertTriangle className="h-4 w-4" />,
        label: 'Degraded',
        badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        textClass: 'text-yellow-600'
      },
      down: {
        icon: <AlertTriangle className="h-4 w-4" />,
        label: 'Down',
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
        textClass: 'text-rose-600'
      },
      maintenance: {
        icon: <Clock className="h-4 w-4" />,
        label: 'Maintenance',
        badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
        textClass: 'text-blue-600'
      }
    };
    return configs[status];
  };

  const getServiceIcon = (service: string) => {
    const icons: Record<string, React.ReactNode> = {
      'API Gateway': <Wifi className="h-4 w-4" />,
      'Database Cluster': <Database className="h-4 w-4" />,
      'Payment Processing': <Zap className="h-4 w-4" />,
      'Email Service': <Server className="h-4 w-4" />,
      'Storage CDN': <Server className="h-4 w-4" />
    };
    return icons[service] || <Server className="h-4 w-4" />;
  };

  const formatTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  if (loading) {
    return (
      <Card className={cn("rounded-[28px] border border-border/60", className)}>
        <CardHeader className="pb-2 p-6">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="p-6 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("rounded-[28px] border border-border/60", className)}>
      <CardHeader className="pb-2 p-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary animate-pulse" />
              Real-Time Monitoring
            </CardTitle>
            <p className="text-sm text-text-secondary mt-1">
              System health and performance metrics
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span>Live</span>
            <span>•</span>
            <span>Updated {formatTimeAgo(lastUpdated)}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-3">
          {statuses.map((status) => {
            const statusConfig = getStatusConfig(status.status);
            const serviceIcon = getServiceIcon(status.service);
            
            return (
              <div 
                key={status.id}
                className="flex items-center justify-between p-3 rounded-xl border border-border/40 hover:border-border/60 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg transition-colors group-hover:scale-105",
                    status.status === 'operational' ? 'bg-emerald-100 text-emerald-600' :
                    status.status === 'degraded' ? 'bg-yellow-100 text-yellow-600' :
                    status.status === 'down' ? 'bg-rose-100 text-rose-600' :
                    'bg-blue-100 text-blue-600'
                  )}>
                    {serviceIcon}
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-text-primary group-hover:text-primary transition-colors">
                      {status.service}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-text-secondary mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {status.responseTime}ms
                      </span>
                      <span className="flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        {status.uptime.toFixed(2)}% uptime
                      </span>
                    </div>
                    
                    {/* Metrics */}
                    <div className="flex items-center gap-2 mt-2">
                      {status.metrics.requests !== undefined && (
                        <Badge variant="secondary" className="text-xs">
                          {status.metrics.requests} req/s
                        </Badge>
                      )}
                      {status.metrics.errors !== undefined && status.metrics.errors > 0 && (
                        <Badge 
                          variant="secondary" 
                          className="text-xs bg-rose-100 text-rose-700 border-rose-200"
                        >
                          {status.metrics.errors} errors
                        </Badge>
                      )}
                      {status.metrics.cpu !== undefined && (
                        <Badge variant="secondary" className="text-xs">
                          CPU: {status.metrics.cpu}%
                        </Badge>
                      )}
                      {status.metrics.memory !== undefined && (
                        <Badge variant="secondary" className="text-xs">
                          RAM: {status.metrics.memory}%
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="secondary" 
                    className={cn("text-xs font-medium", statusConfig.badgeClass)}
                  >
                    {statusConfig.icon}
                    <span className="ml-1">{statusConfig.label}</span>
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
        
        {statuses.length === 0 && (
          <div className="text-center py-8">
            <Server className="h-12 w-12 mx-auto text-text-tertiary mb-3" />
            <p className="text-text-secondary">No system data available</p>
            <p className="text-xs text-text-tertiary mt-1">
              Monitoring services will appear here when connected
            </p>
          </div>
        )}
        
        {/* Summary */}
        <div className="mt-6 pt-4 border-t border-border/40">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Overall System Status</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="font-medium text-emerald-600">All Systems Operational</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}