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

    const tiers = await prisma.loyaltyTier.findMany({
      where: {
        businessId,
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            members: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
      orderBy: {
        minPoints: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: tiers,
    });
  } catch (error) {
    console.error('Error fetching loyalty tiers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loyalty tiers' },
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
      minPoints, 
      discountPercentage, 
      description,
      benefits 
    } = body;

    if (!businessId || !name || minPoints === undefined) {
      return NextResponse.json(
        { error: 'Business ID, name, and minPoints are required' },
        { status: 400 }
      );
    }

    // Check for duplicate tier name
    const existingTier = await prisma.loyaltyTier.findFirst({
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
        { error: 'Loyalty tier with this name already exists' },
        { status: 409 }
      );
    }

    const tier = await prisma.loyaltyTier.create({
      data: {
        businessId,
        name,
        description,
        minPoints,
        discountPercentage: discountPercentage || 0,
        benefits: benefits || [],
        createdBy: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: tier,
    });
  } catch (error) {
    console.error('Error creating loyalty tier:', error);
    return NextResponse.json(
      { error: 'Failed to create loyalty tier' },
      { status: 500 }
    );
  }
}