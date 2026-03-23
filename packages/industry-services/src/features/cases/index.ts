// @ts-nocheck
/**
 * Cases Feature Module
 * Dedicated module for case management functionality
 */

export * from '../../services/case-service';

export interface CaseFeatureConfig {
  enableSLA: boolean;
  defaultSLADays: number;
  enableNotifications: boolean;
  escalationEnabled: boolean;
  defaultPriority: 'low' | 'medium' | 'high';
}

export const DEFAULT_CASE_CONFIG: CaseFeatureConfig = {
  enableSLA: true,
  defaultSLADays: 5,
  enableNotifications: true,
  escalationEnabled: true,
  defaultPriority: 'medium',
};