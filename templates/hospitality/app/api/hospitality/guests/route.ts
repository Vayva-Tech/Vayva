import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const membershipLevel = searchParams.get('membershipLevel');
    const vipStatus = searchParams.get('vipStatus');

    // Mock luxury guest data
    const guests = [
      {
        id: 'guest_1',
        firstName: 'Alexander',
        lastName: 'Thompson',
        email: 'alexander.thompson@email.com',
        phone: '+1 (555) 123-4567',
        membershipLevel: 'platinum',
        vipStatus: 'gold',
        totalStays: 24,
        totalSpent: 87500,
        favoriteRoomType: 'Presidential Suite',
        preferredAmenities: ['spa', 'fine_dining', 'concierge'],
        specialRequests: 'Late check-in requested, room facing ocean view',
        anniversary: '2024-06-15',
        birthday: '1985-03-22',
        notes: 'Celebrating 10th wedding anniversary',
        status: 'active',
        lastStay: '2024-05-20',
        nextStay: '2024-07-10'
      },
      {
        id: 'guest_2',
        firstName: 'Sophia',
        lastName: 'Martinez',
        email: 'sophia.martinez@email.com',
        phone: '+1 (555) 987-6543',
        membershipLevel: 'diamond',
        vipStatus: 'platinum',
        totalStays: 42,
        totalSpent: 156800,
        favoriteRoomType: 'Executive Suite',
        preferredAmenities: ['business_center', 'fitness', 'airport_transfer'],
        specialRequests: 'Early check-in, extra towels, room upgrade appreciated',
        anniversary: '2024-09-08',
        birthday: '1978-11-15',
        notes: 'Frequent business traveler, prefers quiet floors',
        status: 'active',
        lastStay: '2024-05-18',
        nextStay: '2024-06-25'
      },
      {
        id: 'guest_3',
        firstName: 'James',
        lastName: 'Kim',
        email: 'james.kim@email.com',
        phone: '+1 (555) 456-7890',
        membershipLevel: 'gold',
        vipStatus: 'silver',
        totalStays: 12,
        totalSpent: 32400,
        favoriteRoomType: 'Deluxe Room',
        preferredAmenities: ['pool', 'restaurant', 'wifi'],
        specialRequests: 'Room with twin beds, vegetarian breakfast options',
        anniversary: null,
        birthday: '1990-07-30',
        notes: 'Leisure traveler, interested in local attractions',
        status: 'active',
        lastStay: '2024-04-12',
        nextStay: null
      },
      {
        id: 'guest_4',
        firstName: 'Eleanor',
        lastName: 'Williams',
        email: 'eleanor.williams@email.com',
        phone: '+1 (555) 321-0987',
        membershipLevel: 'platinum',
        vipStatus: 'gold',
        totalStays: 31,
        totalSpent: 112600,
        favoriteRoomType: 'Presidential Suite',
        preferredAmenities: ['spa', 'fine_dining', 'private_balcony'],
        specialRequests: 'Flowers and champagne upon arrival, late checkout',
        anniversary: '2024-12-03',
        birthday: '1982-09-18',
        notes: 'Celebrity guest, requires maximum privacy',
        status: 'vip',
        lastStay: '2024-05-15',
        nextStay: '2024-08-05'
      }
    ];

    // Apply filters
    let filteredGuests = guests;
    
    if (status) {
      filteredGuests = filteredGuests.filter(g => g.status === status);
    }
    
    if (membershipLevel) {
      filteredGuests = filteredGuests.filter(g => g.membershipLevel === membershipLevel);
    }
    
    if (vipStatus) {
      filteredGuests = filteredGuests.filter(g => g.vipStatus === vipStatus);
    }

    // Calculate summary statistics
    const summary = {
      totalGuests: guests.length,
      activeGuests: guests.filter(g => g.status === 'active').length,
      vipGuests: guests.filter(g => g.status === 'vip').length,
      platinumMembers: guests.filter(g => g.membershipLevel === 'platinum').length,
      totalRevenue: guests.reduce((sum, g) => sum + g.totalSpent, 0),
      averageSpent: Math.round(guests.reduce((sum, g) => sum + g.totalSpent, 0) / guests.length)
    };

    return NextResponse.json({
      success: true,
      guests: filteredGuests,
      total: filteredGuests.length,
      summary
    });

  } catch (error) {
    console.error('Error fetching luxury guests:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch luxury guests',
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
    const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create new luxury guest profile (mock implementation)
    const newGuest = {
      id: `guest_${Date.now()}`,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      membershipLevel: body.membershipLevel || 'silver',
      vipStatus: body.vipStatus || 'bronze',
      totalStays: 0,
      totalSpent: 0,
      favoriteRoomType: null,
      preferredAmenities: body.preferredAmenities || [],
      specialRequests: body.specialRequests || '',
      anniversary: body.anniversary || null,
      birthday: body.birthday || null,
      notes: body.notes || '',
      status: 'active',
      lastStay: null,
      nextStay: null,
      createdAt: new Date().toISOString().split('T')[0]
    };

    return NextResponse.json({
      success: true,
      guest: newGuest,
      message: 'Luxury guest profile created successfully'
    });

  } catch (error) {
    console.error('Error creating luxury guest:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create luxury guest profile',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { guestId, action, ...updates } = body;

    if (!guestId) {
      return NextResponse.json(
        { success: false, error: 'Guest ID is required' },
        { status: 400 }
      );
    }

    // Mock guest update
    const updatedGuest = {
      id: guestId,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      guest: updatedGuest,
      message: 'Guest profile updated successfully'
    });

  } catch (error) {
    console.error('Error updating luxury guest:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update luxury guest profile',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}