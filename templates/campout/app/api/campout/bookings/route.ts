import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tourId = searchParams.get('tourId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Mock adventure booking data
    const bookings = [
      {
        id: 'adv_bk_1',
        tourId: 'tour_1',
        tourName: 'Rocky Mountain Hiking Expedition',
        participantName: 'Sarah Johnson',
        participantEmail: 'sarah.johnson@email.com',
        emergencyContact: 'Mike Johnson - (555) 123-4567',
        departureDate: '2024-07-15',
        participants: 2,
        status: 'confirmed',
        totalAmount: 1798,
        currency: 'USD',
        specialRequirements: 'Vegetarian diet requested',
        experienceLevel: 'intermediate',
        gearRental: ['hiking boots', 'backpack', 'sleeping bag'],
        insurance: true,
        waiverSigned: true,
        createdAt: '2024-05-20'
      },
      {
        id: 'adv_bk_2',
        tourId: 'tour_2',
        tourName: 'Patagonia Trekking Adventure',
        participantName: 'Michael Chen',
        participantEmail: 'michael.chen@email.com',
        emergencyContact: 'Lisa Chen - (555) 987-6543',
        departureDate: '2024-11-10',
        participants: 1,
        status: 'pending',
        totalAmount: 2499,
        currency: 'USD',
        specialRequirements: 'Photography equipment needed',
        experienceLevel: 'advanced',
        gearRental: ['trekking poles', 'camera protection'],
        insurance: true,
        waiverSigned: false,
        createdAt: '2024-05-22'
      },
      {
        id: 'adv_bk_3',
        tourId: 'tour_1',
        tourName: 'Rocky Mountain Hiking Expedition',
        participantName: 'Emma Wilson',
        participantEmail: 'emma.wilson@email.com',
        emergencyContact: 'David Wilson - (555) 456-7890',
        departureDate: '2024-08-05',
        participants: 3,
        status: 'confirmed',
        totalAmount: 2697,
        currency: 'USD',
        specialRequirements: 'Group booking discount',
        experienceLevel: 'beginner',
        gearRental: ['hiking boots', 'water bottles', 'first aid kit'],
        insurance: true,
        waiverSigned: true,
        createdAt: '2024-05-18'
      },
      {
        id: 'adv_bk_4',
        tourId: 'tour_3',
        tourName: 'Alaska Wilderness Canoe Journey',
        participantName: 'James Brown',
        participantEmail: 'james.brown@email.com',
        emergencyContact: 'Maria Brown - (555) 321-0987',
        departureDate: '2024-06-20',
        participants: 2,
        status: 'checked_in',
        totalAmount: 3398,
        currency: 'USD',
        specialRequirements: 'Early arrival requested',
        experienceLevel: 'intermediate',
        gearRental: ['canoe', 'paddle', 'bear spray'],
        insurance: true,
        waiverSigned: true,
        createdAt: '2024-05-15'
      }
    ];

    // Apply filters
    let filteredBookings = bookings;
    
    if (tourId) {
      filteredBookings = filteredBookings.filter(b => b.tourId === tourId);
    }
    
    if (status) {
      filteredBookings = filteredBookings.filter(b => b.status === status);
    }
    
    if (startDate || endDate) {
      filteredBookings = filteredBookings.filter(b => {
        const bookingDate = new Date(b.departureDate);
        return (
          (!startDate || bookingDate >= new Date(startDate)) &&
          (!endDate || bookingDate <= new Date(endDate))
        );
      });
    }

    return NextResponse.json({
      success: true,
      bookings: filteredBookings,
      total: filteredBookings.length,
      summary: {
        totalBookings: bookings.length,
        pending: bookings.filter(b => b.status === 'pending').length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        checkedIn: bookings.filter(b => b.status === 'checked_in').length,
        completed: bookings.filter(b => b.status === 'completed').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length,
        totalRevenue: bookings
          .filter(b => ['confirmed', 'checked_in', 'completed'].includes(b.status))
          .reduce((sum, b) => sum + b.totalAmount, 0),
        totalParticipants: bookings
          .filter(b => ['confirmed', 'checked_in', 'completed'].includes(b.status))
          .reduce((sum, b) => sum + b.participants, 0)
      }
    });

  } catch (error) {
    console.error('Error fetching adventure bookings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch adventure bookings',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = [
      'tourId', 'participantName', 'participantEmail', 
      'emergencyContact', 'departureDate', 'participants'
    ];
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create new adventure booking (mock implementation)
    const newBooking = {
      id: `adv_bk_${Date.now()}`,
      tourId: body.tourId,
      tourName: body.tourName || 'Unknown Tour',
      participantName: body.participantName,
      participantEmail: body.participantEmail,
      emergencyContact: body.emergencyContact,
      departureDate: body.departureDate,
      participants: parseInt(body.participants),
      status: 'pending',
      totalAmount: parseFloat(body.totalAmount) || 0,
      currency: body.currency || 'USD',
      specialRequirements: body.specialRequirements || '',
      experienceLevel: body.experienceLevel || 'beginner',
      gearRental: body.gearRental || [],
      insurance: body.insurance ?? false,
      waiverSigned: false,
      createdAt: new Date().toISOString().split('T')[0]
    };

    return NextResponse.json({
      success: true,
      booking: newBooking,
      message: 'Adventure booking created successfully'
    });

  } catch (error) {
    console.error('Error creating adventure booking:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create adventure booking',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { bookingId, action, ...updates } = body;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Mock booking update
    const updatedBooking = {
      id: bookingId,
      status: action === 'confirm' ? 'confirmed' : 
              action === 'cancel' ? 'cancelled' : 
              action === 'checkin' ? 'checked_in' : 'completed',
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: `Booking ${action}ed successfully`
    });

  } catch (error) {
    console.error('Error updating adventure booking:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update adventure booking',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}