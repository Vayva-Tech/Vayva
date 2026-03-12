/**
 * @vayva/industry-healthcare - Unified Healthcare Industry Package
 * 
 * Complete healthcare industry solution including:
 * - Patient Intake & Scheduling
 * - Appointment Management
 * - Medical Records (EHR)
 * - Telemedicine
 * - HIPAA Compliance
 * - Treatment Planning
 * - Insurance Verification
 */

// Main engine
export {
  HealthcareEngine,
  HealthcareEngineFactory,
  createDefaultHealthcareConfig,
  type HealthcareEngineConfig,
  type HealthcareFeatureId,
  type HealthcareEngineStatus,
} from './healthcare.engine.js';

// Types
export * from './types';

// Services (selective exports to avoid duplicates)
export {
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
} from './services';

export type {
  AppointmentFilters,
  TimeSlot,
  TelemedicineSessionParams,
  MedicalRecordCategory,
  DocumentFormat,
  AuditLogEntry,
  ComplianceReport,
  TreatmentGoal,
  Intervention,
  MedicationPlan,
  TreatmentPlanData,
  InsuranceVerificationData,
  EligibilityResponse,
  PrescriptionData,
  DrugInteractionCheck,
  // Phase 4: AI Types
  SymptomCheckInput,
  TreatmentRecommendationInput,
  ClinicalNoteInput,
} from './services';

// Dashboard Configuration
export {
  HEALTHCARE_DASHBOARD_CONFIG,
} from './dashboard/healthcare-dashboard.config.js';

// Dashboard Components
export * from './dashboard';
export { HealthcareDashboard } from './dashboard/HealthcareDashboard';

// Components (to be created)
// export * from './components';

// Features (to be created)
// export * from './features';

export const VERSION = '0.0.1';

export const PACKAGE_INFO = {
  name: '@vayva/industry-healthcare',
  version: VERSION,
  description: 'Vayva Healthcare Industry Engine',
  industries: ['healthcare', 'medical', 'wellness', 'telemedicine'],
} as const;
