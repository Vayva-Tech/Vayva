// Workflow Engine - Core Types and Utilities

// Trigger Types
export type TriggerType = 'webhook' | 'schedule' | 'event';

// Industry Slugs
export type IndustrySlug = 
  | 'fashion'
  | 'restaurant'
  | 'retail'
  | 'beauty'
  | 'healthcare'
  | 'real-estate'
  | 'automotive'
  | 'events'
  | 'nightlife'
  | 'blog'
  | 'education'
  | 'saas'
  | 'creative'
  | 'grocery'
  | 'kitchen'
  | 'legal'
  | 'marketplace'
  | 'nonprofit'
  | 'professional-services'
  | 'travel'
  | 'wellness'
  | 'wholesale';

// Node Types
export type NodeType = 
  | 'trigger'
  | 'action'
  | 'condition'
  | 'delay'
  | 'approval';

// Workflow Node
export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: {
    x: number;
    y: number;
  };
  data: Record<string, unknown>;
}

// Workflow Edge
export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  condition?: {
    type: 'true' | 'false' | 'custom';
    expression?: string;
  };
  label?: string;
}

// Workflow Status
export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'archived';

// Workflow Definition
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  merchantId: string;
  industry: IndustrySlug;
  status: WorkflowStatus;
  version: number;
  trigger: {
    type: TriggerType;
    config: Record<string, unknown>;
  };
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Validation Result
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// Validator Interface
export interface WorkflowValidator {
  validate(workflow: Workflow): ValidationResult;
}

// Default Validator Implementation
export class DefaultValidator implements WorkflowValidator {
  validate(workflow: Workflow): ValidationResult {
    const errors: string[] = [];

    // Basic validation
    if (!workflow.name || workflow.name.length === 0) {
      errors.push('Workflow name is required');
    }

    if (!workflow.merchantId) {
      errors.push('Merchant ID is required');
    }

    if (!workflow.nodes || workflow.nodes.length === 0) {
      errors.push('At least one node is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Export default validator instance
export function getDefaultValidator(): WorkflowValidator {
  return new DefaultValidator();
}
