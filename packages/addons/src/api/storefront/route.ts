/**
 * Storefront Add-ons API Route
 * 
 * GET /api/storefront/addons?storeId=xxx
 * 
 * Returns active add-ons for a storefront with their configurations.
 * Used by the AddOnProvider to load add-ons on the storefront.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');

    if (!storeId) {
      return NextResponse.json(
        { error: 'storeId parameter is required' },
        { status: 400 }
      );
    }

    // Fetch active add-ons for this store
    const storeAddOns = await prisma.storeAddOn.findMany({
      where: {
        storeId,
        status: 'ACTIVE',
      },
      include: {
        addOn: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: true,
            mountPoints: true,
            versions: {
              where: { status: 'PUBLISHED' },
              orderBy: { publishedAt: 'desc' },
              take: 1,
              select: {
                version: true,
                configSchema: true,
              },
            },
          },
        },
      },
    });

    // Transform for frontend consumption
    const addOns = storeAddOns.map((storeAddOn) => {
      const latestVersion = storeAddOn.addOn.versions[0];
      
      return {
        id: storeAddOn.id,
        addOnId: storeAddOn.addOnId,
        name: storeAddOn.addOn.name,
        slug: storeAddOn.addOn.slug,
        category: storeAddOn.addOn.category,
        status: storeAddOn.status,
        installedVersion: storeAddOn.installedVersion,
        latestVersion: latestVersion?.version || storeAddOn.installedVersion,
        updateAvailable: storeAddOn.updateAvailable,
        config: storeAddOn.config || {},
        enabledFeatures: storeAddOn.enabledFeatures || [],
        customCSS: storeAddOn.customCSS,
        customJS: storeAddOn.customJS,
        mountPointConfig: storeAddOn.mountPointConfig || {},
        mountPoints: storeAddOn.addOn.mountPoints || [],
        configSchema: latestVersion?.configSchema,
      };
    });

    return NextResponse.json({
      addOns,
      count: addOns.length,
    });

  } catch (error) {
    console.error('Storefront add-ons API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch add-ons' },
      { status: 500 }
    );
  }
}
