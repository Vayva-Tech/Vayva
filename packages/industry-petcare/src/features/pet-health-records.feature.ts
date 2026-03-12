/**
 * Pet Health Records Feature
 */

import { PetHealthRecordsService, PetRecord, Medication, Vaccination, HealthConfig } from '../services/pet-health-records.service';

export class PetHealthRecordsFeature {
  constructor(private service: PetHealthRecordsService) {}

  async createPetRecord(petData: Partial<PetRecord>): Promise<PetRecord> {
    return this.service.createPetRecord(petData);
  }

  async updateWeight(petId: string, weight: number): Promise<boolean> {
    return this.service.updateWeight(petId, weight);
  }

  async addVaccination(vaccinationData: Partial<Vaccination>): Promise<Vaccination> {
    return this.service.addVaccination(vaccinationData);
  }

  async getUpcomingVaccinations(daysAhead?: number): Promise<Vaccination[]> {
    return this.service.getUpcomingVaccinations(daysAhead);
  }

  async getStatistics() {
    return this.service.getStatistics();
  }
}
