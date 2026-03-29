import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class WellnessService {
  constructor(private readonly db = prisma) {}

  async findAppointments(storeId: string, filters: any) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = { storeId };

    if (filters.status) where.status = filters.status;
    if (filters.clientId) where.clientId = filters.clientId;
    if (filters.instructorId) where.instructorId = filters.instructorId;
    if (filters.serviceType) {
      where.serviceType = { contains: filters.serviceType, mode: 'insensitive' };
    }
    if (filters.location) {
      where.location = { contains: filters.location, mode: 'insensitive' };
    }
    if (filters.dateFrom || filters.dateTo) {
      where.startTime = {};
      if (filters.dateFrom) where.startTime.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.startTime.lte = new Date(filters.dateTo);
    }

    const [appointments, total] = await Promise.all([
      this.db.wellnessAppointment.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          instructor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              specialty: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { startTime: 'asc' },
      }),
      this.db.wellnessAppointment.count({ where }),
    ]);

    const appointmentsWithMetrics = appointments.map((appointment) => {
      const durationMinutes = Math.round(
        (appointment.endTime.getTime() - appointment.startTime.getTime()) / (1000 * 60),
      );
      const timeUntilStart = Math.ceil((appointment.startTime.getTime() - Date.now()) / (1000 * 60));
      const isUpcoming = timeUntilStart > 0;
      const isInPast = appointment.endTime < new Date();

      return {
        ...appointment,
        clientPreferences: JSON.parse(appointment.clientPreferences || '{}'),
        reminders: JSON.parse(appointment.reminders || '[]'),
        clientName: `${appointment.client.firstName} ${appointment.client.lastName}`,
        instructorName: `${appointment.instructor.firstName} ${appointment.instructor.lastName}`,
        durationMinutes,
        timeUntilStart,
        isUpcoming,
        isInPast,
        isToday: appointment.startTime.toDateString() === new Date().toDateString(),
      };
    });

    return {
      data: appointmentsWithMetrics,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createAppointment(storeId: string, data: any) {
    const {
      clientId,
      instructorId,
      serviceType,
      startTime,
      endTime,
      location,
      duration,
      price,
      notes,
      clientPreferences,
      reminders,
    } = data;

    // Verify client exists
    const client = await this.db.user.findFirst({
      where: { id: clientId, storeId },
    });

    if (!client) {
      throw new Error('Client not found');
    }

    // Verify instructor exists
    const instructor = await this.db.wellnessInstructor.findFirst({
      where: { id: instructorId, storeId },
    });

    if (!instructor) {
      throw new Error('Instructor not found');
    }

    // Check for scheduling conflicts
    const conflictingAppointments = await this.db.wellnessAppointment.findMany({
      where: {
        instructorId,
        status: { not: 'cancelled' },
        OR: [
          {
            startTime: { lte: new Date(startTime) },
            endTime: { gt: new Date(startTime) },
          },
          {
            startTime: { lt: new Date(endTime) },
            endTime: { gte: new Date(endTime) },
          },
          {
            startTime: { gte: new Date(startTime) },
            endTime: { lte: new Date(endTime) },
          },
        ],
      },
    });

    if (conflictingAppointments.length > 0) {
      throw new Error('Instructor is unavailable at this time');
    }

    // Validate time constraints
    const startDateTime = new Date(startTime);
    const endDateTime = new Date(endTime);

    if (startDateTime >= endDateTime) {
      throw new Error('End time must be after start time');
    }

    const calculatedDuration = Math.round((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60));
    if (Math.abs(calculatedDuration - duration) > 5) {
      throw new Error('Duration mismatch between start/end times and specified duration');
    }

    const appointment = await this.db.wellnessAppointment.create({
      data: {
        storeId,
        clientId,
        instructorId,
        serviceType,
        startTime: startDateTime,
        endTime: endDateTime,
        location,
        duration,
        price,
        notes: notes || null,
        clientPreferences: JSON.stringify(clientPreferences || {}),
        reminders: JSON.stringify(reminders || []),
        status: 'scheduled',
      },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        instructor: {
          select: {
            firstName: true,
            lastName: true,
            specialty: true,
          },
        },
      },
    });

    logger.info(`[Wellness] Created appointment ${appointment.id}`);
    return appointment;
  }

  async updateAppointmentStatus(appointmentId: string, storeId: string, status: string) {
    const appointment = await this.db.wellnessAppointment.findFirst({
      where: { id: appointmentId, storeId },
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    const updated = await this.db.wellnessAppointment.update({
      where: { id: appointmentId },
      data: { status },
    });

    logger.info(`[Wellness] Updated appointment ${appointmentId} status to ${status}`);
    return updated;
  }
}
