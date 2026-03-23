// @ts-nocheck
import type {
  WellnessService,
  Practitioner,
  WellnessAppointment,
  WellnessClient,
  WellnessPackage,
  AppointmentStatus,
  PractitionerSpecialty,
} from '../types';

export interface AvailableSlot {
  startTime: string;
  endTime: string;
  availablePractitioners: Practitioner[];
  price: number;
}

export interface HealthScreeningResult {
  canProceed: boolean;
  warnings: string[];
  recommendations: string[];
}

/**
 * WellnessBookingService - Manages appointment scheduling and client bookings
 * Handles intelligent practitioner matching, health screening, and booking workflows
 */
export class WellnessBookingService {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  /**
   * Find available time slots for a service
   */
  async findAvailableSlots(params: {
    serviceId: string;
    date: Date;
    duration: number;
    preferredPractitioners?: string[];
    requiredSpecialties?: PractitionerSpecialty[];
  }): Promise<AvailableSlot[]> {
    const service = await this.db.wellnessService.findUnique({
      where: { id: params.serviceId },
    });

    if (!service) throw new Error('Service not found');

    // Get practitioners with required specialties
    const practitioners = await this.db.practitioner.findMany({
      where: {
        tenantId: service.tenantId,
        specialties: {
          hasSome: params.requiredSpecialties || service.requiredSpecialties,
        },
        isActive: true,
      },
    });

    // Filter by preferred practitioners if specified
    const filteredPractitioners = params.preferredPractitioners
      ? practitioners.filter(p => params.preferredPractitioners!.includes(p.id))
      : practitioners;

    const slots: AvailableSlot[] = [];
    const workHours = { start: 9, end: 18 }; // 9 AM to 6 PM

    // Check each time slot
    for (let hour = workHours.start; hour < workHours.end; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

        // Check practitioner availability
        const availablePractitioners = filteredPractitioners.filter(practitioner => {
          const dayOfWeek = params.date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
          const availability = practitioner.availability[dayOfWeek as keyof typeof practitioner.availability];

          return availability.some((slot: string) => {
            const [start, end] = slot.split('-');
            return timeSlot >= start && this.addMinutes(timeSlot, params.duration) <= end;
          });
        });

        if (availablePractitioners.length > 0) {
          slots.push({
            startTime: timeSlot,
            endTime: this.addMinutes(timeSlot, params.duration),
            availablePractitioners,
            price: service.price,
          });
        }
      }
    }

