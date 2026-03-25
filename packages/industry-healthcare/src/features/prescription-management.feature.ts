/**
 * Prescription Management Feature Module
 */

import { PrescriptionTrackingService, PrescriptionData } from '../services/prescription-tracking-service.js';

export interface PrescriptionManagementConfig {
  enableDrugInteractionChecks: boolean;
  enableAdherenceTracking: boolean;
  controlledSubstanceReporting: boolean;
}

export class PrescriptionManagementFeature {
  private service: PrescriptionTrackingService;
  private config: PrescriptionManagementConfig;
  private initialized: boolean = false;

  constructor(config: PrescriptionManagementConfig = {
    enableDrugInteractionChecks: true,
    enableAdherenceTracking: true,
    controlledSubstanceReporting: true,
  }) {
    this.config = config;
    this.service = new PrescriptionTrackingService();
  }

  async initialize(): Promise<void> {
    if (!this.initialized) {
      await this.service.initialize();
      this.initialized = true;
      console.log('[PrescriptionManagementFeature] Initialized');
    }
  }

  async createPrescription(prescriptionData: PrescriptionData): Promise<any> {
    return this.service.createPrescription(prescriptionData);
  }

  async getActivePrescriptions(patientId: string): Promise<any[]> {
    return this.service.getActivePrescriptions(patientId);
  }

  async renewPrescription(prescriptionId: string, renewalData: Partial<PrescriptionData>): Promise<any> {
    return this.service.renewPrescription(prescriptionId, renewalData);
  }

  async cancelPrescription(prescriptionId: string, reason: string): Promise<void> {
    return this.service.cancelPrescription(prescriptionId, reason);
  }

  async sendToPharmacy(prescriptionId: string, pharmacyNPI: string): Promise<boolean> {
    return this.service.sendToPharmacy(prescriptionId, pharmacyNPI);
  }

  async trackAdherence(prescriptionId: string): Promise<{
    adherenceRate: number;
    refillsOnTime: number;
    refillsLate: number;
    gapsInTherapy: number;
  }> {
    return this.service.trackAdherence(prescriptionId);
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async dispose(): Promise<void> {
    await this.service.dispose();
    this.initialized = false;
  }
}
