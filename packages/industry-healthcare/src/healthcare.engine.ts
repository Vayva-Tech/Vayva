// @ts-nocheck
/**
 * Healthcare Industry Engine
 * Main orchestrator for all healthcare-specific features
 */

import {
  DashboardEngine,
  type DashboardEngineConfig,
  type DataResolver,
} from '@vayva/industry-core';

import {
  AppointmentService,
  PatientSchedulingService,
  MedicalRecordsService,
  TelemedicineService,
  HIPAAAuditService,
  TreatmentPlanService,
  InsuranceVerificationService,
  PrescriptionTrackingService,
  // Phase 4: AI Services
  SymptomCheckerService,
  TreatmentRecommendationService,
  ClinicalNoteSummarizationService,
} from './services/index';

import { HEALTHCARE_DASHBOARD_CONFIG } from './dashboard/healthcare-dashboard.config';

export interface HealthcareEngineConfig {
  patientIntake?: boolean;
  appointments?: boolean;
  medicalRecords?: boolean;
  telemedicine?: boolean;
  hipaaCompliance?: boolean;
  treatmentPlanning?: boolean;
  insuranceVerification?: boolean;
  prescriptionManagement?: boolean;
  // Phase 4: AI Services
  aiSymptomChecker?: boolean;
  aiTreatmentRecommendation?: boolean;
  aiClinicalNoteSummarization?: boolean;
}

export type HealthcareFeatureId = 
  | 'patient-intake'
  | 'appointment-scheduling'
  | 'medical-records'
  | 'telemedicine'
  | 'hipaa-compliance'
  | 'treatment-planning'
  | 'insurance-verification'
  | 'prescription-management'
  // Phase 4: AI Features
  | 'ai-symptom-checker'
  | 'ai-treatment-recommendation'
  | 'ai-clinical-note-summarization';

export interface HealthcareEngineStatus {
  initialized: boolean;
  activeFeatures: HealthcareFeatureId[];
  dashboardReady: boolean;
  servicesReady: boolean;
}

export class HealthcareEngine {
  // Feature services
  private appointmentService?: AppointmentService;
  private schedulingService?: PatientSchedulingService;
  private medicalRecordsService?: MedicalRecordsService;
  private telemedicineService?: TelemedicineService;
  
  // Phase 3: Advanced Services
  private hipaaAuditService?: HIPAAAuditService;
  private treatmentPlanService?: TreatmentPlanService;
  private insuranceVerificationService?: InsuranceVerificationService;
  private prescriptionTrackingService?: PrescriptionTrackingService;
  
  // Phase 4: AI Services
  private symptomCheckerService?: SymptomCheckerService;
  private treatmentRecommendationService?: TreatmentRecommendationService;
  private clinicalNoteSummarizationService?: ClinicalNoteSummarizationService;

  // Dashboard engine
  private dashboardEngine: DashboardEngine;

  // Configuration
  private healthcareConfig: HealthcareEngineConfig;

  // Status tracking
  private status: HealthcareEngineStatus;

  constructor(
    config: HealthcareEngineConfig = {}
  ) {
    this.healthcareConfig = config;
    this.dashboardEngine = new DashboardEngine();
    this.dashboardEngine.setConfig(HEALTHCARE_DASHBOARD_CONFIG);
    
    this.status = {
      initialized: false,
      activeFeatures: [],
      dashboardReady: false,
      servicesReady: false,
    };
  }

