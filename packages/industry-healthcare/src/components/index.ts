/**
 * Healthcare Components
 * Re-export all UI components
 */

export { PatientIntakeForms } from './patient-intake/PatientIntakeForms.js';
export type { PatientIntakeFormData, PatientIntakeFormsProps } from './patient-intake/PatientIntakeForms.js';

export { HIPAAComplianceTracker } from './hipaa-compliance/HIPAAComplianceTracker.js';
export type { HIPAAComplianceTrackerProps } from './hipaa-compliance/HIPAAComplianceTracker.js';

export { TreatmentPlanBuilder } from './treatment-plan/TreatmentPlanBuilder.js';
export type { 
  TreatmentPlanBuilderProps, 
  TreatmentPlanData,
  TreatmentGoal,
  TreatmentIntervention 
} from './treatment-plan/TreatmentPlanBuilder.js';

export { InsuranceVerification } from './insurance-verification/InsuranceVerification.js';
export type { 
  InsuranceVerificationProps,
  EligibilityRequest,
  EligibilityResponse 
} from './insurance-verification/InsuranceVerification.js';

export { MedicalRecordsViewer } from './medical-records/MedicalRecordsViewer.js';
export type { 
  MedicalRecordsViewerProps,
  MedicalRecord 
} from './medical-records/MedicalRecordsViewer.js';
