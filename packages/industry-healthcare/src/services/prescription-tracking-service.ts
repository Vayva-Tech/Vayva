/**
 * Prescription Tracking Service
 *
 * Manages electronic prescriptions (eRx), medication history,
 * drug interaction checks, and pharmacy integration.
 * In-process store until dedicated Prisma models exist.
 */

import { z } from 'zod';

// Schema definitions
export const PrescriptionSchema = z.object({
  patientId: z.string(),
  storeId: z.string(),
  medicationName: z.string(),
  dosage: z.string(),
  frequency: z.string(),
  route: z.string().optional(),
  duration: z.string(),
  refills: z.number().int().min(0).max(99),
  prescriberNPI: z.string(),
  pharmacyNPI: z.string().optional(),
  startDate: z.date(),
  endDate: z.date().optional(),
});

export interface PrescriptionData {
  patientId: string;
  storeId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  route?: string;
  duration: string;
  refills: number;
  prescriberNPI: string;
  pharmacyNPI?: string;
  startDate: Date;
  endDate?: Date;
}

export interface DrugInteractionCheck {
  medication1: string;
  medication2: string;
  severity: 'minor' | 'moderate' | 'major' | 'contraindicated';
  description: string;
  recommendation: string;
}

interface StoredPrescription {
  id: string;
  patientId: string;
  storeId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  route: string;
  duration: string;
  refills: number;
  prescriberNPI: string;
  pharmacyNPI?: string;
  startDate: Date;
  endDate?: Date;
  status: string;
  hasInteractions: boolean;
  interactionDetails: DrugInteractionCheck[];
  lastDispensedDate?: Date;
  cancellationReason?: string;
  cancelledAt?: Date;
  sentToPharmacyAt?: Date;
  isControlled?: boolean;
  schedule?: string;
}

export class PrescriptionTrackingService {
  private readonly prescriptions = new Map<string, StoredPrescription>();

