import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class BeautyService {
  constructor(private readonly db = prisma) {}

  async getStylists(storeId: string) {
    const stylists = await this.db.beautyStaff.findMany({
      where: { storeId },
      include: {
        services: {
          select: {
            id: true,
            name: true,
            price: true,
            duration: true,
          },
        },
        _count: {
          select: {
            appointments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return stylists.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      phone: s.phone,
      role: s.role,
      specialty: s.specialty,
      bio: s.bio,
      avatar: s.avatar,
      commissionRate: s.commissionRate ? Number(s.commissionRate) : null,
      active: s.active,
      services: s.services,
      appointmentCount: s._count.appointments,
    }));
  }

  async getStylistAvailability(stylistId: string, storeId: string, date?: string) {
    const stylist = await this.db.beautyStaff.findFirst({
      where: { id: stylistId, storeId },
      include: {
        availability: true,
        appointments: {
          where: date ? {
            date: new Date(date),
          } : {},
          select: {
            date: true,
            startTime: true,
            endTime: true,
          },
        },
      },
    });

    if (!stylist) {
      throw new Error('Stylist not found');
    }

    return {
      stylist: {
        id: stylist.id,
        name: stylist.name,
        specialty: stylist.specialty,
      },
      availability: stylist.availability,
      bookedSlots: stylist.appointments.map((a) => ({
        date: a.date,
        startTime: a.startTime,
        endTime: a.endTime,
      })),
    };
  }

  async getGallery(storeId: string, id?: string) {
    if (id) {
      const image = await this.db.beautyGallery.findFirst({
        where: { id, storeId },
      });
      return image;
    }

    const images = await this.db.beautyGallery.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
    });

    return images;
  }

  async getPackages(storeId: string) {
    const packages = await this.db.beautyPackage.findMany({
      where: { storeId },
      include: {
        services: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return packages.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price ? Number(p.price) : null,
      discount: p.discount ? Number(p.discount) : null,
      services: p.services,
      active: p.active,
    }));
  }

  async getServicePerformance(storeId: string) {
    const services = await this.db.beautyService.findMany({
      where: { storeId },
      include: {
        _count: {
          select: {
            appointments: {
              where: {
                status: 'completed',
                date: {
                  gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
                },
              },
            },
          },
        },
        appointments: {
          where: {
            status: 'completed',
            date: {
              gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
            },
          },
          select: {
            price: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return services.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      price: Number(s.price),
      duration: s.duration,
      bookings: s._count.appointments,
      revenue: s.appointments.reduce((sum, a) => sum + Number(a.price), 0),
    }));
  }
}
