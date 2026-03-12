import { prisma } from '@/lib/prisma';
import type {
  GhostBrand,
  Reservation,
  ReservationStatus,
} from '@/types/phase2-industry';

export class FoodService {
  // ===== GHOST BRANDS =====

  async getGhostBrands(storeId: string): Promise<GhostBrand[]> {
    const brands = await prisma.ghostBrand?.findMany({
      where: { storeId, isActive: true },
    });

    return brands.map((b: any) => ({
      id: b.id,
      storeId: b.storeId,
      name: b.name,
      cuisine: b.cuisine,
      logoUrl: b.logoUrl ?? undefined,
      menuIds: b.menuIds,
      deliveryPlatforms: b.deliveryPlatforms,
      isActive: b.isActive,
      createdAt: b.createdAt,
    }));
  }

  async createGhostBrand(
    storeId: string,
    data: Omit<GhostBrand, 'id' | 'storeId' | 'isActive' | 'createdAt'>
  ): Promise<GhostBrand> {
    const brand = await prisma.ghostBrand?.create({
      data: {
        storeId,
        name: data.name,
        cuisine: data.cuisine,
        logoUrl: data.logoUrl,
        menuIds: data.menuIds,
        deliveryPlatforms: data.deliveryPlatforms,
        isActive: true,
      },
    });

    return {
      id: brand.id,
      storeId: brand.storeId,
      name: brand.name,
      cuisine: brand.cuisine,
      logoUrl: brand.logoUrl ?? undefined,
      menuIds: brand.menuIds,
      deliveryPlatforms: brand.deliveryPlatforms,
      isActive: brand.isActive,
      createdAt: brand.createdAt,
    };
  }

  // ===== WASTE TRACKING =====

  async logWaste(data: {
    storeId: string;
    ingredientId: string;
    quantity: number;
    unit: string;
    reason: string;
    cost: number;
    recordedBy: string;
    notes?: string;
  }): Promise<any> {
    const log = await prisma.wasteLog?.create({
      data: {
        storeId: data.storeId,
        ingredientId: data.ingredientId,
        quantity: data.quantity,
        unit: data.unit,
        reason: data.reason,
        cost: data.cost,
        recordedBy: data.recordedBy,
        notes: data.notes,
      },
    });

    return log;
  }

  async getWasteReport(
    storeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    const logs = await prisma.wasteLog?.findMany({
      where: {
        storeId,
        createdAt: { gte: startDate, lte: endDate },
      },
    });

    const totalCost = logs.reduce((sum: number, log: any) => sum + Number(log.cost), 0);
    const byReason = logs.reduce((acc: Record<string, number>, log: any) => {
      acc[log.reason] = (acc[log.reason] || 0) + Number(log.cost);
      return acc;
    }, {});

    return {
      totalCost,
      totalEntries: logs.length,
      byReason,
      period: { startDate, endDate },
    };
  }

  // ===== RESERVATIONS =====

