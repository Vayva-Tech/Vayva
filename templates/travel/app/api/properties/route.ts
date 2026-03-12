import { NextResponse } from 'next/server';
import { TravelPropertyService, AvailabilityService } from '@vayva/industry-travel/services';
import { PrismaClient } from '../../../../platform/infra/db/src/generated/client';

// Initialize services
const prisma = new PrismaClient();
const propertyService = new TravelPropertyService(prisma);
const availabilityService = new AvailabilityService(prisma);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const destination = searchParams.get('destination');
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const guests = searchParams.get('guests');
    const propertyType = searchParams.get('type');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const amenities = searchParams.get('amenities')?.split(',') || [];
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    // Build filters
    const filters: any = {
      isPublished: true,
      isActive: true
    };

    if (destination) {
      filters.OR = [
        { city: { contains: destination, mode: 'insensitive' } },
        { country: { contains: destination, mode: 'insensitive' } },
        { address: { contains: destination, mode: 'insensitive' } }
      ];
    }

    if (propertyType) {
      filters.type = propertyType;
    }

    // Get properties
    const properties = await propertyService.getProperties(filters);

    // Filter by price range if specified
    let filteredProperties = properties;
    if (minPrice || maxPrice) {
      filteredProperties = properties.filter(property => {
        // This would need to check actual room rates
        // For now, we'll use a mock approach
        const avgRate = 150; // Mock average rate
        if (minPrice && avgRate < parseInt(minPrice)) return false;
        if (maxPrice && avgRate > parseInt(maxPrice)) return false;
        return true;
      });
    }

    // Filter by amenities
    if (amenities.length > 0) {
      filteredProperties = filteredProperties.filter(property => {
        return amenities.every(amenity => 
          property.amenities.includes(amenity.toLowerCase())
        );
      });
    }

    // Check availability if dates are provided
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      
      const availableProperties = [];
      for (const property of filteredProperties) {
        const isAvailable = await availabilityService.checkAvailability(
          property.id, 
          { startDate: checkInDate, endDate: checkOutDate }
        );
        if (isAvailable) {
          availableProperties.push(property);
        }
      }
      filteredProperties = availableProperties;
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProperties = filteredProperties.slice(startIndex, endIndex);

    // Add calculated fields
    const propertiesWithDetails = await Promise.all(
      paginatedProperties.map(async (property) => {
        // Get average rating and review count
        const reviewStats = await getReviewStats(property.id);
        
        // Get starting price (lowest room rate)
        const startingPrice = await getStartingPrice(property.id, checkIn, checkOut);
        
        // Get availability status
        let availabilityStatus = 'available';
        if (checkIn && checkOut) {
          const isAvailable = await availabilityService.checkAvailability(
            property.id, 
            { startDate: new Date(checkIn), endDate: new Date(checkOut) }
          );
          availabilityStatus = isAvailable ? 'available' : 'unavailable';
        }

        return {
          ...property,
          averageRating: reviewStats.averageRating,
          reviewCount: reviewStats.reviewCount,
          startingPrice,
          availabilityStatus,
          image: property.images?.[0] || '/placeholder-property.jpg'
        };
      })
    );

    return NextResponse.json({
      success: true,
      properties: propertiesWithDetails,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredProperties.length / limit),
        totalItems: filteredProperties.length,
        hasNextPage: endIndex < filteredProperties.length,
        hasPrevPage: page > 1
      },
      filters: {
        destination,
        checkIn,
        checkOut,
        guests,
        propertyType,
        priceRange: minPrice || maxPrice ? { min: minPrice, max: maxPrice } : undefined,
        amenities
      }
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
    const requiredFields = ['name', 'type', 'address', 'city', 'country'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Missing required field: ${field}` 
          },
          { status: 400 }
        );
      }
    }

    // Create property
    const property = await propertyService.createProperty({
      tenantId: body.tenantId || 'default-tenant',
      name: body.name,
      type: body.type,
      description: body.description,
      address: body.address,
      city: body.city,
      state: body.state,
      country: body.country,
      postalCode: body.postalCode,
      latitude: body.latitude,
      longitude: body.longitude,
      phoneNumber: body.phoneNumber,
      email: body.email,
      website: body.website,
      amenities: body.amenities || [],
      checkInTime: body.checkInTime || '14:00',
      checkOutTime: body.checkOutTime || '11:00',
      cancellationPolicy: body.cancellationPolicy,
      isPublished: body.isPublished ?? false,
      isActive: body.isActive ?? true,
      images: body.images || []
    });

    return NextResponse.json({
      success: true,
      property,
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

// Helper functions
async function getReviewStats(propertyId: string) {
  // Mock implementation - in real scenario, this would query the database
  return {
    averageRating: 4.2 + (Math.random() * 0.8), // Random rating between 4.2-5.0
    reviewCount: Math.floor(Math.random() * 150) + 10 // Random count between 10-160
  };
}

async function getStartingPrice(propertyId: string, checkIn?: string, checkOut?: string) {
  // Mock implementation - in real scenario, this would calculate based on:
  // - Room rates
  // - Seasonal pricing
  // - Length of stay discounts
  // - Current demand
  
  const basePrice = 100 + Math.random() * 300; // $100-$400 base
  
  // Apply seasonal multiplier
  const now = new Date();
  const month = now.getMonth();
  let seasonalMultiplier = 1;
  
  if (month >= 5 && month <= 7) { // Summer peak season
    seasonalMultiplier = 1.4;
  } else if (month >= 11 || month <= 1) { // Holiday season
    seasonalMultiplier = 1.6;
  } else if (month >= 2 && month <= 4) { // Spring shoulder season
    seasonalMultiplier = 1.1;
  }
  
  return Math.round(basePrice * seasonalMultiplier);
}