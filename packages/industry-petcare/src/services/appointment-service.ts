// @ts-nocheck
/**
 * Petcare Appointment Service
 * Specialized service for pet appointment management
 */

import { prisma } from '@vayva/db';
import { PetAppointment, AppointmentStatus } from '../types';

export class AppointmentService {
  private storeId: string;

  constructor(storeId: string) {
    this.storeId = storeId;
  }

  async createAppointment(data: Omit<PetAppointment, 'id' | 'createdAt' | 'updatedAt'>) {
    // Validate availability
    const conflicts = await this.checkAvailability(
      data.petId,
      data.startDate,
      data.endDate
    );

    if (conflicts.length > 0) {
      throw new Error('Selected time slot is not available for this pet');
    }

    return await prisma.petAppointment.create({
      data: {
        ...data,
        storeId: this.storeId,
      },
      include: {
        pet: true,
        owner: true,
        veterinarian: true,
      },
    });
  }

  async checkAvailability(petId: string, startDate: Date, endDate: Date) {
    return await prisma.petAppointment.findMany({
      where: {
        petId,
        startDate: { lt: endDate },
        endDate: { gt: startDate },
        status: { not: 'cancelled' },
      },
    });
  }

  async getAvailableSlots(date: Date, duration: number, veterinarianId?: string) {
    // Get existing appointments for the day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await prisma.petAppointment.findMany({
      where: {
        storeId: this.storeId,
        startDate: { gte: startOfDay, lte: endOfDay },
        status: { not: 'cancelled' },
        ...(veterinarianId ? { veterinarianId } : {}),
      },
      orderBy: { startDate: 'asc' },
    });

    // Generate available slots (assuming 8am-6pm working hours)
    const slots = [];
    const workingStart = new Date(date);
    workingStart.setHours(8, 0, 0, 0);

    const workingEnd = new Date(date);
    workingEnd.setHours(18, 0, 0, 0);

    const slotStart = new Date(workingStart);

    while (slotStart < workingEnd) {
      const slotEndTime = new Date(slotStart.getTime() + duration * 60000);

      // Check if slot conflicts with existing appointments
      const hasConflict = existingAppointments.some(appointment => {
        return (
          (slotStart >= appointment.startDate && slotStart < appointment.endDate) ||
          (slotEndTime > appointment.startDate && slotEndTime <= appointment.endDate) ||
          (slotStart <= appointment.startDate && slotEndTime >= appointment.endDate)
        );
      });

      if (!hasConflict && slotEndTime <= workingEnd) {
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

  async updateAppointmentStatus(appointmentId: string, status: AppointmentStatus, notes?: string) {
    const appointment = await prisma.petAppointment.update({
      where: { id: appointmentId },
      data: {
        status,
        notes: notes || undefined,
      },
      include: {
        pet: true,
        owner: true,
      },
    });

    // Send notifications based on status change
    // await this.sendStatusNotification(appointment, status);

    return appointment;
  }

  async getAppointmentsByPet(petId: string) {
    return await prisma.petAppointment.findMany({
      where: {
        storeId: this.storeId,
        petId,
      },
      include: {
        veterinarian: true,
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async getUpcomingAppointments(daysAhead: number = 7) {
    const fromDate = new Date();
    const toDate = new Date();
    toDate.setDate(toDate.getDate() + daysAhead);

    return await prisma.petAppointment.findMany({
      where: {
        storeId: this.storeId,
        startDate: {
          gte: fromDate,
          lte: toDate,
        },
        status: { not: 'cancelled' },
      },
      include: {
        pet: true,
        owner: true,
        veterinarian: true,
      },
      orderBy: { startDate: 'asc' },
    });
  }

  async cancelAppointment(appointmentId: string, reason: string) {
    const appointment = await prisma.petAppointment.update({
      where: { id: appointmentId },
      data: {
        status: 'cancelled',
        cancellationReason: reason,
      },
      include: {
        pet: true,
        owner: true,
      },
    });

    // Send cancellation notification
    // await this.sendCancellationNotification(appointment, reason);

    return appointment;
  }
}