    return slots;
  }

  /**
   * Book wellness appointment with health screening
   */
  async bookAppointment(data: {
    clientId: string;
    serviceId: string;
    preferredDateTime: Date;
    preferredPractitionerId?: string;
    preferences?: string;
    healthConcerns?: string;
  }): Promise<WellnessAppointment> {
    const client = await this.db.wellnessClient.findUnique({
      where: { id: data.clientId },
    });

    if (!client) throw new Error('Client not found');

    const service = await this.db.wellnessService.findUnique({
      where: { id: data.serviceId },
    });

    if (!service) throw new Error('Service not found');

    // Check for contraindications
    const contraindications = service.contraindications.filter(condition =>
      client.healthConditions.includes(condition)
    );

    if (contraindications.length > 0) {
      throw new Error(`Contraindications detected: ${contraindications.join(', ')}. Please consult with staff.`);
    }

    // Find available slot
    const availableSlots = await this.findAvailableSlots({
      serviceId: data.serviceId,
      date: data.preferredDateTime,
      duration: service.duration,
      preferredPractitioners: data.preferredPractitionerId ? [data.preferredPractitionerId] : undefined,
    });

    const matchingSlot = availableSlots.find(slot =>
      slot.startTime === this.formatTime(data.preferredDateTime)
    );

    if (!matchingSlot) {
      throw new Error('Selected time slot is not available');
    }

    // Assign practitioner (prefer requested, otherwise first available)
    const assignedPractitioner = data.preferredPractitionerId
      ? matchingSlot.availablePractitioners.find(p => p.id === data.preferredPractitionerId)
      : matchingSlot.availablePractitioners[0];

    if (!assignedPractitioner) {
      throw new Error('No practitioner available for selected time');
    }

    const appointment: WellnessAppointment = {
      id: `apt_${Date.now()}`,
      tenantId: service.tenantId,
      clientId: data.clientId,
      serviceId: data.serviceId,
      practitionerId: assignedPractitioner.id,
      date: data.preferredDateTime,
      startTime: this.formatTime(data.preferredDateTime),
      endTime: this.addMinutes(this.formatTime(data.preferredDateTime), service.duration),
      duration: service.duration,
      status: 'confirmed',
      notes: data.preferences,
      healthConcerns: data.healthConcerns,
      price: service.price,
      depositRequired: service.price > 100, // Require deposit for expensive services
      depositAmount: service.price > 100 ? service.price * 0.5 : undefined,
      reminderSent: false,
      followUpSent: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.db.wellnessAppointment.create({ data: appointment });

    // Send confirmation (would integrate with communication service)
    // await this.sendBookingConfirmation(appointment, client, service, assignedPractitioner);

    return appointment;
  }

  /**
   * Conduct health screening questionnaire
   */
  async conductHealthScreening(clientId: string, serviceId: string): Promise<HealthScreeningResult> {
    const [client, service] = await Promise.all([
      this.db.wellnessClient.findUnique({ where: { id: clientId } }),
      this.db.wellnessService.findUnique({ where: { id: serviceId } }),
    ]);

    if (!client || !service) {
      throw new Error('Client or service not found');
    }

    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Check contraindications
    const contraindications = service.contraindications.filter(condition =>
      client.healthConditions.includes(condition)
    );

    if (contraindications.length > 0) {
      return {
        canProceed: false,
        warnings: [`Cannot proceed due to contraindications: ${contraindications.join(', ')}`],
        recommendations: ['Please consult with our wellness coordinator before booking'],
      };
    }

    // Check prerequisites
    if (service.prerequisites.length > 0) {
      const missingPrerequisites = service.prerequisites.filter(prereq =>
        !this.hasCompletedPrerequisite(clientId, prereq)
      );

      if (missingPrerequisites.length > 0) {
        warnings.push(`Missing prerequisites: ${missingPrerequisites.join(', ')}`);
        recommendations.push('Please complete prerequisite services first');
      }
    }

    // Age-based recommendations
    if (client.dateOfBirth) {
      const age = this.calculateAge(client.dateOfBirth);

      if (age > 65 && service.type === 'massage') {
        recommendations.push('Consider gentler massage techniques for mature skin');
      }

      if (age < 18 && service.type === 'fitness_training') {
        recommendations.push('Parental consent required for clients under 18');
      }
    }

    return {
      canProceed: warnings.length === 0,
      warnings,
      recommendations,
    };
  }

  /**
   * Reschedule existing appointment
   */
  async rescheduleAppointment(
    appointmentId: string,
    newDateTime: Date
  ): Promise<WellnessAppointment> {
    const appointment = await this.db.wellnessAppointment.findUnique({
      where: { id: appointmentId },
      include: { service: true },
    });

    if (!appointment) throw new Error('Appointment not found');

    // Check availability for new time
    const availableSlots = await this.findAvailableSlots({
      serviceId: appointment.serviceId,
      date: newDateTime,
      duration: appointment.service.duration,
      preferredPractitioners: appointment.practitionerId ? [appointment.practitionerId] : undefined,
    });

    const newTimeSlot = this.formatTime(newDateTime);
    const matchingSlot = availableSlots.find(slot => slot.startTime === newTimeSlot);

    if (!matchingSlot) {
      throw new Error('New time slot is not available');
    }

    // Update appointment
    const updatedAppointment = await this.db.wellnessAppointment.update({
      where: { id: appointmentId },
      data: {
        date: newDateTime,
        startTime: newTimeSlot,
        endTime: this.addMinutes(newTimeSlot, appointment.service.duration),
        status: 'rescheduled',
        updatedAt: new Date(),
      },
    });

    return updatedAppointment;
  }

  /**
   * Cancel appointment
   */
  async cancelAppointment(
    appointmentId: string,
    reason?: string
  ): Promise<WellnessAppointment> {
    const appointment = await this.db.wellnessAppointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) throw new Error('Appointment not found');

    const updatedAppointment = await this.db.wellnessAppointment.update({
      where: { id: appointmentId },
      data: {
        status: 'cancelled',
        notes: reason ? `${appointment.notes || ''} [Cancellation reason: ${reason}]` : appointment.notes,
        updatedAt: new Date(),
      },
    });

    // Process refund if applicable (would integrate with payment service)
    // if (appointment.depositAmount && this.isRefundEligible(appointment)) {
    //   await this.processRefund(appointment);
    // }

    return updatedAppointment;
  }

  // Helper methods
  private formatTime(date: Date): string {
    return date.toTimeString().slice(0, 5);
  }

  private addMinutes(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  private async hasCompletedPrerequisite(clientId: string, prerequisite: string): Promise<boolean> {
    // In real implementation, this would check client's appointment history
    // For now, returning true to allow booking
    return true;
  }
}