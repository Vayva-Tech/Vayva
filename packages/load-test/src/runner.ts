/**
 * Load Test Runner
 * Executes load test scenarios with configurable concurrency and duration
 */

import { MetricsAggregator } from './metrics/aggregator';
import { ScenarioDefinition, ScenarioOptions, ScenarioContext, ScenarioResult } from './index';

export interface LoadTestConfig {
  /** Default base URL for tests */
  defaultBaseUrl: string;
  /** Default concurrency level */
  defaultConcurrency: number;
  /** Default test duration in seconds */
  defaultDuration: number;
  /** Default ramp-up time in seconds */
  defaultRampUp: number;
  /** Request timeout in milliseconds */
  requestTimeout: number;
  /** Whether to follow redirects */
  followRedirects: boolean;
}

export interface LoadTestResult {
  scenarioName: string;
  config: {
    concurrency: number;
    duration: number;
    rampUp: number;
    baseUrl: string;
  };
  summary: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    totalDuration: number;
    averageRps: number;
  };
  latency: {
    min: number;
    max: number;
    average: number;
    p50: number;
    p95: number;
    p99: number;
  };
  statusCodes: Record<number, number>;
  errors: Array<{ message: string; count: number }>;
  timestamps: {
    start: Date;
    end: Date;
  };
}

export class LoadTestRunner {
  private config: LoadTestConfig;
  private metrics: MetricsAggregator;

  constructor(config: Partial<LoadTestConfig> = {}, metrics: MetricsAggregator) {
    this.config = {
      defaultBaseUrl: 'http://localhost:3000',
      defaultConcurrency: 50,
      defaultDuration: 30,
      defaultRampUp: 5,
      requestTimeout: 30000,
      followRedirects: true,
      ...config,
    };
    this.metrics = metrics;
  }

  /**
   * Run a load test scenario
   */
  async run(scenario: ScenarioDefinition, options: ScenarioOptions = {}): Promise<LoadTestResult> {
    const config = this.mergeOptions(options);
    const startTime = Date.now();
    const startDate = new Date();

    console.log(`🚀 Starting Load Test: ${scenario.name}`);
    console.log(`   Description: ${scenario.description}`);
    console.log(`   Target: ${config.baseUrl}`);
    console.log(`   Concurrency: ${config.concurrency} workers`);
    console.log(`   Duration: ${config.duration}s`);
    console.log(`   Ramp-up: ${config.rampUp}s`);
    console.log('');

    // Run setup if provided
    if (scenario.setup) {
      console.log('📋 Running setup...');
      await scenario.setup();
    }

    // Reset metrics for this run
    this.metrics.reset();

    // Execute the load test
    await this.executeLoadTest(scenario, config);

    // Run teardown if provided
    if (scenario.teardown) {
      console.log('🧹 Running teardown...');
      await scenario.teardown();
    }

    const endTime = Date.now();
    const endDate = new Date();

    // Generate result
    const result: LoadTestResult = {
      scenarioName: scenario.name,
      config: {
        concurrency: config.concurrency,
        duration: config.duration,
        rampUp: config.rampUp,
        baseUrl: config.baseUrl,
      },
      summary: {
        totalRequests: this.metrics.getTotalRequests(),
        successfulRequests: this.metrics.getSuccessfulRequests(),
        failedRequests: this.metrics.getFailedRequests(),
        totalDuration: endTime - startTime,
        averageRps: this.metrics.getAverageRps(endTime - startTime),
      },
      latency: this.metrics.getLatencyStats(),
      statusCodes: this.metrics.getStatusCodes(),
      errors: this.metrics.getErrors(),
      timestamps: {
        start: startDate,
        end: endDate,
      },
    };

    this.printResult(result);
    return result;
  }

  /**
   * Execute the actual load test with workers
   */
  private async executeLoadTest(scenario: ScenarioDefinition, config: Required<ScenarioOptions>): Promise<void> {
    const workers: Promise<void>[] = [];
    const sharedState = new Map<string, unknown>();
    const rampUpInterval = (config.rampUp * 1000) / config.concurrency;
    const endTime = Date.now() + (config.duration * 1000);

    for (let workerId = 0; workerId < config.concurrency; workerId++) {
      // Stagger worker start times for ramp-up
      await this.sleep(rampUpInterval);

      workers.push(
        this.runWorker(workerId, scenario, config, sharedState, endTime)
      );
    }

    await Promise.all(workers);
  }

