/**
 * Workflow Engine Types
 * Core type definitions for the visual workflow builder
 */

export type IndustrySlug = 
  | 'fashion' 
  | 'restaurant' 
  | 'healthcare' 
  | 'realestate' 
  | 'retail' 
  | 'grocery' 
  | 'events' 
  | 'b2b';

export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'archived';

export type TriggerType =
  | 'order_created'
  | 'order_paid'
  | 'order_cancelled'
  | 'inventory_low'
  | 'customer_segment_entered'
  | 'customer_segment_exited'
  | 'schedule'
  | 'webhook'
  | 'manual'
  | 'ai_intent_detected'
  | 'product_added'
  | 'product_updated'
  | 'customer_created'
  | 'payment_received'
  | 'refund_requested';

export type NodeType =
  // Logic
  | 'condition'
  | 'delay'
  | 'split'
  | 'merge'
  | 'loop'
  // Actions
  | 'send_email'
  | 'send_sms'
  | 'send_whatsapp'
  | 'send_push'
  | 'update_inventory'
  | 'create_task'
  | 'update_customer'
  | 'apply_discount'
  | 'tag_customer'
  | 'create_purchase_order'
  | 'update_collection'
  | 'filter_customers'
  | 'query_menu_items'
  | 'query_tables'
  | 'send_notification'
  // Industry-specific
  | 'fashion_size_alert'
  | 'restaurant_86_item'
  | 'realestate_schedule_showing'
  | 'healthcare_send_reminder'
  // AI
  | 'ai_classify'
  | 'ai_generate'
  | 'ai_summarize'
  | 'ai_extract'
  // Trigger
  | 'trigger';

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  industry: IndustrySlug;
  merchantId: string;
  trigger: WorkflowTrigger;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  status: WorkflowStatus;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface WorkflowTrigger {
  type: TriggerType;
  config: TriggerConfig;
}

export type TriggerConfig =
  | OrderTriggerConfig
  | InventoryTriggerConfig
  | ScheduleTriggerConfig
  | WebhookTriggerConfig
  | ManualTriggerConfig
  | CustomerSegmentConfig
  | AIIntentConfig;

export interface OrderTriggerConfig {
  orderStatus?: 'pending' | 'paid' | 'fulfilled' | 'cancelled';
  minAmount?: number;
  maxAmount?: number;
  productTags?: string[];
}

export interface InventoryTriggerConfig {
  thresholdType: 'overall' | 'size_specific' | 'variant_specific';
  minQuantity: number;
  productIds?: string[];
  categoryIds?: string[];
  entity?: 'product' | 'ingredient' | 'variant';
}

export interface ScheduleTriggerConfig {
  cron?: string;
  interval?: string;
  timezone?: string;
}

export interface WebhookTriggerConfig {
  endpoint: string;
  secret?: string;
  method?: 'POST' | 'PUT' | 'PATCH';
}

export interface ManualTriggerConfig {
  allowBulkExecution?: boolean;
}

export interface CustomerSegmentConfig {
  segmentId: string;
  segmentName?: string;
}

export interface AIIntentConfig {
  intent: string;
  confidenceThreshold?: number;
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: NodeData;
}

export type NodeData =
  | TriggerNodeData
  | ConditionNodeData
  | DelayNodeData
  | SendEmailNodeData
  | SendSMSNodeData
  | UpdateInventoryNodeData
  | CreateTaskNodeData
  | UpdateCustomerNodeData
  | ApplyDiscountNodeData
  | TagCustomerNodeData
  | AIGenerateNodeData
  | AIClassifyNodeData
  | FashionSizeAlertNodeData
  | Restaurant86ItemNodeData
  | FilterCustomersNodeData
  | QueryMenuItemsNodeData
  | QueryTablesNodeData
  | SendNotificationNodeData
  | CreatePurchaseOrderNodeData
  | UpdateCollectionNodeData;

export interface BaseNodeData {
  label: string;
  description?: string;
}

export interface TriggerNodeData extends BaseNodeData {
  triggerType: TriggerType;
}

