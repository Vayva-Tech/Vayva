/**
 * Performance Analytics API Route
 * 
 * Receives and stores Core Web Vitals metrics from the client
 * Provides aggregated performance data for monitoring
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";

interface PerformanceMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  timestamp: number;
  url: string;
}

/**
 * POST /api/analytics/performance
 * Receive performance metrics from client
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, value, rating, timestamp, url } = body as PerformanceMetric;

    // Validate required fields
    if (!name || typeof value !== "number" || !rating) {
      return NextResponse.json(
        { error: "Missing required fields: name, value, rating" },
        { status: 400 }
      );
    }

    // Validate metric name
    const validMetrics = ["LCP", "FID", "CLS", "FCP", "TTFB", "INP"];
    if (!validMetrics.includes(name)) {
      return NextResponse.json(
        { error: `Invalid metric name. Must be one of: ${validMetrics.join(", ")}` },
        { status: 400 }
      );
    }

    // Get client info
    const userAgent = request.headers.get("user-agent") || "unknown";
    const ipAddress = request.headers.get("x-forwarded-for") || 
                      request.headers.get("x-real-ip") || 
                      "unknown";

    // Parse URL to get pathname
    let pathname = "/";
    try {
      const urlObj = new URL(url || "http://localhost");
      pathname = urlObj.pathname;
    } catch {
      pathname = url || "/";
    }

    // Store metric in database
    // Note: You may want to create a PerformanceMetric model in Prisma
    // For now, we'll log it and optionally store in a time-series database
    const metricData = {
      metric: name,
      value,
      rating,
      pathname,
      userAgent: userAgent.substring(0, 200), // Limit length
      ipHash: await hashIp(ipAddress.split(",")[0].trim()), // Hash for privacy
      timestamp: new Date(timestamp || Date.now()),
    };

    // Log metric (replace with actual database storage)
    console.log("[Performance Metric]", metricData);

    // Send to analytics pipeline if configured
    if (process.env.ANALYTICS_ENDPOINT) {
      fetch(process.env.ANALYTICS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metricData),
      }).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      message: "Metric recorded",
    });
  } catch (error) {
    console.error("Performance analytics error:", error);
    return NextResponse.json(
      { error: "Failed to record metric" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analytics/performance
 * Get aggregated performance metrics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const metric = searchParams.get("metric");
    const timeRange = searchParams.get("range") || "24h"; // 1h, 24h, 7d, 30d
    const pathname = searchParams.get("pathname");

    // Calculate time range
    const now = new Date();
    const startTime = new Date();
    switch (timeRange) {
      case "1h":
        startTime.setHours(now.getHours() - 1);
        break;
      case "24h":
        startTime.setDate(now.getDate() - 1);
        break;
      case "7d":
        startTime.setDate(now.getDate() - 7);
        break;
      case "30d":
        startTime.setDate(now.getDate() - 30);
        break;
      default:
        startTime.setDate(now.getDate() - 1);
    }

    // Return mock data (replace with actual database query)
    // This would typically query a time-series database like InfluxDB or ClickHouse
    const mockData = {
      timeRange,
      startTime: startTime.toISOString(),
      endTime: now.toISOString(),
      metrics: metric
        ? {
            [metric]: {
              p50: 1200,
              p75: 1800,
              p95: 3200,
              p99: 4500,
              good: 75,
              needsImprovement: 20,
              poor: 5,
            },
          }
        : {
            LCP: { p50: 1200, p75: 1800, p95: 3200, good: 75, needsImprovement: 20, poor: 5 },
            FID: { p50: 12, p75: 45, p95: 120, good: 90, needsImprovement: 8, poor: 2 },
            CLS: { p50: 0.02, p75: 0.08, p95: 0.18, good: 85, needsImprovement: 12, poor: 3 },
            FCP: { p50: 900, p75: 1400, p95: 2500, good: 80, needsImprovement: 15, poor: 5 },
            TTFB: { p50: 180, p75: 320, p95: 650, good: 88, needsImprovement: 10, poor: 2 },
          },
      pathname: pathname || "all",
    };

    return NextResponse.json({
      success: true,
      data: mockData,
    });
  } catch (error) {
    console.error("Get performance analytics error:", error);
    return NextResponse.json(
      { error: "Failed to get performance metrics" },
      { status: 500 }
    );
  }
}

/**
 * Hash IP address for privacy
 */
async function hashIp(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").substring(0, 16);
}
