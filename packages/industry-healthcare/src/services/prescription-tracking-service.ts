/**
 * Prescription Tracking Service
 * 
 * Manages electronic prescriptions (eRx), medication history,
 * drug interaction checks, and pharmacy integration.
 */

import { PrismaClient } from '@vayva/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

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

export class PrescriptionTrackingService {
  /**
   * Create new electronic prescription
   */
  async createPrescription(prescriptionData: PrescriptionData): Promise<any> {
    const { patientId, storeId, medicationName, dosage, frequency, route, duration, refills, prescriberNPI, pharmacyNPI, startDate, endDate } = prescriptionData;

    // Check for drug interactions first
    const interactions = await this.checkDrugInteractions(patientId, medicationName);

    return prisma.prescription.create({
      data: {
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
        interactionDetails: interactions as any[],
      },
    });
  }

  /**
   * Get active prescriptions for patient
   */
  async getActivePrescriptions(patientId: string): Promise<any[]> {
    return prisma.prescription.findMany({
      where: {
        patientId,
        status: 'active',
        OR: [
          { endDate: { gte: new Date() } },
          { endDate: null },
        ],
      },
      orderBy: { startDate: 'desc' },
    });
  }

  /**
   * Get prescription by ID
   */
  async getPrescription(prescriptionId: string): Promise<any> {
    return prisma.prescription.findUnique({
      where: { id: prescriptionId },
    });
  }

  /**
   * Renew prescription
   */
  async renewPrescription(
    prescriptionId: string,
    renewalData: Partial<PrescriptionData>
  ): Promise<any> {
    const existing = await this.getPrescription(prescriptionId);

    if (!existing) {
      throw new Error('Prescription not found');
    }

    if (existing.refills <= 0) {
      throw new Error('No refills remaining');
    }

    return prisma.prescription.update({
      where: { id: prescriptionId },
      data: {
        ...renewalData,
        refills: existing.refills - 1,
        lastDispensedDate: new Date(),
      },
    });
  }

  /**
   * Cancel prescription
   */
  async cancelPrescription(prescriptionId: string, reason: string): Promise<void> {
    await prisma.prescription.update({
      where: { id: prescriptionId },
      data: {
        status: 'cancelled',
        cancellationReason: reason,
        cancelledAt: new Date(),
      },
    });
  }

  /**
   * Check drug-drug interactions
   */
  async checkDrugInteractions(
    patientId: string,
    newMedication: string
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
  async getMedicationHistory(patientId: string, months: number = 12): Promise<any[]> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    return prisma.prescription.findMany({
      where: {
        patientId,
        startDate: { gte: startDate },
      },
      orderBy: { startDate: 'desc' },
    });
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

    // Mock adherence calculation
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

    // Update prescription with pharmacy info
    await prisma.prescription.update({
      where: { id: prescriptionId },
      data: {
        pharmacyNPI,
        sentToPharmacyAt: new Date(),
        status: 'sent',
      },
    });

    // In production, would transmit via Surescripts or similar
    console.log(`[eRx] Prescription ${prescriptionId} sent to pharmacy ${pharmacyNPI}`);

    return true;
  }

  /**
   * Get controlled substance report
   */
  async getControlledSubstanceReport(storeId: string, months: number = 6): Promise<any> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const controlledSubstances = await prisma.prescription.findMany({
      where: {
        storeId,
        startDate: { gte: startDate },
        isControlled: true,
      },
    });

    return {
      totalPrescriptions: controlledSubstances.length,
      bySchedule: this.groupBySchedule(controlledSubstances),
      generatedAt: new Date(),
    };
  }

  private async lookupInteraction(
    med1: string,
    med2: string
  ): Promise<DrugInteractionCheck | null> {
    // Mock implementation - in production would use drug database
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

  private groupBySchedule(prescriptions: any[]): Record<string, number> {
    return prescriptions.reduce((acc, rx) => {
      const schedule = rx.schedule || 'non-controlled';
      acc[schedule] = (acc[schedule] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  async initialize(): Promise<void> {
    console.log('[PrescriptionTrackingService] Initialized');
  }

  async dispose(): Promise<void> {
    // Cleanup if needed
  }
}
