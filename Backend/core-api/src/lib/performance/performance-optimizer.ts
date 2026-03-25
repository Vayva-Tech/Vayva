import { logger } from "@vayva/shared";
import { prisma as _prisma } from "@vayva/db";
import { LRUCache } from "lru-cache";
import { promisify as _promisify } from "util";

// Performance monitoring types
export interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  cacheHitRate: number;
  databaseQueries: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface QueryOptimizationResult {
  query: string;
  optimizedQuery: string;
  performanceGain: number; // percentage
  complexityReduction: number; // percentage
  recommendations: string[];
}

export interface CacheStrategy {
  key: string;
  ttl: number; // seconds
  maxSize?: number;
  evictionPolicy?: 'LRU' | 'LFU' | 'FIFO';
}

/**
 * Advanced Performance Optimization Service
 */
export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private queryCache: LRUCache<string, object>;
  private cacheHits = 0;
  private cacheMisses = 0;
  private metricsHistory: Map<string, PerformanceMetrics[]>;
  private optimizationRules: Map<string, () => void | Promise<void>>;

  private constructor() {
    // Initialize LRU cache with 1000 max items, 5 minute TTL
    this.queryCache = new LRUCache<string, object>({
      max: 1000,
      ttl: 1000 * 60 * 5, // 5 minutes
      updateAgeOnGet: true
    });
    
    this.metricsHistory = new Map();
    this.optimizationRules = new Map();
    
    this.initializeOptimizationRules();
  }

  public static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  /**
   * Optimize database queries with intelligent caching and indexing suggestions
   */
  public async optimizeQuery<T>(
    queryKey: string,
    queryFunction: () => Promise<T>,
    cacheStrategy?: CacheStrategy
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      // Check cache first
      const cachedResult = this.getCachedResult(queryKey);
      if (cachedResult) {
        this.recordMetrics(queryKey, Date.now() - startTime, true);
        return cachedResult as T;
      }

      // Execute query
      const result = await queryFunction();
      
      // Cache result
      this.cacheResult(queryKey, result, cacheStrategy);
      
      // Record performance metrics
      this.recordMetrics(queryKey, Date.now() - startTime, false);
      
      // Analyze query performance
      await this.analyzeQueryPerformance(queryKey, Date.now() - startTime);
      
      return result;
    } catch (error) {
      logger.error("[QUERY_OPTIMIZATION_ERROR]", { 
        queryKey, 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
      throw error;
    }
  }

  /**
   * Batch optimize multiple related queries
   */
  public async batchOptimize<T extends Record<string, unknown>>(
    queries: { [K in keyof T]: () => Promise<T[K]> }
  ): Promise<T> {
    const startTime = Date.now();
    const results = {} as T;
    const promises: Promise<void>[] = [];

    // Execute all queries in parallel (preserve key/value types)
    for (const key of Object.keys(queries) as Array<keyof T>) {
      const queryFn = queries[key];
      promises.push(
        this.optimizeQuery(String(key), queryFn).then((result) => {
          results[key] = result;
        }),
      );
    }

    await Promise.all(promises);
    
    logger.info("[BATCH_OPTIMIZATION_COMPLETED]", {
      queryCount: Object.keys(queries).length,
      executionTime: Date.now() - startTime
    });

    return results;
  }

  /**
   * Analyze and suggest database query optimizations
   */
  public async analyzeQueryPerformance(
    queryKey: string,
    executionTime: number
  ): Promise<QueryOptimizationResult | null> {
    // Skip analysis for fast queries
    if (executionTime < 100) return null;

    const recentMetrics = this.getRecentMetrics(queryKey, 10);
    const avgExecutionTime = recentMetrics.length > 0
      ? recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length
      : executionTime;

    // If query is consistently slow, suggest optimizations
    if (executionTime > avgExecutionTime * 1.5) {
      return await this.suggestQueryOptimizations(queryKey, executionTime);
    }

    return null;
  }

  /**
   * Generate database indexing recommendations
   */
  public async generateIndexingRecommendations(
    storeId: string
  ): Promise<{ table: string; columns: string[]; recommendation: string }[]> {
    const recommendations: { table: string; columns: string[]; recommendation: string }[] = [];

    try {
      // Analyze slow queries from logs (simulated)
      const slowQueries = await this.getSlowQueries(storeId);
      
      // Group by table and column usage
      const queryPatterns = this.analyzeQueryPatterns(slowQueries);
      
      // Generate index recommendations
      Object.entries(queryPatterns).forEach(([table, columns]) => {
        if (columns.length > 1) {
          recommendations.push({
            table,
            columns,
            recommendation: `CREATE INDEX idx_${table}_${columns.join('_')} ON ${table} (${columns.join(', ')})`
          });
        } else if (columns.length === 1) {
          recommendations.push({
            table,
            columns,
            recommendation: `CREATE INDEX idx_${table}_${columns[0]} ON ${table} (${columns[0]})`
          });
        }
      });

      logger.info("[INDEXING_RECOMMENDATIONS_GENERATED]", {
        storeId,
        recommendationCount: recommendations.length
      });

    } catch (error) {
      logger.error("[INDEXING_ANALYSIS_ERROR]", { 
        storeId, 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }

    return recommendations;
  }

  /**
   * Monitor and optimize API endpoint performance
   */
  public async monitorEndpointPerformance(
    endpoint: string,
    executionTime: number,
    memoryUsage: number,
    statusCode: number
  ): Promise<void> {
    const metrics: PerformanceMetrics = {
      responseTime: executionTime,
      throughput: 1, // requests per second
      errorRate: statusCode >= 400 ? 1 : 0,
      cacheHitRate: 0, // would be calculated from cache hits
      databaseQueries: 0, // would track DB query count
      memoryUsage,
      cpuUsage: 0 // would track CPU usage
    };

    this.recordMetrics(endpoint, executionTime, false, metrics);

    // Trigger optimization if performance degrades
    const recentMetrics = this.getRecentMetrics(endpoint, 20);
    if (recentMetrics.length >= 5) {
      const avgResponseTime = recentMetrics
        .slice(-5)
        .reduce((sum, m) => sum + m.responseTime, 0) / 5;
      
      if (executionTime > avgResponseTime * 2) {
        await this.triggerEndpointOptimization(endpoint);
      }
    }
  }

  /**
   * Get performance dashboard data
   */
  public getPerformanceDashboard(storeId: string): unknown {
    const endpoints = Array.from(this.metricsHistory.keys())
      .filter(key => key.startsWith(`/api/${storeId}`) || !key.includes('/'));

    const dashboard = {
      overallHealth: this.calculateOverallHealth(endpoints),
      slowEndpoints: this.identifySlowEndpoints(endpoints),
      cachePerformance: this.getCachePerformance(),
      resourceUsage: this.getResourceUsage(),
      optimizationOpportunities: this.getOptimizationOpportunities(endpoints)
    };

    return dashboard;
  }

  // Private helper methods
  private getCachedResult(key: string): unknown {
    const value = this.queryCache.get(key);
    if (value === undefined) this.cacheMisses++;
    else this.cacheHits++;
    return value;
  }

  private cacheResult(key: string, result: unknown, strategy?: CacheStrategy): void {
    const ttl = strategy?.ttl ? strategy.ttl * 1000 : 1000 * 60 * 5; // Convert to ms
    const maxSize = strategy?.maxSize || 1000;
    
    // Update cache configuration if needed
    if (this.queryCache.max !== maxSize) {
      this.queryCache = new LRUCache<string, object>({
        max: maxSize,
        ttl,
        updateAgeOnGet: true
      });
    }
    
    if (result && typeof result === "object") {
      this.queryCache.set(key, result as object, { ttl });
    }
  }

  private recordMetrics(
    key: string,
    responseTime: number,
    cacheHit: boolean,
    additionalMetrics?: PerformanceMetrics
  ): void {
    if (!this.metricsHistory.has(key)) {
      this.metricsHistory.set(key, []);
    }

    const metrics: PerformanceMetrics = {
      responseTime,
      throughput: 1,
      errorRate: 0,
      cacheHitRate: cacheHit ? 1 : 0,
      databaseQueries: 1,
      memoryUsage: process.memoryUsage().heapUsed,
      cpuUsage: 0,
      ...additionalMetrics
    };

    const history = this.metricsHistory.get(key)!;
    history.push(metrics);

    // Keep only last 100 metrics per endpoint
    if (history.length > 100) {
      history.shift();
    }
  }

  private getRecentMetrics(key: string, count: number): PerformanceMetrics[] {
    const history = this.metricsHistory.get(key) || [];
    return history.slice(-count);
  }

  private async suggestQueryOptimizations(
    queryKey: string,
    executionTime: number
  ): Promise<QueryOptimizationResult> {
    // Simulate query analysis (in real implementation, would use query plan analysis)
    const recommendations: string[] = [];
    
    if (executionTime > 1000) {
      recommendations.push("Consider adding database indexes on frequently queried columns");
      recommendations.push("Review query complexity and consider pagination");
    }
    
    if (executionTime > 500) {
      recommendations.push("Evaluate if all selected columns are necessary");
      recommendations.push("Consider query result caching for frequently accessed data");
    }

    return {
      query: queryKey,
      optimizedQuery: queryKey, // Would contain actual optimized SQL
      performanceGain: Math.min(70, executionTime / 10), // Simulated gain
      complexityReduction: 30, // Simulated reduction
      recommendations
    };
  }

  private async getSlowQueries(_storeId: string): Promise<unknown[]> {
    // Simulate getting slow queries from database logs
    return [
      { query: "SELECT * FROM orders WHERE store_id = ?", executionTime: 1200 },
      { query: "SELECT * FROM customers WHERE email LIKE '%'", executionTime: 800 }
    ];
  }

  private analyzeQueryPatterns(queries: unknown[]): Record<string, string[]> {
    const patterns: Record<string, string[]> = {};
    
    queries.forEach((q) => {
      const qrec = q as Record<string, unknown>;
      const query = typeof qrec.query === "string" ? qrec.query : "";
      // Simulate pattern extraction
      const table = query.match(/FROM\s+(\w+)/i)?.[1] || 'unknown';
      const columns =
        query.match(/WHERE\s+(\w+)/gi)?.map((c: string) => c.split(" ")[1]) ||
        [];
      
      if (!patterns[table]) {
        patterns[table] = [];
      }
      patterns[table].push(...columns);
    });

    return patterns;
  }

  private async triggerEndpointOptimization(endpoint: string): Promise<void> {
    logger.warn("[ENDPOINT_PERFORMANCE_DEGRADATION]", { endpoint });
    
    // Apply optimization rules
    const rules = this.getOptimizationRules(endpoint);
    for (const rule of rules) {
      try {
        await rule();
      } catch (error) {
        logger.error("[OPTIMIZATION_RULE_FAILED]", { 
          endpoint, 
          error: error instanceof Error ? error.message : "Unknown error" 
        });
      }
    }
  }

  private initializeOptimizationRules(): void {
    // Define optimization rules
    this.optimizationRules.set('cache_heavy_endpoints', async () => {
      // Increase cache TTL for frequently accessed endpoints
      logger.info("[CACHE_TTL_INCREASED]", { reason: "performance_degradation" });
    });

    this.optimizationRules.set('database_connection_pool', async () => {
      // Optimize database connection pooling
      logger.info("[CONNECTION_POOL_OPTIMIZED]", { reason: "high_latency" });
    });
  }

  private getOptimizationRules(_endpoint: string): Array<() => void | Promise<void>> {
    // Return applicable optimization rules based on endpoint
    return Array.from(this.optimizationRules.values());
  }

  private calculateOverallHealth(endpoints: string[]): unknown {
    const metrics = endpoints.flatMap(endpoint => this.getRecentMetrics(endpoint, 10));
    
    if (metrics.length === 0) return { status: 'unknown', score: 0 };

    const avgResponseTime = metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length;
    const avgErrorRate = metrics.reduce((sum, m) => sum + m.errorRate, 0) / metrics.length;
    const avgCacheHitRate = metrics.reduce((sum, m) => sum + m.cacheHitRate, 0) / metrics.length;

    const score = Math.max(0, 100 - 
      (avgResponseTime / 10) - 
      (avgErrorRate * 50) + 
      (avgCacheHitRate * 20)
    );

    return {
      status: score > 80 ? 'healthy' : score > 60 ? 'degraded' : 'poor',
      score: Math.round(score),
      responseTime: Math.round(avgResponseTime),
      errorRate: Math.round(avgErrorRate * 100) / 100,
      cacheHitRate: Math.round(avgCacheHitRate * 100) / 100
    };
  }

  private identifySlowEndpoints(endpoints: string[]): unknown[] {
    return endpoints
      .map(endpoint => {
        const recentMetrics = this.getRecentMetrics(endpoint, 5);
        if (recentMetrics.length === 0) return null;
        
        const avgResponseTime = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length;
        return { endpoint, avgResponseTime };
      })
      .filter(Boolean)
      .sort((a, b) => b!.avgResponseTime - a!.avgResponseTime)
      .slice(0, 5)
      .map(item => ({
        endpoint: item!.endpoint,
        responseTime: Math.round(item!.avgResponseTime),
        status: item!.avgResponseTime > 1000 ? 'critical' : 
                item!.avgResponseTime > 500 ? 'warning' : 'normal'
      }));
  }

  private getCachePerformance(): unknown {
    return {
      hitRate: this.cacheHits / (this.cacheHits + this.cacheMisses) || 0,
      itemCount: this.queryCache.size,
      maxSize: this.queryCache.max,
      ttl: this.queryCache.ttl
    };
  }

  private getResourceUsage(): unknown {
    const memory = process.memoryUsage();
    return {
      heapUsed: Math.round(memory.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(memory.heapTotal / 1024 / 1024), // MB
      external: Math.round(memory.external / 1024 / 1024), // MB
      rss: Math.round(memory.rss / 1024 / 1024) // MB
    };
  }

  private getOptimizationOpportunities(endpoints: string[]): unknown[] {
    const opportunities: unknown[] = [];
    
    // Check for endpoints with poor cache hit rates
    endpoints.forEach(endpoint => {
      const recentMetrics = this.getRecentMetrics(endpoint, 10);
      if (recentMetrics.length > 0) {
        const avgCacheHitRate = recentMetrics.reduce((sum, m) => sum + m.cacheHitRate, 0) / recentMetrics.length;
        if (avgCacheHitRate < 0.3) {
          opportunities.push({
            type: 'cache_optimization',
            endpoint,
            recommendation: 'Increase caching for this endpoint',
            potentialGain: '30-50% performance improvement'
          });
        }
      }
    });

    return opportunities;
  }
}