/**
 * Education Registry
 *
 * Central registry of all template education maps.
 */

import { RetailSellingEducation } from "./templates/retail-selling";
import { SoloServicesEducation } from "./templates/solo-services";

export interface EducationMap {
  templateId: string;
  templateName: string;
  workflows: {
    [workflowId: string]: {
      emptyState?: {
        primary: string;
        secondary?: string;
      };
      firstAction?: {
        guidanceId: string;
        message: string;
        trigger: string;
      };
      workflowStall?: {
        guidanceId: string;
        trigger: string;
        message: string;
      };
      explanations?: {
        [key: string]: string;
      };
    };
  };
}

/**
 * Template Education Registry
 */
export const EducationRegistry: Record<string, EducationMap> = {
  "simple-retail": RetailSellingEducation,
  "solo-services": SoloServicesEducation,
  // Additional templates will be added here
};

/**
 * Get education map for template
 */
export function getTemplateEducation(templateId: string): EducationMap | null {
  return EducationRegistry[templateId] || null;
}

/**
 * Get workflow guidance
 */
export function getWorkflowGuidance(
  templateId: string,
  workflowId: string,
): EducationMap["workflows"][string] | null {
  const education = getTemplateEducation(templateId);
  return education?.workflows[workflowId] || null;
}

/**
 * Get empty state guidance
 */
export function getEmptyStateGuidance(
  templateId: string,
  workflowId: string,
): { primary: string; secondary?: string } | null {
  const workflow = getWorkflowGuidance(templateId, workflowId);
  return workflow?.emptyState || null;
}

/**
 * Get first action hint
 */
export function getFirstActionHint(
  templateId: string,
  workflowId: string,
): { guidanceId: string; message: string; trigger: string } | null {
  const workflow = getWorkflowGuidance(templateId, workflowId);
  return workflow?.firstAction || null;
}

/**
 * Get workflow stall nudge
 */
export function getWorkflowStallNudge(
  templateId: string,
  workflowId: string,
): { guidanceId: string; trigger: string; message: string } | null {
  const workflow = getWorkflowGuidance(templateId, workflowId);
  return workflow?.workflowStall || null;
}

/**
 * Get explanation
 */
export function getExplanation(
  templateId: string,
  workflowId: string,
  key: string,
): string | null {
  const workflow = getWorkflowGuidance(templateId, workflowId);
  return workflow?.explanations?.[key] || null;
}
