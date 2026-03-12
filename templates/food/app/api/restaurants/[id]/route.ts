import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";

// GET /api/restaurants/[id] - Get restaurant details
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const restaurantId = params.id;

    const restaurant = await prisma.store.findUnique({
      where: {
        id: restaurantId,
        isActive: true
      },
      include: {
        products: {
          where: {
            productType: 'menu_item',
            status: 'ACTIVE'
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
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
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    // Transform data for frontend
    const transformedRestaurant = {
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
      menuItems: restaurant.products.map(item => ({
        id: item.id,
        name: item.title,
        description: item.description,
        price: parseFloat(item.price.toString()),
        images: item.images || [],
        category: item.metadata?.category || 'Main Course',
        prepTime: item.metadata?.prepTime || 20,
        allergens: item.metadata?.allergens || [],
        dietaryInfo: item.metadata?.dietaryInfo || [],
        isAvailable: item.status === 'ACTIVE',
        isPopular: item.metadata?.isPopular || false
      })),
      averageRating: 4.5, // Would come from reviews
      totalReviews: 128 // Would come from reviews
    };

    return NextResponse.json({ restaurant: transformedRestaurant });

  } catch (error) {
    console.error('Failed to fetch restaurant:', error);
    return NextResponse.json(
      { error: 'Failed to fetch restaurant' },
      { status: 500 }
    );
  }
}