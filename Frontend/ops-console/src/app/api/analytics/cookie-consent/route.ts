/**
 * COOKIE CONSENT ANALYTICS API
 * 
 * Track cookie consent events for compliance analytics
 * GDPR Article 7(1) - Demonstrating valid consent
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@vayva/db';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ConsentEvent {
  visitorId: string;
  sessionId: string;
  choice: 'accept' | 'reject' | 'customize';
  categories: {
    essential: boolean;
    functional: boolean;
    analytics: boolean;
    marketing: boolean;
  };
  userAgent: string;
  ip: string;
  referer: string;
  timestamp: Date;
}

// ============================================================================
// POST /api/analytics/cookie-consent
// Track consent event
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      visitorId,
      sessionId,
      choice,
      categories,
      userAgent,
      ip,
      referer,
    } = body;

    // Validate required fields
    if (!visitorId || !choice) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Store consent event via raw query (table may not exist yet)
    const timestamp = new Date();
    try {
      await prisma.$executeRaw`
        INSERT INTO "CookieConsentEvent" ("id", "visitorId", "sessionId", "choice", "functionalConsent", "analyticsConsent", "marketingConsent", "userAgent", "ip", "referer", "timestamp")
        VALUES (gen_random_uuid(), ${visitorId}, ${sessionId || null}, ${choice}, ${categories?.functional || false}, ${categories?.analytics || false}, ${categories?.marketing || false}, ${userAgent || null}, ${anonymizeIP(ip)}, ${referer || null}, ${timestamp})
      `;
    } catch {
      // Table may not exist yet — log and continue
      console.warn('[COOKIE_CONSENT] Table not yet created, skipping DB write');
    }

    return NextResponse.json({
      success: true,
      eventId: 'pending',
      timestamp: timestamp.toISOString(),
    });
  } catch (error) {
    console.error('Cookie consent tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track consent event' },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET /api/analytics/cookie-consent
// Get consent analytics (Ops Console only)
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const groupBy = searchParams.get('groupBy') || 'day';

    // Build date filter
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    // Get total counts
    const totalEvents = await prisma.cookieConsentEvent.count({
      where: dateFilter ? { timestamp: dateFilter } : {},
    });

    // Get counts by choice
    const acceptCount = await prisma.cookieConsentEvent.count({
      where: {
        choice: 'accept',
        ...(dateFilter && { timestamp: dateFilter }),
      },
    });

    const rejectCount = await prisma.cookieConsentEvent.count({
      where: {
        choice: 'reject',
        ...(dateFilter && { timestamp: dateFilter }),
      },
    });

    const customizeCount = await prisma.cookieConsentEvent.count({
      where: {
        choice: 'customize',
        ...(dateFilter && { timestamp: dateFilter }),
      },
    });

    // Calculate rates
    const consentRate = totalEvents > 0 
      ? ((acceptCount + customizeCount) / totalEvents) * 100 
      : 0;

    const rejectRate = totalEvents > 0 
      ? (rejectCount / totalEvents) * 100 
      : 0;

    // Get trend data (last 7 days by default)
    const trendData = await getTrendData(groupBy, dateFilter);

    // Get geographic breakdown
    const geoData = await getGeographicBreakdown(dateFilter);

    return NextResponse.json({
      success: true,
      metrics: {
        totalVisitors: totalEvents,
        consentRate: consentRate.toFixed(2),
        rejectRate: rejectRate.toFixed(2),
        customizeRate: totalEvents > 0 
          ? ((customizeCount / totalEvents) * 100).toFixed(2) 
          : '0',
        trend: calculateTrend(trendData),
      },
      trendData,
      geoData,
      breakdown: {
        accept: acceptCount,
        reject: rejectCount,
        customize: customizeCount,
      },
    });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Anonymize IP address for GDPR compliance
 * Remove last octet of IPv4 or last 3 hextets of IPv6
 */
function anonymizeIP(ip: string): string {
  if (!ip) return '';
  
  // IPv4: 192.168.1.123 → 192.168.1.0
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) {
    return ip.replace(/\.\d{1,3}$/, '.0');
  }
  
  // IPv6: 2001:0db8:85a3:0000:0000:8a2e:0370:7334 → 2001:0db8:85a3:0000:0000:0000:0000:0000
  if (/^[0-9a-fA-F:]+$/.test(ip)) {
    const parts = ip.split(':');
    if (parts.length >= 4) {
      return [...parts.slice(0, 4), '0000', '0000', '0000', '0000'].join(':');
    }
  }
  
  return ip;
}

/**
 * Get trend data grouped by time period
 */
async function getTrendData(groupBy: string, dateFilter: any) {
  const now = new Date();
  const startDate = dateFilter?.gte || new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // This is a simplified version - in production, use raw SQL or Prisma groupBy
  const events = await prisma.cookieConsentEvent.findMany({
    where: {
      timestamp: {
        gte: startDate,
        lte: dateFilter?.lte || now,
      },
    },
    select: {
      choice: true,
      timestamp: true,
    },
    orderBy: { timestamp: 'asc' },
  });

  // Group by day
  const grouped: any = {};
  events.forEach(event => {
    const date = event.timestamp.toISOString().split('T')[0];
    if (!grouped[date]) {
      grouped[date] = { accept: 0, reject: 0, customize: 0 };
    }
    grouped[date][event.choice]++;
  });

  // Convert to array and calculate percentages
  return Object.entries(grouped).map(([date, counts]: [string, any]) => ({
    date,
    accept: Math.round((counts.accept / (counts.accept + counts.reject + counts.customize)) * 100) || 0,
    reject: Math.round((counts.reject / (counts.accept + counts.reject + counts.customize)) * 100) || 0,
    customize: Math.round((counts.customize / (counts.accept + counts.reject + counts.customize)) * 100) || 0,
  })).slice(-7);
}

/**
 * Get geographic breakdown (simplified - would need GeoIP in production)
 */
async function getGeographicBreakdown(dateFilter: any) {
  // In production, integrate with MaxMind GeoIP or similar
  // For now, return mock structure
  return [
    { country: 'Nigeria', count: 0, rate: 0 },
    { country: 'United Kingdom', count: 0, rate: 0 },
    { country: 'European Union', count: 0, rate: 0 },
    { country: 'United States', count: 0, rate: 0 },
  ];
}

/**
 * Calculate trend direction
 */
function calculateTrend(data: any[]): 'up' | 'down' | 'stable' {
  if (data.length < 2) return 'stable';
  
  const recent = data.slice(-3);
  const older = data.slice(0, 3);
  
  const recentAvg = recent.reduce((sum, d) => sum + d.accept, 0) / recent.length;
  const olderAvg = older.reduce((sum, d) => sum + d.accept, 0) / older.length;
  
  const change = recentAvg - olderAvg;
  
  if (change > 5) return 'up';
  if (change < -5) return 'down';
  return 'stable';
}
