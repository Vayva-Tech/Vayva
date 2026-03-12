import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const difficulty = searchParams.get('difficulty');
    const destination = searchParams.get('destination');

    // Mock adventure tour data
    const tours = [
      {
        id: 'tour_1',
        name: 'Rocky Mountain Hiking Expedition',
        destination: 'Colorado Rockies',
        difficulty: 'intermediate',
        duration: 5,
        price: 899,
        maxParticipants: 12,
        currentParticipants: 8,
        rating: 4.8,
        reviewCount: 156,
        departureDates: ['2024-07-15', '2024-08-05', '2024-08-25'],
        highlights: [
          'Summit Mount Elbert (14,440 ft)',
          'Alpine lake camping',
          'Wildlife photography',
          'Expert mountain guide'
        ],
        included: [
          'Professional guide',
          'All meals',
          'Camping equipment',
          'Transportation',
          'Park permits'
        ],
        excluded: [
          'Personal gear',
          'Travel insurance',
          'Alcoholic beverages'
        ],
        isActive: true,
        isPublished: true,
        createdAt: '2024-01-15',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop'
      },
      {
        id: 'tour_2',
        name: 'Patagonia Trekking Adventure',
        destination: 'Torres del Paine, Chile',
        difficulty: 'advanced',
        duration: 10,
        price: 2499,
        maxParticipants: 8,
        currentParticipants: 6,
        rating: 4.9,
        reviewCount: 89,
        departureDates: ['2024-11-10', '2024-12-05'],
        highlights: [
          'Torres del Paine trek',
          'Glacier hiking',
          'Guinea pig sightings',
          'Milky Way photography'
        ],
        included: [
          'Bilingual guide',
          'Premium camping',
          'All meals',
          'Emergency support',
          'International flights'
        ],
        excluded: [
          'Personal expenses',
          'Visa fees',
          'Tips for guides'
        ],
        isActive: true,
        isPublished: true,
        createdAt: '2024-02-20',
        image: 'https://images.unsplash.com/photo-1516442143623-c479957550d7?w=400&h=250&fit=crop'
      },
      {
        id: 'tour_3',
        name: 'Alaska Wilderness Canoe Journey',
        destination: 'Denali National Park',
        difficulty: 'intermediate',
        duration: 7,
        price: 1699,
        maxParticipants: 10,
        currentParticipants: 7,
        rating: 4.7,
        reviewCount: 124,
        departureDates: ['2024-06-20', '2024-07-10', '2024-08-01'],
        highlights: [
          'Wilderness canoeing',
          'Bear watching',
          'Northern lights',
          'Native culture experience'
        ],
        included: [
          'Canoe rental',
          'Wilderness guide',
          'Camping gear',
          'All meals',
          'Safety equipment'
        ],
        excluded: [
          'Fishing license',
          'Camera equipment',
          'Souvenir purchases'
        ],
        isActive: true,
        isPublished: true,
        createdAt: '2024-03-10',
        image: 'https://images.unsplash.com/photo-1517451518004-96838795d316?w=400&h=250&fit=crop'
      },
      {
        id: 'tour_4',
        name: 'Beginner Backpacking Course',
        destination: 'Yosemite National Park',
        difficulty: 'beginner',
        duration: 3,
        price: 499,
        maxParticipants: 15,
        currentParticipants: 12,
        rating: 4.6,
        reviewCount: 203,
        departureDates: ['2024-06-08', '2024-06-22', '2024-07-06', '2024-07-20'],
        highlights: [
          'Learn backpacking basics',
          'Yosemite Valley exploration',
          'Waterfall hikes',
          'Leave No Trace principles'
        ],
        included: [
          'Instructional guide',
          'Basic camping gear',
          'Meals provided',
          'Training materials',
          'Park entrance fees'
        ],
        excluded: [
          'Personal clothing',
          'Snacks',
          'Optional activities'
        ],
        isActive: true,
        isPublished: true,
        createdAt: '2024-01-30',
        image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=250&fit=crop'
      }
    ];

    // Apply filters
    let filteredTours = tours;
    
    if (status) {
      filteredTours = filteredTours.filter(t => 
        status === 'active' ? t.isActive : !t.isActive
      );
    }
    
    if (difficulty) {
      filteredTours = filteredTours.filter(t => t.difficulty === difficulty);
    }
    
    if (destination) {
      filteredTours = filteredTours.filter(t => 
        t.destination.toLowerCase().includes(destination.toLowerCase())
      );
    }

    return NextResponse.json({
      success: true,
      tours: filteredTours,
      total: filteredTours.length,
      filters: {
        status,
        difficulty,
        destination
      }
    });

  } catch (error) {
    console.error('Error fetching adventure tours:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch adventure tours',
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
    const requiredFields = ['name', 'destination', 'difficulty', 'duration', 'price', 'maxParticipants'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create new adventure tour (mock implementation)
    const newTour = {
      id: `tour_${Date.now()}`,
      name: body.name,
      destination: body.destination,
      difficulty: body.difficulty,
      duration: parseInt(body.duration),
      price: parseFloat(body.price),
      maxParticipants: parseInt(body.maxParticipants),
      currentParticipants: 0,
      rating: 0,
      reviewCount: 0,
      departureDates: body.departureDates || [],
      highlights: body.highlights || [],
      included: body.included || [],
      excluded: body.excluded || [],
      isActive: body.isActive ?? true,
      isPublished: body.isPublished ?? false,
      createdAt: new Date().toISOString().split('T')[0],
      image: body.image || 'https://placehold.co/400x250'
    };

    return NextResponse.json({
      success: true,
      tour: newTour,
      message: 'Adventure tour created successfully'
    });

  } catch (error) {
    console.error('Error creating adventure tour:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create adventure tour',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}