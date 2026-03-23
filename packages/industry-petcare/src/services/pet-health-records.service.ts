// @ts-nocheck
/**
 * Pet Health Records Service
 * Manages pet medical records, vaccinations, and health tracking
 */

import { z } from 'zod';

export interface PetRecord {
  id: string;
  petId: string;
  ownerId: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'hamster' | 'other';
  breed?: string;
  age: number;
  weight: number;
  lastCheckup?: Date;
  nextCheckup?: Date;
  medicalConditions?: string[];
  medications?: Medication[];
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  active: boolean;
}

export interface Vaccination {
  id: string;
  petId: string;
  vaccineName: string;
  dateAdministered: Date;
  nextDueDate?: Date;
  administeredBy: string;
}

export interface HealthConfig {
  enableReminders?: boolean;
  trackWeight?: boolean;
  enableVaccinationAlerts?: boolean;
}

const PetRecordSchema = z.object({
  id: z.string(),
  petId: z.string(),
  ownerId: z.string(),
  name: z.string(),
  species: z.enum(['dog', 'cat', 'bird', 'rabbit', 'hamster', 'other']),
  breed: z.string().optional(),
  age: z.number().min(0),
  weight: z.number().min(0),
  lastCheckup: z.date().optional(),
  nextCheckup: z.date().optional(),
  medicalConditions: z.array(z.string()).optional(),
  medications: z.array(z.object({
    name: z.string(),
    dosage: z.string(),
    frequency: z.string(),
    startDate: z.date(),
    endDate: z.date().optional(),
    active: z.boolean(),
  })).optional(),
});

export class PetHealthRecordsService {
  private records: Map<string, PetRecord>;
  private vaccinations: Map<string, Vaccination>;
  private config: HealthConfig;

  constructor(config: HealthConfig = {}) {
    this.config = {
      enableReminders: true,
      trackWeight: true,
      enableVaccinationAlerts: true,
      ...config,
    };
    this.records = new Map();
    this.vaccinations = new Map();
  }

  async initialize(): Promise<void> {
    console.log('[PET_HEALTH] Initializing service...');
    
    // Initialize sample data
    this.initializeSampleRecords();
    
    console.log('[PET_HEALTH] Service initialized');
  }

  private initializeSampleRecords(): void {
    const now = new Date();
    const sampleRecords: PetRecord[] = [
      {
        id: 'pr1',
        petId: 'pet1',
        ownerId: 'owner1',
        name: 'Buddy',
        species: 'dog',
        breed: 'Golden Retriever',
        age: 5,
        weight: 32.5,
        lastCheckup: new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000),
        nextCheckup: new Date(now.getTime() + 6 * 30 * 24 * 60 * 60 * 1000),
        medicalConditions: ['Hip Dysplasia'],
        medications: [{
          name: 'Rimadyl',
          dosage: '75mg',
          frequency: 'Twice daily',
          startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          active: true,
        }],
      },
      {
        id: 'pr2',
        petId: 'pet2',
        ownerId: 'owner2',
        name: 'Whiskers',
        species: 'cat',
        breed: 'Persian',
        age: 3,
        weight: 4.2,
        lastCheckup: new Date(now.getTime() - 3 * 30 * 24 * 60 * 60 * 1000),
        nextCheckup: new Date(now.getTime() + 9 * 30 * 24 * 60 * 60 * 1000),
      },
    ];

    sampleRecords.forEach(record => this.records.set(record.petId, record));
  }

  createPetRecord(petData: Partial<PetRecord>): PetRecord {
    const record: PetRecord = {
      ...petData,
      id: petData.id || `pr_${Date.now()}`,
    } as PetRecord;

    PetRecordSchema.parse(record);
    this.records.set(record.petId, record);
    return record;
  }

  updateWeight(petId: string, weight: number): boolean {
    const record = this.records.get(petId);
    if (!record) return false;

    record.weight = weight;
    return true;
  }

  addVaccination(vaccinationData: Partial<Vaccination>): Vaccination {
    const vaccination: Vaccination = {
      ...vaccinationData,
      id: vaccinationData.id || `vac_${Date.now()}`,
      dateAdministered: vaccinationData.dateAdministered || new Date(),
    } as Vaccination;

    this.vaccinations.set(vaccination.id, vaccination);
    return vaccination;
  }

  getUpcomingVaccinations(daysAhead: number = 30): Vaccination[] {
    const cutoff = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
    return Array.from(this.vaccinations.values()).filter(
      v => v.nextDueDate && v.nextDueDate <= cutoff && v.nextDueDate >= new Date()
    );
  }

  getStatistics(): {
    totalPets: number;
    bySpecies: Record<string, number>;
    averageAge: number;
    petsWithConditions: number;
    upcomingCheckups: number;
  } {
    const allRecords = Array.from(this.records.values());
    const speciesCount = new Map<string, number>();
    
    allRecords.forEach(record => {
      speciesCount.set(record.species, (speciesCount.get(record.species) || 0) + 1);
    });

    const avgAge = allRecords.reduce((sum, r) => sum + r.age, 0) / allRecords.length;
    const withConditions = allRecords.filter(r => r.medicalConditions && r.medicalConditions.length > 0).length;
    const now = new Date();
    const upcomingCheckups = allRecords.filter(r => 
      r.nextCheckup && r.nextCheckup > now && r.nextCheckup <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    ).length;

    return {
      totalPets: allRecords.length,
      bySpecies: Object.fromEntries(speciesCount),
      averageAge: Math.round(avgAge * 10) / 10,
      petsWithConditions: withConditions,
      upcomingCheckups,
    };
  }
}
