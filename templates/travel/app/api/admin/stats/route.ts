import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock data - in real implementation, this would query actual services
    const stats = {
      totalProperties: 12,
      totalBookings: 142,
      pendingBookings: 8,
      revenue: 28450,
      occupancyRate: 78,
      averageRating: 4.6
    };

    // Add some realistic growth percentages
    const growthData = {
      totalProperties: '+2',
      totalBookings: '+12%',
      pendingBookings: '-3',
      revenue: '+18%',
      occupancyRate: '+5%',
      averageRating: '+0.2'
    };

    return NextResponse.json({
      success: true,
      stats: {
        ...stats,
        growth: growthData
      }
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}