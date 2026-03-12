import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@vayva/db";

// GET /api/restaurants - List restaurants with filtering
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cuisine = searchParams.get('cuisine');
    const city = searchParams.get('city');
    const rating = searchParams.get('rating');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isActive: true
    };

    if (cuisine) {
      where.cuisine = {
        has: cuisine
      };
    }

    if (city) {
      where.city = {
        contains: city,
        mode: 'insensitive'
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { cuisine: { has: search } }
      ];
    }

    const [restaurants, total] = await Promise.all([
      prisma.store.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          _count: {
            select: {
              products: {
                where: {
                  productType: 'menu_item',
                  status: 'ACTIVE'
                }
              }
            }
          }
        }
      }),
      prisma.store.count({ where })
    ]);

    // Transform data for frontend
    const transformedRestaurants = restaurants.map(restaurant => ({
      id: restaurant.id,
      name: restaurant.name,
      description: restaurant.description,
      cuisine: restaurant.metadata?.cuisine || [],
      phone: restaurant.phone,
      email: restaurant.email,
      address: restaurant.address,
      city: restaurant.city,
      state: restaurant.state,
      zipCode: restaurant.zipCode,
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
      logo: restaurant.logo,
      coverImage: restaurant.coverImage,
      images: restaurant.images || [],
      hours: restaurant.metadata?.hours || {},
      deliveryRadius: restaurant.metadata?.deliveryRadius || 5,
      deliveryFee: parseFloat(restaurant.metadata?.deliveryFee || '0'),
      minimumOrder: parseFloat(restaurant.metadata?.minimumOrder || '0'),
      preparationTime: restaurant.metadata?.preparationTime || 20,
      isOpen: restaurant.metadata?.isOpen !== undefined ? restaurant.metadata.isOpen : true,
      menuItemCount: restaurant._count.products,
      averageRating: 4.5, // Would come from reviews in real implementation
      totalReviews: 128 // Would come from reviews in real implementation
    }));

    return NextResponse.json({
      restaurants: transformedRestaurants,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRestaurants: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Failed to fetch restaurants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch restaurants' },
      { status: 500 }
    );
  }
}

// POST /api/restaurants - Create new restaurant (requires authentication)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      name, 
      description, 
      cuisine,
      phone,
      email,
      address,
      city,
      state,
      zipCode,
      latitude,
      longitude,
      logo,
      coverImage,
      hours,
      deliveryRadius,
      deliveryFee,
      minimumOrder,
      preparationTime
    } = body;

    // Validate required fields
    if (!name || !phone || !address || !city) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create restaurant/store
    const restaurant = await prisma.store.create({
      data: {
        ownerId: session.user.id,
        name,
        description,
        phone,
        email,
        address,
        city,
        state,
        zipCode,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        logo,
        coverImage,
        metadata: {
          cuisine: cuisine || [],
          hours: hours || {},
          deliveryRadius: deliveryRadius || 5,
          deliveryFee: deliveryFee || 0,
          minimumOrder: minimumOrder || 0,
          preparationTime: preparationTime || 20,
          isOpen: true
        }
      }
    });

    return NextResponse.json({ 
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        description: restaurant.description,
        cuisine: restaurant.metadata?.cuisine || [],
        phone: restaurant.phone,
        email: restaurant.email,
        address: restaurant.address,
        city: restaurant.city,
        state: restaurant.state,
        zipCode: restaurant.zipCode,
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
        logo: restaurant.logo,
        coverImage: restaurant.coverImage,
        hours: restaurant.metadata?.hours || {},
        deliveryRadius: restaurant.metadata?.deliveryRadius || 5,
        deliveryFee: restaurant.metadata?.deliveryFee || 0,
        minimumOrder: restaurant.metadata?.minimumOrder || 0,
        preparationTime: restaurant.metadata?.preparationTime || 20,
        isOpen: restaurant.metadata?.isOpen !== undefined ? restaurant.metadata.isOpen : true
      }
    });

  } catch (error) {
    console.error('Failed to create restaurant:', error);
    return NextResponse.json(
      { error: 'Failed to create restaurant' },
      { status: 500 }
    );
  }
}