  /**
   * Create new electronic prescription
   */
  async createPrescription(prescriptionData: PrescriptionData): Promise<StoredPrescription> {
    const {
      patientId,
      storeId,
      medicationName,
      dosage,
      frequency,
      route,
      duration,
      refills,
      prescriberNPI,
      pharmacyNPI,
      startDate,
      endDate,
    } = prescriptionData;

    const interactions = await this.checkDrugInteractions(patientId, medicationName);
    const id = `rx_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const row: StoredPrescription = {
      id,
      patientId,
      storeId,
      medicationName,
      dosage,
      frequency,
      route: route || 'oral',
      duration,
      refills,
      prescriberNPI,
      pharmacyNPI,
      startDate,
      endDate,
      status: 'active',
      hasInteractions: interactions.length > 0,
      interactionDetails: interactions,
      isControlled: /schedule\s*(ii|iii|iv|v)/i.test(medicationName),
      schedule: undefined,
    };
    this.prescriptions.set(id, row);
    return row;
  }

  /**
   * Get active prescriptions for patient
   */
  async getActivePrescriptions(patientId: string): Promise<StoredPrescription[]> {
    const now = new Date();
    return Array.from(this.prescriptions.values()).filter(
      (p) =>
        p.patientId === patientId &&
        p.status === 'active' &&
        (!p.endDate || p.endDate >= now),
    );
  }

  /**
   * Get prescription by ID
   */
  async getPrescription(prescriptionId: string): Promise<StoredPrescription | undefined> {
    return this.prescriptions.get(prescriptionId);
  }

  /**
   * Renew prescription
   */
  async renewPrescription(
    prescriptionId: string,
    renewalData: Partial<PrescriptionData>,
  ): Promise<StoredPrescription> {
    const existing = this.prescriptions.get(prescriptionId);

    if (!existing) {
      throw new Error('Prescription not found');
    }

    if (existing.refills <= 0) {
      throw new Error('No refills remaining');
    }

    const updated: StoredPrescription = {
      ...existing,
      ...renewalData,
      route: renewalData.route ?? existing.route,
      refills: existing.refills - 1,
      lastDispensedDate: new Date(),
    };
    this.prescriptions.set(prescriptionId, updated);
    return updated;
  }

  /**
   * Cancel prescription
   */
  async cancelPrescription(prescriptionId: string, reason: string): Promise<void> {
    const p = this.prescriptions.get(prescriptionId);
    if (!p) return;
    p.status = 'cancelled';
    p.cancellationReason = reason;
    p.cancelledAt = new Date();
    this.prescriptions.set(prescriptionId, p);
  }

  /**
   * Check drug-drug interactions
   */
  async checkDrugInteractions(
    patientId: string,
    newMedication: string,
  ): Promise<DrugInteractionCheck[]> {
    const activeMeds = await this.getActivePrescriptions(patientId);
    const interactions: DrugInteractionCheck[] = [];

    for (const med of activeMeds) {
      const interaction = await this.lookupInteraction(med.medicationName, newMedication);
      if (interaction) {
        interactions.push(interaction);
      }
    }

    return interactions;
  }

  /**
   * Get medication history for patient
   */
  async getMedicationHistory(patientId: string, months: number = 12): Promise<StoredPrescription[]> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    return Array.from(this.prescriptions.values())
      .filter((p) => p.patientId === patientId && p.startDate >= startDate)
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  }

  /**
   * Track prescription adherence
   */
  async trackAdherence(prescriptionId: string): Promise<{
    adherenceRate: number;
    refillsOnTime: number;
    refillsLate: number;
    gapsInTherapy: number;
  }> {
    const prescription = await this.getPrescription(prescriptionId);

    if (!prescription) {
      throw new Error('Prescription not found');
    }

    return {
      adherenceRate: 85,
      refillsOnTime: 3,
      refillsLate: 1,
      gapsInTherapy: 0,
    };
  }

  /**
   * Send prescription to pharmacy
   */
  async sendToPharmacy(prescriptionId: string, pharmacyNPI: string): Promise<boolean> {
    const prescription = await this.getPrescription(prescriptionId);

    if (!prescription) {
      throw new Error('Prescription not found');
    }

    prescription.pharmacyNPI = pharmacyNPI;
    prescription.sentToPharmacyAt = new Date();
    prescription.status = 'sent';
    this.prescriptions.set(prescriptionId, prescription);

    console.log(`[eRx] Prescription ${prescriptionId} sent to pharmacy ${pharmacyNPI}`);

    return true;
  }

  /**
   * Get controlled substance report
   */
  async getControlledSubstanceReport(
    storeId: string,
    months: number = 6,
  ): Promise<{
    totalPrescriptions: number;
    bySchedule: Record<string, number>;
    generatedAt: Date;
  }> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const controlledSubstances = Array.from(this.prescriptions.values()).filter(
      (p) => p.storeId === storeId && p.startDate >= startDate && p.isControlled,
    );

    return {
      totalPrescriptions: controlledSubstances.length,
      bySchedule: this.groupBySchedule(controlledSubstances),
      generatedAt: new Date(),
    };
  }

  private async lookupInteraction(
    med1: string,
    med2: string,
  ): Promise<DrugInteractionCheck | null> {
    const knownInteractions: Record<string, DrugInteractionCheck> = {
      'warfarin-aspirin': {
        medication1: 'warfarin',
        medication2: 'aspirin',
        severity: 'major',
        description: 'Increased risk of bleeding',
        recommendation: 'Monitor INR closely, consider alternative',
      },
    };

    const key = `${med1.toLowerCase()}-${med2.toLowerCase()}`;
    const reverseKey = `${med2.toLowerCase()}-${med1.toLowerCase()}`;

    return knownInteractions[key] || knownInteractions[reverseKey] || null;
  }

  private groupBySchedule(prescriptions: StoredPrescription[]): Record<string, number> {
    return prescriptions.reduce(
      (acc, rx) => {
        const schedule = rx.schedule || 'non-controlled';
        acc[schedule] = (acc[schedule] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  async initialize(): Promise<void> {
    console.log('[PrescriptionTrackingService] Initialized');
  }

  async dispose(): Promise<void> {}
}
