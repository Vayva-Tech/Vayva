import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'monthly';
    const storeId = searchParams.get('storeId');

    if (!storeId) {
      return NextResponse.json({ error: 'Store ID required' }, { status: 400 });
    }

    // Mock cohort data (in production, calculate from order/customer data)
    const cohorts = [
      {
        cohort: '2024-01',
        size: 1250,
        retentionRates: [0.65, 0.48, 0.38, 0.32, 0.28],
        revenue: 125000,
        avgOrderValue: 185,
      },
      {
        cohort: '2024-02',
        size: 1420,
        retentionRates: [0.68, 0.52, 0.42, 0.35],
        revenue: 142000,
        avgOrderValue: 192,
      },
      {
        cohort: '2024-03',
        size: 1580,
        retentionRates: [0.72, 0.58, 0.48],
        revenue: 165000,
        avgOrderValue: 198,
      },
      {
        cohort: '2024-04',
        size: 1720,
        retentionRates: [0.75, 0.62],
        revenue: 178000,
        avgOrderValue: 205,
      },
      {
        cohort: '2024-05',
        size: 1890,
        retentionRates: [0.78],
        revenue: 195000,
        avgOrderValue: 212,
      },
    ];

    return NextResponse.json({ cohorts });
  } catch (error) {
    console.error('Error fetching cohort data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cohort data' },
      { status: 500 }
    );
  }
}
