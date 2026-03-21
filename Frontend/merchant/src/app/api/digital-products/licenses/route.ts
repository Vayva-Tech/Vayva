// @ts-nocheck
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { apiJson } from '@/lib/api-client-shared';
import { handleApiError } from '@/lib/api-error-handler';

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
       // Fetch license by key via API
       const result = await apiJson<{
         success: boolean;
         data?: any;
         error?: string;
       }>(`${process.env.BACKEND_API_URL}/api/digital-products/licenses?key=${licenseKey}`, {
         headers: { 'x-store-id': storeId },
       });

       if (!result.success) {
         throw new Error(result.error || 'Failed to fetch license');
       }

       return NextResponse.json({ license: result.data });
     }

     // Fetch licenses via backend API
     const queryParams = new URLSearchParams({ storeId });
     if (productId) queryParams.append('productId', productId);
     if (customerId) queryParams.append('customerId', customerId);
     if (status) queryParams.append('status', status);

     const result = await apiJson<{
       success: boolean;
       data?: any[];
       error?: string;
     }>(`${process.env.BACKEND_API_URL}/api/digital-products/licenses?${queryParams.toString()}`, {
       headers: { 'x-store-id': storeId },
     });

     if (!result.success) {
       throw new Error(result.error || 'Failed to fetch licenses');
     }

     return NextResponse.json({ licenses: result.data || [] });
   } catch (error: unknown) {
     handleApiError(
       error,
       {
         endpoint: '/api/digital-products/licenses',
         operation: 'FETCH_LICENSES',
       }
     );
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
    const { storeId, productId, customerId, orderId } = body;

    if (!storeId || !productId || !customerId || !orderId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await apiJson<{ success: boolean; data?: any; error?: string }>(
      `${process.env.BACKEND_API_URL}/api/digital-products/licenses`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-store-id': storeId },
        body: JSON.stringify(body),
      }
    );

    return NextResponse.json({ license: result.data }, { status: 201 });
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
    const { licenseKey, action, reason, storeId } = body;

    if (!licenseKey || !action) {
      return NextResponse.json(
        { error: 'Missing licenseKey or action' },
        { status: 400 }
      );
    }

    if (action !== 'activate' && action !== 'revoke') {
      return NextResponse.json(
        { error: 'Invalid action. Use activate or revoke' },
        { status: 400 }
      );
    }

    if (action === 'revoke' && !reason) {
      return NextResponse.json(
        { error: 'Revoke reason required' },
        { status: 400 }
      );
    }

    const result = await apiJson<{ success: boolean; data?: any; error?: string }>(
      `${process.env.BACKEND_API_URL}/api/digital-products/licenses`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-store-id': storeId || '' },
        body: JSON.stringify({ licenseKey, action, reason }),
      }
    );

    return NextResponse.json({ license: result.data });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Failed to update license', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
