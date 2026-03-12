import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const featured = searchParams.get('featured');

    // Mock luxury experience data
    const experiences = [
      {
        id: 'exp_1',
        name: 'Michelin-Starred Dining Experience',
        category: 'dining',
        price: 295,
        duration: 120,
        capacity: 20,
        currentBookings: 15,
        rating: 4.9,
        reviewCount: 234,
        description: 'Exclusive fine dining with award-winning chef and wine pairing',
        highlights: [
          '3-course tasting menu',
          'Premium wine selection',
          'Personal sommelier service',
          'Private dining room available'
        ],
        exclusions: [
          'Gratuities not included',
          'Dietary restrictions require advance notice'
        ],
        isActive: true,
        isFeatured: true,
        createdAt: '2024-01-15',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop'
      },
      {
        id: 'exp_2',
        name: 'Royal Spa Retreat',
        category: 'spa',
        price: 185,
        duration: 90,
        capacity: 8,
        currentBookings: 6,
        rating: 4.8,
        reviewCount: 156,
        description: 'Luxury spa treatment with premium organic products and hydrotherapy',
        highlights: [
          '60-minute massage therapy',
          'Aromatherapy session',
          'Facial treatment',
          'Access to relaxation lounge'
        ],
        exclusions: [
          'Additional treatments extra',
          'Cancellation policy applies'
        ],
        isActive: true,
        isFeatured: true,
        createdAt: '2024-02-20',
        image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=250&fit=crop'
      },
      {
        id: 'exp_3',
        name: 'Helicopter City Tour',
        category: 'activities',
        price: 450,
        duration: 45,
        capacity: 4,
        currentBookings: 3,
        rating: 4.7,
        reviewCount: 89,
        description: 'Breathtaking aerial views of the city skyline and landmarks',
        highlights: [
          'Private helicopter tour',
          'Professional pilot',
          'Photo opportunities',
          'Champagne toast included'
        ],
        exclusions: [
          'Weather dependent',
          'Weight restrictions apply'
        ],
        isActive: true,
        isFeatured: false,
        createdAt: '2024-03-10',
        image: 'https://images.unsplash.com/photo-1539840093081-010146436111?w=400&h=250&fit=crop'
      },
      {
        id: 'exp_4',
        name: 'Private Yacht Charter',
        category: 'activities',
        price: 895,
        duration: 240,
        capacity: 12,
        currentBookings: 8,
        rating: 4.9,
        reviewCount: 167,
        description: 'Luxury yacht experience with captain and crew service',
        highlights: [
          '4-hour private charter',
          'Professional captain and crew',
          'Premium beverages included',
          'Water sports equipment',
          'Gourmet lunch served onboard'
        ],
        exclusions: [
          'Fuel surcharge may apply',
          'Additional hours extra'
        ],
        isActive: true,
        isFeatured: true,
        createdAt: '2024-01-30',
        image: 'https://images.unsplash.com/photo-1561501900-3701fa6a0864?w=400&h=250&fit=crop'
      },
      {
        id: 'exp_5',
        name: 'Wine Tasting Masterclass',
        category: 'events',
        price: 125,
        duration: 90,
        capacity: 15,
        currentBookings: 12,
        rating: 4.6,
        reviewCount: 98,
        description: 'Educational wine tasting session with expert sommelier',
        highlights: [
          '5 premium wine samples',
          'Expert sommelier guidance',
          'Cheese pairing selection',
          'Take-home tasting notes'
        ],
        exclusions: [
          'Additional bottles extra',
          'Must be 21+ to participate'
        ],
        isActive: true,
        isFeatured: false,
        createdAt: '2024-02-15',
        image: 'https://images.unsplash.com/photo-1610824224917-d35a19ab2ba9?w=400&h=250&fit=crop'
      },
      {
        id: 'exp_6',
        name: 'Personal Shopping Concierge',
        category: 'concierge',
        price: 75,
        duration: 180,
        capacity: 1,
        currentBookings: 23,
        rating: 4.8,
        reviewCount: 189,
        description: 'Personal shopping assistant for luxury retail therapy',
        highlights: [
          '2-hour personal shopping session',
          'Access to VIP boutiques',
          'Style consultation',
          'Complimentary champagne'
        ],
        exclusions: [
          'Purchases not included',
          'Additional hours extra'
        ],
        isActive: true,
        isFeatured: false,
        createdAt: '2024-03-05',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=250&fit=crop'
      }
    ];

    // Apply filters
    let filteredExperiences = experiences;
    
    if (category) {
      filteredExperiences = filteredExperiences.filter(e => e.category === category);
    }
    
    if (status) {
      filteredExperiences = filteredExperiences.filter(e => 
        status === 'active' ? e.isActive : !e.isActive
      );
    }
    
    if (featured === 'true') {
      filteredExperiences = filteredExperiences.filter(e => e.isFeatured);
    }

    return NextResponse.json({
      success: true,
      experiences: filteredExperiences,
      total: filteredExperiences.length,
      filters: {
        category,
        status,
        featured
      }
    });

  } catch (error) {
    console.error('Error fetching luxury experiences:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch luxury experiences',
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
    const requiredFields = ['name', 'category', 'price', 'duration', 'capacity', 'description'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create new luxury experience (mock implementation)
    const newExperience = {
      id: `exp_${Date.now()}`,
      name: body.name,
      category: body.category,
      price: parseFloat(body.price),
      duration: parseInt(body.duration),
      capacity: parseInt(body.capacity),
      currentBookings: 0,
      rating: 0,
      reviewCount: 0,
      description: body.description,
      highlights: body.highlights || [],
      exclusions: body.exclusions || [],
      isActive: body.isActive ?? true,
      isFeatured: body.isFeatured ?? false,
      createdAt: new Date().toISOString().split('T')[0],
      image: body.image || 'https://placehold.co/400x250'
    };

    return NextResponse.json({
      success: true,
      experience: newExperience,
      message: 'Luxury experience created successfully'
    });

  } catch (error) {
    console.error('Error creating luxury experience:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create luxury experience',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}