// @ts-nocheck
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { apiJson } from '@/lib/api-client-shared';
import { handleApiError } from '@/lib/api-error-handler';

 // GET /api/nonprofit/volunteers?storeId=xxx&status=xxx
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

    // Fetch volunteers via backend API
    const queryParams = new URLSearchParams({ storeId });
    if (status) queryParams.append('status', status);

    const result = await apiJson<{
      success: boolean;
      data?: any[];
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/nonprofit/volunteers?${queryParams.toString()}`);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch volunteers');
    }

    return NextResponse.json({ volunteers: result.data || [] });
   } catch (error: unknown) {
    handleApiError(
      error,
      {
        endpoint: '/api/nonprofit/volunteers',
        operation: 'FETCH_VOLUNTEERS',
      }
    );
     const errorMessage = error instanceof Error ? error.message : String(error);
     return NextResponse.json(
       { error: 'Failed to fetch volunteers', message: errorMessage },
       { status: 500 }
     );
   }
}

// POST /api/nonprofit/volunteers
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      storeId,
      email,
      firstName,
      lastName,
      phone,
      skills,
      availability,
      emergencyContact,
    } = body;

    if (!storeId || !email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const volunteer = await nonprofitService.createVolunteer({
      storeId,
      email,
      firstName,
      lastName,
      phone,
      skills,
      availability,
      emergencyContact,
    });

    return NextResponse.json({ volunteer }, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to create volunteer', message: errorMessage },
      { status: 500 }
    );
  }
}
