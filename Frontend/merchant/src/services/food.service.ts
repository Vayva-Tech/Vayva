import { api } from '@/lib/api-client';
import type {
  GhostBrand,
  Reservation,
  ReservationStatus,
} from '@/types/phase2-industry';

export class FoodService {
  // ===== GHOST BRANDS =====

  async getGhostBrands(storeId: string): Promise<GhostBrand[]> {
    const response = await api.get(`/food/${storeId}/ghost-brands`);
    return response.data || [];
  }

  async createGhostBrand(
    storeId: string,
    data: Omit<GhostBrand, 'id' | 'storeId' | 'isActive' | 'createdAt'>
  ): Promise<GhostBrand> {
    const response = await api.post(`/food/${storeId}/ghost-brands`, {
      storeId,
      ...data,
    });
    return response.data || {};
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
    const response = await api.post('/food/waste-log', {
      ...data,
    });
    return response.data || {};
  }

  async getWasteReport(
    storeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    const response = await api.get(`/food/${storeId}/waste-report`, {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
    return response.data || {};
  }
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
    const response = await api.get(`/food/${storeId}/reservations`, {
      date: date.toISOString(),
      status,
    });
    return response.data || [];
  }

  async createReservation(
    data: Omit<Reservation, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'arrivedAt' | 'completedAt' | 'cancelledAt' | 'noShow'>
  ): Promise<Reservation> {
    const response = await api.post('/food/reservations', {
      ...data,
    });
    return response.data || {};
  }

  async checkInReservation(storeId: string, id: string): Promise<Reservation> {
    const response = await api.patch(`/food/reservations/${id}/check-in`, { storeId });
    return response.data || {};
  }

  async cancelReservation(storeId: string, id: string): Promise<Reservation> {
    const response = await api.patch(`/food/reservations/${id}/cancel`, { storeId });
    return response.data || {};
  }
    });

    if (!reservation) {
      throw new Error('Reservation not found');
    }

    return this.mapReservationRow(reservation);
  }

  private mapReservationRow(r: Record<string, unknown>): Reservation {
    const row = r as {
      id: string;
      storeId: string;
      customerId: string;
      customerName: string;
      customerPhone: string;
      partySize: number;
      date: Date;
      time: string;
      tableId: string | null;
      status: string;
      specialRequests: string | null;
      dietaryRestrictions: string[];
      arrivedAt: Date | null;
      completedAt: Date | null;
      cancelledAt: Date | null;
      noShow: boolean;
      depositAmount: unknown;
      createdAt: Date;
      updatedAt: Date;
    };

    return {
      id: row.id,
      storeId: row.storeId,
      customerId: row.customerId,
      customerName: row.customerName,
      customerPhone: row.customerPhone,
      partySize: row.partySize,
      date: row.date,
      time: row.time,
      tableId: row.tableId ?? undefined,
      status: row.status as ReservationStatus,
      specialRequests: row.specialRequests ?? undefined,
      dietaryRestrictions: row.dietaryRestrictions,
      arrivedAt: row.arrivedAt ?? undefined,
      completedAt: row.completedAt ?? undefined,
      cancelledAt: row.cancelledAt ?? undefined,
      noShow: row.noShow,
      depositAmount: Number(row.depositAmount),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
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
