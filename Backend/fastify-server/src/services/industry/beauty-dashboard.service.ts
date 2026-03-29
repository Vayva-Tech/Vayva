import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class BeautyDashboardService {
  constructor(private readonly db = prisma) {}

  async getDashboard(storeId: string) {
    const [
      totalServices,
      activeServices,
      totalClients,
      totalAppointments,
      todayAppointments,
      totalRevenue,
      recentAppointments,
    ] = await Promise.all([
      this.db.beautyService.count({ where: { storeId } }),
      this.db.beautyService.count({ where: { storeId, isActive: true } }),
      this.db.beautyClient.count({ where: { storeId } }),
      this.db.beautyAppointment.count({ where: { storeId } }),
      this.db.beautyAppointment.count({
        where: {
          storeId,
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
      this.db.beautyAppointment.aggregate({
        where: { storeId, status: 'completed' },
        _sum: { price: true },
      }),
      this.db.beautyAppointment.findMany({
        where: { storeId },
        include: {
          client: { select: { firstName: true, lastName: true, phone: true } },
          service: { select: { name: true } },
        },
        orderBy: { date: 'desc' },
        take: 10,
      }),
    ]);

    return {
      stats: {
        services: { total: totalServices, active: activeServices },
        clients: { total: totalClients },
        appointments: { total: totalAppointments, today: todayAppointments },
        revenue: { total: totalRevenue._sum.price || 0 },
      },
      recentAppointments,
    };
  }

  async getOverview(storeId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [monthlyRevenue, monthlyBookings, topServices] = await Promise.all([
      this.db.beautyAppointment.aggregate({
        where: {
          storeId,
          status: 'completed',
          date: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { price: true },
      }),
      this.db.beautyAppointment.count({
        where: {
          storeId,
          date: { gte: startOfMonth, lte: endOfMonth },
        },
      }),
      this.db.beautyService.findMany({
        where: { storeId },
        include: {
          _count: {
            select: {
              appointments: {
                where: {
                  date: { gte: startOfMonth, lte: endOfMonth },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      monthlyRevenue: Number(monthlyRevenue._sum.price || 0),
      monthlyBookings,
      topServices: topServices.map((s) => ({
        id: s.id,
        name: s.name,
        bookings: s._count.appointments,
      })),
    };
  }
}
