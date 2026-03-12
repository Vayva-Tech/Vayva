import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const menuItem = await prisma.menuItem.findUnique({
      where: {
        id: params.id,
        storeId: process.env.STORE_ID || 'default-food-store',
        isActive: true,
      },
      include: {
        pricingHistory: true,
        recipes: {
          include: {
            ingredients: {
              include: {
                ingredient: true,
              },
            },
          },
        },
      },
    });

    if (!menuItem) {
      return Response.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    // Transform menu item data
    const transformedItem = {
      id: menuItem.id,
      name: menuItem.name,
      description: menuItem.description,
      price: Number(menuItem.price),
      images: menuItem.imageUrl ? [menuItem.imageUrl] : [],
      category: menuItem.category,
      prepTime: menuItem.prepTime,
      allergens: menuItem.allergens,
      dietaryInfo: menuItem.dietaryInfo,
      cost: menuItem.cost ? Number(menuItem.cost) : undefined,
      isActive: menuItem.isActive,
      createdAt: menuItem.createdAt,
      // Pricing details
      currentPrice: menuItem.pricingHistory?.actualPrice ? Number(menuItem.pricingHistory.actualPrice) : Number(menuItem.price),
      suggestedPrice: menuItem.pricingHistory?.suggestedPrice ? Number(menuItem.pricingHistory.suggestedPrice) : undefined,
      grossMargin: menuItem.pricingHistory?.grossMargin ? Number(menuItem.pricingHistory.grossMargin) : undefined,
      // Recipe information if available
      ingredients: menuItem.recipes.length > 0 ? 
        menuItem.recipes[0].ingredients.map(ri => ({
          name: ri.ingredient.name,
          quantity: ri.quantity,
          unit: ri.unit,
        })) : [],
      recipeInstructions: menuItem.recipes.length > 0 ? menuItem.recipes[0].instructions : undefined,
    };

    // Get related menu items (same category, excluding current item)
    const relatedItems = await prisma.menuItem.findMany({
      where: {
        storeId: process.env.STORE_ID || 'default-food-store',
        isActive: true,
        category: menuItem.category,
        id: {
          not: menuItem.id,
        },
      },
      take: 4,
    });

    const transformedRelated = relatedItems.map(item => ({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      images: item.imageUrl ? [item.imageUrl] : [],
      category: item.category,
      prepTime: item.prepTime,
    }));

    return Response.json({
      product: transformedItem,
      related: transformedRelated,
    });
  } catch (error) {
    console.error('Menu item detail API error:', error);
    return Response.json(
      { error: 'Failed to fetch menu item' },
      { status: 500 }
    );
  }
}