import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const property = await prisma.property.findUnique({
      where: {
        id: params.id,
        storeId: process.env.STORE_ID || 'default-real-estate-store',
        status: 'available',
      },
      include: {
        viewings: {
          where: {
            status: 'scheduled',
          },
          orderBy: {
            scheduledAt: 'asc',
          },
        },
        applications: {
          where: {
            status: 'pending',
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!property) {
      return Response.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Transform property data
    const transformedProperty = {
      id: property.id,
      name: property.title,
      description: property.description,
      price: Number(property.price),
      images: property.images,
      videoUrl: property.videoUrl,
      virtualTourUrl: property.virtualTourUrl,
      floorPlanUrl: property.floorPlanUrl,
      category: property.type,
      location: `${property.address}, ${property.city}, ${property.state}`,
      address: property.address,
      city: property.city,
      state: property.state,
      zipCode: property.zipCode,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      sqft: property.area ? Math.round(property.area * 10.764) : undefined, // Convert sqm to sqft
      type: property.purpose === 'sale' ? 'For Sale' : property.purpose === 'rent' ? 'For Rent' : 'For Lease',
      featured: property.featured,
      lat: property.lat ? Number(property.lat) : undefined,
      lng: property.lng ? Number(property.lng) : undefined,
      amenities: property.amenities,
      status: property.status,
      createdAt: property.createdAt,
      agentId: property.agentId,
      yearBuilt: property.yearBuilt,
      currency: property.currency,
    };

    // Get related properties (same city/type, excluding current property)
    const relatedProperties = await prisma.property.findMany({
      where: {
        storeId: process.env.STORE_ID || 'default-real-estate-store',
        status: 'available',
        city: property.city,
        type: property.type,
        id: {
          not: property.id,
        },
      },
      take: 4,
    });

    const transformedRelated = relatedProperties.map(p => ({
      id: p.id,
      name: p.title,
      price: Number(p.price),
      images: p.images.slice(0, 1),
      location: `${p.city}, ${p.state}`,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      sqft: p.area ? Math.round(p.area * 10.764) : undefined,
      type: p.purpose === 'sale' ? 'For Sale' : p.purpose === 'rent' ? 'For Rent' : 'For Lease',
    }));

    return Response.json({
      property: transformedProperty,
      related: transformedRelated,
      upcomingViewings: property.viewings.length,
      pendingApplications: property.applications.length,
    });
  } catch (error) {
    console.error('Property detail API error:', error);
    return Response.json(
      { error: 'Failed to fetch property' },
      { status: 500 }
    );
  }
}