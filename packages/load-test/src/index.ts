/**
 * Vayva Load Testing Framework
 * Comprehensive load testing with metrics collection and reporting
 */

import { LoadTestRunner, LoadTestConfig, LoadTestResult } from './runner';
import { MetricsAggregator, PerformanceMetrics } from './metrics/aggregator';
import { ScenarioRegistry } from './scenarios/registry';

export * from './runner';
export * from './metrics/aggregator';
export * from './scenarios/registry';

/**
 * Main entry point for load testing
 */
export class LoadTestFramework {
  private runner: LoadTestRunner;
  private metrics: MetricsAggregator;
  private registry: ScenarioRegistry;

  constructor(config: Partial<LoadTestConfig> = {}) {
    this.metrics = new MetricsAggregator();
    this.registry = new ScenarioRegistry();
    this.runner = new LoadTestRunner(config, this.metrics);
  }

  /**
   * Register a load test scenario
   */
  registerScenario(name: string, scenario: ScenarioDefinition): void {
    this.registry.register(name, scenario);
  }

  /**
   * Run a load test scenario
   */
  async runScenario(scenarioName: string, options: ScenarioOptions = {}): Promise<LoadTestResult> {
    const scenario = this.registry.get(scenarioName);
    if (!scenario) {
      throw new Error(`Scenario '${scenarioName}' not found`);
    }

    return this.runner.run(scenario, options);
  }

  /**
   * Run multiple scenarios in parallel
   */
  async runScenarios(
    scenarios: Array<{ name: string; options?: ScenarioOptions }>
  ): Promise<Record<string, LoadTestResult>> {
    const results: Record<string, LoadTestResult> = {};

    await Promise.all(
      scenarios.map(async ({ name, options }) => {
        results[name] = await this.runScenario(name, options);
      })
    );

    return results;
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return this.metrics.getMetrics();
  }

  /**
   * Generate a performance report
   */
  generateReport(): string {
    return this.metrics.generateReport();
  }

  /**
   * Compare current results against benchmarks
   */
  compareAgainstBenchmarks(benchmarks: BenchmarkConfig): BenchmarkComparison {
    return this.metrics.compareAgainstBenchmarks(benchmarks);
  }
}

/**
 * Scenario definition interface
 */
export interface ScenarioDefinition {
  name: string;
  description: string;
  /** The test function to execute */
  execute: (context: ScenarioContext) => Promise<ScenarioResult>;
  /** Setup function run once before the test */
  setup?: () => Promise<void>;
  /** Teardown function run once after the test */
  teardown?: () => Promise<void>;
}

/**
 * Context passed to each scenario execution
 */
export interface ScenarioContext {
  /** Unique worker ID */
  workerId: number;
  /** Base URL for the target */
  baseUrl: string;
  /** Current iteration number */
  iteration: number;
  /** Shared state across iterations */
  state: Map<string, unknown>;
  /** Make an HTTP request with automatic metrics collection */
  request: (url: string, options?: RequestInit) => Promise<Response>;
  /** Log a message */
  log: (message: string) => void;
  /** Sleep for a duration */
  sleep: (ms: number) => Promise<void>;
}

/**
 * Result from a scenario execution
 */
export interface ScenarioResult {
  success: boolean;
  statusCode?: number;
  duration: number;
  error?: Error;
  metadata?: Record<string, unknown>;
}

/**
 * Options for running a scenario
 */
export interface ScenarioOptions {
  /** Number of concurrent workers */
  concurrency?: number;
  /** Test duration in seconds */
  duration?: number;
  /** Ramp-up time in seconds */
  rampUp?: number;
  /** Cool-down time in seconds */
  coolDown?: number;
  /** Target base URL */
  baseUrl?: string;
  /** Maximum requests per second */
  maxRps?: number;
  /** Whether to stop on first error */
  stopOnError?: boolean;
}

/**
 * Benchmark configuration for comparison
 */
export interface BenchmarkConfig {
  /** Target p95 latency in ms */
  p95Latency?: number;
  /** Target p99 latency in ms */
  p99Latency?: number;
  /** Target average latency in ms */
  avgLatency?: number;
  /** Target requests per second */
  targetRps?: number;
  /** Target error rate (0-1) */
  maxErrorRate?: number;
  /** Target success rate (0-1) */
  minSuccessRate?: number;
}

/**
 * Benchmark comparison result
 */
export interface BenchmarkComparison {
  passed: boolean;
  metrics: {
    p95Latency: { actual: number; target: number; passed: boolean };
    p99Latency: { actual: number; target: number; passed: boolean };
    avgLatency: { actual: number; target: number; passed: boolean };
    rps: { actual: number; target: number; passed: boolean };
    errorRate: { actual: number; target: number; passed: boolean };
    successRate: { actual: number; target: number; passed: boolean };
  };
  summary: string;
}

// Create default framework instance
export const loadTest = new LoadTestFramework();

export default LoadTestFramework;
