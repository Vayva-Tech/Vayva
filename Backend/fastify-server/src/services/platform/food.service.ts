import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

/**
 * Food Service - Restaurant and food industry features
 * 
 * Provides:
 * - Ghost brands (virtual restaurant brands)
 * - Waste tracking and reporting
 * - Table reservations management
 * - Dining history tracking
 * - Availability slots
 */

export interface GhostBrand {
  id: string;
  storeId: string;
  name: string;
  description?: string;
  logoUrl?: string;
  cuisineType: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reservation {
  id: string;
  storeId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  partySize: number;
  date: Date;
  time: string;
  tableId?: string;
  status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show';
  specialRequests?: string;
  dietaryRestrictions: string[];
  arrivedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  noShow: boolean;
  depositAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DiningHistory {
  id: string;
  storeId: string;
  customerId: string;
  visitCount: number;
  favoriteDishes: string[];
  dietaryNotes?: string;
  lastVisit: Date;
  totalSpent: number;
  averageOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export class FoodService {
  // ==================== Ghost Brands ====================
  
  async getGhostBrands(storeId: string) {
    try {
      const brands = await prisma.ghostBrand.findMany({
        where: { storeId },
        orderBy: { createdAt: 'desc' },
      });

      return brands.map((b) => ({
        id: b.id,
        storeId: b.storeId,
        name: b.name,
        description: b.description,
        logoUrl: b.logoUrl,
        cuisineType: b.cuisineType,
        isActive: b.isActive,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      }));
    } catch (error) {
      logger.error('[FoodService] Failed to get ghost brands', {
        storeId,
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  async createGhostBrand(storeId: string, data: any) {
    try {
      const brand = await prisma.ghostBrand.create({
        data: {
          storeId,
          name: data.name,
          description: data.description,
          logoUrl: data.logoUrl,
          cuisineType: data.cuisineType,
          isActive: true,
        },
      });

      logger.info('[FoodService] Ghost brand created', {
        brandId: brand.id,
      });

      return {
        id: brand.id,
        storeId: brand.storeId,
        name: brand.name,
        description: brand.description,
        logoUrl: brand.logoUrl,
        cuisineType: brand.cuisineType,
        isActive: brand.isActive,
        createdAt: brand.createdAt,
        updatedAt: brand.updatedAt,
      };
    } catch (error) {
      logger.error('[FoodService] Failed to create ghost brand', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  // ==================== Waste Tracking ====================
  
  async logWaste(data: any) {
    try {
      const wasteLog = await prisma.wasteLog.create({
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

      logger.info('[FoodService] Waste logged', {
        wasteId: wasteLog.id,
      });

      return {
        id: wasteLog.id,
        storeId: wasteLog.storeId,
        ingredientId: wasteLog.ingredientId,
        quantity: Number(wasteLog.quantity),
        unit: wasteLog.unit,
        reason: wasteLog.reason,
        cost: Number(wasteLog.cost),
        recordedBy: wasteLog.recordedBy,
        notes: wasteLog.notes,
        createdAt: wasteLog.createdAt,
        updatedAt: wasteLog.updatedAt,
      };
    } catch (error) {
      logger.error('[FoodService] Failed to log waste', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async getWasteReport(storeId: string, startDate: Date, endDate: Date) {
    try {
      const logs = await prisma.wasteLog.findMany({
        where: {
          storeId,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      const totalCost = logs.reduce((sum, log) => sum + Number(log.cost), 0);
      
      const byReason = logs.reduce((acc: Record<string, number>, log) => {
        acc[log.reason] = (acc[log.reason] || 0) + Number(log.cost);
        return acc;
      }, {});

      return {
        totalCost,
        totalEntries: logs.length,
        byReason,
        period: { startDate, endDate },
        logs: logs.map((log) => ({
          id: log.id,
          storeId: log.storeId,
          ingredientId: log.ingredientId,
          quantity: Number(log.quantity),
          unit: log.unit,
          reason: log.reason,
          cost: Number(log.cost),
          recordedBy: log.recordedBy,
          notes: log.notes,
          createdAt: log.createdAt,
        })),
      };
    } catch (error) {
      logger.error('[FoodService] Failed to get waste report', {
        storeId,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  // ==================== Reservations ====================
  
  async getReservations(storeId: string, date: Date, status?: string) {
    try {
      const where: any = { storeId };
      
      // Filter by date range
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      where.date = { gte: startOfDay, lte: endOfDay };
      
      if (status) where.status = status;

      const reservations = await prisma.reservation.findMany({
        where,
        orderBy: { time: 'asc' },
      });

      return reservations.map((r) => this.mapReservationRow(r));
    } catch (error) {
      logger.error('[FoodService] Failed to get reservations', {
        storeId,
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  async createReservation(data: any) {
    try {
      const reservation = await prisma.reservation.create({
        data: {
          storeId: data.storeId,
          customerId: data.customerId,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          partySize: data.partySize,
          date: data.date,
          time: data.time,
          tableId: data.tableId,
          status: 'pending',
          specialRequests: data.specialRequests,
          dietaryRestrictions: data.dietaryRestrictions || [],
          depositAmount: data.depositAmount,
        },
      });

      logger.info('[FoodService] Reservation created', {
        reservationId: reservation.id,
      });

      return this.mapReservationRow(reservation);
    } catch (error) {
      logger.error('[FoodService] Failed to create reservation', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async checkInReservation(id: string, storeId: string) {
    try {
      const reservation = await prisma.reservation.update({
        where: { id, storeId },
        data: {
          status: 'seated',
          arrivedAt: new Date(),
        },
      });

      logger.info('[FoodService] Reservation checked in', {
        reservationId: id,
      });

      return this.mapReservationRow(reservation);
    } catch (error) {
      logger.error('[FoodService] Failed to check in reservation', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async cancelReservation(id: string, storeId: string) {
    try {
      const reservation = await prisma.reservation.update({
        where: { id, storeId },
        data: {
          status: 'cancelled',
          cancelledAt: new Date(),
        },
      });

      logger.info('[FoodService] Reservation cancelled', {
        reservationId: id,
      });

      return this.mapReservationRow(reservation);
    } catch (error) {
      logger.error('[FoodService] Failed to cancel reservation', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  // ==================== Dining History ====================
  
  async getDiningHistory(storeId: string, customerId: string) {
    try {
      const history = await prisma.diningHistory.findFirst({
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
        id: history.id,
        storeId: history.storeId,
        customerId: history.customerId,
        visitCount: history.visitCount,
        favoriteDishes: history.favoriteDishes ? JSON.parse(history.favoriteDishes as string) : [],
        dietaryNotes: history.dietaryNotes,
        lastVisit: history.lastVisit,
        totalSpent: Number(history.totalSpent),
        averageOrder: Number(history.averageOrder),
        createdAt: history.createdAt,
        updatedAt: history.updatedAt,
      };
    } catch (error) {
      logger.error('[FoodService] Failed to get dining history', {
        storeId,
        customerId,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  async updateDiningHistory(storeId: string, customerId: string, orderTotal?: number, dishName?: string) {
    try {
      const existing = await prisma.diningHistory.findFirst({
        where: { storeId, customerId },
      });

      const favoriteDishes = existing?.favoriteDishes 
        ? JSON.parse(existing.favoriteDishes as string) 
        : [];
      
      if (dishName && !favoriteDishes.includes(dishName)) {
        favoriteDishes.push(dishName);
      }

      if (existing) {
        const updated = await prisma.diningHistory.update({
          where: { id: existing.id },
          data: {
            visitCount: { increment: 1 },
            lastVisit: new Date(),
            favoriteDishes: JSON.stringify(favoriteDishes),
            totalSpent: orderTotal ? { increment: orderTotal } : undefined,
          },
        });

        return {
          id: updated.id,
          storeId: updated.storeId,
          customerId: updated.customerId,
          visitCount: updated.visitCount,
          favoriteDishes: updated.favoriteDishes ? JSON.parse(updated.favoriteDishes as string) : [],
          dietaryNotes: updated.dietaryNotes,
          lastVisit: updated.lastVisit,
          totalSpent: Number(updated.totalSpent),
          averageOrder: Number(updated.averageOrder),
        };
      } else {
        const created = await prisma.diningHistory.create({
          data: {
            storeId,
            customerId,
            visitCount: 1,
            favoriteDishes: JSON.stringify(dishName ? [dishName] : []),
            lastVisit: new Date(),
            totalSpent: orderTotal || 0,
            averageOrder: orderTotal || 0,
          },
        });

        return {
          id: created.id,
          storeId: created.storeId,
          customerId: created.customerId,
          visitCount: created.visitCount,
          favoriteDishes: created.favoriteDishes ? JSON.parse(created.favoriteDishes as string) : [],
          dietaryNotes: created.dietaryNotes,
          lastVisit: created.lastVisit,
          totalSpent: Number(created.totalSpent),
          averageOrder: Number(created.averageOrder),
        };
      }
    } catch (error) {
      logger.error('[FoodService] Failed to update dining history', {
        storeId,
        customerId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  // ==================== Availability Slots ====================
  
  async getAvailableSlots(storeId: string, date: Date, partySize: number) {
    try {
      const allSlots = [
        '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
        '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
      ];

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Get existing reservations
      const reservations = await prisma.reservation.findMany({
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

      // Return slots with capacity (assuming max capacity of 50)
      return allSlots.filter(slot => (countBySlot[slot] || 0) + partySize <= 50);
    } catch (error) {
      logger.error('[FoodService] Failed to get available slots', {
        storeId,
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  // ==================== Helpers ====================
  
  private mapReservationRow(r: any): Reservation {
    return {
      id: r.id,
      storeId: r.storeId,
      customerId: r.customerId,
      customerName: r.customerName,
      customerPhone: r.customerPhone,
      partySize: r.partySize,
      date: r.date,
      time: r.time,
      tableId: r.tableId ?? undefined,
      status: r.status as any,
      specialRequests: r.specialRequests ?? undefined,
      dietaryRestrictions: r.dietaryRestrictions || [],
      arrivedAt: r.arrivedAt ?? undefined,
      completedAt: r.completedAt ?? undefined,
      cancelledAt: r.cancelledAt ?? undefined,
      noShow: r.noShow,
      depositAmount: r.depositAmount ? Number(r.depositAmount) : undefined,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }
}
