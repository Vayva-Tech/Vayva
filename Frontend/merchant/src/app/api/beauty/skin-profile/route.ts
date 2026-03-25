import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { authOptions } from '@/lib/auth';
import { beautyService } from '@/services/beauty.service';

// GET /api/beauty/skin-profile?customerId=xxx
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const sessionStoreId = session?.user?.storeId;
    if (!session?.user || !sessionStoreId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json({ error: 'Missing customerId' }, { status: 400 });
    }

    const profile = await beautyService.getSkinProfile(sessionStoreId, customerId);
    
    if (!profile) {
      return NextResponse.json({ error: 'Skin profile not found' }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Failed to fetch skin profile', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST /api/beauty/skin-profile
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const sessionStoreId = session?.user?.storeId;
    if (!session?.user || !sessionStoreId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { customerId, skinType, skinTone, undertone, concerns, allergies } = body;

    if (!customerId || !skinType) {
      return NextResponse.json(
        { error: 'Missing required fields: customerId, skinType' },
        { status: 400 }
      );
    }

    const profile = await beautyService.createSkinProfile(sessionStoreId, {
      customerId,
      skinType,
      skinTone,
      undertone,
      concerns,
      allergies,
    });

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Customer not found') {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Failed to create skin profile', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PATCH /api/beauty/skin-profile?customerId=xxx
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const sessionStoreId = session?.user?.storeId;
    if (!session?.user || !sessionStoreId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json({ error: 'Missing customerId' }, { status: 400 });
    }

    const body = await req.json();
    const profile = await beautyService.updateSkinProfile(sessionStoreId, customerId, body);

    return NextResponse.json({ profile });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Skin profile not found') {
      return NextResponse.json({ error: 'Skin profile not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Failed to update skin profile', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
