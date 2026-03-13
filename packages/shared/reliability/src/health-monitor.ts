/**
 * Health Monitor - System health checking
 */

export interface HealthCheckResult {
  ok: boolean;
  message?: string;
  latency?: number;
  timestamp?: string;
}

export interface HealthStatus {
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  timestamp: string;
  checks: Record<string, HealthCheckResult>;
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
  };
}

export class HealthMonitor {
  private static checks = new Map<
    string,
    {
      name: string;
      category: string;
      timeoutMs: number;
      check: () => Promise<HealthCheckResult>;
    }
  >();

  static registerCheck(
    id: string,
    config: {
      name: string;
      category: string;
      timeoutMs: number;
      check: () => Promise<HealthCheckResult>;
    },
  ) {
    this.checks.set(id, config);
  }

  static async runChecks(): Promise<HealthStatus> {
    const results: Record<string, HealthCheckResult> = {};
    let healthy = 0;
    let degraded = 0;
    let unhealthy = 0;

    for (const [id, config] of this.checks.entries()) {
      try {
        const timeoutPromise = new Promise<HealthCheckResult>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), config.timeoutMs),
        );

        const result = await Promise.race([config.check(), timeoutPromise]);
        results[id] = {
          ...result,
          timestamp: new Date().toISOString(),
        };

        if (result.ok) {
          healthy++;
        } else {
          degraded++;
        }
      } catch (error) {
        results[id] = {
          ok: false,
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        };
        unhealthy++;
      }
    }

    const total = this.checks.size;
    const status: HealthStatus['status'] =
      unhealthy > 0 ? 'UNHEALTHY' : degraded > 0 ? 'DEGRADED' : 'HEALTHY';

    return {
      status,
      timestamp: new Date().toISOString(),
      checks: results,
      summary: {
        total,
        healthy,
        degraded,
        unhealthy,
      },
    };
  }
}
