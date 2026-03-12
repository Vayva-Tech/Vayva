import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeStaff = searchParams.get('includeStaff') === 'true';
    const includeShifts = searchParams.get('includeShifts') === 'true';

    const storeId = process.env.STORE_ID || 'default-food-store';

    // Get restaurant staff information
    const staffData: any = {};
    
    if (includeStaff) {
      const staff = await prisma.restaurantStaff.findMany({
        where: {
          storeId,
          isActive: true,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
          skills: true,
          isFullTime: true,
          hourlyRate: true,
        },
        orderBy: {
          role: 'asc',
        },
      });

      staffData.staff = staff.map(member => ({
        id: member.id,
        name: `${member.firstName} ${member.lastName}`,
        role: member.role,
        skills: member.skills,
        isFullTime: member.isFullTime,
        hourlyRate: Number(member.hourlyRate),
      }));
    }

    if (includeShifts) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const shifts = await prisma.restaurantShift.findMany({
        where: {
          storeId,
          date: {
            gte: today,
            lt: tomorrow,
          },
          status: {
            not: 'draft',
          },
        },
        include: {
          staff: {
            select: {
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
        orderBy: {
          startTime: 'asc',
        },
      });

      staffData.shifts = shifts.map(shift => ({
        id: shift.id,
        date: shift.date,
        startTime: shift.startTime,
        endTime: shift.endTime,
        role: shift.role,
        section: shift.section,
        status: shift.status,
        staffMember: shift.staff ? 
          `${shift.staff.firstName} ${shift.staff.lastName}` : 
          'Unassigned',
        staffRole: shift.staff?.role || null,
      }));
    }

    // Get basic restaurant info (this would typically come from a Restaurant/Vendor model)
    const restaurantInfo = {
      id: storeId,
      name: 'Flavor Restaurant',
      description: 'Delicious food delivered fast',
      openingHours: '10:00 AM - 10:00 PM',
      deliveryRadius: '5km',
      minimumOrder: 1500,
      deliveryFee: 500,
      averagePrepTime: 25, // minutes
      rating: 4.7,
      totalReviews: 1247,
      cuisineTypes: ['Nigerian', 'Continental', 'Fast Food'],
      services: ['Delivery', 'Takeaway', 'Dine-in'],
      ...staffData,
    };

    return Response.json({
      restaurant: restaurantInfo,
    });
  } catch (error) {
    console.error('Restaurant info API error:', error);
    return Response.json(
      { error: 'Failed to fetch restaurant information' },
      { status: 500 }
    );
  }
}