export interface ConditionNodeData extends BaseNodeData {
  condition: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'starts_with' | 'ends_with' | 'in' | 'not_in';
  field: string;
  value: string | number | boolean | string[];
}

export interface DelayNodeData extends BaseNodeData {
  delay: string;
  delayType: 'fixed' | 'until_time' | 'business_hours';
}

export interface SendEmailNodeData extends BaseNodeData {
  template?: string;
  to?: string;
  subject?: string;
  body?: string;
  includeLookbook?: boolean;
}

export interface SendSMSNodeData extends BaseNodeData {
  template?: string;
  to?: string;
  message?: string;
}

export interface UpdateInventoryNodeData extends BaseNodeData {
  productId?: string;
  quantity?: number;
  operation: 'set' | 'add' | 'subtract';
}

export interface CreateTaskNodeData extends BaseNodeData {
  title: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface UpdateCustomerNodeData extends BaseNodeData {
  tags?: string[];
  segment?: string;
  metadata?: Record<string, unknown>;
}

export interface ApplyDiscountNodeData extends BaseNodeData {
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number;
  code?: string;
  expiry?: string;
}

export interface TagCustomerNodeData extends BaseNodeData {
  tags: string[];
  operation: 'add' | 'remove' | 'set';
}

export interface AIGenerateNodeData extends BaseNodeData {
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  outputVariable: string;
}

export interface AIClassifyNodeData extends BaseNodeData {
  input: string;
  categories: string[];
  outputVariable: string;
}

export interface FashionSizeAlertNodeData extends BaseNodeData {
  size: string;
  threshold: number;
  notifyChannels: ('email' | 'sms' | 'push')[];
}

export interface Restaurant86ItemNodeData extends BaseNodeData {
  notifyKitchen: boolean;
  updateOnlineMenus: boolean;
  reason?: string;
}

export interface FilterCustomersNodeData extends BaseNodeData {
  segment: string;
  filters?: Record<string, unknown>;
}

export interface QueryMenuItemsNodeData extends BaseNodeData {
  query: string;
  filter?: Record<string, unknown>;
}

export interface QueryTablesNodeData extends BaseNodeData {
  filter: string;
}

export interface SendNotificationNodeData extends BaseNodeData {
  channels: ('kds' | 'mobile_app' | 'email' | 'sms')[];
  message: string;
}

export interface CreatePurchaseOrderNodeData extends BaseNodeData {
  quantity: string;
  vendor: string;
  notes?: string;
}

export interface UpdateCollectionNodeData extends BaseNodeData {
  visibility: 'public' | 'private' | 'scheduled';
  scheduleDate?: string;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  condition?: EdgeCondition;
  label?: string;
  animated?: boolean;
  style?: Record<string, unknown>;
}

export interface EdgeCondition {
  type: 'true' | 'false' | 'custom';
  expression?: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  merchantId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  triggerData: Record<string, unknown>;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  results: WorkflowExecutionResult[];
}

export interface WorkflowExecutionResult {
  nodeId: string;
  nodeType: NodeType;
  status: 'success' | 'failed' | 'skipped';
  output?: Record<string, unknown>;
  error?: string;
  startedAt: Date;
  completedAt: Date;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  industry: IndustrySlug;
  description: string;
  trigger: WorkflowTrigger;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  tags?: string[];
}

export interface NodeDefinition {
  type: NodeType;
  category: 'logic' | 'action' | 'ai' | 'industry' | 'trigger';
  label: string;
  description: string;
  icon?: string;
  inputs: NodeInput[];
  outputs: NodeOutput[];
  industries?: IndustrySlug[];
  configSchema?: Record<string, unknown>;
}

export interface NodeInput {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description?: string;
}

export interface NodeOutput {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
}

export interface ExecutionContext {
  workflow: Workflow;
  execution: WorkflowExecution;
  variables: Map<string, unknown>;
  merchantId: string;
}

export type NodeExecutor = (
  node: WorkflowNode,
  context: ExecutionContext
) => Promise<Record<string, unknown> | void>;

export type TriggerHandler = (
  trigger: WorkflowTrigger,
  eventData: Record<string, unknown>
) => Promise<boolean>;
