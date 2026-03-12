import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock recent activity data
    const activity = [
      {
        id: 'act_1',
        type: 'booking',
        title: 'New Booking Request',
        description: 'Sarah Johnson booked Deluxe King Room for Dec 12-15',
        time: '2 hours ago',
        status: 'new'
      },
      {
        id: 'act_2',
        type: 'review',
        title: 'Review Pending Approval',
        description: 'Mike Chen left a 5-star review for his stay',
        time: '4 hours ago',
        status: 'processing'
      },
      {
        id: 'act_3',
        type: 'inquiry',
        title: 'Guest Inquiry',
        description: 'Emma Wilson asked about pet policies',
        time: '1 day ago',
        status: 'completed'
      },
      {
        id: 'act_4',
        type: 'booking',
        title: 'Booking Confirmed',
        description: 'James Brown confirmed his reservation',
        time: '1 day ago',
        status: 'completed'
      },
      {
        id: 'act_5',
        type: 'review',
        title: 'New Review Posted',
        description: 'Lisa Garcia shared her experience',
        time: '2 days ago',
        status: 'completed'
      }
    ];

    return NextResponse.json({
      success: true,
      activity
    });

  } catch (error) {
    console.error('Error fetching admin activity:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch activity',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}