import { NextResponse } from 'next/server';
import { AvailabilityService } from '@vayva/industry-travel/services';
import { PrismaClient } from '../../../../platform/infra/db/src/generated/client';

// Initialize service
const prisma = new PrismaClient();
const availabilityService = new AvailabilityService(prisma);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const propertyId = searchParams.get('propertyId');
    const roomId = searchParams.get('roomId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const guests = parseInt(searchParams.get('guests') || '1');

    // Validate required parameters
    if (!propertyId && !roomId) {
      return NextResponse.json(
        { success: false, error: 'Either propertyId or roomId is required' },
        { status: 400 }
      );
    }

    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Both startDate and endDate are required' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate date range
    if (start >= end) {
      return NextResponse.json(
        { success: false, error: 'Start date must be before end date' },
        { status: 400 }
      );
    }

    if (end.getTime() - start.getTime() > 365 * 24 * 60 * 60 * 1000) {
      return NextResponse.json(
        { success: false, error: 'Date range cannot exceed 1 year' },
        { status: 400 }
      );
    }

    let availabilityData;

    if (roomId) {
      // Check specific room availability
      availabilityData = await getRoomAvailability(roomId, start, end);
    } else {
      // Check property-wide availability
      availabilityData = await getPropertyAvailability(propertyId!, start, end, guests);
    }

    return NextResponse.json({
      success: true,
      availability: availabilityData,
      dateRange: {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0]
      }
    });

  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check availability',
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
    const requiredFields = ['roomId', 'dates', 'isAvailable'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const { roomId, dates, isAvailable, price, minStay } = body;

    // Validate dates format
    if (!Array.isArray(dates) || dates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Dates must be a non-empty array' },
        { status: 400 }
      );
    }

    // Process each date
    const results = [];
    for (const dateStr of dates) {
      const date = new Date(dateStr);
      
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { success: false, error: `Invalid date format: ${dateStr}` },
          { status: 400 }
        );
      }

      const result = await availabilityService.setAvailability(
        roomId,
        { startDate: date, endDate: date },
        isAvailable,
        price,
        minStay
      );
      
      results.push({
        date: dateStr,
        success: result.success,
        message: result.message
      });
    }

    return NextResponse.json({
      success: true,
      results,
      message: `Availability updated for ${results.length} dates`
    });

  } catch (error) {
    console.error('Error setting availability:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to set availability',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    const { roomId, date, price, minStay, isAvailable } = body;

    if (!roomId || !date) {
      return NextResponse.json(
        { success: false, error: 'roomId and date are required' },
        { status: 400 }
      );
    }

    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format' },
        { status: 400 }
      );
    }

    const result = await availabilityService.setAvailability(
      roomId,
      { startDate: targetDate, endDate: targetDate },
      isAvailable !== undefined ? isAvailable : true,
      price,
      minStay
    );

    return NextResponse.json({
      success: true,
      result,
      message: 'Availability updated successfully'
    });

  } catch (error) {
    console.error('Error updating availability:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update availability',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper functions
async function getRoomAvailability(roomId: string, startDate: Date, endDate: Date) {
  // Check if room is available for the entire date range
  const isAvailable = await availabilityService.checkAvailability(
    roomId,
    { startDate, endDate }
  );

  // Get pricing information
  const pricingInfo = await availabilityService.getPrice(roomId, startDate);

  // Get detailed daily availability
  const dailyAvailability = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dayPrice = await availabilityService.getPrice(roomId, currentDate);
    
    dailyAvailability.push({
      date: currentDate.toISOString().split('T')[0],
      available: await availabilityService.checkAvailability(
        roomId,
        { startDate: currentDate, endDate: currentDate }
      ),
      price: dayPrice.price,
      currency: dayPrice.currency,
      minStay: dayPrice.minStay
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return {
    roomId,
    isAvailable,
    pricing: pricingInfo,
    dailyBreakdown: dailyAvailability
  };
}

async function getPropertyAvailability(
  propertyId: string, 
  startDate: Date, 
  endDate: Date, 
  guests: number
) {
  // Mock implementation - in real scenario, this would:
  // 1. Get all rooms for the property
  // 2. Check availability for each room
  // 3. Filter by capacity (guests)
  // 4. Return available room options
  
  const mockRooms = [
    {
      id: 'room_1',
      name: 'Deluxe King Room',
      type: 'deluxe',
      capacity: 2,
      basePrice: 150,
      amenities: ['wifi', 'ac', 'tv']
    },
    {
      id: 'room_2',
      name: 'Standard Queen Room',
      type: 'standard',
      capacity: 2,
      basePrice: 120,
      amenities: ['wifi', 'ac']
    },
    {
      id: 'room_3',
      name: 'Family Suite',
      type: 'suite',
      capacity: 4,
      basePrice: 200,
      amenities: ['wifi', 'ac', 'kitchenette', 'balcony']
    }
  ];

  // Filter rooms by capacity
  const suitableRooms = mockRooms.filter(room => room.capacity >= guests);

  // Check availability for each suitable room
  const availableRooms = [];
  for (const room of suitableRooms) {
    const isAvailable = await availabilityService.checkAvailability(
      room.id,
      { startDate, endDate }
    );
    
    if (isAvailable) {
      const pricing = await availabilityService.getPrice(room.id, startDate);
      
      availableRooms.push({
        ...room,
        available: true,
        pricing: {
          ...pricing,
          totalPrice: pricing.price * ((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        }
      });
    }
  }

  // Get property-level information
  const propertyInfo = await getPropertyInfo(propertyId);

  return {
    propertyId,
    propertyName: propertyInfo.name,
    propertyType: propertyInfo.type,
    availableRooms: availableRooms.sort((a, b) => a.basePrice - b.basePrice),
    dateRange: {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      nights: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    },
    guestCount: guests
  };
}

async function getPropertyInfo(propertyId: string) {
  // Mock implementation
  return {
    id: propertyId,
    name: 'Sample Property',
    type: 'hotel',
    address: '123 Main St',
    city: 'Sample City',
    country: 'Sample Country',
    rating: 4.5,
    reviewCount: 128,
    images: ['/property-1.jpg', '/property-2.jpg']
  };
}