import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const roomType = searchParams.get('roomType');

    // Mock rate data
    const rates = [
      {
        id: 'rate_1',
        propertyId: 'prop_1',
        propertyName: 'Grand Plaza Hotel',
        roomType: 'Standard King',
        baseRate: 150,
        currentRate: 180,
        minStay: 1,
        maxStay: 30,
        season: 'summer',
        startDate: '2024-06-01',
        endDate: '2024-08-31',
        isActive: true,
        daysOfWeek: [1, 2, 3, 4, 5, 6, 0], // Mon-Sun
        createdAt: '2024-01-15'
      },
      {
        id: 'rate_2',
        propertyId: 'prop_1',
        propertyName: 'Grand Plaza Hotel',
        roomType: 'Deluxe King',
        baseRate: 200,
        currentRate: 240,
        minStay: 2,
        maxStay: 15,
        season: 'peak',
        startDate: '2024-12-15',
        endDate: '2025-01-15',
        isActive: true,
        daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
        createdAt: '2024-01-15'
      },
      {
        id: 'rate_3',
        propertyId: 'prop_2',
        propertyName: 'Seaside Resort & Spa',
        roomType: 'Ocean View',
        baseRate: 250,
        currentRate: 295,
        minStay: 3,
        maxStay: 14,
        season: 'summer',
        startDate: '2024-06-01',
        endDate: '2024-09-15',
        isActive: true,
        daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
        createdAt: '2024-02-20'
      },
      {
        id: 'rate_4',
        propertyId: 'prop_3',
        propertyName: 'Urban Boutique Inn',
        roomType: 'Standard Queen',
        baseRate: 100,
        currentRate: 125,
        minStay: 1,
        maxStay: 7,
        season: 'regular',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        isActive: true,
        daysOfWeek: [1, 2, 3, 4, 5],
        createdAt: '2024-03-10'
      }
    ];

    // Apply filters
    let filteredRates = rates;
    
    if (propertyId) {
      filteredRates = filteredRates.filter(r => r.propertyId === propertyId);
    }
    
    if (roomType) {
      filteredRates = filteredRates.filter(r => r.roomType === roomType);
    }

    return NextResponse.json({
      success: true,
      rates: filteredRates,
      total: filteredRates.length,
      summary: {
        totalRates: rates.length,
        activeRates: rates.filter(r => r.isActive).length,
        averageMarkup: Math.round(
          (rates.reduce((sum, r) => sum + ((r.currentRate - r.baseRate) / r.baseRate * 100), 0) / rates.length) * 100
        ) / 100
      }
    });

  } catch (error) {
    console.error('Error fetching rates:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch rates',
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
    const requiredFields = ['propertyId', 'roomType', 'baseRate', 'currentRate', 'startDate', 'endDate'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create new rate (mock implementation)
    const newRate = {
      id: `rate_${Date.now()}`,
      propertyId: body.propertyId,
      propertyName: body.propertyName || 'Unknown Property',
      roomType: body.roomType,
      baseRate: parseFloat(body.baseRate),
      currentRate: parseFloat(body.currentRate),
      minStay: parseInt(body.minStay) || 1,
      maxStay: parseInt(body.maxStay) || 30,
      season: body.season || 'regular',
      startDate: body.startDate,
      endDate: body.endDate,
      isActive: body.isActive ?? true,
      daysOfWeek: body.daysOfWeek || [1, 2, 3, 4, 5, 6, 0],
      createdAt: new Date().toISOString().split('T')[0]
    };

    return NextResponse.json({
      success: true,
      rate: newRate,
      message: 'Rate created successfully'
    });

  } catch (error) {
    console.error('Error creating rate:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create rate',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { rateId, ...updates } = body;

    if (!rateId) {
      return NextResponse.json(
        { success: false, error: 'Rate ID is required' },
        { status: 400 }
      );
    }

    // Mock rate update
    const updatedRate = {
      id: rateId,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      rate: updatedRate,
      message: 'Rate updated successfully'
    });

  } catch (error) {
    console.error('Error updating rate:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update rate',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}