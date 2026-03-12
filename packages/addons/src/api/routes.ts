/**
 * Add-on Management API Routes
 * 
 * Provides endpoints for:
 * - Installing, uninstalling, and updating add-ons
 * - Configuring add-on settings
 * - Managing add-on status
 * - Checking for updates
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const installSchema = z.object({
  addOnId: z.string(),
  version: z.string().optional(),
  config: z.record(z.any()).optional(),
});

const uninstallSchema = z.object({
  addOnId: z.string(),
  removeData: z.boolean().default(false),
});

const updateSchema = z.object({
  addOnId: z.string(),
  version: z.string(),
});

const configSchema = z.object({
  addOnId: z.string(),
  config: z.record(z.any()),
  enabledFeatures: z.array(z.string()).optional(),
  customCSS: z.string().optional(),
  customJS: z.string().optional(),
  mountPointConfig: z.record(z.any()).optional(),
});

const statusSchema = z.object({
  addOnId: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

// ============================================================================
// AUTHENTICATION HELPER
// ============================================================================

async function authenticate(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  // Get store from header or session
  const storeId = request.headers.get('x-store-id') || session.user.storeId;
  
  if (!storeId) {
    return { error: NextResponse.json({ error: 'Store ID required' }, { status: 400 }) };
  }

  // Verify user has access to this store
  const store = await prisma.store.findFirst({
    where: {
      id: storeId,
      users: {
        some: {
          userId: session.user.id,
        },
      },
    },
  });

  if (!store) {
    return { error: NextResponse.json({ error: 'Store access denied' }, { status: 403 }) };
  }

  return { session, storeId };
}

// ============================================================================
// INSTALL ADD-ON
// POST /api/addons/install
// ============================================================================

export async function POST_install(request: NextRequest) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const { addOnId, version, config } = installSchema.parse(body);
    const { storeId } = auth;

    // Check if add-on exists in registry
    const addOn = await prisma.addOn.findUnique({
      where: { id: addOnId, status: 'PUBLISHED' },
      include: { versions: { orderBy: { createdAt: 'desc' } } },
    });

    if (!addOn) {
      return NextResponse.json(
        { error: 'Add-on not found or not available' },
        { status: 404 }
      );
    }

    // Check if already installed
    const existing = await prisma.storeAddOn.findUnique({
      where: {
        storeId_addOnId: { storeId, addOnId },
      },
    });

    if (existing && !['UNINSTALLED', 'ERROR'].includes(existing.status)) {
      return NextResponse.json(
        { error: 'Add-on already installed', status: existing.status },
        { status: 409 }
      );
    }
    
    // Determine which version to install
    const targetVersion = version || addOn.versions.find(v => v.status === 'PUBLISHED')?.version || '1.0.0';

    // Create or update installation record
    const storeAddOn = await prisma.storeAddOn.upsert({
      where: {
        storeId_addOnId: { storeId, addOnId },
      },
      create: {
        storeId,
        addOnId,
        status: 'INSTALLING',
        installedVersion: targetVersion,
        latestVersion: targetVersion,
        config: config || {},
        priceKobo: BigInt(0), // Pricing handled separately
        currency: 'NGN',
        installedAt: new Date(),
      },
      update: {
        status: 'INSTALLING',
        installedVersion: targetVersion,
        latestVersion: targetVersion,
        config: config || existing?.config || {},
        installedAt: new Date(),
        lastError: null,
        lastErrorAt: null,
        retryCount: 0,
      },
    });

    // TODO: Trigger async installation process (WebSocket, background job)
    // For now, we'll mark it as active immediately
    await prisma.storeAddOn.update({
      where: { id: storeAddOn.id },
      data: { status: 'ACTIVE' },
    });

    return NextResponse.json({
      success: true,
      message: 'Add-on installation initiated',
      installation: {
        id: storeAddOn.id,
        addOnId,
        status: 'ACTIVE',
        installedVersion: targetVersion,
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Add-on install error:', error);
    return NextResponse.json(
      { error: 'Failed to install add-on' },
      { status: 500 }
    );
  }
}

// ============================================================================
// UNINSTALL ADD-ON
// POST /api/addons/uninstall
// ============================================================================

export async function POST_uninstall(request: NextRequest) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const { addOnId, removeData } = uninstallSchema.parse(body);
    const { storeId } = auth;

    // Find the installation
    const storeAddOn = await prisma.storeAddOn.findUnique({
      where: {
        storeId_addOnId: { storeId, addOnId },
      },
    });

    if (!storeAddOn) {
      return NextResponse.json(
        { error: 'Add-on not installed' },
        { status: 404 }
      );
    }

    if (storeAddOn.status === 'UNINSTALLED') {
      return NextResponse.json(
        { error: 'Add-on already uninstalled' },
        { status: 409 }
      );
    }

    // Update status to uninstalling
    await prisma.storeAddOn.update({
      where: { id: storeAddOn.id },
      data: { status: 'UNINSTALLING' },
    });

    // TODO: Trigger async uninstallation process if needed
    // Clean up add-on data if requested
    if (removeData) {
      // TODO: Implement data cleanup logic based on add-on type
    }

    // Mark as uninstalled
    await prisma.storeAddOn.update({
      where: { id: storeAddOn.id },
      data: { status: 'UNINSTALLED' },
    });

    return NextResponse.json({
      success: true,
      message: 'Add-on uninstalled successfully',
      removedData: removeData,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Add-on uninstall error:', error);
    return NextResponse.json(
      { error: 'Failed to uninstall add-on' },
      { status: 500 }
    );
  }
}

// ============================================================================
// UPDATE ADD-ON
// POST /api/addons/update
// ============================================================================

export async function POST_update(request: NextRequest) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const { addOnId, version } = updateSchema.parse(body);
    const { storeId } = auth;

    // Find the installation
    const storeAddOn = await prisma.storeAddOn.findUnique({
      where: {
        storeId_addOnId: { storeId, addOnId },
      },
      include: { store: true },
    });

    if (!storeAddOn || storeAddOn.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Add-on not installed or not active' },
        { status: 404 }
      );
    }

    // Verify version exists
    const addOnVersion = await prisma.addOnVersion.findFirst({
      where: {
        addOnId,
        version,
        status: 'PUBLISHED',
      },
    });

    if (!addOnVersion) {
      return NextResponse.json(
        { error: 'Version not found or not available' },
        { status: 404 }
      );
    }

    // Check compatibility
    if (addOnVersion.minPlatformVersion) {
      // TODO: Check against current platform version
    }

    // Update to new version
    await prisma.storeAddOn.update({
      where: { id: storeAddOn.id },
      data: {
        status: 'UPDATE_IN_PROGRESS',
        installedVersion: version,
        latestVersion: version,
        updateAvailable: false,
      },
    });

    // TODO: Trigger async update process
    // For now, mark as active
    await prisma.storeAddOn.update({
      where: { id: storeAddOn.id },
      data: { status: 'ACTIVE' },
    });

    return NextResponse.json({
      success: true,
      message: 'Add-on updated successfully',
      previousVersion: storeAddOn.installedVersion,
      newVersion: version,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Add-on update error:', error);
    return NextResponse.json(
      { error: 'Failed to update add-on' },
      { status: 500 }
    );
  }
}

// ============================================================================
// CONFIGURE ADD-ON
// POST /api/addons/config
// ============================================================================

export async function POST_config(request: NextRequest) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const {
      addOnId,
      config,
      enabledFeatures,
      customCSS,
      customJS,
      mountPointConfig,
    } = configSchema.parse(body);
    const { storeId } = auth;

    // Find the installation
    const storeAddOn = await prisma.storeAddOn.findUnique({
      where: {
        storeId_addOnId: { storeId, addOnId },
      },
    });

    if (!storeAddOn || !['ACTIVE', 'INACTIVE'].includes(storeAddOn.status)) {
      return NextResponse.json(
        { error: 'Add-on not installed' },
        { status: 404 }
      );
    }

    // Get add-on config schema for validation
    const addOn = await prisma.addOn.findUnique({
      where: { id: addOnId },
      include: {
        versions: {
          where: { version: storeAddOn.installedVersion },
          select: { configSchema: true },
        },
      },
    });

    // TODO: Validate config against schema if available
    // const configSchema = addOn?.versions[0]?.configSchema;

    // Update configuration
    const updated = await prisma.storeAddOn.update({
      where: { id: storeAddOn.id },
      data: {
        config: config,
        ...(enabledFeatures && { enabledFeatures }),
        ...(customCSS !== undefined && { customCSS }),
        ...(customJS !== undefined && { customJS }),
        ...(mountPointConfig && { mountPointConfig }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Configuration updated',
      config: updated.config,
      enabledFeatures: updated.enabledFeatures,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Add-on config error:', error);
    return NextResponse.json(
      { error: 'Failed to update configuration' },
      { status: 500 }
    );
  }
}

// ============================================================================
// UPDATE ADD-ON STATUS
// POST /api/addons/status
// ============================================================================

export async function POST_status(request: NextRequest) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const { addOnId, status } = statusSchema.parse(body);
    const { storeId } = auth;

    // Find the installation
    const storeAddOn = await prisma.storeAddOn.findUnique({
      where: {
        storeId_addOnId: { storeId, addOnId },
      },
    });

    if (!storeAddOn || !['ACTIVE', 'INACTIVE'].includes(storeAddOn.status)) {
      return NextResponse.json(
        { error: 'Add-on not installed' },
        { status: 404 }
      );
    }

    // Update status
    await prisma.storeAddOn.update({
      where: { id: storeAddOn.id },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      message: `Add-on ${status === 'ACTIVE' ? 'enabled' : 'disabled'}`,
      status,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Add-on status error:', error);
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    );
  }
}

// ============================================================================
// CHECK FOR UPDATES
// GET /api/addons/updates
// ============================================================================

export async function GET_updates(request: NextRequest) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;
  const { storeId } = auth;

  try {
    // Get all installed add-ons
    const installedAddOns = await prisma.storeAddOn.findMany({
      where: {
        storeId,
        status: 'ACTIVE',
      },
      include: {
        addOn: {
          include: {
            versions: {
              where: { status: 'PUBLISHED' },
              orderBy: { publishedAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    // Check each for updates
    const updates = installedAddOns
      .filter((storeAddOn) => {
        const latestVersion = storeAddOn.addOn.versions[0]?.version;
        return latestVersion && latestVersion !== storeAddOn.installedVersion;
      })
      .map((storeAddOn) => ({
        addOnId: storeAddOn.addOnId,
        name: storeAddOn.addOn.name,
        currentVersion: storeAddOn.installedVersion,
        latestVersion: storeAddOn.addOn.versions[0].version,
        changelog: storeAddOn.addOn.versions[0].changelog,
      }));

    return NextResponse.json({
      updates,
      count: updates.length,
    });

  } catch (error) {
    console.error('Check updates error:', error);
    return NextResponse.json(
      { error: 'Failed to check for updates' },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET ADD-ON CONFIG
// GET /api/addons/config?addOnId=xxx
// ============================================================================

export async function GET_config(request: NextRequest) {
  const auth = await authenticate(request);
  if (auth.error) return auth.error;
  const { storeId } = auth;

  const addOnId = request.nextUrl.searchParams.get('addOnId');
  
  if (!addOnId) {
    return NextResponse.json(
      { error: 'addOnId parameter required' },
      { status: 400 }
    );
  }

  try {
    const storeAddOn = await prisma.storeAddOn.findUnique({
      where: {
        storeId_addOnId: { storeId, addOnId },
      },
      include: {
        addOn: {
          select: {
            name: true,
            configSchema: true,
            mountPoints: true,
          },
        },
      },
    });

    if (!storeAddOn) {
      return NextResponse.json(
        { error: 'Add-on not installed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      addOnId,
      name: storeAddOn.addOn.name,
      status: storeAddOn.status,
      version: storeAddOn.installedVersion,
      config: storeAddOn.config,
      enabledFeatures: storeAddOn.enabledFeatures,
      customCSS: storeAddOn.customCSS,
      customJS: storeAddOn.customJS,
      mountPointConfig: storeAddOn.mountPointConfig,
      mountPoints: storeAddOn.addOn.mountPoints,
      configSchema: storeAddOn.addOn.configSchema,
    });

  } catch (error) {
    console.error('Get config error:', error);
    return NextResponse.json(
      { error: 'Failed to get configuration' },
      { status: 500 }
    );
  }
}
