import { z } from 'zod';
import type { 
  Appointment, 
  AppointmentStatus, 
  AppointmentType, 
  Doctor, 
  Patient,
  HealthcareAnalytics 
} from '../types';

// ─── Enhanced Scheduling Types ────────────────────────────────────────────────

export const SchedulingPriority = z.enum([
  'routine',
  'urgent',
  'emergency',
  'follow_up'
]);
export type SchedulingPriority = z.infer<typeof SchedulingPriority>;

export interface SchedulingConstraints {
  minGapBetweenAppointments?: number; // minutes
  maxDailyAppointmentsPerDoctor?: number;
  preferredTimeWindows?: Array<{ start: string; end: string }>; // HH:MM format
  requiredEquipment?: string[];
  bufferTime?: number; // minutes between appointments
}

export interface SchedulingPreferences {
  preferredDoctors?: string[];
  preferredDays?: number[]; // 0-6 (Sunday-Saturday)
  preferredTimeRanges?: Array<{ start: string; end: string }>;
  avoidDates?: Date[];
}

export interface ConflictResolutionStrategy {
  type: 'reschedule' | 'suggest_alternative' | 'waitlist' | 'escalate';
  priorityPatientIds?: string[]; // Patients who get priority in conflicts
  maxRescheduleAttempts?: number;
}

export interface SchedulingResult {
  success: boolean;
  appointmentId?: string;
  suggestedAlternatives?: TimeSlot[];
  conflictsDetected?: SchedulingConflict[];
  waitlistPosition?: number;
  estimatedWaitTime?: number; // minutes
  message?: string;
}

export interface SchedulingConflict {
  type: 'doctor_unavailable' | 'patient_overlap' | 'equipment_conflict' | 'resource_limit';
  description: string;
  conflictingAppointmentId?: string;
  severity: 'low' | 'medium' | 'high';
}

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
  doctorId: string;
  doctorName: string;
  specialty: string;
  duration: number;
  fee: number;
  type: AppointmentType;
}

export interface WaitlistEntry {
  id: string;
  patientId: string;
  doctorId: string;
  specialty: string;
  priority: SchedulingPriority;
  requestedDate: Date;
  createdAt: Date;
  estimatedWaitTime: number; // minutes
  status: 'pending' | 'scheduled' | 'cancelled';
}

export interface ResourceAllocation {
  doctorId: string;
  date: Date;
  allocatedTimeSlots: number;
  usedTimeSlots: number;
  utilizationPercentage: number;
}

// ─── Enhanced Patient Scheduling Service ──────────────────────────────────────

export class PatientSchedulingService {
  private db: any;
  private readonly DEFAULT_APPOINTMENT_DURATION = 30; // minutes
  private readonly DEFAULT_BUFFER_TIME = 15; // minutes
  private readonly MAX_DAILY_APPOINTMENTS = 16; // 8am-6pm with 30min slots

  constructor(db: any) {
    this.db = db;
  }

