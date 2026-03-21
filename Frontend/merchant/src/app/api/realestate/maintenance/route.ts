// @ts-nocheck
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { apiJson } from '@/lib/api-client-shared';
import { handleApiError } from '@/lib/api-error-handler';

// GET /api/realestate/maintenance?storeId=xxx&status=xxx
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');
    const status = searchParams.get('status');

    if (!storeId) {
      return NextResponse.json({ error: 'Missing storeId' }, { status: 400 });
    }

    // Fetch maintenance requests via backend API
    const queryParams = new URLSearchParams({ storeId });
    if (status) queryParams.append('status', status);

    const result = await apiJson<{
      success: boolean;
      data?: any[];
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/realestate/maintenance?${queryParams.toString()}`);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch maintenance requests');
    }

    return NextResponse.json({ requests: result.data || [] });
  } catch (error: unknown) {
    handleApiError(
      error,
      {
        endpoint: '/api/realestate/maintenance',
        operation: 'FETCH_MAINTENANCE_REQUESTS',
      }
    );
    return NextResponse.json(
      { error: 'Failed to fetch maintenance requests', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST /api/realestate/maintenance
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      storeId,
      propertyId,
      tenantId,
      category,
      priority,
      description,
      images,
    } = body;

    if (!storeId || !propertyId || !tenantId || !category || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create maintenance request via backend API
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/realestate/maintenance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storeId,
        propertyId,
        tenantId,
        category,
        priority: priority || 'normal',
        description,
        images: images || [],
      }),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to create maintenance request');
    }

    return NextResponse.json({ request: result.data }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Failed to create maintenance request', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PATCH /api/realestate/maintenance?id=xxx - assign or complete
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const body = await req.json();
    const { action, assignedTo, cost, rating, feedback } = body;

    if (!action || !['assign', 'complete', 'feedback'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Use assign, complete, or feedback' },
        { status: 400 }
      );
    }

    if (action === 'assign' && !assignedTo) {
      return NextResponse.json(
        { error: 'Missing assignedTo' },
        { status: 400 }
      );
    }

    if (action === 'feedback' && (!rating || !feedback)) {
      return NextResponse.json(
        { error: 'Missing rating or feedback' },
        { status: 400 }
      );
    }

    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/realestate/maintenance/${id}/${action}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignedTo, cost, rating, feedback }),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to update maintenance request');
    }

    return NextResponse.json({ request: result.data });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Failed to update request', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
