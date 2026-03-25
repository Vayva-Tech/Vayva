/**
 * Petcare Industry Types
 * Core types for the petcare industry engine
 */

// Pet Species
export type PetSpecies = 
  | 'dog'
  | 'cat'
  | 'bird'
  | 'rabbit'
  | 'hamster'
  | 'guinea_pig'
  | 'fish'
  | 'reptile'
  | 'other';

// Pet Gender
export type PetGender = 'male' | 'female' | 'unknown';

// Appointment Types
export type AppointmentType = 
  | 'wellness_exam'
  | 'vaccination'
  | 'surgery'
  | 'dental'
  | 'emergency'
  | 'grooming'
  | 'boarding'
  | 'consultation';

// Appointment Status
export type AppointmentStatus = 
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

// Vaccination Status
export type VaccinationStatus = 
  | 'up_to_date'
  | 'due_soon'
  | 'overdue'
  | 'not_applicable';

// Medical Record Types
export type MedicalRecordType = 
  | 'vaccination'
  | 'diagnosis'
  | 'treatment'
  | 'surgery'
  | 'medication'
  | 'allergy'
  | 'lab_result';

// Grooming Service Types
export type GroomingServiceType = 
  | 'bath'
  | 'haircut'
  | 'nail_trim'
  | 'ear_cleaning'
  | 'teeth_cleaning'
  | 'full_groom';

// Boarding Status
export type BoardingStatus = 
  | 'reserved'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled';

// Emergency Contact Relationship
export type EmergencyContactRelationship = 
  | 'owner'
  | 'family'
  | 'friend'
  | 'veterinarian';

// Pet Size Categories
export type PetSize = 'toy' | 'small' | 'medium' | 'large' | 'extra_large';

// Behavioral Assessment
export type BehaviorAssessment = 
  | 'calm'
  | 'friendly'
  | 'anxious'
  | 'aggressive'
  | 'shy';

// Base Interfaces
export interface Pet {
  id: string;
  ownerId: string;
  name: string;
  species: PetSpecies;
  breed?: string;
  gender: PetGender;
  dateOfBirth?: Date;
  weight?: number;
  weightUnit: 'kg' | 'lbs';
  color?: string;
  microchipId?: string;
  spayedNeutered: boolean;
  size?: PetSize;
  behavior?: BehaviorAssessment;
  specialNeeds?: string;
  feedingInstructions?: string;
  medication?: string;
  allergies?: string[];
  isActive: boolean;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PetOwner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  emergencyContacts: EmergencyContact[];
  preferredVetId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: EmergencyContactRelationship;
  isPrimary: boolean;
}

export interface Veterinarian {
  id: string;
  storeId: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  licenseNumber: string;
  bio?: string;
  isActive: boolean;
  workingHours?: WeeklySchedule;
  createdAt: Date;
  updatedAt: Date;
}

export interface WeeklySchedule {
  monday?: TimeSlot[];
  tuesday?: TimeSlot[];
  wednesday?: TimeSlot[];
  thursday?: TimeSlot[];
  friday?: TimeSlot[];
  saturday?: TimeSlot[];
  sunday?: TimeSlot[];
}

export interface TimeSlot {
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  isAvailable: boolean;
}

export interface PetAppointment {
  id: string;
  storeId: string;
  petId: string;
  ownerId: string;
  veterinarianId?: string;
  appointmentType: AppointmentType;
  reason?: string;
  startDate: Date;
  endDate: Date;
  status: AppointmentStatus;
  notes?: string;
  cost?: number;
  depositAmount?: number;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded';
  cancellationReason?: string;
  followUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface VaccinationRecord {
  id: string;
  petId: string;
  vaccineName: string;
  administeredDate: Date;
  nextDueDate?: Date;
  veterinarianId?: string;
  batchNumber?: string;
  notes?: string;
  status: VaccinationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicalRecord {
  id: string;
  petId: string;
  recordType: MedicalRecordType;
  title: string;
  description: string;
  date: Date;
  veterinarianId?: string;
  diagnosis?: string;
  treatment?: string;
  medications?: string[];
  followUpRequired: boolean;
  followUpDate?: Date;
  attachments: string[];
  isConfidential: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroomingService {
  id: string;
  storeId: string;
  name: string;
  description?: string;
  duration: number; // in minutes
  basePrice: number;
  species: PetSpecies[];
  sizeRequirements?: PetSize[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroomingAppointment {
  id: string;
  storeId: string;
  petId: string;
  ownerId: string;
  serviceId: string;
  groomerId?: string;
  startDate: Date;
  endDate: Date;
  status: AppointmentStatus;
  specialRequests?: string;
  coatCondition?: string;
  notes?: string;
  totalPrice: number;
  addOns: GroomingAddOn[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GroomingAddOn {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export interface BoardingReservation {
  id: string;
  storeId: string;
  petId: string;
  ownerId: string;
  startDate: Date;
  endDate: Date;
  status: BoardingStatus;
  kennelNumber?: string;
  specialInstructions?: string;
  dietRequirements?: string;
  medication?: string;
  emergencyContact?: EmergencyContact;
  dailyRate: number;
  totalCost: number;
  depositAmount?: number;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded';
  checkInNotes?: string;
  checkOutNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PetWeightRecord {
  id: string;
  petId: string;
  weight: number;
  unit: 'kg' | 'lbs';
  date: Date;
  recordedBy?: string;
  notes?: string;
  createdAt: Date;
}

export interface PetBehaviorLog {
  id: string;
  petId: string;
  date: Date;
  behavior: BehaviorAssessment;
  notes: string;
  recordedBy: string;
  incidentType?: string;
  createdAt: Date;
}

import type { HealthConfig } from '../services/pet-health-records.service';

/** Engine wiring for optional pet-health feature module. */
export interface PetCareConfig {
  healthRecords?: false | HealthConfig;
}

// Configuration Types
export interface PetcareConfig {
  defaultCurrency: string;
  timezone: string;
  workingHours: WeeklySchedule;
  appointmentLeadTime: number; // minimum hours before booking
  cancellationWindow: number; // hours before appointment
  vaccinationSchedule: Record<PetSpecies, Record<string, number>>; // months
  boardingPolicies: {
    minimumAge: number; // in weeks
    requiredVaccinations: string[];
    maxStayDuration: number; // in days
  };
  emergencyProtocols: {
    contactNumbers: string[];
    procedures: string[];
  };
}