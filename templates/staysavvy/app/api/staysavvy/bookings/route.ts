import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Mock booking data
    const bookings = [
      {
        id: 'bk_1',
        propertyId: 'prop_1',
        propertyName: 'Grand Plaza Hotel',
        guestName: 'Sarah Johnson',
        guestEmail: 'sarah.johnson@email.com',
        checkInDate: '2024-06-15',
        checkOutDate: '2024-06-18',
        roomType: 'Deluxe King',
        adults: 2,
        children: 1,
        status: 'confirmed',
        totalAmount: 540,
        currency: 'USD',
        specialRequests: 'Late check-in requested',
        createdAt: '2024-05-20'
      },
      {
        id: 'bk_2',
        propertyId: 'prop_1',
        propertyName: 'Grand Plaza Hotel',
        guestName: 'Michael Chen',
        guestEmail: 'michael.chen@email.com',
        checkInDate: '2024-06-20',
        checkOutDate: '2024-06-25',
        roomType: 'Executive Suite',
        adults: 2,
        children: 0,
        status: 'pending',
        totalAmount: 900,
        currency: 'USD',
        specialRequests: '',
        createdAt: '2024-05-22'
      },
      {
        id: 'bk_3',
        propertyId: 'prop_2',
        propertyName: 'Seaside Resort & Spa',
        guestName: 'Emma Wilson',
        guestEmail: 'emma.wilson@email.com',
        checkInDate: '2024-07-01',
        checkOutDate: '2024-07-08',
        roomType: 'Ocean View',
        adults: 2,
        children: 2,
        status: 'confirmed',
        totalAmount: 2065,
        currency: 'USD',
        specialRequests: 'Birthday celebration',
        createdAt: '2024-05-18'
      },
      {
        id: 'bk_4',
        propertyId: 'prop_3',
        propertyName: 'Urban Boutique Inn',
        guestName: 'James Brown',
        guestEmail: 'james.brown@email.com',
        checkInDate: '2024-06-25',
        checkOutDate: '2024-06-27',
        roomType: 'Standard Queen',
        adults: 1,
        children: 0,
        status: 'checked_in',
        totalAmount: 250,
        currency: 'USD',
        specialRequests: 'Early check-in',
        createdAt: '2024-05-15'
      }
    ];

    // Apply filters
    let filteredBookings = bookings;
    
    if (propertyId) {
      filteredBookings = filteredBookings.filter(b => b.propertyId === propertyId);
    }
    
    if (status) {
      filteredBookings = filteredBookings.filter(b => b.status === status);
    }
    
    if (startDate || endDate) {
      filteredBookings = filteredBookings.filter(b => {
        const bookingDate = new Date(b.checkInDate);
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
          .reduce((sum, b) => sum + b.totalAmount, 0)
      }
    });

  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch bookings',
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
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: `Booking ${action}ed successfully`
    });

  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update booking',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}