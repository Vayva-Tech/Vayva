import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { realEstateService } from '@/services/realestate.service';

// GET /api/realestate/maintenance?storeId=xxx&status=xxx
export async function GET(req: Request) {
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

    const requests = await realEstateService.getMaintenanceRequests(
      storeId,
      status as any
    );

    return NextResponse.json({ requests });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Failed to fetch maintenance requests', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST /api/realestate/maintenance
export async function POST(req: Request) {
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

    const request = await realEstateService.createMaintenanceRequest({
      storeId,
      propertyId,
      tenantId,
      category,
      priority: priority || 'normal',
      description,
      images: images || [],
    });

    return NextResponse.json({ request }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Failed to create maintenance request', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PATCH /api/realestate/maintenance?id=xxx - assign or complete
export async function PATCH(req: Request) {
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

    let request;
    if (action === 'assign') {
      if (!assignedTo) {
        return NextResponse.json(
          { error: 'Missing assignedTo' },
          { status: 400 }
        );
      }
      request = await realEstateService.assignMaintenanceRequest(id, assignedTo);
    } else if (action === 'complete') {
      request = await realEstateService.completeMaintenanceRequest(id, { cost });
    } else if (action === 'feedback') {
      if (!rating || !feedback) {
        return NextResponse.json(
          { error: 'Missing rating or feedback' },
          { status: 400 }
        );
      }
      request = await realEstateService.addTenantFeedback(id, {
        rating,
        feedback,
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use assign, complete, or feedback' },
        { status: 400 }
      );
    }

    return NextResponse.json({ request });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Failed to update request', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
