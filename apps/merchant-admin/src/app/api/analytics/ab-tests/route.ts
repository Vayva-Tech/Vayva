import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const storeId = request.nextUrl.searchParams.get('storeId');

    if (!storeId) {
      return NextResponse.json({ error: 'Store ID required' }, { status: 400 });
    }

    // Mock A/B test data (in production, fetch from experimentation platform)
    const tests = [
      {
        id: 'test-1',
        name: 'Homepage Hero Banner',
        variant: 'A',
        traffic: 50,
        conversions: 245,
        conversionRate: 0.049,
        revenue: 45000,
        winner: false,
        confidence: 0.78,
      },
      {
        id: 'test-1-b',
        name: 'Homepage Hero Banner',
        variant: 'B',
        traffic: 50,
        conversions: 298,
        conversionRate: 0.0596,
        revenue: 58000,
        winner: true,
        confidence: 0.96,
      },
      {
        id: 'test-2',
        name: 'Product Page CTA',
        variant: 'A',
        traffic: 50,
        conversions: 189,
        conversionRate: 0.0378,
        revenue: 32000,
        winner: false,
        confidence: 0.82,
      },
      {
        id: 'test-2-b',
        name: 'Product Page CTA',
        variant: 'B',
        traffic: 50,
        conversions: 215,
        conversionRate: 0.043,
        revenue: 38500,
        winner: true,
        confidence: 0.88,
      },
    ];

    return NextResponse.json({ tests });
  } catch (error) {
    console.error('Error fetching A/B test data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch A/B test data' },
      { status: 500 }
    );
  }
}
