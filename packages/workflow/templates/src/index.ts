/**
 * @vayva/workflow-templates
 * Industry-specific workflow templates for VAYVA
 */

// Fashion templates
export {
  FASHION_WORKFLOW_TEMPLATES,
  getFashionTemplates,
  getFashionTemplateById,
} from './fashion-workflows.js';

// Restaurant templates
export {
  RESTAURANT_WORKFLOW_TEMPLATES,
  getRestaurantTemplates,
  getRestaurantTemplateById,
} from './restaurant-workflows.js';

// Healthcare templates
export {
  HEALTHCARE_WORKFLOW_TEMPLATES,
  getHealthcareTemplates,
  getHealthcareTemplateById,
} from './healthcare-workflows.js';

// Real Estate templates
export {
  REALESTATE_WORKFLOW_TEMPLATES,
  getRealestateTemplates,
  getRealestateTemplateById,
} from './realestate-workflows.js';

// Types
export type { TemplateCategory, TemplateGalleryProps } from './types.js';

// Combined exports
import type { WorkflowTemplate } from '@vayva/workflow-engine';
import { FASHION_WORKFLOW_TEMPLATES } from './fashion-workflows.js';
import { RESTAURANT_WORKFLOW_TEMPLATES } from './restaurant-workflows.js';
import { HEALTHCARE_WORKFLOW_TEMPLATES } from './healthcare-workflows.js';
import { REALESTATE_WORKFLOW_TEMPLATES } from './realestate-workflows.js';

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
