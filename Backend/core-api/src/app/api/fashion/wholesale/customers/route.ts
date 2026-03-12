import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const customerSchema = z.object({
  businessName: z.string(),
  contactName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  businessType: z.enum(['retailer', 'distributor', 'marketplace', 'boutique']),
  taxId: z.string().optional(),
  shippingAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }),
  billingAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }).optional(),
});

/**
 * POST /api/fashion/wholesale/customers
 * Create new wholesale customer
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = customerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      );
    }

    const customer = await prisma.wholesaleCustomer.create({
      data: {
        ...validation.data,
        businessId: session.user.id,
        status: 'pending_approval',
        creditLimit: 5000, // Default credit limit
      },
      include: {
        pricingTier: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: customer,
      message: 'Wholesale customer created successfully',
    });
  } catch (error) {
    console.error('Create wholesale customer error:', error);
    return NextResponse.json(
      { error: 'Failed to create wholesale customer' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/fashion/wholesale/customers
 * Get all wholesale customers
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const businessType = searchParams.get('type');

    const where: any = { businessId: session.user.id };
    
    if (status) where.status = status;
    if (businessType) where.businessType = businessType;

    const customers = await prisma.wholesaleCustomer.findMany({
      where,
      include: {
        pricingTier: {
          select: {
            name: true,
            discountPercentage: true,
          },
        },
        orders: {
          select: {
            id: true,
            total: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate customer metrics
    const enrichedCustomers = customers.map(customer => {
      const totalOrders = customer._count.orders;
      const totalRevenue = customer.orders.reduce((sum, order) => sum + order.total, 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      return {
        ...customer,
        metrics: {
          totalOrders,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          averageOrderValue: Math.round(averageOrderValue * 100) / 100,
          lastOrderDate: customer.orders[0]?.createdAt,
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalCustomers: enrichedCustomers.length,
          byStatus: {
            pending: enrichedCustomers.filter(c => c.status === 'pending_approval').length,
            active: enrichedCustomers.filter(c => c.status === 'active').length,
            inactive: enrichedCustomers.filter(c => c.status === 'inactive').length,
          },
          byType: {
            retailer: enrichedCustomers.filter(c => c.businessType === 'retailer').length,
            distributor: enrichedCustomers.filter(c => c.businessType === 'distributor').length,
            marketplace: enrichedCustomers.filter(c => c.businessType === 'marketplace').length,
            boutique: enrichedCustomers.filter(c => c.businessType === 'boutique').length,
          },
        },
        customers: enrichedCustomers,
      },
    });
  } catch (error) {
    console.error('Get wholesale customers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wholesale customers' },
      { status: 500 }
    );
  }
}
