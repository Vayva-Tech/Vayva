import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const adults = searchParams.get('adults');
    const children = searchParams.get('children');
    const rooms = searchParams.get('rooms');

    // Mock room availability data
    const roomTypes = [
      {
        id: 'room_1',
        name: 'Standard King Room',
        description: 'Comfortable room with king-size bed and city view',
        capacity: 2,
        price: 150,
        available: 8,
        amenities: ['WiFi', 'AC', 'TV'],
        image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=300&h=200&fit=crop'
      },
      {
        id: 'room_2',
        name: 'Deluxe King Suite',
        description: 'Spacious suite with separate living area and premium amenities',
        capacity: 3,
        price: 220,
        available: 5,
        amenities: ['WiFi', 'AC', 'TV', 'Mini-bar', 'Balcony'],
        image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=300&h=200&fit=crop'
      },
      {
        id: 'room_3',
        name: 'Family Suite',
        description: 'Large suite perfect for families with two bedrooms',
        capacity: 5,
        price: 320,
        available: 3,
        amenities: ['WiFi', 'AC', 'TV', 'Kitchenette', 'Living Area'],
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=300&h=200&fit=crop'
      },
      {
        id: 'room_4',
        name: 'Executive Suite',
        description: 'Luxury suite with premium furnishings and executive amenities',
        capacity: 2,
        price: 380,
        available: 2,
        amenities: ['WiFi', 'AC', 'TV', 'Jacuzzi', 'Butler Service', 'Panoramic View'],
        image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=300&h=200&fit=crop'
      }
    ];

    // Filter rooms based on guest requirements
    const guestCount = parseInt(adults || '2') + parseInt(children || '0');
    const requiredRooms = parseInt(rooms || '1');
    
    const filteredRooms = roomTypes.filter(room => {
      // Check capacity
      if (room.capacity < guestCount) return false;
      
      // Check availability
      if (room.available < requiredRooms) return false;
      
      return true;
    });

    // Apply dynamic pricing based on demand (mock logic)
    const enhancedRooms = filteredRooms.map(room => {
      let priceMultiplier = 1;
      
      // Weekend pricing
      if (checkIn) {
        const checkInDate = new Date(checkIn);
        const dayOfWeek = checkInDate.getDay();
        if (dayOfWeek === 5 || dayOfWeek === 6) { // Friday or Saturday
          priceMultiplier = 1.2;
        }
      }
      
      // Peak season pricing (summer months)
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      if (currentMonth >= 5 && currentMonth <= 7) { // June-August
        priceMultiplier *= 1.3;
      }
      
      return {
        ...room,
        price: Math.round(room.price * priceMultiplier)
      };
    });

    return NextResponse.json({
      success: true,
      rooms: enhancedRooms,
      totalAvailable: enhancedRooms.reduce((sum, room) => sum + room.available, 0),
      searchParams: {
        checkIn,
        checkOut,
        adults: parseInt(adults || '2'),
        children: parseInt(children || '0'),
        rooms: parseInt(rooms || '1')
      }
    });

  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch availability',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}