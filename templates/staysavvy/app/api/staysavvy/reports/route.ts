import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const period = searchParams.get('period') || 'month';
    const metric = searchParams.get('metric') || 'occupancy';

    // Mock report data
    const reports = {
      occupancy: {
        daily: [
          { date: '2024-06-01', value: 65 },
          { date: '2024-06-02', value: 72 },
          { date: '2024-06-03', value: 68 },
          { date: '2024-06-04', value: 75 },
          { date: '2024-06-05', value: 82 },
          { date: '2024-06-06', value: 78 },
          { date: '2024-06-07', value: 85 }
        ],
        monthly: [
          { month: 'Jan 2024', value: 68 },
          { month: 'Feb 2024', value: 71 },
          { month: 'Mar 2024', value: 74 },
          { month: 'Apr 2024', value: 76 },
          { month: 'May 2024', value: 79 },
          { month: 'Jun 2024', value: 77 }
        ]
      },
      revenue: {
        daily: [
          { date: '2024-06-01', value: 12500 },
          { date: '2024-06-02', value: 13800 },
          { date: '2024-06-03', value: 13200 },
          { date: '2024-06-04', value: 14500 },
          { date: '2024-06-05', value: 15800 },
          { date: '2024-06-06', value: 15200 },
          { date: '2024-06-07', value: 16500 }
        ],
        monthly: [
          { month: 'Jan 2024', value: 385000 },
          { month: 'Feb 2024', value: 412000 },
          { month: 'Mar 2024', value: 438000 },
          { month: 'Apr 2024', value: 456000 },
          { month: 'May 2024', value: 472000 },
          { month: 'Jun 2024', value: 465000 }
        ]
      },
      bookings: {
        daily: [
          { date: '2024-06-01', value: 42 },
          { date: '2024-06-02', value: 48 },
          { date: '2024-06-03', value: 45 },
          { date: '2024-06-04', value: 52 },
          { date: '2024-06-05', value: 58 },
          { date: '2024-06-06', value: 55 },
          { date: '2024-06-07', value: 62 }
        ],
        monthly: [
          { month: 'Jan 2024', value: 1280 },
          { month: 'Feb 2024', value: 1340 },
          { month: 'Mar 2024', value: 1420 },
          { month: 'Apr 2024', value: 1480 },
          { month: 'May 2024', value: 1520 },
          { month: 'Jun 2024', value: 1490 }
        ]
      }
    };

    // Mock property performance data
    const propertyPerformance = [
      {
        propertyId: 'prop_1',
        propertyName: 'Grand Plaza Hotel',
        occupancyRate: 71,
        avgDailyRate: 180,
        revenue: 465000,
        bookings: 1490,
        rating: 4.5,
        reviewCount: 234
      },
      {
        propertyId: 'prop_2',
        propertyName: 'Seaside Resort & Spa',
        occupancyRate: 73,
        avgDailyRate: 295,
        revenue: 325000,
        bookings: 890,
        rating: 4.8,
        reviewCount: 156
      },
      {
        propertyId: 'prop_3',
        propertyName: 'Urban Boutique Inn',
        occupancyRate: 72,
        avgDailyRate: 125,
        revenue: 112000,
        bookings: 620,
        rating: 4.3,
        reviewCount: 89
      }
    ];

    // Filter by property if specified
    let filteredPerformance = propertyPerformance;
    if (propertyId) {
      filteredPerformance = propertyPerformance.filter(p => p.propertyId === propertyId);
    }

    // Get requested metric data
    const metricData = reports[metric as keyof typeof reports]?.[period === 'day' ? 'daily' : 'monthly'] || [];

    return NextResponse.json({
      success: true,
      data: {
        chartData: metricData,
        performance: filteredPerformance,
        summary: {
          totalProperties: propertyPerformance.length,
          averageOccupancy: Math.round(
            propertyPerformance.reduce((sum, p) => sum + p.occupancyRate, 0) / propertyPerformance.length
          ),
          totalRevenue: propertyPerformance.reduce((sum, p) => sum + p.revenue, 0),
          totalBookings: propertyPerformance.reduce((sum, p) => sum + p.bookings, 0),
          averageRating: (
            propertyPerformance.reduce((sum, p) => sum + p.rating, 0) / propertyPerformance.length
          ).toFixed(1)
        }
      },
      period,
      metric
    });

  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch reports',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, format, startDate, endDate } = body;

    // Validate required fields
    if (!type || !format) {
      return NextResponse.json(
        { success: false, error: 'Report type and format are required' },
        { status: 400 }
      );
    }

    // Generate report (mock implementation)
    const reportData = {
      id: `report_${Date.now()}`,
      type,
      format,
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date().toISOString().split('T')[0],
      generatedAt: new Date().toISOString(),
      url: `/reports/${type}_${Date.now()}.${format}`
    };

    return NextResponse.json({
      success: true,
      report: reportData,
      message: 'Report generation started'
    });

  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate report',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}