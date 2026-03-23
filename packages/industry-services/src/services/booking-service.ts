// @ts-nocheck
/**
 * Booking Service
 * Specialized service for booking management
 */

import { prisma } from '@vayva/db';
import { Booking, BookingStatus } from '../types';

export class BookingService {
  private storeId: string;

  constructor(storeId: string) {
    this.storeId = storeId;
  }

  async createBooking(data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) {
    // Validate availability
    const conflicts = await this.checkAvailability(
      data.serviceId,
      data.startDate,
      data.endDate,
      data.serviceProviderId
    );

    if (conflicts.length > 0) {
      throw new Error('Selected time slot is not available');
    }

    return await prisma.serviceBooking.create({
      data: {
        ...data,
        storeId: this.storeId,
      },
      include: {
        service: true,
        serviceProvider: true,
        customer: true,
      },
    });
  }

  async checkAvailability(
    serviceId: string,
    startDate: Date,
    endDate: Date,
    serviceProviderId?: string
  ) {
    const where: any = {
      serviceId,
      startDate: { lt: endDate },
      endDate: { gt: startDate },
      status: { not: 'cancelled' },
    };

    if (serviceProviderId) {
      where.serviceProviderId = serviceProviderId;
    }

    return await prisma.serviceBooking.findMany({
      where,
    });
  }

  async getAvailableSlots(
    serviceId: string,
    date: Date,
    duration: number,
    serviceProviderId?: string
  ) {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new Error('Service not found');
    }

    // Get existing bookings for the day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await prisma.serviceBooking.findMany({
      where: {
        serviceId,
        startDate: { gte: startOfDay, lte: endOfDay },
        status: { not: 'cancelled' },
        ...(serviceProviderId ? { serviceProviderId } : {}),
      },
      orderBy: { startDate: 'asc' },
    });

    // Generate available slots based on service duration and working hours
    const slots = [];
    const workingHours = service.workingHours || { 
      start: '09:00', 
      end: '17:00' 
    };

    const [startHour, startMinute] = workingHours.start.split(':').map(Number);
    const [endHour, endMinute] = workingHours.end.split(':').map(Number);

    const slotStart = new Date(date);
    slotStart.setHours(startHour, startMinute, 0, 0);

    const slotEnd = new Date(date);
    slotEnd.setHours(endHour, endMinute, 0, 0);

    while (slotStart < slotEnd) {
      const slotEndTime = new Date(slotStart.getTime() + duration * 60000);

      // Check if slot conflicts with existing bookings
      const hasConflict = existingBookings.some((booking: any) => {
        return (
          (slotStart >= booking.startDate && slotStart < booking.endDate) ||
          (slotEndTime > booking.startDate && slotEndTime <= booking.endDate) ||
          (slotStart <= booking.startDate && slotEndTime >= booking.endDate)
        );
      });

      if (!hasConflict) {
        slots.push({
          start: new Date(slotStart),
          end: new Date(slotEndTime),
          available: true,
        });
      }

      slotStart.setTime(slotStart.getTime() + 30 * 60000); // 30-minute intervals
    }

    return slots;
  }

  async updateBookingStatus(bookingId: string, status: BookingStatus, notes?: string) {
    const booking = await prisma.serviceBooking.update({
      where: { id: bookingId },
      data: {
        status,
        notes: notes || undefined,
      },
      include: {
        service: true,
        customer: true,
      },
    });

    // Send notifications based on status change
    // await this.sendStatusNotification(booking, status);

    return booking;
  }

  async getBookingsByCustomer(customerId: string) {
    return await prisma.serviceBooking.findMany({
      where: {
        storeId: this.storeId,
        customerId,
      },
      include: {
        service: true,
        serviceProvider: true,
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async getUpcomingBookings(daysAhead: number = 7) {
    const fromDate = new Date();
    const toDate = new Date();
    toDate.setDate(toDate.getDate() + daysAhead);

    return await prisma.serviceBooking.findMany({
      where: {
        storeId: this.storeId,
        startDate: {
          gte: fromDate,
          lte: toDate,
        },
        status: { not: 'cancelled' },
      },
      include: {
        service: true,
        customer: true,
        serviceProvider: true,
      },
      orderBy: { startDate: 'asc' },
    });
  }

  async cancelBooking(bookingId: string, reason: string) {
    const booking = await prisma.serviceBooking.update({
      where: { id: bookingId },
      data: {
        status: 'cancelled',
        cancellationReason: reason,
      },
      include: {
        service: true,
        customer: true,
      },
    });

    // Send cancellation notification
    // await this.sendCancellationNotification(booking, reason);

    return booking;
  }
}