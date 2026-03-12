/**
 * Performance Benchmark Configuration
 * Centralized configuration for all performance benchmarks
 */

/**
 * Benchmark targets for VAYVA V2
 */
export const BENCHMARK_TARGETS = {
  /** API Response Time Targets */
  api: {
    p50: 50,   // 50th percentile: 50ms
    p95: 200,  // 95th percentile: 200ms
    p99: 500,  // 99th percentile: 500ms
    max: 1000, // Maximum: 1000ms
  },
  
  /** Database Query Targets */
  database: {
    simple: 10,     // Simple queries: 10ms
    complex: 50,    // Complex queries: 50ms
    aggregation: 100, // Aggregation queries: 100ms
    max: 200,       // Maximum acceptable: 200ms
  },
  
  /** Cache Performance Targets */
  cache: {
    hitRate: 0.90,     // 90% hit rate
    missRate: 0.10,    // 10% miss rate
    getLatency: 5,     // 5ms for GET operations
    setLatency: 10,    // 10ms for SET operations
  },
  
  /** Throughput Targets */
  throughput: {
    rps: 100,          // 100 requests per second
    concurrentUsers: 1000, // 1000 concurrent users
    checkoutPerMinute: 60, // 60 checkouts per minute
  },
  
  /** Resource Utilization Targets */
  resources: {
    cpuMax: 0.80,      // 80% CPU max
    memoryMax: 0.85,   // 85% memory max
    dbConnectionsMax: 0.80, // 80% of pool capacity
  },
} as const;

/**
 * Benchmark categories
 */
export const BENCHMARK_CATEGORIES = {
  API: 'api',
  DATABASE: 'database',
  CACHE: 'cache',
  MEMORY: 'memory',
  CPU: 'cpu',
} as const;

export type BenchmarkCategory = typeof BENCHMARK_CATEGORIES[keyof typeof BENCHMARK_CATEGORIES];

/**
 * Benchmark result interface
 */
export interface BenchmarkResult {
  name: string;
  category: BenchmarkCategory;
  timestamp: Date;
  iterations: number;
  duration: {
    total: number;
    average: number;
    min: number;
    max: number;
    p50: number;
    p95: number;
    p99: number;
  };
  throughput?: {
    opsPerSecond: number;
    totalOps: number;
  };
  memory?: {
    before: number;
    after: number;
    delta: number;
  };
  passed: boolean;
  targets: {
    p95?: number;
    p99?: number;
    average?: number;
    opsPerSecond?: number;
  };
}

/**
 * Benchmark configuration options
 */
export interface BenchmarkConfig {
  name: string;
  category: BenchmarkCategory;
  iterations: number;
  warmupIterations?: number;
  timeout?: number;
  targets?: {
    p95?: number;
    p99?: number;
    average?: number;
    opsPerSecond?: number;
  };
}

/**
 * Get benchmark configuration by category
 */
export function getBenchmarkConfig(category: BenchmarkCategory): Partial<BenchmarkConfig> {
  switch (category) {
    case BENCHMARK_CATEGORIES.API:
      return {
        iterations: 1000,
        warmupIterations: 100,
        targets: {
          p95: BENCHMARK_TARGETS.api.p95,
          p99: BENCHMARK_TARGETS.api.p99,
          average: BENCHMARK_TARGETS.api.p50,
        },
      };
    case BENCHMARK_CATEGORIES.DATABASE:
      return {
        iterations: 500,
        warmupIterations: 50,
        targets: {
          p95: BENCHMARK_TARGETS.database.complex,
          average: BENCHMARK_TARGETS.database.simple,
        },
      };
    case BENCHMARK_CATEGORIES.CACHE:
      return {
        iterations: 10000,
        warmupIterations: 1000,
        targets: {
          p95: BENCHMARK_TARGETS.cache.getLatency,
          average: BENCHMARK_TARGETS.cache.getLatency / 2,
        },
      };
    default:
      return {
        iterations: 1000,
        warmupIterations: 100,
      };
  }
}

/**
 * Performance thresholds for CI/CD gates
 */
export const CI_PERFORMANCE_THRESHOLDS = {
  maxRegressionPercent: 10, // 10% regression allowed
  minImprovementPercent: 5, // 5% improvement to celebrate
  requiredBenchmarks: [
    'api-response-time',
    'database-query-time',
    'cache-hit-rate',
    'checkout-throughput',
  ],
} as const;

/**
 * Environment-specific benchmark settings
 */
export function getEnvironmentConfig(): { iterations: number; parallel: boolean } {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return { iterations: 5000, parallel: false };
    case 'staging':
      return { iterations: 2000, parallel: true };
    case 'ci':
      return { iterations: 500, parallel: true };
    default:
      return { iterations: 100, parallel: true };
  }
}
