/**
 * Custom Domains API
 * 
 * Manage custom domains for merchant stores
 * - Add custom domain
 * - Verify DNS records
 * - Configure SSL
 * - Set primary domain
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@vayva/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Validation schema
const addDomainSchema = z.object({
  domain: z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/, 'Invalid domain format'),
});

/**
 * GET /api/merchant/domains
 * List all domains for the current store
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get store for current user
    const membership = await prisma.membership.findFirst({
      where: { userId: session.user.id, status: 'ACTIVE' },
      select: { storeId: true },
    });
    
    if (!membership?.storeId) {
      return NextResponse.json(
        { error: 'No active store found' },
        { status: 404 }
      );
    }
    
    const storeId = membership.storeId;
    
    // Fetch domains from database
    const customDomains = await prisma.customDomain.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
    });
    
    // Get primary domain info from settings or use first active domain
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { settings: true },
    });
    
    const storeSettings = store?.settings as { primaryDomain?: string } | null;
    const primaryDomain = storeSettings?.primaryDomain;
    
    const domains = customDomains.map((domain) => ({
      id: domain.id,
      domain: domain.domain,
      status: domain.status === 'active' ? 'active' : 'pending',
      dnsVerified: domain.status === 'active',
      sslStatus: domain.status === 'active' ? 'active' : 'pending',
      isPrimary: primaryDomain === domain.domain,
      verificationType: domain.verificationType,
      expectedValue: domain.expectedValue,
      createdAt: domain.createdAt.toISOString(),
    }));
    
    return NextResponse.json({ domains });
  } catch (error) {
    console.error('Failed to fetch domains:', error);
    return NextResponse.json(
      { error: 'Failed to fetch domains' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/merchant/domains
 * Add a new custom domain
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const result = addDomainSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid domain format', details: result.error.flatten() },
        { status: 400 }
      );
    }
    
    const { domain } = result.data;
    
    // Get store for current user
    const membership = await prisma.membership.findFirst({
      where: { userId: session.user.id, status: 'ACTIVE' },
      select: { storeId: true },
    });
    
    if (!membership?.storeId) {
      return NextResponse.json(
        { error: 'No active store found' },
        { status: 404 }
      );
    }
    
    const storeId = membership.storeId;
    
    // Check if domain already exists
    const existingDomain = await prisma.customDomain.findUnique({
      where: { domain },
    });
    
    if (existingDomain) {
      return NextResponse.json(
        { error: 'Domain already exists' },
        { status: 409 }
      );
    }
    
    // Generate required DNS records
    const expectedValue = 'cname.vayva.ng';
    
    // Create domain in database
    const customDomain = await prisma.customDomain.create({
      data: {
        storeId,
        domain,
        status: 'pending_verification',
        verificationType: 'cname',
        expectedValue,
      },
    });
    
    const newDomain = {
      id: customDomain.id,
      storeId: customDomain.storeId,
      domain: customDomain.domain,
      status: 'pending',
      dnsVerified: false,
      sslStatus: 'pending',
      isPrimary: false,
      verificationType: customDomain.verificationType,
      expectedValue: customDomain.expectedValue,
      createdAt: customDomain.createdAt.toISOString(),
    };
    
    return NextResponse.json({ domain: newDomain }, { status: 201 });
  } catch (error) {
    console.error('Failed to add domain:', error);
    return NextResponse.json(
      { error: 'Failed to add domain' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/merchant/domains
 * Remove a custom domain
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const domainId = searchParams.get('id');
    
    if (!domainId) {
      return NextResponse.json(
        { error: 'Domain ID parameter required' },
        { status: 400 }
      );
    }
    
    // Get store for current user
    const membership = await prisma.membership.findFirst({
      where: { userId: session.user.id, status: 'ACTIVE' },
      select: { storeId: true },
    });
    
    if (!membership?.storeId) {
      return NextResponse.json(
        { error: 'No active store found' },
        { status: 404 }
      );
    }
    
    const storeId = membership.storeId;
    
    // Verify domain belongs to this store
    const domain = await prisma.customDomain.findFirst({
      where: { id: domainId, storeId },
    });
    
    if (!domain) {
      return NextResponse.json(
        { error: 'Domain not found' },
        { status: 404 }
      );
    }
    
    // Delete from database
    await prisma.customDomain.delete({
      where: { id: domainId },
    });
    
    // If this was the primary domain, clear it from store settings
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { settings: true },
    });
    
    const storeSettings = store?.settings as { primaryDomain?: string } | null;
    if (storeSettings?.primaryDomain === domain.domain) {
      const newSettings = { ...storeSettings, primaryDomain: null };
      await prisma.store.update({
        where: { id: storeId },
        data: { settings: newSettings },
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to remove domain:', error);
    return NextResponse.json(
      { error: 'Failed to remove domain' },
      { status: 500 }
    );
  }
}
