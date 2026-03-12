import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/creative/resources/capacity
// Get team capacity and allocation overview
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');

    if (!storeId) {
      return NextResponse.json({ error: 'Missing storeId' }, { status: 400 });
    }

    // Get all team members with their allocations
    const teamMembers = await prisma.teamMember.findMany({
      where: { storeId, isActive: true },
      include: {
        allocations: {
          where: {
            endDate: { gte: new Date() },
            startDate: { lte: new Date() },
          },
          include: {
            project: {
              select: {
                id: true,
                name: true,
                stage: true,
              },
            },
          },
        },
        skills: true,
      },
    });

    // Calculate capacity metrics
    const capacityOverview = teamMembers.map((member) => {
      const allocatedHours = member.allocations.reduce((sum, alloc) => {
        const daysAllocated = Math.ceil(
          (new Date(alloc.endDate).getTime() - new Date(alloc.startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return sum + (alloc.hoursPerWeek || 0) * (daysAllocated / 7);
      }, 0);

      const availableHours = 40; // Standard work week
      const utilizationRate = (allocatedHours / availableHours) * 100;

      return {
        id: member.id,
        name: member.name,
        role: member.role || 'Team Member',
        skills: member.skills.map((s) => s.skill),
        allocatedHours: Math.round(allocatedHours),
        availableHours,
        utilizationRate: Math.round(utilizationRate),
        isOverallocated: utilizationRate > 100,
        projectCount: member.allocations.length,
        projects: member.allocations.map((a) => ({
          projectId: a.projectId,
          projectName: a.project?.name || 'Unknown',
          stage: a.project?.stage || 'unknown',
          hoursPerWeek: a.hoursPerWeek || 0,
        })),
      };
    });

    const overallocated = capacityOverview.filter((m) => m.isOverallocated);
    const available = capacityOverview.filter((m) => !m.isOverallocated && m.utilizationRate < 80);

    return NextResponse.json({
      capacity: {
        teamMembers: capacityOverview,
        summary: {
          total: teamMembers.length,
          overallocated: overallocated.length,
          available: available.length,
          avgUtilization: Math.round(
            capacityOverview.reduce((sum, m) => sum + m.utilizationRate, 0) / capacityOverview.length
          ),
        },
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to fetch resource capacity', message: errorMessage },
      { status: 500 }
    );
  }
}

// POST /api/creative/resources/allocate
// Allocate a team member to a project
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { storeId, memberId, projectId, hoursPerWeek, startDate, endDate } = body;

    if (!storeId || !memberId || !projectId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const allocation = await prisma.resourceAllocation.create({
      data: {
        storeId,
        memberId,
        projectId,
        hoursPerWeek: hoursPerWeek || 40,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : undefined,
      },
      include: {
        member: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ allocation }, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Failed to create allocation', message: errorMessage },
      { status: 500 }
    );
  }
}
