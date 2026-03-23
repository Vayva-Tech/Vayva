// @ts-nocheck
/**
 * Applications Feature Module
 * Dedicated module for application management functionality
 */

export * from '../../services/application-service';

export interface ApplicationFeatureConfig {
  enableDocumentUpload: boolean;
  requirePhoneVerification: boolean;
  enableAutoResponse: boolean;
  defaultReviewTimeHours: number;
  enableInterviewScheduling: boolean;
}

export const DEFAULT_APPLICATION_CONFIG: ApplicationFeatureConfig = {
  enableDocumentUpload: true,
  requirePhoneVerification: false,
  enableAutoResponse: true,
  defaultReviewTimeHours: 48,
  enableInterviewScheduling: true,
};