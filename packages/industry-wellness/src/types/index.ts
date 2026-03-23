// @ts-nocheck
import { z } from 'zod';

export const WellnessIndustrySlug = 'wellness' as const;
export type WellnessIndustrySlug = typeof WellnessIndustrySlug;

// Service Categories
export const WellnessServiceType = z.enum([
  'massage', 'facial', 'body_treatment', 'hair_styling', 'nail_care',
  'fitness_training', 'yoga', 'meditation', 'nutrition_consulting',
  'spa_day', 'detox_program', 'weight_loss', 'stress_management'
]);
export type WellnessServiceType = z.infer<typeof WellnessServiceType>;

// Appointment Status
export const AppointmentStatus = z.enum([
  'requested', 'confirmed', 'rescheduled', 'completed', 'cancelled', 'no_show'
]);
export type AppointmentStatus = z.infer<typeof AppointmentStatus>;

// Practitioner Specializations
export const PractitionerSpecialty = z.enum([
  'massage_therapist', 'esthetician', 'cosmetologist', 'fitness_trainer',
  'yoga_instructor', 'nutritionist', 'wellness_coach', 'acupuncturist',
  'chiropractor', 'physical_therapist'
]);
export type PractitionerSpecialty = z.infer<typeof PractitionerSpecialty>;

// Client Wellness Goals
export const WellnessGoal = z.enum([
  'stress_reduction', 'weight_loss', 'muscle_gain', 'improved_sleep',
  'better_skin', 'increased_energy', 'pain_management', 'overall_wellness'
]);
export type WellnessGoal = z.infer<typeof WellnessGoal>;

// Core Wellness Service Schema
export const WellnessServiceSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  description: z.string(),
  type: WellnessServiceType,
  duration: z.number().int(), // minutes
  price: z.number(),
  
  // Service details
  prerequisites: z.array(z.string()).default([]), // Required before booking
  contraindications: z.array(z.string()).default([]), // Health conditions to avoid
  preparationNotes: z.string().optional(),
  aftercareInstructions: z.string().optional(),
  
  // Practitioner requirements
  requiredSpecialties: z.array(PractitionerSpecialty),
  certificationRequired: z.boolean().default(false),
  
  // Availability
  availableDays: z.array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])),
  timeSlots: z.array(z.string()).default([]), // ['09:00-17:00']
  
  isActive: z.boolean().default(true),
  createdAt: z.date(),
});

export type WellnessService = z.infer<typeof WellnessServiceSchema>;

// Practitioner Schema
export const PractitionerSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  userId: z.string().optional(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  
  // Professional details
  specialties: z.array(PractitionerSpecialty),
  certifications: z.array(z.string()),
  yearsOfExperience: z.number().int().min(0),
  bio: z.string().optional(),
  photoUrl: z.string().optional(),
  
  // Scheduling
  availability: z.object({
    monday: z.array(z.string()).default([]),
    tuesday: z.array(z.string()).default([]),
    wednesday: z.array(z.string()).default([]),
    thursday: z.array(z.string()).default([]),
    friday: z.array(z.string()).default([]),
    saturday: z.array(z.string()).default([]),
    sunday: z.array(z.string()).default([]),
  }),
  
  // Preferences
  maxConcurrentClients: z.number().int().default(1),
  breakBetweenSessions: z.number().int().default(15), // minutes
  
  isActive: z.boolean().default(true),
  createdAt: z.date(),
});

export type Practitioner = z.infer<typeof PractitionerSchema>;

// Appointment Schema
export const WellnessAppointmentSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  clientId: z.string(),
  serviceId: z.string(),
  practitionerId: z.string().optional(), // Assigned during booking
  
  // Appointment details
  date: z.date(),
  startTime: z.string(), // HH:MM format
  endTime: z.string(),
  duration: z.number().int(),
  status: AppointmentStatus,
  
  // Service specifics
  notes: z.string().optional(),
  preferences: z.string().optional(), // Client preferences
  healthConcerns: z.string().optional(),
  
  // Pricing
  price: z.number(),
  depositRequired: z.boolean().default(false),
  depositAmount: z.number().optional(),
  
  // Reminders
  reminderSent: z.boolean().default(false),
  followUpSent: z.boolean().default(false),
  
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type WellnessAppointment = z.infer<typeof WellnessAppointmentSchema>;

// Client Profile Schema
export const WellnessClientSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  userId: z.string().optional(),
  
  // Personal info
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  dateOfBirth: z.date().optional(),
  
  // Health profile
  healthConditions: z.array(z.string()).default([]),
  medications: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  injuries: z.array(z.string()).default([]),
  
  // Wellness goals
  primaryGoals: z.array(WellnessGoal).default([]),
  targetAreas: z.array(z.string()).default([]), // Body areas of concern
  
  // Preferences
  preferredPractitioners: z.array(z.string()).default([]), // Practitioner IDs
  preferredTimes: z.array(z.string()).default([]), // Time ranges
  communicationPreferences: z.array(z.enum(['email', 'sms', 'phone'])).default(['email']),
  
  // Membership
  membershipType: z.enum(['none', 'monthly', 'annual']).default('none'),
  membershipStartDate: z.date().optional(),
  membershipEndDate: z.date().optional(),
  
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type WellnessClient = z.infer<typeof WellnessClientSchema>;

// Package/Membership Schema
export const WellnessPackageSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.enum(['membership', 'package', 'series']),
  
  // Inclusions
  includedServices: z.array(z.object({
    serviceId: z.string(),
    quantity: z.number().int().min(1),
    validityDays: z.number().int().optional(), // Days from purchase
  })),
  
  // Pricing
  price: z.number(),
  originalPrice: z.number().optional(), // For discount display
  savingsAmount: z.number().optional(),
  
  // Duration
  validityMonths: z.number().int().default(12),
  maxRedemptions: z.number().int().optional(), // Total sessions
  
  // Restrictions
  blackoutDates: z.array(z.date()).default([]),
  advanceBookingRequired: z.number().int().default(0), // Hours
  cancellationPolicyHours: z.number().int().default(24),
  
  isActive: z.boolean().default(true),
  createdAt: z.date(),
});

export type WellnessPackage = z.infer<typeof WellnessPackageSchema>;