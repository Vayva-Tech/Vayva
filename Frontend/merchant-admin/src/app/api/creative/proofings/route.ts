import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { creativePortfolioService } from '@/services/creative-portfolio.service';

// GET /api/creative/proofings?storeId=xxx&clientId=xxx
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');
    const clientId = searchParams.get('clientId');
    const status = searchParams.get('status');

    if (!storeId) {
      return NextResponse.json({ error: 'Missing storeId' }, { status: 400 });
    }

    const proofings = await creativePortfolioService.getClientProofings(storeId, {
      ...(clientId && { clientId }),
      ...(status && { status: status as any }),
    });

    return NextResponse.json({ proofings });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to fetch proofings', message: errorMessage },
      { status: 500 }
    );
  }
}

// POST /api/creative/proofings
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      storeId,
      clientId,
      projectId,
      title,
      images,
      expiresAt,
      password,
    } = body;

    if (!storeId || !clientId || !projectId || !title || !images) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const proofing = await creativePortfolioService.createClientProofing({
      storeId,
      clientId,
      projectId,
      title,
      images,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      password,
    });

    return NextResponse.json({ proofing }, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to create proofing', message: errorMessage },
      { status: 500 }
    );
  }
}

// PATCH /api/creative/proofings?id=xxx - client selection or revision request
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
    const { action, selectedImageIds, feedback } = body;

    let proofing;
    if (action === 'select') {
      if (!selectedImageIds) {
        return NextResponse.json(
          { error: 'Missing selectedImageIds' },
          { status: 400 }
        );
      }
      proofing = await creativePortfolioService.submitClientSelection(id, {
        selectedImageIds,
        feedback,
      });
    } else if (action === 'revise') {
      if (!feedback) {
        return NextResponse.json(
          { error: 'Missing feedback for revision' },
          { status: 400 }
        );
      }
      proofing = await creativePortfolioService.requestRevisions(id, feedback);
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use select or revise' },
        { status: 400 }
      );
    }

    return NextResponse.json({ proofing });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to update proofing', message: errorMessage },
      { status: 500 }
    );
  }
}
