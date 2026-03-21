import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@vayva/infra/db';

/**
 * POST /api/analytics/cookie-consent/track
 * Track cookie consent events for GDPR compliance analytics
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.choice || !['accept_all', 'reject_all', 'customize'].includes(body.choice)) {
      return NextResponse.json(
        { error: 'Invalid choice. Must be accept_all, reject_all, or customize' },
        { status: 400 }
      );
    }
    
    // Generate unique event ID for deduplication
    const eventId = `${body.choice}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Detect region from IP (simplified - integrate with your IP geolocation service)
    const region = detectRegionFromIP(request);
    
    // Create consent event
    const event = await prisma.cookieConsentEvent.create({
      data: {
        eventId,
        choice: body.choice,
        functional: body.functional ?? false,
        analytics: body.analytics ?? false,
        marketing: body.marketing ?? false,
        region: body.region || region,
        userAgent: body.userAgent || request.headers.get('user-agent'),
        timestamp: new Date(body.timestamp || Date.now()),
      },
    });
    
    return NextResponse.json({ 
      success: true, 
      eventId: event.id,
      message: 'Consent event tracked successfully'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Failed to track cookie consent:', error);
    return NextResponse.json(
      { error: 'Failed to track cookie consent event' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analytics/cookie-consent
 * Get aggregated cookie consent analytics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7d';
    
    // Calculate date range
    const startDate = new Date();
    switch (range) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }
    
    // Fetch events within date range
    const events = await prisma.cookieConsentEvent.findMany({
      where: {
        timestamp: { gte: startDate },
      },
      orderBy: { timestamp: 'asc' },
    });
    
    // Calculate metrics
    const total = events.length;
    const acceptAll = events.filter(e => e.choice === 'accept_all').length;
    const rejectAll = events.filter(e => e.choice === 'reject_all').length;
    const customize = events.filter(e => e.choice === 'customize').length;
    
    const consentRate = total > 0 ? ((acceptAll / total) * 100).toFixed(1) : '0.0';
    const rejectRate = total > 0 ? ((rejectAll / total) * 100).toFixed(1) : '0.0';
    const customizeRate = total > 0 ? ((customize / total) * 100).toFixed(1) : '0.0';
    
    // Group by region
    const byRegionMap = events.reduce((acc, event) => {
      const region = event.region || 'Unknown';
      if (!acc[region]) {
        acc[region] = { total: 0, accept: 0, reject: 0, customize: 0 };
      }
      acc[region].total++;
      if (event.choice === 'accept_all') acc[region].accept++;
      else if (event.choice === 'reject_all') acc[region].reject++;
      else if (event.choice === 'customize') acc[region].customize++;
      return acc;
    }, {} as Record<string, { total: number; accept: number; reject: number; customize: number }>);
    
    const byRegion = Object.entries(byRegionMap).map(([region, data]) => ({
      region,
      visitors: data.total,
      acceptRate: ((data.accept / data.total) * 100).toFixed(1),
      rejectRate: ((data.reject / data.total) * 100).toFixed(1),
      customizeRate: ((data.customize / data.total) * 100).toFixed(1),
    }));
    
    // Daily trend for chart
    const dailyTrendMap = events.reduce((acc, event) => {
      const date = event.timestamp.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { accept: 0, reject: 0, customize: 0 };
      }
      if (event.choice === 'accept_all') acc[date].accept++;
      else if (event.choice === 'reject_all') acc[date].reject++;
      else if (event.choice === 'customize') acc[date].customize++;
      return acc;
    }, {} as Record<string, { accept: number; reject: number; customize: number }>);
    
    const trend = Object.entries(dailyTrendMap).map(([date, data]) => ({
      date,
      accept: data.accept,
      reject: data.reject,
      customize: data.customize,
    })).slice(-7); // Last 7 days
    
    return NextResponse.json({
      metrics: {
        totalVisitors: total,
        consentRate: parseFloat(consentRate),
        rejectRate: parseFloat(rejectRate),
        customizeRate: parseFloat(customizeRate),
      },
      byRegion,
      trend,
      period: {
        start: startDate.toISOString(),
        end: new Date().toISOString(),
        range,
      },
    });
    
  } catch (error) {
    console.error('Failed to fetch cookie consent analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cookie consent analytics' },
      { status: 500 }
    );
  }
}

/**
 * Helper: Detect region from IP address
 * Integrate with your preferred IP geolocation service
 */
function detectRegionFromIP(request: NextRequest): string | null {
  // Option 1: Use Vercel's built-in geo
  const geo = request.geo;
  if (geo?.country) {
    if (geo.country === 'NG') return 'Nigeria';
    if (['DE', 'FR', 'NL', 'IE', 'ES', 'IT'].includes(geo.country)) return 'European Union';
    if (geo.country === 'GB') return 'United Kingdom';
    if (geo.country === 'US') return 'United States';
  }
  
  // Option 2: Use header-based detection (if using Cloudflare, AWS, etc.)
  const countryHeader = request.headers.get('cf-ipcountry') || 
                        request.headers.get('x-country-code');
  
  if (countryHeader) {
    if (countryHeader === 'NG') return 'Nigeria';
    if (['DE', 'FR', 'NL', 'IE', 'ES', 'IT'].includes(countryHeader)) return 'European Union';
    if (countryHeader === 'GB') return 'United Kingdom';
    if (countryHeader === 'US') return 'United States';
  }
  
  return 'Unknown';
}
