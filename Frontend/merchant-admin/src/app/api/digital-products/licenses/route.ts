import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { digitalProductsService } from '@/services/digital-products.service';
import type { LicenseStatus } from '@/types/phase3-industry';

// GET /api/digital-products/licenses?storeId=xxx&filters...
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');
    const productId = searchParams.get('productId');
    const customerId = searchParams.get('customerId');
    const status = searchParams.get('status');
    const licenseKey = searchParams.get('key');

    if (!storeId) {
      return NextResponse.json({ error: 'Missing storeId' }, { status: 400 });
    }

    if (licenseKey) {
      const key = await digitalProductsService.getLicenseByKey(licenseKey);
      return NextResponse.json({ license: key });
    }

    const parsedStatus: LicenseStatus | undefined =
      status === 'active' || status === 'revoked' || status === 'expired'
        ? status
        : undefined;

    if (status && !parsedStatus) {
      return NextResponse.json(
        { error: 'Invalid status. Use active, revoked, or expired' },
        { status: 400 }
      );
    }

    const licenses = await digitalProductsService.getLicenseKeys(storeId, {
      ...(productId && { productId }),
      ...(customerId && { customerId }),
      ...(parsedStatus && { status: parsedStatus }),
    });

    return NextResponse.json({ licenses });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Failed to fetch licenses', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST /api/digital-products/licenses
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      storeId,
      productId,
      customerId,
      orderId,
      maxActivations,
      expiresAt,
    } = body;

    if (!storeId || !productId || !customerId || !orderId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const license = await digitalProductsService.createLicenseKey({
      storeId,
      productId,
      customerId,
      orderId,
      maxActivations,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    return NextResponse.json({ license }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Failed to create license', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PATCH /api/digital-products/licenses - activate or revoke
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { licenseKey, action, reason } = body;

    if (!licenseKey || !action) {
      return NextResponse.json(
        { error: 'Missing licenseKey or action' },
        { status: 400 }
      );
    }

    let license;
    if (action === 'activate') {
      license = await digitalProductsService.activateLicense(licenseKey);
    } else if (action === 'revoke') {
      if (!reason) {
        return NextResponse.json(
          { error: 'Revoke reason required' },
          { status: 400 }
        );
      }
      license = await digitalProductsService.revokeLicense(licenseKey, reason);
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use activate or revoke' },
        { status: 400 }
      );
    }

    return NextResponse.json({ license });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Failed to update license', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
