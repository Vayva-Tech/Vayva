import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const tipPoolSchema = z.object({
  distributionMethod: z.enum(['equal', 'hoursWorked', 'role', 'custom']),
  totalTips: z.number().positive(),
  staff: z.array(z.object({
    staffId: z.string(),
    hoursWorked: z.number().optional(),
    role: z.string().optional(),
    customPercentage: z.number().optional(),
  })),
});

/**
 * POST /api/restaurant/staff/tips/pool
 * Calculate and distribute tip pool
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = tipPoolSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { distributionMethod, totalTips, staff } = validation.data;

    // Calculate tip distribution
    let distribution: Array<{
      staffId: string;
      amount: number;
      percentage: number;
    }> = [];

    switch (distributionMethod) {
      case 'equal': {
        const equalShare = totalTips / staff.length;
        distribution = staff.map(s => ({
          staffId: s.staffId,
          amount: equalShare,
          percentage: (equalShare / totalTips) * 100,
        }));
        break;
      }

      case 'hoursWorked': {
        const totalHours = staff.reduce((sum, s) => sum + (s.hoursWorked || 0), 0);
        distribution = staff.map(s => {
          const hours = s.hoursWorked || 0;
          const percentage = totalHours > 0 ? hours / totalHours : 0;
          return {
            staffId: s.staffId,
            amount: totalTips * percentage,
            percentage: percentage * 100,
          };
        });
        break;
      }

      case 'role': {
        const roleWeights: Record<string, number> = {
          'server': 1.0,
          'bartender': 0.8,
          'busser': 0.6,
          'host': 0.5,
          'runner': 0.5,
        };
        
        const totalWeight = staff.reduce((sum, s) => {
          return sum + (roleWeights[s.role || 'server'] || 1.0);
        }, 0);
        
        distribution = staff.map(s => {
          const weight = roleWeights[s.role || 'server'] || 1.0;
          const percentage = totalWeight > 0 ? weight / totalWeight : 0;
          return {
            staffId: s.staffId,
            amount: totalTips * percentage,
            percentage: percentage * 100,
          };
        });
        break;
      }

      case 'custom':
        distribution = staff.map(s => ({
          staffId: s.staffId,
          amount: totalTips * ((s.customPercentage || 0) / 100),
          percentage: s.customPercentage || 0,
        }));
        break;
    }

    // Create tip transactions
    const transactions = await Promise.all(
      distribution.map(async (dist) => {
        return prisma.tipTransaction.create({
          data: {
            staffId: dist.staffId,
            businessId: session.user.id,
            amount: Math.round(dist.amount * 100) / 100,
            percentage: Math.round(dist.percentage * 100) / 100,
            distributionMethod,
            periodStart: new Date(),
            periodEnd: new Date(),
          },
          include: {
            staff: {
              select: {
                name: true,
                role: true,
              },
            },
          },
        });
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalTips,
          totalDistributed: distribution.reduce((sum, d) => sum + d.amount, 0),
          staffCount: staff.length,
          distributionMethod,
        },
        distribution: distribution.map(d => ({
          ...d,
          amount: Math.round(d.amount * 100) / 100,
          percentage: Math.round(d.percentage * 100) / 100,
        })),
        transactions,
      },
    });
  } catch (error) {
    console.error('Tip pooling error:', error);
    return NextResponse.json(
      { error: 'Failed to process tip pool' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/restaurant/staff/tips/history
 * Get tip distribution history
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = searchParams.get('endDate') || new Date().toISOString();

    const transactions = await prisma.tipTransaction.findMany({
      where: {
        businessId: session.user.id,
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        staff: {
          select: {
            name: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Aggregate by staff member
    const staffTotals: Record<string, {
      totalTips: number;
      transactionCount: number;
      averageTip: number;
    }> = {};

    transactions.forEach(tx => {
      if (!staffTotals[tx.staffId]) {
        staffTotals[tx.staffId] = {
          totalTips: 0,
          transactionCount: 0,
          averageTip: 0,
        };
      }
      staffTotals[tx.staffId].totalTips += tx.amount;
      staffTotals[tx.staffId].transactionCount += 1;
    });

    Object.keys(staffTotals).forEach(staffId => {
      staffTotals[staffId].averageTip = 
        staffTotals[staffId].totalTips / staffTotals[staffId].transactionCount;
    });

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalDistributed: transactions.reduce((sum, tx) => sum + tx.amount, 0),
          transactionCount: transactions.length,
          uniqueStaff: Object.keys(staffTotals).length,
        },
        transactions,
        staffTotals: Object.entries(staffTotals).map(([staffId, data]) => ({
          staffId,
          staffName: transactions.find(t => t.staffId === staffId)?.staff.name,
          role: transactions.find(t => t.staffId === staffId)?.staff.role,
          totalTips: Math.round(data.totalTips * 100) / 100,
          transactionCount: data.transactionCount,
          averageTip: Math.round(data.averageTip * 100) / 100,
        })),
      },
    });
  } catch (error) {
    console.error('Get tips history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tip history' },
      { status: 500 }
    );
  }
}