  /**
   * Smart appointment scheduling with conflict detection
   */
  async scheduleAppointment(data: {
    patientId: string;
    doctorId: string;
    type: AppointmentType;
    requestedDate: Date;
    duration?: number;
    priority?: SchedulingPriority;
    constraints?: SchedulingConstraints;
    preferences?: SchedulingPreferences;
    conflictStrategy?: ConflictResolutionStrategy;
    notes?: string;
  }): Promise<SchedulingResult> {
    const duration = data.duration || this.DEFAULT_APPOINTMENT_DURATION;
    const priority = data.priority || 'routine';
    
    // Validate patient and doctor exist
    const [patient, doctor] = await Promise.all([
      this.getPatient(data.patientId),
      this.getDoctor(data.doctorId)
    ]);

    if (!patient) {
      return {
        success: false,
        message: `Patient ${data.patientId} not found`
      };
    }

    if (!doctor) {
      return {
        success: false,
        message: `Doctor ${data.doctorId} not found`
      };
    }

    // Check for existing appointments that conflict
    const conflicts = await this.detectConflicts({
      patientId: data.patientId,
      doctorId: data.doctorId,
      requestedDate: data.requestedDate,
      duration,
      type: data.type
    });

    if (conflicts.length > 0) {
      return await this.handleConflicts(
        data,
        conflicts,
        data.conflictStrategy || { type: 'suggest_alternative' }
      );
    }

    // Find available time slot
    const availableSlot = await this.findAvailableSlot({
      doctorId: data.doctorId,
      requestedDate: data.requestedDate,
      duration,
      preferences: data.preferences,
      constraints: data.constraints
    });

    if (!availableSlot) {
      // Add to waitlist
      const waitlistEntry = await this.addToWaitlist({
        patientId: data.patientId,
        doctorId: data.doctorId,
        specialty: doctor.specialty,
        priority,
        requestedDate: data.requestedDate
      });

      return {
        success: false,
        message: 'No available slots found. Added to waitlist.',
        waitlistPosition: waitlistEntry.position,
        estimatedWaitTime: waitlistEntry.estimatedWaitTime
      };
    }

    // Create the appointment
    const appointment = await this.createAppointment({
      patientId: data.patientId,
      doctorId: data.doctorId,
      type: data.type,
      scheduledAt: availableSlot.start,
      duration,
      specialty: doctor.specialty,
      notes: data.notes,
      fee: this.calculateFee(doctor, data.type)
    });

    // Send confirmation notifications
    await this.sendSchedulingNotifications(appointment, patient, doctor);

    return {
      success: true,
      appointmentId: appointment.id,
      message: 'Appointment scheduled successfully'
    };
  }

