/**
 * Insurance Verification Feature Module
 */

import { InsuranceVerificationService, InsuranceVerificationData, EligibilityResponse } from '../services/insurance-verification-service.js';

export interface InsuranceVerificationConfig {
  autoVerifyEligibility: boolean;
  checkPriorAuth: boolean;
  estimatePatientResponsibility: boolean;
}

export class InsuranceVerificationFeature {
  private service: InsuranceVerificationService;
  private config: InsuranceVerificationConfig;
  private initialized: boolean = false;

  constructor(config: InsuranceVerificationConfig = {
    autoVerifyEligibility: true,
    checkPriorAuth: true,
    estimatePatientResponsibility: true,
  }) {
    this.config = config;
    this.service = new InsuranceVerificationService();
  }

  async initialize(): Promise<void> {
    if (!this.initialized) {
      await this.service.initialize();
      this.initialized = true;
      console.log('[InsuranceVerificationFeature] Initialized');
    }
  }

  async verifyEligibility(data: InsuranceVerificationData): Promise<EligibilityResponse> {
    return this.service.verifyEligibility(data);
  }

  async checkPriorAuth(procedureCode: string, diagnosisCode: string, provider: string): Promise<{ required: boolean; authCode?: string }> {
    return this.service.checkPriorAuth(procedureCode, diagnosisCode, provider);
  }

  async submitPriorAuthRequest(data: {
    patientId: string;
    procedureCode: string;
    diagnosisCode: string;
    providerNPI: string;
    facilityNPI: string;
    requestedDate: Date;
  }): Promise<string> {
    return this.service.submitPriorAuthRequest(data);
  }

  async estimatePatientResponsibility(
    procedureCode: string,
    allowedAmount: number,
    eligibility: EligibilityResponse
  ): Promise<{ copay: number; deductible: number; coinsurance: number; total: number }> {
    return this.service.estimatePatientResponsibility(procedureCode, allowedAmount, eligibility);
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async dispose(): Promise<void> {
    await this.service.dispose();
    this.initialized = false;
  }
}