  /**
   * Run a single worker
   */
  private async runWorker(
    workerId: number,
    scenario: ScenarioDefinition,
    config: Required<ScenarioOptions>,
    sharedState: Map<string, unknown>,
    endTime: number
  ): Promise<void> {
    let iteration = 0;

    while (Date.now() < endTime) {
      iteration++;

      const context = this.createContext(workerId, config, sharedState, iteration);
      const startTime = performance.now();

      try {
        const result = await scenario.execute(context);
        const duration = performance.now() - startTime;

        this.metrics.recordRequest({
          success: result.success,
          statusCode: result.statusCode || 0,
          duration,
          error: result.error,
        });

        // Stop on error if configured
        if (!result.success && config.stopOnError) {
          break;
        }
      } catch (error) {
        const duration = performance.now() - startTime;
        this.metrics.recordRequest({
          success: false,
          statusCode: 0,
          duration,
          error: error as Error,
        });

        if (config.stopOnError) {
          break;
        }
      }

      // Rate limiting
      if (config.maxRps) {
        const minInterval = 1000 / (config.maxRps / config.concurrency);
        await this.sleep(minInterval);
      } else {
        // Add jitter to avoid thundering herd
        await this.sleep(Math.random() * 100);
      }
    }
  }

  /**
   * Create a scenario context for a worker
   */
  private createContext(
    workerId: number,
    config: Required<ScenarioOptions>,
    sharedState: Map<string, unknown>,
    iteration: number
  ): ScenarioContext {
    return {
      workerId,
      baseUrl: config.baseUrl,
      iteration,
      state: sharedState,
      request: async (url: string, options: RequestInit = {}): Promise<Response> => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.requestTimeout);

        try {
          const response = await fetch(url.startsWith('http') ? url : `${config.baseUrl}${url}`, {
            ...options,
            signal: controller.signal,
          });
          return response;
        } finally {
          clearTimeout(timeoutId);
        }
      },
      log: (message: string): void => {
        console.log(`[Worker ${workerId}] ${message}`);
      },
      sleep: this.sleep,
    };
  }

  /**
   * Merge provided options with defaults
   */
  private mergeOptions(options: ScenarioOptions): Required<ScenarioOptions> {
    return {
      concurrency: options.concurrency ?? this.config.defaultConcurrency,
      duration: options.duration ?? this.config.defaultDuration,
      rampUp: options.rampUp ?? this.config.defaultRampUp,
      coolDown: options.coolDown ?? 0,
      baseUrl: options.baseUrl ?? this.config.defaultBaseUrl,
      maxRps: options.maxRps ?? 0,
      stopOnError: options.stopOnError ?? false,
    };
  }

  /**
   * Sleep for a duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Print test results
   */
  private printResult(result: LoadTestResult): void {
    console.log('\n📊 Load Test Results');
    console.log('===================================');
    console.log(`Scenario: ${result.scenarioName}`);
    console.log(`Duration: ${(result.summary.totalDuration / 1000).toFixed(2)}s`);
    console.log('');
    console.log('Requests:');
    console.log(`  Total:      ${result.summary.totalRequests}`);
    console.log(`  Successful: ${result.summary.successfulRequests}`);
    console.log(`  Failed:     ${result.summary.failedRequests}`);
    console.log(`  RPS:        ${result.summary.averageRps.toFixed(2)}`);
    console.log('');
    console.log('Latency (ms):');
    console.log(`  Min:     ${result.latency.min.toFixed(2)}`);
    console.log(`  Max:     ${result.latency.max.toFixed(2)}`);
    console.log(`  Average: ${result.latency.average.toFixed(2)}`);
    console.log(`  p50:     ${result.latency.p50.toFixed(2)}`);
    console.log(`  p95:     ${result.latency.p95.toFixed(2)}`);
    console.log(`  p99:     ${result.latency.p99.toFixed(2)}`);
    console.log('');
    console.log('Status Codes:');
    Object.entries(result.statusCodes)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .forEach(([code, count]) => {
        console.log(`  ${code}: ${count}`);
      });
    console.log('===================================\n');
  }
}
