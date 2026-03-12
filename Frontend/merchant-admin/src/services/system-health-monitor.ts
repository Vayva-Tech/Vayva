/**
 * System Health Monitoring Service
 * Monitors API health, performance, and system stability
 */

import { logger } from '@vayva/shared';

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: number;
  checks: {
    api: HealthStatus;
    database: HealthStatus;
    cache: HealthStatus;
    network: HealthStatus;
  };
  metrics: {
    responseTime: number;
    uptime: number;
    errorRate: number;
  };
}

interface HealthStatus {
  status: 'ok' | 'warning' | 'error';
  message: string;
  responseTime?: number;
  lastChecked: number;
}

class SystemHealthMonitor {
  private static instance: SystemHealthMonitor;
  private healthHistory: HealthCheckResult[] = [];
  private maxHistory = 100;
  private checkInterval: NodeJS.Timeout | null = null;
  private lastCheck: number = 0;
  private isChecking = false;

  private constructor() {}

  public static getInstance(): SystemHealthMonitor {
    if (!SystemHealthMonitor.instance) {
      SystemHealthMonitor.instance = new SystemHealthMonitor();
    }
    return SystemHealthMonitor.instance;
  }

  // Perform comprehensive health check
  public async performHealthCheck(): Promise<HealthCheckResult> {
    if (this.isChecking) {
      throw new Error('Health check already in progress');
    }

    this.isChecking = true;
    const startTime = Date.now();

    try {
      const [apiStatus, databaseStatus, cacheStatus, networkStatus] = await Promise.all([
        this.checkApiHealth(),
        this.checkDatabaseHealth(),
        this.checkCacheHealth(),
        this.checkNetworkHealth()
      ]);

      const responseTime = Date.now() - startTime;
      const uptime = this.calculateUptime();
      const errorRate = this.calculateErrorRate();

      const result: HealthCheckResult = {
        status: this.determineOverallStatus([apiStatus, databaseStatus, cacheStatus, networkStatus]),
        timestamp: Date.now(),
        checks: {
          api: apiStatus,
          database: databaseStatus,
          cache: cacheStatus,
          network: networkStatus
        },
        metrics: {
          responseTime,
          uptime,
          errorRate
        }
      };

      this.addToHistory(result);
      this.lastCheck = Date.now();
      
      logger.info('[HEALTH_MONITOR] Health check completed', {
        status: result.status,
        responseTime: result.metrics.responseTime,
        errorRate: result.metrics.errorRate
      });

      return result;
    } finally {
      this.isChecking = false;
    }
  }

