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
    const memberId = searchParams.get('memberId');
    const transactionType = searchParams.get('transactionType'); // EARNED, REDEEMED, ADJUSTED
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID required' }, { status: 400 });
    }

    const where: any = {
      member: {
        businessId,
        deletedAt: null,
      },
      deletedAt: null,
    };

    if (memberId) {
      where.memberId = memberId;
    }

    if (transactionType) {
      where.transactionType = transactionType;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const transactions = await prisma.loyaltyTransaction.findMany({
      where,
      take: limit,
      include: {
        member: {
          include: {
            customer: {
              select: {
                name: true,
                email: true,
              },
            },
            tier: {
              select: {
                name: true,
              },
            },
          },
        },
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate summary
    const totalEarned = transactions
      .filter(t => t.transactionType === 'EARNED')
      .reduce((sum, t) => sum + t.points, 0);
      
    const totalRedeemed = transactions
      .filter(t => t.transactionType === 'REDEEMED')
      .reduce((sum, t) => sum + Math.abs(t.points), 0);

    const netPoints = totalEarned - totalRedeemed;

    return NextResponse.json({
      success: true,
      data: {
        transactions,
        summary: {
          totalTransactions: transactions.length,
          totalEarned,
          totalRedeemed,
          netPoints,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching loyalty transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loyalty transactions' },
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
    const { businessId, memberId, points, transactionType, description, orderId } = body;

    if (!businessId || !memberId || !points || !transactionType) {
      return NextResponse.json(
        { error: 'Business ID, Member ID, points, and transactionType are required' },
        { status: 400 }
      );
    }

    // Verify member exists and belongs to business
    const member = await prisma.loyaltyMember.findFirst({
      where: {
        id: memberId,
        businessId,
        deletedAt: null,
      },
      include: {
        tier: true,
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: 'Loyalty member not found' },
        { status: 404 }
      );
    }

    // Handle point adjustments based on transaction type
    let newPointsBalance = member.pointsBalance;
    if (transactionType === 'EARNED') {
      newPointsBalance += points;
    } else if (transactionType === 'REDEEMED') {
      if (member.pointsBalance < points) {
        return NextResponse.json(
          { error: 'Insufficient points balance' },
          { status: 400 }
        );
      }
      newPointsBalance -= points;
    } else if (transactionType === 'ADJUSTED') {
      newPointsBalance += points; // Can be negative for deductions
    }

    // Create transaction
    const transaction = await prisma.loyaltyTransaction.create({
      data: {
        memberId,
        points: transactionType === 'REDEEMED' ? -points : points,
        transactionType,
        description: description || getDefaultDescription(transactionType, points),
        orderId: orderId || null,
        createdBy: session.user.id,
      },
    });

    // Update member's point balance
    await prisma.loyaltyMember.update({
      where: { id: memberId },
      data: {
        pointsBalance: Math.max(0, newPointsBalance), // Ensure non-negative
        lastActivity: new Date(),
        updatedBy: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: transaction,
      message: 'Points transaction recorded successfully',
    });
  } catch (error) {
    console.error('Error recording loyalty transaction:', error);
    return NextResponse.json(
      { error: 'Failed to record loyalty transaction' },
      { status: 500 }
    );
  }
}

function getDefaultDescription(transactionType: string, points: number): string {
  switch (transactionType) {
    case 'EARNED':
      return `Earned ${points} points`;
    case 'REDEEMED':
      return `Redeemed ${points} points`;
    case 'ADJUSTED':
      return `Points adjustment: ${points > 0 ? '+' : ''}${points}`;
    default:
      return 'Points transaction';
  }
}