// @ts-nocheck
export { AppointmentService } from './appointment-service';
export type { AppointmentFilters, TimeSlot } from './appointment-service';

export { TelemedicineService } from './telemedicine-service';
export type { TelemedicineSessionParams } from './telemedicine-service';

export { PatientSchedulingService } from './patient-scheduling-service';
export type { 
  SchedulingPriority, 
  SchedulingConstraints, 
  SchedulingPreferences,
  ConflictResolutionStrategy,
  SchedulingResult,
  SchedulingConflict,
  TimeSlot as SchedulingTimeSlot,
  WaitlistEntry,
  ResourceAllocation
} from './patient-scheduling-service';

export { MedicalRecordsService } from './medical-records-service';
export type {
  MedicalRecordCategory,
  DocumentFormat,
  MedicalRecordQuery,
  DocumentAttachment,
  LabResult,
  VitalSigns,
  Immunization,
  Allergy,
  MedicationHistory,
  MedicalRecordVersion,
  AccessLog
} from './medical-records-service';

// Phase 3: HIPAA Compliance & Advanced Features
export { HIPAAAuditService } from './hipaa-audit-service';
export type {
  AuditLogEntry,
  ComplianceReport,
  AuditLogSchema,
  ComplianceReportSchema
} from './hipaa-audit-service';

export { TreatmentPlanService } from './treatment-plan-service';
export type {
  TreatmentGoal,
  Intervention,
  MedicationPlan,
  TreatmentPlanData,
  TreatmentPlanSchema
} from './treatment-plan-service';

export { InsuranceVerificationService } from './insurance-verification-service';
export type {
  InsuranceVerificationData,
  EligibilityResponse,
  InsuranceVerificationSchema
} from './insurance-verification-service';

export { PrescriptionTrackingService } from './prescription-tracking-service';
export type {
  PrescriptionData,
  DrugInteractionCheck,
  PrescriptionSchema
} from './prescription-tracking-service';

// Phase 4: AI-Powered Services
export { SymptomCheckerService } from './symptom-checker.service';
export type { SymptomCheckInput } from './symptom-checker.service';

export { TreatmentRecommendationService } from './treatment-recommendation.service';
export type { TreatmentRecommendationInput } from './treatment-recommendation.service';

export { ClinicalNoteSummarizationService } from './clinical-note-summarization.service';
export type { ClinicalNoteInput } from './clinical-note-summarization.service';
