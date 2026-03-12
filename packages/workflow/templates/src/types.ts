/**
 * Workflow Template Types
 */

import type { Workflow, WorkflowTemplate } from '@vayva/workflow-engine';

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  templates: WorkflowTemplate[];
}

export interface TemplateGalleryProps {
  industry?: string;
  onSelect: (template: WorkflowTemplate) => void;
  className?: string;
}

export { type Workflow, type WorkflowTemplate } from '@vayva/workflow-engine';
