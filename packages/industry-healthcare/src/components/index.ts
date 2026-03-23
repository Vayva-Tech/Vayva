// @ts-nocheck
/**
 * Healthcare Components
 * Re-export all UI components
 */

export { PatientIntakeForms } from './patient-intake/PatientIntakeForms';
export type { PatientIntakeFormData, PatientIntakeFormsProps } from './patient-intake/PatientIntakeForms';

export { HIPAAComplianceTracker } from './hipaa-compliance/HIPAAComplianceTracker';
export type { HIPAAComplianceTrackerProps } from './hipaa-compliance/HIPAAComplianceTracker';

export { TreatmentPlanBuilder } from './treatment-plan/TreatmentPlanBuilder';
export type { 
  TreatmentPlanBuilderProps, 
  TreatmentPlanData,
  TreatmentGoal,
  TreatmentIntervention 
} from './treatment-plan/TreatmentPlanBuilder';

export { InsuranceVerification } from './insurance-verification/InsuranceVerification';
export type { 
  InsuranceVerificationProps,
  EligibilityRequest,
  EligibilityResponse 
} from './insurance-verification/InsuranceVerification';

export { MedicalRecordsViewer } from './medical-records/MedicalRecordsViewer';
export type { 
  MedicalRecordsViewerProps,
  MedicalRecord 
} from './medical-records/MedicalRecordsViewer';