  /**
   * Initialize the healthcare engine and all enabled features
   */
  async initialize(): Promise<void> {
    try {
      // Initialize Appointment Service if enabled
      if (this.healthcareConfig.appointments) {
        this.appointmentService = new AppointmentService();
        await this.appointmentService.initialize();
        this.status.activeFeatures.push('appointment-scheduling');
      }

      // Initialize Patient Scheduling if enabled
      if (this.healthcareConfig.patientIntake) {
        this.schedulingService = new PatientSchedulingService();
        await this.schedulingService.initialize();
        this.status.activeFeatures.push('patient-intake');
      }

      // Initialize Medical Records if enabled
      if (this.healthcareConfig.medicalRecords) {
        this.medicalRecordsService = new MedicalRecordsService();
        await this.medicalRecordsService.initialize();
        this.status.activeFeatures.push('medical-records');
      }

      // Initialize Telemedicine if enabled
      if (this.healthcareConfig.telemedicine) {
        this.telemedicineService = new TelemedicineService();
        await this.telemedicineService.initialize();
        this.status.activeFeatures.push('telemedicine');
      }

      // Add HIPAA compliance and treatment planning as feature flags
      if (this.healthcareConfig.hipaaCompliance) {
        this.status.activeFeatures.push('hipaa-compliance');
      }

      if (this.healthcareConfig.treatmentPlanning) {
        this.status.activeFeatures.push('treatment-planning');
      }

      if (this.healthcareConfig.insuranceVerification) {
        this.insuranceVerificationService = new InsuranceVerificationService();
        await this.insuranceVerificationService.initialize();
        this.status.activeFeatures.push('insurance-verification');
      }

      // Initialize HIPAA Audit Service
      if (this.healthcareConfig.hipaaCompliance) {
        this.hipaaAuditService = new HIPAAAuditService();
        await this.hipaaAuditService.initialize();
        this.status.activeFeatures.push('hipaa-compliance');
      }

      // Initialize Treatment Planning Service
      if (this.healthcareConfig.treatmentPlanning) {
        this.treatmentPlanService = new TreatmentPlanService();
        await this.treatmentPlanService.initialize();
        this.status.activeFeatures.push('treatment-planning');
      }

      // Initialize Prescription Tracking Service
      if (this.healthcareConfig.prescriptionManagement) {
        this.prescriptionTrackingService = new PrescriptionTrackingService();
        await this.prescriptionTrackingService.initialize();
        this.status.activeFeatures.push('prescription-management');
      }

      // Phase 4: Initialize AI Services
      if (this.healthcareConfig.aiSymptomChecker) {
        this.symptomCheckerService = new SymptomCheckerService();
        await this.symptomCheckerService.initialize();
        this.status.activeFeatures.push('ai-symptom-checker');
      }

      if (this.healthcareConfig.aiTreatmentRecommendation) {
        this.treatmentRecommendationService = new TreatmentRecommendationService();
        await this.treatmentRecommendationService.initialize();
        this.status.activeFeatures.push('ai-treatment-recommendation');
      }

      if (this.healthcareConfig.aiClinicalNoteSummarization) {
        this.clinicalNoteSummarizationService = new ClinicalNoteSummarizationService();
        await this.clinicalNoteSummarizationService.initialize();
        this.status.activeFeatures.push('ai-clinical-note-summarization');
      }

      this.status.servicesReady = true;
      this.status.initialized = true;
      this.status.dashboardReady = true;

      // Register data resolvers for dashboard widgets
      this.registerDataResolvers();

      console.log(`[HEALTHCARE_ENGINE] Initialized with ${this.status.activeFeatures.length} features`);
    } catch (error) {
      console.error('[HEALTHCARE_ENGINE] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Get the dashboard engine for widget configuration
   */
  getDashboardEngine(): DashboardEngine {
    return this.dashboardEngine;
  }

  /**
   * Get a specific service by name
   */
  getService<T>(serviceName: string): T | undefined {
    switch (serviceName) {
      case 'appointments':
        return this.appointmentService as T;
      case 'scheduling':
        return this.schedulingService as T;
      case 'medicalRecords':
        return this.medicalRecordsService as T;
      case 'telemedicine':
        return this.telemedicineService as T;
      case 'hipaaAudit':
        return this.hipaaAuditService as T;
      case 'treatmentPlan':
        return this.treatmentPlanService as T;
      case 'insuranceVerification':
        return this.insuranceVerificationService as T;
      case 'prescriptionTracking':
        return this.prescriptionTrackingService as T;
      // Phase 4: AI Services
      case 'symptomChecker':
        return this.symptomCheckerService as T;
      case 'treatmentRecommendation':
        return this.treatmentRecommendationService as T;
      case 'clinicalNoteSummarization':
        return this.clinicalNoteSummarizationService as T;
      default:
        return undefined;
    }
  }

  /**
   * Get current engine status
   */
  getStatus(): HealthcareEngineStatus {
    return { ...this.status };
  }

  /**
   * Get active features
   */
  getActiveFeatures(): HealthcareFeatureId[] {
    return [...this.status.activeFeatures];
  }

  // Feature-specific accessor methods
  async getAppointmentService(): Promise<AppointmentService | undefined> {
    if (!this.status.initialized) {
      await this.initialize();
    }
    return this.appointmentService;
  }

  async getSchedulingService(): Promise<PatientSchedulingService | undefined> {
    if (!this.status.initialized) {
      await this.initialize();
    }
    return this.schedulingService;
  }

  async getMedicalRecordsService(): Promise<MedicalRecordsService | undefined> {
    if (!this.status.initialized) {
      await this.initialize();
    }
    return this.medicalRecordsService;
  }

  async getTelemedicineService(): Promise<TelemedicineService | undefined> {
    if (!this.status.initialized) {
      await this.initialize();
    }
    return this.telemedicineService;
  }

  // Phase 3: New service accessors
  async getHipaaAuditService(): Promise<HIPAAAuditService | undefined> {
    if (!this.status.initialized) {
      await this.initialize();
    }
    return this.hipaaAuditService;
  }

  async getTreatmentPlanService(): Promise<TreatmentPlanService | undefined> {
    if (!this.status.initialized) {
      await this.initialize();
    }
    return this.treatmentPlanService;
  }

  async getInsuranceVerificationService(): Promise<InsuranceVerificationService | undefined> {
    if (!this.status.initialized) {
      await this.initialize();
    }
    return this.insuranceVerificationService;
  }

  async getPrescriptionTrackingService(): Promise<PrescriptionTrackingService | undefined> {
    if (!this.status.initialized) {
      await this.initialize();
    }
    return this.prescriptionTrackingService;
  }

  // Phase 4: AI Service Accessors
  async getSymptomCheckerService(): Promise<SymptomCheckerService | undefined> {
    if (!this.status.initialized) {
      await this.initialize();
    }
    return this.symptomCheckerService;
  }

  async getTreatmentRecommendationService(): Promise<TreatmentRecommendationService | undefined> {
    if (!this.status.initialized) {
      await this.initialize();
    }
    return this.treatmentRecommendationService;
  }

  async getClinicalNoteSummarizationService(): Promise<ClinicalNoteSummarizationService | undefined> {
    if (!this.status.initialized) {
      await this.initialize();
    }
    return this.clinicalNoteSummarizationService;
  }

  /**
   * Check if a feature is available (initialized)
   */
  isFeatureAvailable(featureId: HealthcareFeatureId): boolean {
    return this.status.activeFeatures.includes(featureId);
  }

  /**
   * Get healthcare-specific feature
   */
  getHealthcareFeature<T>(featureId: HealthcareFeatureId): T | undefined {
    // Delegate to service getters based on feature ID
    switch (featureId) {
      case 'patient-intake':
        return this.schedulingService as any;
      case 'appointment-scheduling':
        return this.appointmentService as any;
      case 'medical-records':
        return this.medicalRecordsService as any;
      case 'telemedicine':
        return this.telemedicineService as any;
      case 'hipaa-compliance':
        return this.hipaaAuditService as any;
      case 'treatment-planning':
        return this.treatmentPlanService as any;
      case 'insurance-verification':
        return this.insuranceVerificationService as any;
      case 'prescription-management':
        return this.prescriptionTrackingService as any;
      // Phase 4: AI Features
      case 'ai-symptom-checker':
        return this.symptomCheckerService as any;
      case 'ai-treatment-recommendation':
        return this.treatmentRecommendationService as any;
      case 'ai-clinical-note-summarization':
        return this.clinicalNoteSummarizationService as any;
      default:
        return undefined;
    }
  }

  /**
   * Check if a feature is enabled
   */
  isFeatureEnabled(featureId: string): boolean {
    switch (featureId) {
      case 'patient-intake':
        return !!this.healthcareConfig.patientIntake;
      case 'appointment-scheduling':
        return !!this.healthcareConfig.appointments;
      case 'medical-records':
        return !!this.healthcareConfig.medicalRecords;
      case 'telemedicine':
        return !!this.healthcareConfig.telemedicine;
      case 'hipaa-compliance':
        return !!this.healthcareConfig.hipaaCompliance;
      case 'treatment-planning':
        return !!this.healthcareConfig.treatmentPlanning;
      case 'insurance-verification':
        return !!this.healthcareConfig.insuranceVerification;
      case 'prescription-management':
        return !!this.healthcareConfig.prescriptionManagement;
      // Phase 4: AI Features
      case 'ai-symptom-checker':
        return !!this.healthcareConfig.aiSymptomChecker;
      case 'ai-treatment-recommendation':
        return !!this.healthcareConfig.aiTreatmentRecommendation;
      case 'ai-clinical-note-summarization':
        return !!this.healthcareConfig.aiClinicalNoteSummarization;
      default:
        return false;
    }
  }

  /**
   * Cleanup and dispose of all resources
   */
  async dispose(): Promise<void> {
    // Cleanup Phase 3 services
    if (this.hipaaAuditService?.dispose) {
      await this.hipaaAuditService.dispose();
    }
    if (this.treatmentPlanService?.dispose) {
      await this.treatmentPlanService.dispose();
    }
    if (this.insuranceVerificationService?.dispose) {
      await this.insuranceVerificationService.dispose();
    }
    if (this.prescriptionTrackingService?.dispose) {
      await this.prescriptionTrackingService.dispose();
    }
  }

  /**
   * Register data resolvers for dashboard widgets
   */
  private registerDataResolvers(): void {
    // Register static data resolver for simple widgets
    this.dashboardEngine.registerDataResolver('static', {
      resolve: async (config, context) => ({
        widgetId: config.query || 'static',
        data: config.params || {},
        cachedAt: new Date(),
      }),
    });

    // Register entity resolver for database entities
    this.dashboardEngine.registerDataResolver('entity', {
      resolve: async (config, context) => ({
        widgetId: config.entity || 'entity',
        data: {
          entity: config.entity,
          filter: config.filter,
          storeId: context.storeId,
        },
        cachedAt: new Date(),
      }),
    });

    // Register analytics resolver
    this.dashboardEngine.registerDataResolver('analytics', {
      resolve: async (config, context) => ({
        widgetId: config.query || 'analytics',
        data: {
          query: config.query,
          params: config.params,
          storeId: context.storeId,
        },
        cachedAt: new Date(),
      }),
    });

    // Register realtime resolver
    this.dashboardEngine.registerDataResolver('realtime', {
      resolve: async (config, context) => ({
        widgetId: config.channel || 'realtime',
        data: {
          channel: config.channel,
          storeId: context.storeId,
        },
        cachedAt: new Date(),
      }),
    });
  }
}

export class HealthcareEngineFactory {
  static create(config?: HealthcareEngineConfig): HealthcareEngine {
    return new HealthcareEngine(config);
  }

  static createDefault(): HealthcareEngine {
    return new HealthcareEngine({
      patientIntake: true,
      appointments: true,
      medicalRecords: true,
      telemedicine: true,
      hipaaCompliance: true,
    });
  }
}

export function createDefaultHealthcareConfig(): HealthcareEngineConfig {
  return {
    patientIntake: true,
    appointments: true,
    medicalRecords: true,
    telemedicine: true,
    hipaaCompliance: true,
  };
}
