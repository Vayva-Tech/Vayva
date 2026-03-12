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
    const tierId = searchParams.get('tierId');
    const status = searchParams.get('status'); // active, inactive, suspended
    const search = searchParams.get('search'); // name or email search
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID required' }, { status: 400 });
    }

    const where: any = {
      businessId,
      deletedAt: null,
    };

    if (tierId) {
      where.tierId = tierId;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { email: { contains: search, mode: 'insensitive' } } },
        { customer: { phone: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const members = await prisma.loyaltyMember.findMany({
      where,
      take: limit,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        tier: {
          select: {
            id: true,
            name: true,
            minPoints: true,
            discountPercentage: true,
          },
        },
        _count: {
          select: {
            transactions: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
      orderBy: {
        pointsBalance: 'desc',
      },
    });

    // Calculate summary statistics
    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.status === 'ACTIVE').length;
    const totalPoints = members.reduce((sum, member) => sum + member.pointsBalance, 0);
    const averagePoints = totalMembers > 0 ? totalPoints / totalMembers : 0;

    return NextResponse.json({
      success: true,
      data: {
        members,
        summary: {
          totalMembers,
          activeMembers,
          inactiveMembers: totalMembers - activeMembers,
          totalPoints,
          averagePoints: Math.round(averagePoints),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching loyalty members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loyalty members' },
      { status: 500 }
    );
  }
}