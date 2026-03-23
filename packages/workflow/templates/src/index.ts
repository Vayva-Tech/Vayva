/**
 * @vayva/workflow-templates
 * Industry-specific workflow templates for VAYVA
 */

// Fashion templates
export {
  FASHION_WORKFLOW_TEMPLATES,
  getFashionTemplates,
  getFashionTemplateById,
} from './fashion-workflows';

// Restaurant templates
export {
  RESTAURANT_WORKFLOW_TEMPLATES,
  getRestaurantTemplates,
  getRestaurantTemplateById,
} from './restaurant-workflows';

// Healthcare templates
export {
  HEALTHCARE_WORKFLOW_TEMPLATES,
  getHealthcareTemplates,
  getHealthcareTemplateById,
} from './healthcare-workflows';

// Real Estate templates
export {
  REALESTATE_WORKFLOW_TEMPLATES,
  getRealestateTemplates,
  getRealestateTemplateById,
} from './realestate-workflows';

// Types
export type { TemplateCategory, TemplateGalleryProps } from './types';

// Combined exports
import type { WorkflowTemplate } from '@vayva/workflow-engine';
import { FASHION_WORKFLOW_TEMPLATES } from './fashion-workflows';
import { RESTAURANT_WORKFLOW_TEMPLATES } from './restaurant-workflows';
import { HEALTHCARE_WORKFLOW_TEMPLATES } from './healthcare-workflows';
import { REALESTATE_WORKFLOW_TEMPLATES } from './realestate-workflows';

export const ALL_TEMPLATES: WorkflowTemplate[] = [
  ...FASHION_WORKFLOW_TEMPLATES,
  ...RESTAURANT_WORKFLOW_TEMPLATES,
  ...HEALTHCARE_WORKFLOW_TEMPLATES,
  ...REALESTATE_WORKFLOW_TEMPLATES,
];

export function getAllTemplates(): WorkflowTemplate[] {
  return ALL_TEMPLATES;
}

export function getTemplatesByIndustry(industry: string): WorkflowTemplate[] {
  return ALL_TEMPLATES.filter((t) => t.industry === industry);
}

export function getTemplateById(id: string): WorkflowTemplate | undefined {
  return ALL_TEMPLATES.find((t) => t.id === id);
}
