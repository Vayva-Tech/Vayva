/**
 * @vayva/industry-beauty - Beauty Industry Engine
 * 
 * Complete beauty industry solution for salons, spas, and beauty service providers including:
 * - Appointment Scheduling & Booking
 * - Staff Management & Commission Tracking
 * - Service Menu Management
 * - Client Profiles & Preferences
 * - Inventory & Product Sales
 * - Membership & Loyalty Programs
 */

import { z } from 'zod';
import type { Business, User } from '@vayva/db';

// Schema Definitions
export const BeautyServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  duration: z.number(), // minutes
  price: z.number(),
  category: z.enum(['hair', 'nails', 'skin', 'makeup', 'massage', 'other']),
  staffRequired: z.number().default(1),
  resourcesRequired: z.array(z.string()).optional(),
  commissionRate: z.number().default(0.1),
  active: z.boolean().default(true),
});

export const BeautyStaffSchema = z.object({
  id: z.string(),
  userId: z.string(),
  specialty: z.array(z.string()),
  commissionRate: z.number(),
  maxDailyAppointments: z.number().default(8),
  workingDays: z.array(z.number()), // 0-6 (Sun-Sat)
  workingHours: z.object({
    start: z.string(), // HH:mm format
    end: z.string(), // HH:mm format
  }),
});

export const BeautyAppointmentSchema = z.object({
  id: z.string(),
  businessId: z.string(),
  clientId: z.string(),
  staffId: z.string(),
  serviceIds: z.array(z.string()),
  startTime: z.date(),
  endTime: z.date(),
  status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']),
  totalAmount: z.number(),
  tipAmount: z.number().default(0),
  notes: z.string().optional(),
  remindersSent: z.array(z.object({
    type: z.enum(['sms', 'email', 'push']),
    sentAt: z.date(),
    status: z.enum(['delivered', 'failed'])),
  }).default([]),
});

export const BeautyClientProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  businessId: z.string(),
  preferences: z.object({
    preferredStaff: z.array(z.string()).optional(),
    preferredServices: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
    skinType: z.string().optional(),
    hairType: z.string().optional(),
  }),
  visitHistory: z.array(z.object({
    appointmentId: z.string(),
    date: z.date(),
    servicesReceived: z.array(z.string()),
    totalSpent: z.number(),
  })),
  loyaltyPoints: z.number().default(0),
  membershipTier: z.enum(['standard', 'silver', 'gold', 'platinum']).default('standard'),
});

// Type exports
export type BeautyService = z.infer<typeof BeautyServiceSchema>;
export type BeautyStaff = z.infer<typeof BeautyStaffSchema>;
export type BeautyAppointment = z.infer<typeof BeautyAppointmentSchema>;
export type BeautyClientProfile = z.infer<typeof BeautyClientProfileSchema>;

// Main Beauty Engine Class
export class BeautyEngine {
  private businessId: string;
  private config: BeautyEngineConfig;

  constructor(businessId: string, config: BeautyEngineConfig) {
    this.businessId = businessId;
    this.config = config;
  }

  /**
   * Get available time slots for a given staff member and date
   */
  async getAvailableSlots(staffId: string, date: Date): Promise<Date[]> {
    // Implementation needed
    return [];
  }

  /**
   * Book an appointment
   */
  async bookAppointment(appointmentData: Partial<BeautyAppointment>): Promise<BeautyAppointment> {
    // Implementation needed
    throw new Error('Not implemented');
  }

  /**
   * Calculate staff commission for a given period
   */
  async calculateCommission(staffId: string, startDate: Date, endDate: Date): Promise<number> {
    // Implementation needed
    return 0;
  }

  /**
   * Get client recommendations based on history
   */
  async getClientRecommendations(clientId: string): Promise<string[]> {
    // Implementation needed
    return [];
  }

  /**
   * Update client loyalty points
   */
  async updateLoyaltyPoints(clientId: string, points: number): Promise<void> {
    // Implementation needed
  }
}

// Configuration
export interface BeautyEngineConfig {
  enableOnlineBooking: boolean;
  enableMemberships: boolean;
  enableRetailPos: boolean;
  enableInventoryTracking: boolean;
  defaultCancellationPolicy: number; // hours before appointment
  autoReminderEnabled: boolean;
  reminderTimes: number[]; // hours before appointment
}

// Default configuration
export function createDefaultBeautyConfig(): BeautyEngineConfig {
  return {
    enableOnlineBooking: true,
    enableMemberships: true,
    enableRetailPos: true,
    enableInventoryTracking: true,
    defaultCancellationPolicy: 24,
    autoReminderEnabled: true,
    reminderTimes: [24, 2], // 24 hours and 2 hours before
  };
}

// Factory function
export function createBeautyEngine(
  businessId: string,
  config?: Partial<BeautyEngineConfig>
): BeautyEngine {
  const finalConfig = {
    ...createDefaultBeautyConfig(),
    ...config,
  };
  return new BeautyEngine(businessId, finalConfig);
}

// Feature flags
export type BeautyFeatureId =
  | 'appointments'
  | 'staff_management'
  | 'client_profiles'
  | 'service_menu'
  | 'loyalty_program'
  | 'retail_pos'
  | 'inventory'
  | 'memberships'
  | 'online_booking'
  | 'commission_tracking';

// Status type
export type BeautyEngineStatus = 'initializing' | 'ready' | 'error';
