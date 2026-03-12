/**
 * Specialized Service Management
 * Manages specialized professional services and appointments
 */

import { z } from 'zod';

export interface ServiceAppointment {
  id: string;
  customerId: string;
  serviceType: string;
  providerId: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  scheduledDate: Date;
  duration: number; // minutes
  amount: number;
  notes?: string;
}

export interface ServiceProvider {
  id: string;
  name: string;
  specialty: string;
  availability: boolean;
  rating: number;
}

export interface SpecializedConfig {
  enableOnlineBooking?: boolean;
  autoConfirm?: boolean;
  enableReminders?: boolean;
}

const ServiceAppointmentSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  serviceType: z.string(),
  providerId: z.string(),
  status: z.enum(['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled']),
  scheduledDate: z.date(),
  duration: z.number().min(15),
  amount: z.number().positive(),
  notes: z.string().optional(),
});

export class SpecializedServiceManagement {
  private appointments: Map<string, ServiceAppointment>;
  private providers: Map<string, ServiceProvider>;
  private config: SpecializedConfig;

  constructor(config: SpecializedConfig = {}) {
    this.config = {
      enableOnlineBooking: true,
      autoConfirm: false,
      enableReminders: true,
      ...config,
    };
    this.appointments = new Map();
    this.providers = new Map();
  }

  async initialize(): Promise<void> {
    console.log('[SPECIALIZED] Initializing service...');
    this.initializeSampleData();
    console.log('[SPECIALIZED] Service initialized');
  }

  private initializeSampleData(): void {
    const sampleProviders: ServiceProvider[] = [
      { id: 'sp1', name: 'Dr. Sarah Johnson', specialty: 'Consulting', availability: true, rating: 4.9 },
      { id: 'sp2', name: 'Michael Chen', specialty: 'Legal Services', availability: true, rating: 4.8 },
      { id: 'sp3', name: 'Emma Williams', specialty: 'Financial Planning', availability: false, rating: 4.7 },
    ];

    const now = new Date();
    const sampleAppointments: ServiceAppointment[] = [
      {
        id: 'apt1',
        customerId: 'cust1',
        serviceType: 'Business Consulting',
        providerId: 'sp1',
        status: 'confirmed',
        scheduledDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        duration: 60,
        amount: 250,
        notes: 'Initial consultation',
      },
      {
        id: 'apt2',
        customerId: 'cust2',
        serviceType: 'Contract Review',
        providerId: 'sp2',
        status: 'scheduled',
        scheduledDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        duration: 90,
        amount: 450,
      },
    ];

    sampleProviders.forEach(p => this.providers.set(p.id, p));
    sampleAppointments.forEach(a => this.appointments.set(a.id, a));
  }

  createAppointment(appointmentData: Partial<ServiceAppointment>): ServiceAppointment {
    const appointment: ServiceAppointment = {
      ...appointmentData,
      id: appointmentData.id || `apt_${Date.now()}`,
      status: appointmentData.status || (this.config.autoConfirm ? 'confirmed' : 'scheduled'),
    } as ServiceAppointment;

    ServiceAppointmentSchema.parse(appointment);
    this.appointments.set(appointment.id, appointment);
    return appointment;
  }

  updateStatus(appointmentId: string, status: ServiceAppointment['status']): boolean {
    const appointment = this.appointments.get(appointmentId);
    if (!appointment) return false;

    appointment.status = status;
    return true;
  }

  getUpcomingAppointments(daysAhead: number = 7): ServiceAppointment[] {
    const cutoff = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
    return Array.from(this.appointments.values()).filter(
      a => a.scheduledDate <= cutoff && 
           a.scheduledDate >= new Date() && 
           a.status !== 'cancelled'
    );
  }

  getAvailableProviders(specialty?: string): ServiceProvider[] {
    return Array.from(this.providers.values()).filter(
      p => p.availability && (!specialty || p.specialty === specialty)
    );
  }

  getStatistics(): {
    totalAppointments: number;
    upcomingAppointments: number;
    completionRate: number;
    averageRating: number;
    totalRevenue: number;
  } {
    const allAppts = Array.from(this.appointments.values());
    const completed = allAppts.filter(a => a.status === 'completed');
    const upcoming = this.getUpcomingAppointments();
    const totalRevenue = completed.reduce((sum, a) => sum + a.amount, 0);
    const avgRating = Array.from(this.providers.values()).reduce((sum, p) => sum + p.rating, 0) / this.providers.size;

    return {
      totalAppointments: allAppts.length,
      upcomingAppointments: upcoming.length,
      completionRate: allAppts.length > 0 ? (completed.length / allAppts.length) * 100 : 0,
      averageRating: Math.round(avgRating * 10) / 10,
      totalRevenue: Math.round(totalRevenue),
    };
  }
}
