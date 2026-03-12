/**
 * @vayva/workflow-engine
 * Core workflow execution engine for VAYVA
 */

// Types
export type {
  // Core workflow types
  Workflow,
  WorkflowStatus,
  WorkflowNode,
  WorkflowEdge,
  WorkflowExecution,
  WorkflowExecutionResult,
  WorkflowTemplate,
  ExecutionContext,
  
  // Trigger types
  WorkflowTrigger,
  TriggerType,
  TriggerConfig,
  OrderTriggerConfig,
  InventoryTriggerConfig,
  ScheduleTriggerConfig,
  WebhookTriggerConfig,
  ManualTriggerConfig,
  CustomerSegmentConfig,
  AIIntentConfig,
  TriggerHandler,
  
  // Node types
  NodeType,
  NodeData,
  NodeDefinition,
  NodeInput,
  NodeOutput,
  NodeExecutor,
  BaseNodeData,
  TriggerNodeData,
  ConditionNodeData,
  DelayNodeData,
  SendEmailNodeData,
  SendSMSNodeData,
  UpdateInventoryNodeData,
  CreateTaskNodeData,
  UpdateCustomerNodeData,
  ApplyDiscountNodeData,
  TagCustomerNodeData,
  AIGenerateNodeData,
  AIClassifyNodeData,
  FashionSizeAlertNodeData,
  Restaurant86ItemNodeData,
  FilterCustomersNodeData,
  QueryMenuItemsNodeData,
  QueryTablesNodeData,
  SendNotificationNodeData,
  CreatePurchaseOrderNodeData,
  UpdateCollectionNodeData,
  
  // Edge types
  EdgeCondition,
  
  // Industry types
  IndustrySlug,
} from './types.js';

// Engine
export { 
  WorkflowExecutor, 
  createDefaultNodeExecutors, 
  getDefaultExecutor 
} from './engine/executor.js';

export { 
  WorkflowScheduler, 
  delay, 
  isBusinessHours, 
  nextBusinessDay 
} from './engine/scheduler.js';

// Nodes
export { 
  NODE_DEFINITIONS, 
  getNodeDefinition, 
  getNodesByCategory, 
  getNodesByIndustry,
  getAllNodeTypes,
  isValidNodeType 
} from './nodes/registry.js';

// Triggers
export { 
  TRIGGER_DEFINITIONS,
  TriggerRegistry, 
  createDefaultTriggerHandlers,
  getDefaultTriggerRegistry 
} from './triggers/registry.js';

// Validation
export { 
  WorkflowValidator, 
  getDefaultValidator 
} from './validation/workflow-validator.js';

// Re-export types from validation
export type { ValidationError, ValidationResult } from './validation/workflow-validator.js';
