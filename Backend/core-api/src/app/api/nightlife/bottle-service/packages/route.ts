import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

/**
 * GET /api/nightlife/bottle-service/packages
 * Get available bottle packages
 */
export async function GET(): Promise<Response> {
  try {
    const packages = await (prisma as any).bottlePackage?.findMany({
      orderBy: [{ price: 'asc' }],
    });

    return NextResponse.json({ packages: packages || [] });
  } catch (error) {
    const _errMsg = error instanceof Error ? error.message : String(error);
    logger.error('[NIGHTLIFE_BOTTLE_PACKAGES_ERROR]', {
      error: _errMsg,
      app: 'backend',
    });

    return NextResponse.json(
      { error: 'Failed to fetch bottle packages' },
      { status: 500 }
    );
  }
}
