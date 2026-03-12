import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeCounts = searchParams.get('includeCounts') === 'true';

    // Get distinct categories from active menu items
    const categories = await prisma.menuItem.groupBy({
      by: ['category'],
      where: {
        storeId: process.env.STORE_ID || 'default-food-store',
        isActive: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        category: 'asc',
      },
    });

    // Transform categories with counts if requested
    const transformedCategories = categories.map(cat => ({
      name: cat.category,
      slug: cat.category.toLowerCase().replace(/\s+/g, '-'),
      itemCount: includeCounts ? cat._count.id : undefined,
    }));

    // Add popular food categories that might not have items yet
    const popularCategories = [
      'Appetizers',
      'Main Courses', 
      'Desserts',
      'Beverages',
      'Breakfast',
      'Lunch',
      'Dinner',
      'Vegetarian',
      'Vegan',
      'Gluten-Free',
      'Kids Menu',
      'Specials'
    ];

    // Merge with existing categories, avoiding duplicates
    const allCategories = [...transformedCategories];
    
    popularCategories.forEach(popularCat => {
      const exists = allCategories.some(cat => 
        cat.name.toLowerCase() === popularCat.toLowerCase()
      );
      
      if (!exists) {
        allCategories.push({
          name: popularCat,
          slug: popularCat.toLowerCase().replace(/\s+/g, '-'),
          itemCount: includeCounts ? 0 : undefined,
        });
      }
    });

    return Response.json({
      categories: allCategories,
    });
  } catch (error) {
    console.error('Categories API error:', error);
    return Response.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}