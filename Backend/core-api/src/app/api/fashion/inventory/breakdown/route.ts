import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const categoryId = searchParams.get('categoryId');
    const collectionId = searchParams.get('collectionId');
    const alertType = searchParams.get('alertType'); // 'critical', 'low', 'overstock'

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID required' }, { status: 400 });
    }

    // Base where clause
    const where: any = {
      businessId,
      deletedAt: null,
    };

    // Filter by category if provided
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Filter by collection if provided
    if (collectionId) {
      where.collections = {
        some: {
          collectionId,
        },
      };
    }

    // Get all product variants with inventory data
    const variants = await prisma.productVariant.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            category: {
              select: {
                name: true,
              },
            },
            collections: {
              select: {
                collection: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [
        { product: { name: 'asc' } },
        { size: 'asc' },
        { color: 'asc' },
      ],
    });

    // Process inventory data
    const inventoryBreakdown = variants.map(variant => {
      const totalStock = variant.stockQuantity;
      const reservedStock = variant.reservedQuantity || 0;
      const availableStock = totalStock - reservedStock;
      const reorderPoint = variant.reorderPoint || Math.max(1, Math.floor(totalStock * 0.2));
      
      // Calculate alert status
      let alertStatus = 'normal';
      let alertMessage = '';
      
      if (availableStock <= 0) {
        alertStatus = 'out_of_stock';
        alertMessage = 'Out of stock';
      } else if (availableStock <= reorderPoint * 0.5) {
        alertStatus = 'critical';
        alertMessage = `Critical: Only ${availableStock} units left`;
      } else if (availableStock <= reorderPoint) {
        alertStatus = 'low';
        alertMessage = `Low stock: ${availableStock} units remaining`;
      } else if (totalStock > reorderPoint * 5) {
        alertStatus = 'overstock';
        alertMessage = `Overstock: ${totalStock} units on hand`;
      }

      return {
        variantId: variant.id,
        productId: variant.productId,
        productName: variant.product.name,
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        category: variant.product.category?.name || 'Uncategorized',
        collections: variant.product.collections.map(c => c.collection.name),
        stock: {
          total: totalStock,
          reserved: reservedStock,
          available: availableStock,
          reorderPoint,
        },
        pricing: {
          cost: variant.cost,
          price: variant.price,
          compareAtPrice: variant.compareAtPrice,
        },
        alert: {
          status: alertStatus,
          message: alertMessage,
          needsAttention: ['out_of_stock', 'critical', 'low'].includes(alertStatus),
        },
      };
    });

    // Filter by alert type if specified
    let filteredBreakdown = inventoryBreakdown;
    if (alertType) {
      filteredBreakdown = inventoryBreakdown.filter(item => 
        item.alert.status === alertType
      );
    }

    // Calculate summary statistics
    const summary = {
      totalVariants: inventoryBreakdown.length,
      totalStockValue: inventoryBreakdown.reduce((sum, item) => 
        sum + (item.stock.total * (item.pricing.cost || 0)), 0
      ),
      outOfStockCount: inventoryBreakdown.filter(item => item.alert.status === 'out_of_stock').length,
      criticalCount: inventoryBreakdown.filter(item => item.alert.status === 'critical').length,
      lowStockCount: inventoryBreakdown.filter(item => item.alert.status === 'low').length,
      overstockCount: inventoryBreakdown.filter(item => item.alert.status === 'overstock').length,
      normalCount: inventoryBreakdown.filter(item => item.alert.status === 'normal').length,
    };

    // Group by category for overview
    const categoryBreakdown = inventoryBreakdown.reduce((acc, item) => {
      const category = item.category;
      if (!acc[category]) {
        acc[category] = {
          count: 0,
          totalStock: 0,
          outOfStock: 0,
          critical: 0,
          lowStock: 0,
        };
      }
      
      acc[category].count++;
      acc[category].totalStock += item.stock.total;
      
      if (item.alert.status === 'out_of_stock') acc[category].outOfStock++;
      if (item.alert.status === 'critical') acc[category].critical++;
      if (item.alert.status === 'low') acc[category].lowStock++;
      
      return acc;
    }, {} as Record<string, any>);

    // Group by size for size curve analysis
    const sizeBreakdown = inventoryBreakdown.reduce((acc, item) => {
      const size = item.size || 'Unknown';
      if (!acc[size]) {
        acc[size] = {
          count: 0,
          totalStock: 0,
          availableStock: 0,
          outOfStock: 0,
        };
      }
      
      acc[size].count++;
      acc[size].totalStock += item.stock.total;
      acc[size].availableStock += item.stock.available;
      
      if (item.stock.available <= 0) acc[size].outOfStock++;
      
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      success: true,
      data: {
        items: filteredBreakdown,
        summary,
        breakdowns: {
          byCategory: categoryBreakdown,
          bySize: sizeBreakdown,
        },
        filtersApplied: {
          categoryId: categoryId || null,
          collectionId: collectionId || null,
          alertType: alertType || null,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching inventory breakdown:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory breakdown' },
      { status: 500 }
    );
  }
}