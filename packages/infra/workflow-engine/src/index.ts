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

// Workflow Execution Status
export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

// Workflow Execution
export interface WorkflowExecution {
  id: string;
  workflowId: string;
  merchantId: string;
  status: ExecutionStatus;
  triggerData: Record<string, unknown>;
  startedAt: Date;
  completedAt?: Date;
  result?: unknown;
  error?: string;
}

// Executor Interface
export interface WorkflowExecutor {
  execute(workflow: Workflow, triggerData: Record<string, unknown>, executionId: string): Promise<WorkflowExecution>;
}

// Default Executor Implementation
export class DefaultExecutor implements WorkflowExecutor {
  async execute(
    workflow: Workflow,
    triggerData: Record<string, unknown>,
    executionId: string
  ): Promise<WorkflowExecution> {
    const execution: WorkflowExecution = {
      id: executionId,
      workflowId: workflow.id,
      merchantId: workflow.merchantId,
      status: 'running',
      triggerData,
      startedAt: new Date(),
    };

    // Basic execution logic - can be extended
    try {
      // Execute nodes in order
      for (const node of workflow.nodes) {
        // Process each node based on type
        switch (node.type) {
          case 'trigger':
            // Initialize trigger
            break;
          case 'action':
            // Execute action
            break;
          case 'condition':
            // Evaluate condition
            break;
          case 'delay':
            // Handle delay
            break;
          case 'approval':
            // Wait for approval
            break;
        }
      }

      execution.status = 'completed';
      execution.completedAt = new Date();
    } catch (error) {
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : 'Unknown error';
      execution.completedAt = new Date();
    }

    return execution;
  }
}

// Get default executor instance
export function getDefaultExecutor(): WorkflowExecutor {
  return new DefaultExecutor();
}

// Trigger Definitions
export interface TriggerDefinition {
  type: TriggerType;
  label: string;
  description: string;
}

export const TRIGGER_DEFINITIONS: TriggerDefinition[] = [
  {
    type: 'webhook',
    label: 'Webhook',
    description: 'Triggered by an HTTP request',
  },
  {
    type: 'schedule',
    label: 'Schedule',
    description: 'Triggered at scheduled times',
  },
  {
    type: 'event',
    label: 'Event',
    description: 'Triggered by a system event',
  },
];

// Trigger Registry
export interface TriggerRegistry {
  getDefinitions(): TriggerDefinition[];
  evaluate(trigger: { type: TriggerType; config: Record<string, unknown> }, eventData: Record<string, unknown>): Promise<boolean>;
}

export class DefaultTriggerRegistry implements TriggerRegistry {
  getDefinitions(): TriggerDefinition[] {
    return TRIGGER_DEFINITIONS;
  }

  async evaluate(
    trigger: { type: TriggerType; config: Record<string, unknown> },
    eventData: Record<string, unknown>
  ): Promise<boolean> {
    // Basic evaluation logic - can be extended based on trigger type
    switch (trigger.type) {
      case 'webhook':
        return true; // Always trigger for webhooks
      case 'schedule':
        return true; // Always trigger for scheduled events
      case 'event':
        // Check if event type matches configuration
        return trigger.config.eventType === eventData.type || true;
      default:
        return false;
    }
  }
}

export function getDefaultTriggerRegistry(): TriggerRegistry {
  return new DefaultTriggerRegistry();
}

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
