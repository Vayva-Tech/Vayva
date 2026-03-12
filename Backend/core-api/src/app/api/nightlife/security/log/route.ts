import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

/**
 * GET /api/nightlife/security/log
 * Get security incident log
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const venueId = searchParams.get('venueId');
    const eventId = searchParams.get('eventId');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (venueId) where.venueId = venueId;
    if (eventId) where.eventId = eventId;
    if (status) where.status = status;

    const incidents = await (prisma as any).securityIncident?.findMany({
      where,
      orderBy: [{ reportedAt: 'desc' }],
    });

    const activeIncidents = incidents?.filter((i: { status: string }) => 
      ['open', 'escalated'].includes(i.status)
    ) || [];

    const stats = {
      total: incidents?.length || 0,
      active: activeIncidents.length,
      resolved: incidents?.filter((i: { status: string }) => i.status === 'resolved').length || 0,
      byType: {} as Record<string, number>,
    };

    incidents?.forEach((i: { type: string }) => {
      stats.byType[i.type] = (stats.byType[i.type] || 0) + 1;
    });

    return NextResponse.json({
      incidents: incidents || [],
      activeIncidents,
      stats,
    });
  } catch (error) {
    const _errMsg = error instanceof Error ? error.message : String(error);
    logger.error('[NIGHTLIFE_SECURITY_LOG_ERROR]', {
      error: _errMsg,
      app: 'backend',
    });

    return NextResponse.json(
      { error: 'Failed to fetch security log' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/nightlife/security/incidents
 * Report new security incident
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const {
      eventId,
      venueId,
      type,
      description,
      location,
      severity,
      officerName,
      officerId,
      involvedPersons,
      actionsTaken,
    } = body;

    if (!eventId || !venueId || !type || !description || !officerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const incident = await (prisma as any).securityIncident?.create({
      data: {
        eventId,
        venueId,
        type,
        description,
        location,
        severity,
        status: 'open',
        officerName,
        officerId,
        involvedPersons,
        actionsTaken,
        reportedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, incident });
  } catch (error) {
    const _errMsg = error instanceof Error ? error.message : String(error);
    logger.error('[NIGHTLIFE_REPORT_INCIDENT_ERROR]', {
      error: _errMsg,
      app: 'backend',
    });

    return NextResponse.json(
      { error: 'Failed to report incident' },
      { status: 500 }
    );
  }
}
