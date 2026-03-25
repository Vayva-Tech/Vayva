// ============================================================================
// Delivery Service
// ============================================================================

import type { DeliverySlot } from '../../../../infra/db/src/generated/client';
import { PrismaClient } from '@vayva/db';

export class DeliveryService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a new delivery slot
   */
  async createDeliverySlot(data: {
    storeId: string;
    date: Date;
    startTime: string;
    endTime: string;
    maxCapacity: number;
    zipCodes: string[];
  }): Promise<DeliverySlot> {
    return this.prisma.deliverySlot.create({
      data: {
        ...data,
        bookedCount: 0,
        isAvailable: true,
      },
    });
  }

  /**
   * Get available slots for a date
   */
  async getAvailableSlots(storeId: string, date: Date, zipCode?: string) {
    const where: any = {
      storeId,
      date,
      isAvailable: true,
    };

    if (zipCode) {
      where.zipCodes = {
        has: zipCode,
      };
    }

    return this.prisma.deliverySlot.findMany({
      where,
      orderBy: { startTime: 'asc' },
    });
  }

  /**
   * Book a delivery slot
   */
  async bookSlot(slotId: string): Promise<boolean> {
    const slot = await this.prisma.deliverySlot.findUnique({
      where: { id: slotId },
    });

    if (!slot || !slot.isAvailable) {
      return false;
    }

    if (slot.bookedCount >= slot.maxCapacity) {
      await this.prisma.deliverySlot.update({
        where: { id: slotId },
        data: { isAvailable: false },
      });
      return false;
    }

    await this.prisma.deliverySlot.update({
      where: { id: slotId },
      data: {
        bookedCount: { increment: 1 },
      },
    });

    return true;
  }

  /**
   * Update slot capacity
   */
  async updateCapacity(slotId: string, maxCapacity: number) {
    const slot = await this.prisma.deliverySlot.findUnique({
      where: { id: slotId },
    });

    if (!slot) {
      throw new Error('Slot not found');
    }

    const isAvailable = maxCapacity > slot.bookedCount;

    return this.prisma.deliverySlot.update({
      where: { id: slotId },
      data: {
        maxCapacity,
        isAvailable,
      },
    });
  }

  /**
   * Cancel a slot booking (decrement count)
   */
  async cancelBooking(slotId: string): Promise<void> {
    const slot = await this.prisma.deliverySlot.findUnique({
      where: { id: slotId },
    });

    if (!slot || slot.bookedCount <= 0) {
      throw new Error('Invalid slot');
    }

    await this.prisma.deliverySlot.update({
      where: { id: slotId },
      data: {
        bookedCount: { decrement: 1 },
        isAvailable: true,
      },
    });
  }

  /**
   * Get all slots for a date range
   */
  async getSlotsForDateRange(
    storeId: string,
    startDate: Date,
    endDate: Date
  ) {
    return this.prisma.deliverySlot.findMany({
      where: {
        storeId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });
  }
}