  async getReservations(
    storeId: string,
    date: Date,
    status?: ReservationStatus
  ): Promise<Reservation[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const reservations = await prisma.reservation?.findMany({
      where: {
        storeId,
        date: { gte: startOfDay, lte: endOfDay },
        ...(status && { status }),
      },
      orderBy: { time: 'asc' },
    });

    return reservations.map((r: any) => ({
      id: r.id,
      storeId: r.storeId,
      customerId: r.customerId,
      customerName: r.customerName,
      customerPhone: r.customerPhone,
      partySize: r.partySize,
      date: r.date,
      time: r.time,
      tableId: r.tableId ?? undefined,
      status: (r as any).status as ReservationStatus,
      specialRequests: r.specialRequests ?? undefined,
      dietaryRestrictions: r.dietaryRestrictions,
      arrivedAt: r.arrivedAt ?? undefined,
      completedAt: r.completedAt ?? undefined,
      cancelledAt: r.cancelledAt ?? undefined,
      noShow: r.noShow,
      depositAmount: Number(r.depositAmount),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  async createReservation(
    data: Omit<Reservation, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'arrivedAt' | 'completedAt' | 'cancelledAt' | 'noShow'>
  ): Promise<Reservation> {
    // Check availability
    const existing = await prisma.reservation?.count({
      where: {
        storeId: data.storeId,
        date: data.date,
        time: data.time,
        status: { notIn: ['cancelled', 'no_show'] },
      },
    });

    if (existing >= 50) {
      throw new Error('Time slot fully booked');
    }

    const reservation = await prisma.reservation?.create({
      data: {
        storeId: data.storeId,
        customerId: data.customerId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        partySize: data.partySize,
        date: data.date,
        time: data.time,
        tableId: data.tableId,
        status: 'confirmed',
        specialRequests: data.specialRequests,
        dietaryRestrictions: data.dietaryRestrictions,
        depositAmount: data.depositAmount ?? 0,
        noShow: false,
      },
    });

    return {
      id: reservation.id,
      storeId: reservation.storeId,
      customerId: reservation.customerId,
      customerName: reservation.customerName,
      customerPhone: reservation.customerPhone,
      partySize: reservation.partySize,
      date: reservation.date,
      time: reservation.time,
      tableId: reservation.tableId ?? undefined,
      status: (reservation as any).status as ReservationStatus,
      specialRequests: reservation.specialRequests ?? undefined,
      dietaryRestrictions: reservation.dietaryRestrictions,
      noShow: reservation.noShow,
      depositAmount: Number(reservation.depositAmount),
      createdAt: reservation.createdAt,
      updatedAt: reservation.updatedAt,
    };
  }

  async checkInReservation(id: string): Promise<Reservation> {
    const reservation = await prisma.reservation?.update({
      where: { id },
      data: { status: 'completed', arrivedAt: new Date() },
    });

    // Update dining history
    await this.updateDiningHistory(reservation.storeId, reservation.customerId);

    return {
      id: reservation.id,
      storeId: reservation.storeId,
      customerId: reservation.customerId,
      customerName: reservation.customerName,
      customerPhone: reservation.customerPhone,
      partySize: reservation.partySize,
      date: reservation.date,
      time: reservation.time,
      tableId: reservation.tableId ?? undefined,
      status: (reservation as any).status as ReservationStatus,
      specialRequests: reservation.specialRequests ?? undefined,
      dietaryRestrictions: reservation.dietaryRestrictions,
      arrivedAt: reservation.arrivedAt ?? undefined,
      noShow: reservation.noShow,
      depositAmount: Number(reservation.depositAmount),
      createdAt: reservation.createdAt,
      updatedAt: reservation.updatedAt,
    };
  }

  async cancelReservation(id: string): Promise<Reservation> {
    const reservation = await prisma.reservation?.update({
      where: { id },
      data: { status: 'cancelled', cancelledAt: new Date() },
    });

    return {
      id: reservation.id,
      storeId: reservation.storeId,
      customerId: reservation.customerId,
      customerName: reservation.customerName,
      customerPhone: reservation.customerPhone,
      partySize: reservation.partySize,
      date: reservation.date,
      time: reservation.time,
      tableId: reservation.tableId ?? undefined,
      status: (reservation as any).status as ReservationStatus,
      specialRequests: reservation.specialRequests ?? undefined,
      dietaryRestrictions: reservation.dietaryRestrictions,
      cancelledAt: reservation.cancelledAt ?? undefined,
      noShow: reservation.noShow,
      depositAmount: Number(reservation.depositAmount),
      createdAt: reservation.createdAt,
      updatedAt: reservation.updatedAt,
    };
  }

  // ===== DINING HISTORY =====

  async getDiningHistory(
    storeId: string,
    customerId: string
  ): Promise<any> {
    const history = await prisma.diningHistory?.findFirst({
      where: { storeId, customerId },
    });

    if (!history) {
      return {
        storeId,
        customerId,
        visitCount: 0,
        favoriteDishes: [],
        lastVisit: null,
        totalSpent: 0,
        averageOrder: 0,
      };
    }

    return {
      storeId: history.storeId,
      customerId: history.customerId,
      visitCount: history.visitCount,
      favoriteDishes: history.favoriteDishes,
      dietaryNotes: history.dietaryNotes ?? undefined,
      lastVisit: history.lastVisit,
      totalSpent: Number(history.totalSpent),
      averageOrder: Number(history.averageOrder),
    };
  }

  private async updateDiningHistory(
    storeId: string,
    customerId: string
  ): Promise<void> {
    const existing = await prisma.diningHistory?.findFirst({
      where: { storeId, customerId },
    });

    if (existing) {
      await prisma.diningHistory?.update({
        where: { id: existing.id },
        data: {
          visitCount: { increment: 1 },
          lastVisit: new Date(),
        },
      });
    } else {
      await prisma.diningHistory?.create({
        data: {
          storeId,
          customerId,
          visitCount: 1,
          favoriteDishes: [],
          lastVisit: new Date(),
        },
      });
    }
  }

  // ===== AVAILABILITY =====

  async getAvailableSlots(storeId: string, date: Date, partySize: number): Promise<string[]> {
    const allSlots = [
      '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
      '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
    ];

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get existing reservations
    const reservations = await prisma.reservation?.findMany({
      where: {
        storeId,
        date: { gte: startOfDay, lte: endOfDay },
        status: { notIn: ['cancelled', 'no_show'] },
      },
    });

    // Count by time slot
    const countBySlot = reservations.reduce((acc: Record<string, number>, r: any) => {
      acc[r.time] = (acc[r.time] || 0) + r.partySize;
      return acc;
    }, {});

    // Return slots with capacity
    return allSlots.filter(slot => (countBySlot[slot] || 0) + partySize <= 50);
  }
}

export const foodService = new FoodService();
