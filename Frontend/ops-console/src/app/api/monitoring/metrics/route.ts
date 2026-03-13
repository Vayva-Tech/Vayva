/**
 * Monitoring API Endpoint
 * Get current metrics and manage alerts
 */

import { NextRequest, NextResponse } from 'next/server';
import { monitoringService } from '@/lib/monitoring';

export const dynamic = 'force-dynamic';

/**
 * GET /api/monitoring/metrics
 * Get current system metrics
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const metricName = searchParams.get('metric');

    if (metricName) {
      // Get specific metric
      const metric = await monitoringService.getCurrentMetric(metricName);
      
      if (!metric) {
        return NextResponse.json(
          { error: `Unknown metric: ${metricName}` },
          { status: 404 }
        );
      }

      return NextResponse.json(metric);
    }

    // Get all metrics
    const metrics = await Promise.all([
      monitoringService.getCurrentMetric('error_rate'),
      monitoringService.getCurrentMetric('response_time_p95'),
      monitoringService.getCurrentMetric('health_score_average'),
      monitoringService.getCurrentMetric('nps_response_rate'),
      monitoringService.getCurrentMetric('playbook_failure_rate'),
    ]);

    return NextResponse.json({
      metrics: metrics.filter(m => m !== null),
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