  /**
   * Get doctor's availability calendar
   */
  async getDoctorAvailability(
    doctorId: string,
    startDate: Date,
    endDate: Date,
    duration: number = this.DEFAULT_APPOINTMENT_DURATION
  ): Promise<TimeSlot[]> {
    const doctor = await this.getDoctor(doctorId);
    if (!doctor) {
      return [];
    }

    const slots: TimeSlot[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dailySlots = await this.generateDailySlots(doctorId, currentDate, duration);
      slots.push(...dailySlots);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Filter out booked slots
    const bookedAppointments = await this.getBookedAppointments(doctorId, startDate, endDate);
    const bookedSlotTimes = new Set(
      bookedAppointments.map((appt: any) => appt.scheduledAt.toISOString())
    );

    return slots.map(slot => ({
      ...slot,
      available: !bookedSlotTimes.has(slot.start.toISOString())
    }));
  }

  /**
   * Reschedule an existing appointment
   */
  async rescheduleAppointment(
    appointmentId: string,
    newDateTime: Date,
    options?: {
      notifyParties?: boolean;
      reason?: string;
    }
  ): Promise<SchedulingResult> {
    const appointment = await this.db.appointment.findUnique({
      where: { id: appointmentId },
      include: { patient: true, doctor: true }
    });

    if (!appointment) {
      return {
        success: false,
        message: `Appointment ${appointmentId} not found`
      };
    }

    // Check if new time slot is available
    const conflicts = await this.detectConflicts({
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      requestedDate: newDateTime,
      duration: appointment.duration,
      type: appointment.type as AppointmentType,
      excludeAppointmentId: appointmentId
    });

    if (conflicts.length > 0) {
      return {
        success: false,
        message: 'Selected time slot is not available',
        conflictsDetected: conflicts
      };
    }

    // Update appointment
    const updatedAppointment = await this.db.appointment.update({
      where: { id: appointmentId },
      data: {
        scheduledAt: newDateTime,
        updatedAt: new Date(),
        notes: options?.reason ? `${appointment.notes || ''} [Rescheduled: ${options.reason}]` : appointment.notes
      }
    });

    // Send reschedule notifications
    if (options?.notifyParties !== false) {
      await this.sendRescheduleNotifications(updatedAppointment);
    }

    return {
      success: true,
      appointmentId: updatedAppointment.id,
      message: 'Appointment rescheduled successfully'
    };
  }

  /**
   * Manage waitlist operations
   */
  async getWaitlist(
    doctorId?: string,
    specialty?: string
  ): Promise<Array<WaitlistEntry & { patientName: string }>> {
    const where: Record<string, unknown> = {
      status: 'pending'
    };

    if (doctorId) where.doctorId = doctorId;
    if (specialty) where.specialty = specialty;

    const entries = await this.db.waitlistEntry.findMany({
      where,
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: [
        { priority: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    return entries.map((entry: any, index: number) => ({
      ...entry,
      position: index + 1,
      patientName: `${entry.patient.firstName} ${entry.patient.lastName}`
    }));
  }

  /**
   * Get scheduling analytics and utilization reports
   */
  async getSchedulingAnalytics(
    tenantId: string,
    dateRange: { from: Date; to: Date }
  ): Promise<{
    utilizationRates: ResourceAllocation[];
    waitlistStats: {
      totalEntries: number;
      averageWaitTime: number;
      byPriority: Record<SchedulingPriority, number>;
    };
    conflictStats: {
      totalConflicts: number;
      resolvedAutomatically: number;
      escalated: number;
    };
    appointmentEfficiency: {
      onTimeRate: number;
      noShowRate: number;
      cancellationRate: number;
    };
  }> {
    // Get doctors for this tenant
    const doctors = await this.db.doctor.findMany({
      where: { tenantId }
    });

    // Calculate utilization rates
    const utilizationRates = await Promise.all(
      doctors.map(async (doctor: Doctor) => {
        const totalSlots = await this.calculateTotalAvailableSlots(
          doctor.id,
          dateRange.from,
          dateRange.to
        );
        
        const usedSlots = await this.calculateUsedSlots(
          doctor.id,
          dateRange.from,
          dateRange.to
        );

        return {
          doctorId: doctor.id,
          date: dateRange.from,
          allocatedTimeSlots: totalSlots,
          usedTimeSlots: usedSlots,
          utilizationPercentage: totalSlots > 0 ? (usedSlots / totalSlots) * 100 : 0
        };
      })
    );

    // Waitlist statistics
    const waitlistEntries = await this.db.waitlistEntry.findMany({
      where: {
        createdAt: {
          gte: dateRange.from,
          lte: dateRange.to
        }
      }
    });

    const waitlistStats = {
      totalEntries: waitlistEntries.length,
      averageWaitTime: waitlistEntries.reduce((sum: number, entry: any) => 
        sum + (entry.estimatedWaitTime || 0), 0) / Math.max(waitlistEntries.length, 1),
      byPriority: waitlistEntries.reduce((acc: Record<SchedulingPriority, number>, entry: any) => {
        const priority = entry.priority as SchedulingPriority;
        acc[priority] = (acc[priority] || 0) + 1;
        return acc;
      }, {} as Record<SchedulingPriority, number>)
    };

    // Conflict statistics would come from a conflicts table in production

    return {
      utilizationRates,
      waitlistStats,
      conflictStats: {
        totalConflicts: 0,
        resolvedAutomatically: 0,
        escalated: 0
      },
      appointmentEfficiency: {
        onTimeRate: 0,
        noShowRate: 0,
        cancellationRate: 0
      }
    };
  }

  // ─── Private Helper Methods ─────────────────────────────────────────────────

  private async getPatient(patientId: string): Promise<Patient | null> {
    return await this.db.patient.findUnique({
      where: { id: patientId }
    });
  }

  private async getDoctor(doctorId: string): Promise<Doctor | null> {
    return await this.db.doctor.findUnique({
      where: { id: doctorId }
    });
  }

  private async detectConflicts(params: {
    patientId: string;
    doctorId: string;
    requestedDate: Date;
    duration: number;
    type: AppointmentType;
    excludeAppointmentId?: string;
  }): Promise<SchedulingConflict[]> {
    const conflicts: SchedulingConflict[] = [];

    // Check patient overlap
    const patientConflicts = await this.db.appointment.findMany({
      where: {
        patientId: params.patientId,
        scheduledAt: {
          gte: new Date(params.requestedDate.getTime() - params.duration * 60 * 1000),
          lte: new Date(params.requestedDate.getTime() + params.duration * 60 * 1000)
        },
        ...(params.excludeAppointmentId && { id: { not: params.excludeAppointmentId } })
      }
    });

    if (patientConflicts.length > 0) {
      conflicts.push({
        type: 'patient_overlap',
        description: 'Patient already has an appointment during this time',
        severity: 'high'
      });
    }

    // Check doctor availability
    const doctorConflicts = await this.db.appointment.findMany({
      where: {
        doctorId: params.doctorId,
        scheduledAt: {
          gte: new Date(params.requestedDate.getTime() - params.duration * 60 * 1000),
          lte: new Date(params.requestedDate.getTime() + params.duration * 60 * 1000)
        },
        ...(params.excludeAppointmentId && { id: { not: params.excludeAppointmentId } })
      }
    });

    if (doctorConflicts.length > 0) {
      conflicts.push({
        type: 'doctor_unavailable',
        description: 'Doctor is not available at the requested time',
        conflictingAppointmentId: doctorConflicts[0].id,
        severity: 'high'
      });
    }

    return conflicts;
  }

  private async handleConflicts(
    requestData: any,
    conflicts: SchedulingConflict[],
    strategy: ConflictResolutionStrategy
  ): Promise<SchedulingResult> {
    switch (strategy.type) {
      case 'suggest_alternative':
        const alternatives = await this.findAlternativeSlots(
          requestData.doctorId,
          requestData.requestedDate,
          requestData.duration || this.DEFAULT_APPOINTMENT_DURATION
        );
        
        return {
          success: false,
          message: 'Time slot not available. Here are alternative options:',
          suggestedAlternatives: alternatives,
          conflictsDetected: conflicts
        };

      case 'waitlist':
        const waitlistEntry = await this.addToWaitlist({
          patientId: requestData.patientId,
          doctorId: requestData.doctorId,
          specialty: (await this.getDoctor(requestData.doctorId))?.specialty || '',
          priority: requestData.priority || 'routine',
          requestedDate: requestData.requestedDate
        });

        return {
          success: false,
          message: 'Added to waitlist due to scheduling conflicts',
          waitlistPosition: waitlistEntry.position,
          estimatedWaitTime: waitlistEntry.estimatedWaitTime,
          conflictsDetected: conflicts
        };

      default:
        return {
          success: false,
          message: 'Unable to schedule due to conflicts',
          conflictsDetected: conflicts
        };
    }
  }

  private async findAvailableSlot(params: {
    doctorId: string;
    requestedDate: Date;
    duration: number;
    preferences?: SchedulingPreferences;
    constraints?: SchedulingConstraints;
  }): Promise<TimeSlot | null> {
    const dailySlots = await this.generateDailySlots(
      params.doctorId,
      params.requestedDate,
      params.duration
    );

    const bookedAppointments = await this.getBookedAppointments(
      params.doctorId,
      params.requestedDate,
      params.requestedDate
    );

    const bookedTimes = new Set(
      bookedAppointments.map((appt: any) => appt.scheduledAt.toISOString())
    );

    // Filter available slots
    const availableSlots = dailySlots.filter(
      slot => !bookedTimes.has(slot.start.toISOString())
    );

    // Apply preferences if provided
    if (params.preferences?.preferredTimeRanges) {
      const preferredSlots = availableSlots.filter(slot => 
        this.isInPreferredTimeRange(slot.start, params.preferences!.preferredTimeRanges!)
      );
      if (preferredSlots.length > 0) {
        return preferredSlots[0];
      }
    }

    return availableSlots.length > 0 ? availableSlots[0] : null;
  }

  private async generateDailySlots(
    doctorId: string,
    date: Date,
    duration: number
  ): Promise<TimeSlot[]> {
    const doctor = await this.getDoctor(doctorId);
    if (!doctor) return [];

    const slots: TimeSlot[] = [];
    const workStart = new Date(date);
    workStart.setHours(8, 0, 0, 0);

    const workEnd = new Date(date);
    workEnd.setHours(18, 0, 0, 0);

    const current = new Date(workStart);

    while (current < workEnd) {
      const slotEnd = new Date(current.getTime() + duration * 60 * 1000);
      if (slotEnd > workEnd) break;

      slots.push({
        start: new Date(current),
        end: slotEnd,
        available: true,
        doctorId,
        doctorName: doctor.name,
        specialty: doctor.specialty,
        duration,
        fee: this.calculateFee(doctor, 'in_person'),
        type: 'in_person'
      });

      current.setTime(current.getTime() + duration * 60 * 1000);
    }

    return slots;
  }

  private async getBookedAppointments(
    doctorId: string,
    startDate: Date,
    endDate: Date
  ) {
    return await this.db.appointment.findMany({
      where: {
        doctorId,
        scheduledAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });
  }

  private async createAppointment(data: any): Promise<Appointment> {
    return await this.db.appointment.create({
      data: {
        ...data,
        status: 'scheduled',
        insuranceCovered: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  private calculateFee(doctor: Doctor, type: AppointmentType): number {
    switch (type) {
      case 'telemedicine':
        return doctor.telemedicineFee || doctor.consultationFee * 0.8;
      case 'home_visit':
        return doctor.consultationFee * 1.5;
      case 'emergency':
        return doctor.consultationFee * 2;
      default:
        return doctor.consultationFee;
    }
  }

  private async addToWaitlist(data: {
    patientId: string;
    doctorId: string;
    specialty: string;
    priority: SchedulingPriority;
    requestedDate: Date;
  }): Promise<{ position: number; estimatedWaitTime: number }> {
    // Get current waitlist length for this doctor/specialty
    const existingEntries = await this.db.waitlistEntry.count({
      where: {
        doctorId: data.doctorId,
        status: 'pending'
      }
    });

    const entry = await this.db.waitlistEntry.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        specialty: data.specialty,
        priority: data.priority,
        requestedDate: data.requestedDate,
        estimatedWaitTime: (existingEntries + 1) * 45, // Rough estimate
        status: 'pending',
        createdAt: new Date()
      }
    });

    return {
      position: existingEntries + 1,
      estimatedWaitTime: entry.estimatedWaitTime
    };
  }

  private async findAlternativeSlots(
    doctorId: string,
    originalDate: Date,
    duration: number
  ): Promise<TimeSlot[]> {
    const alternatives: TimeSlot[] = [];
    const doctor = await this.getDoctor(doctorId);
    if (!doctor) return [];

    // Check next 7 days for alternatives
    for (let i = 1; i <= 7; i++) {
      const checkDate = new Date(originalDate);
      checkDate.setDate(checkDate.getDate() + i);
      
      const dailySlots = await this.generateDailySlots(doctorId, checkDate, duration);
      const bookedAppointments = await this.getBookedAppointments(doctorId, checkDate, checkDate);
      const bookedTimes = new Set(bookedAppointments.map((appt: any) => appt.scheduledAt.toISOString()));

      const availableSlots = dailySlots.filter(
        slot => !bookedTimes.has(slot.start.toISOString())
      );

      alternatives.push(...availableSlots.slice(0, 3)); // Max 3 alternatives per day
      
      if (alternatives.length >= 5) break; // Limit total alternatives
    }

    return alternatives.slice(0, 5);
  }

  private isInPreferredTimeRange(time: Date, ranges: Array<{ start: string; end: string }>): boolean {
    const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
    
    return ranges.some(range => {
      return timeStr >= range.start && timeStr <= range.end;
    });
  }

  private async sendSchedulingNotifications(
    appointment: Appointment,
    patient: Patient,
    doctor: Doctor
  ): Promise<void> {
    // In production, this would send SMS/email notifications
    console.log(`Sending scheduling confirmation to ${patient.firstName} for appointment with Dr. ${doctor.name}`);
  }

  private async sendRescheduleNotifications(appointment: Appointment): Promise<void> {
    console.log(`Sending reschedule notification for appointment ${appointment.id}`);
  }

  private async calculateTotalAvailableSlots(
    doctorId: string,
    fromDate: Date,
    toDate: Date
  ): Promise<number> {
    const days = Math.ceil((toDate.getTime() - fromDate.getTime()) / (24 * 60 * 60 * 1000));
    return days * this.MAX_DAILY_APPOINTMENTS;
  }

  private async calculateUsedSlots(
    doctorId: string,
    fromDate: Date,
    toDate: Date
  ): Promise<number> {
    return await this.db.appointment.count({
      where: {
        doctorId,
        scheduledAt: {
          gte: fromDate,
          lte: toDate
        }
      }
    });
  }
}

export const patientScheduling = new PatientSchedulingService({} as any);