  // Individual health checks
  private async checkApiHealth(): Promise<HealthStatus> {
    const startTime = Date.now();
    
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        return {
          status: responseTime > 1000 ? 'warning' : 'ok',
          message: 'API is responding normally',
          responseTime,
          lastChecked: Date.now()
        };
      } else {
        return {
          status: 'error',
          message: `API returned status ${response.status}`,
          responseTime,
          lastChecked: Date.now()
        };
      }
    } catch (error) {
      return {
        status: 'error',
        message: `API check failed: ${(error as Error).message}`,
        lastChecked: Date.now()
      };
    }
  }

  private async checkDatabaseHealth(): Promise<HealthStatus> {
    const startTime = Date.now();
    
    try {
      const response = await fetch('/api/health/database', {
        method: 'GET'
      });

      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        return {
          status: responseTime > 500 ? 'warning' : 'ok',
          message: 'Database is healthy',
          responseTime,
          lastChecked: Date.now()
        };
      } else {
        return {
          status: 'error',
          message: 'Database connectivity issue',
          responseTime,
          lastChecked: Date.now()
        };
      }
    } catch (error) {
      return {
        status: 'error',
        message: `Database check failed: ${(error as Error).message}`,
        lastChecked: Date.now()
      };
    }
  }

  private async checkCacheHealth(): Promise<HealthStatus> {
    const startTime = Date.now();
    
    try {
      // Simple cache operation test
      const testKey = `health-check-${Date.now()}`;
      localStorage.setItem(testKey, 'test');
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      const responseTime = Date.now() - startTime;
      
      if (retrieved === 'test') {
        return {
          status: responseTime > 100 ? 'warning' : 'ok',
          message: 'Cache operations working',
          responseTime,
          lastChecked: Date.now()
        };
      } else {
        return {
          status: 'error',
          message: 'Cache operations failing',
          responseTime,
          lastChecked: Date.now()
        };
      }
    } catch (error) {
      return {
        status: 'error',
        message: `Cache check failed: ${(error as Error).message}`,
        lastChecked: Date.now()
      };
    }
  }

  private async checkNetworkHealth(): Promise<HealthStatus> {
    const startTime = Date.now();
    
    try {
      const online = navigator.onLine;
      
      if (online) {
        // Test actual network connectivity
        await fetch('https://httpbin.org/get', { 
          method: 'GET',
          mode: 'no-cors',
          cache: 'no-cache'
        });
        
        const responseTime = Date.now() - startTime;
        
        return {
          status: responseTime > 2000 ? 'warning' : 'ok',
          message: 'Network connectivity good',
          responseTime,
          lastChecked: Date.now()
        };
      } else {
        return {
          status: 'error',
          message: 'No network connection',
          lastChecked: Date.now()
        };
      }
    } catch (error) {
      return {
        status: 'error',
        message: `Network check failed: ${(error as Error).message}`,
        lastChecked: Date.now()
      };
    }
  }

  // Utility methods
  private determineOverallStatus(statuses: HealthStatus[]): 'healthy' | 'degraded' | 'unhealthy' {
    const errorCount = statuses.filter(s => s.status === 'error').length;
    const warningCount = statuses.filter(s => s.status === 'warning').length;
    
    if (errorCount > 0) return 'unhealthy';
    if (warningCount > 0) return 'degraded';
    return 'healthy';
  }

  private calculateUptime(): number {
    if (this.healthHistory.length === 0) return 100;
    
    const healthyChecks = this.healthHistory.filter(h => h.status === 'healthy').length;
    return (healthyChecks / this.healthHistory.length) * 100;
  }

  private calculateErrorRate(): number {
    if (this.healthHistory.length === 0) return 0;
    
    const errorChecks = this.healthHistory.filter(h => h.status === 'unhealthy').length;
    return (errorChecks / this.healthHistory.length) * 100;
  }

  private addToHistory(result: HealthCheckResult): void {
    this.healthHistory.push(result);
    if (this.healthHistory.length > this.maxHistory) {
      this.healthHistory.shift();
    }
  }

  // Public methods
  public startMonitoring(intervalMs: number = 30000): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    
    this.checkInterval = setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        logger.error('[HEALTH_MONITOR] Monitoring error:', error);
      }
    }, intervalMs);
    
    logger.info('[HEALTH_MONITOR] Started monitoring', { interval: intervalMs });
  }

  public stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      logger.info('[HEALTH_MONITOR] Stopped monitoring');
    }
  }

  public getLatestHealth(): HealthCheckResult | null {
    return this.healthHistory.length > 0 
      ? this.healthHistory[this.healthHistory.length - 1] 
      : null;
  }

  public getHealthHistory(): HealthCheckResult[] {
    return [...this.healthHistory];
  }

  public getLastCheckTime(): number {
    return this.lastCheck;
  }

  public isCurrentlyChecking(): boolean {
    return this.isChecking;
  }
}

// Export singleton instance
export const healthMonitor = SystemHealthMonitor.getInstance();

// Convenience hook for React components
export function useSystemHealth() {
  const [health, setHealth] = React.useState<HealthCheckResult | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const checkHealth = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await healthMonitor.performHealthCheck();
      setHealth(result);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startMonitoring = React.useCallback((intervalMs?: number) => {
    healthMonitor.startMonitoring(intervalMs);
  }, []);

  const stopMonitoring = React.useCallback(() => {
    healthMonitor.stopMonitoring();
  }, []);

  return {
    health,
    isLoading,
    checkHealth,
    startMonitoring,
    stopMonitoring,
    lastCheck: healthMonitor.getLastCheckTime(),
    isChecking: healthMonitor.isCurrentlyChecking()
  };
}

// Auto-start monitoring in browser environment
if (typeof window !== 'undefined') {
  // Start monitoring with 30-second intervals
  healthMonitor.startMonitoring(30000);
}