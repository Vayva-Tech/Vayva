import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    // Mock property data
    const properties = [
      {
        id: 'prop_1',
        name: 'Grand Plaza Hotel',
        type: 'hotel',
        address: '123 Main Street',
        city: 'New York',
        country: 'USA',
        rooms: 120,
        occupiedRooms: 85,
        dailyRate: 180,
        occupancyRate: 71,
        rating: 4.5,
        reviewCount: 234,
        isPublished: true,
        isActive: true,
        createdAt: '2024-01-15',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=200&fit=crop'
      },
      {
        id: 'prop_2',
        name: 'Seaside Resort & Spa',
        type: 'resort',
        address: '456 Ocean Drive',
        city: 'Miami',
        country: 'USA',
        rooms: 85,
        occupiedRooms: 62,
        dailyRate: 295,
        occupancyRate: 73,
        rating: 4.8,
        reviewCount: 156,
        isPublished: true,
        isActive: true,
        createdAt: '2024-02-20',
        image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&h=200&fit=crop'
      },
      {
        id: 'prop_3',
        name: 'Urban Boutique Inn',
        type: 'bnb',
        address: '789 Park Avenue',
        city: 'Chicago',
        country: 'USA',
        rooms: 25,
        occupiedRooms: 18,
        dailyRate: 125,
        occupancyRate: 72,
        rating: 4.3,
        reviewCount: 89,
        isPublished: true,
        isActive: true,
        createdAt: '2024-03-10',
        image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400&h=200&fit=crop'
      }
    ];

    // Apply filters
    let filteredProperties = properties;
    
    if (status) {
      filteredProperties = filteredProperties.filter(p => 
        status === 'published' ? p.isPublished : !p.isPublished
      );
    }
    
    if (type) {
      filteredProperties = filteredProperties.filter(p => p.type === type);
    }

    return NextResponse.json({
      success: true,
      properties: filteredProperties,
      total: filteredProperties.length
    });

  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch properties',
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
    const requiredFields = ['name', 'type', 'address', 'city', 'country', 'rooms'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create new property (mock implementation)
    const newProperty = {
      id: `prop_${Date.now()}`,
      name: body.name,
      type: body.type,
      address: body.address,
      city: body.city,
      country: body.country,
      rooms: parseInt(body.rooms),
      occupiedRooms: 0,
      dailyRate: parseInt(body.dailyRate) || 100,
      occupancyRate: 0,
      rating: 0,
      reviewCount: 0,
      isPublished: body.isPublished ?? false,
      isActive: body.isActive ?? true,
      createdAt: new Date().toISOString().split('T')[0],
      image: body.image || 'https://placehold.co/400x200'
    };

    return NextResponse.json({
      success: true,
      property: newProperty,
      message: 'Property created successfully'
    });

  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create property',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}