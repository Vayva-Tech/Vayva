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

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID required' }, { status: 400 });
    }

    const pricingTiers = await prisma.wholesalePricingTier.findMany({
      where: {
        businessId,
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            customers: true,
          },
        },
      },
      orderBy: {
        minOrderValue: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: pricingTiers,
    });
  } catch (error) {
    console.error('Error fetching wholesale pricing tiers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wholesale pricing tiers' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      businessId, 
      name, 
      minOrderValue, 
      discountPercentage, 
      description,
      benefits 
    } = body;

    if (!businessId || !name || minOrderValue === undefined || discountPercentage === undefined) {
      return NextResponse.json(
        { error: 'Business ID, name, minOrderValue, and discountPercentage are required' },
        { status: 400 }
      );
    }

    // Check for duplicate tier name
    const existingTier = await prisma.wholesalePricingTier.findFirst({
      where: {
        businessId,
        name: {
          equals: name,
          mode: 'insensitive',
        },
        deletedAt: null,
      },
    });

    if (existingTier) {
      return NextResponse.json(
        { error: 'Pricing tier with this name already exists' },
        { status: 409 }
      );
    }

    const pricingTier = await prisma.wholesalePricingTier.create({
      data: {
        businessId,
        name,
        description,
        minOrderValue,
        discountPercentage,
        benefits: benefits || [],
        createdBy: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: pricingTier,
    });
  } catch (error) {
    console.error('Error creating wholesale pricing tier:', error);
    return NextResponse.json(
      { error: 'Failed to create wholesale pricing tier' },
      { status: 500 }
    );
  }
}