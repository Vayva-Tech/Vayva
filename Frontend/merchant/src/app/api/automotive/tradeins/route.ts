// @ts-nocheck
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { apiJson } from '@/lib/api-client-shared';
import { handleApiError } from '@/lib/api-error-handler';

 // GET /api/automotive/tradeins?storeId=xxx or ?customerId=xxx
 export async function GET(req: Request) {
   try {
     const session = await getServerSession(authOptions);
     if (!session?.user) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     }

     const { searchParams } = new URL(req.url);
     const storeId = searchParams.get('storeId');
     const customerId = searchParams.get('customerId');
     const status = searchParams.get('status');

     if (!storeId && !customerId) {
       return NextResponse.json(
         { error: 'Missing storeId or customerId' },
         { status: 400 }
       );
     }

    // Fetch trade-ins via backend API
    const queryParams = new URLSearchParams();
    if (storeId) queryParams.append('storeId', storeId);
    if (customerId) queryParams.append('customerId', customerId);
    if (status) queryParams.append('status', status);

    const result = await apiJson<{
      success: boolean;
      data?: any[];
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/automotive/tradeins?${queryParams.toString()}`);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch trade-ins');
    }

    return NextResponse.json({ valuations: result.data || [] });
   } catch (error: unknown) {
    handleApiError(
      error,
      {
        endpoint: '/api/automotive/tradeins',
        operation: 'FETCH_TRADE_INS',
      }
    );
     return NextResponse.json(
       { error: 'Failed to fetch trade-ins', message: error instanceof Error ? error.message : String(error) },
       { status: 500 }
     );
   }
 }

 // POST /api/automotive/tradeins
 export async function POST(req: Request) {
   try {
     const session = await getServerSession(authOptions);
     if (!session?.user) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     }

     const body = await req.json();
     const {
       storeId,
       customerId,
       make,
       model,
       year,
       mileage,
       condition,
       vin,
       estimatedValue,
       vehicleId,
       notes,
     } = body;

     if (!storeId || !customerId || !make || !model || !year || !estimatedValue) {
       return NextResponse.json(
         { error: 'Missing required fields' },
         { status: 400 }
       );
     }

     const valuation = await automotiveService.createTradeInValuation({
       storeId,
       customerId,
       make,
       model,
       year: Number(year),
       mileage: Number(mileage) || 0,
       condition: condition || 'good',
       vin,
       estimatedValue: Number(estimatedValue),
       vehicleId,
       notes,
     });

     return NextResponse.json({ valuation }, { status: 201 });
   } catch (error: unknown) {
     return NextResponse.json(
       { error: 'Failed to create trade-in valuation', message: error instanceof Error ? error.message : String(error) },
       { status: 500 }
     );
   }
 }

 // PATCH /api/automotive/tradeins?id=xxx - update offer or accept
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
     const { action, offerPrice, notes } = body;

     let valuation;
     if (action === 'offer') {
       if (!offerPrice) {
         return NextResponse.json(
           { error: 'Missing offerPrice' },
           { status: 400 }
         );
       }
       valuation = await automotiveService.updateTradeInOffer(id, offerPrice, notes);
     } else if (action === 'accept') {
       valuation = await automotiveService.acceptTradeInOffer(id);
     } else {
       return NextResponse.json(
         { error: 'Invalid action. Use offer or accept' },
         { status: 400 }
       );
     }

     return NextResponse.json({ valuation });
   } catch (error: unknown) {
     return NextResponse.json(
       { error: 'Failed to update trade-in', message: error instanceof Error ? error.message : String(error) },
       { status: 500 }
     );
   }
 }
