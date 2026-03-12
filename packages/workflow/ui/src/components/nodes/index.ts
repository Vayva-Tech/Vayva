/**
 * Node Components
 * Custom React Flow node components
 */

import type { NodeTypes } from '@xyflow/react';
import { TriggerNode } from './TriggerNode.js';
import { ActionNode } from './ActionNode.js';
import { ConditionNode } from './ConditionNode.js';
import { LogicNode } from './LogicNode.js';
import { AINode } from './AINode.js';
import { IndustryNode } from './IndustryNode.js';

export const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  condition: ConditionNode,
  delay: LogicNode,
  split: LogicNode,
  merge: LogicNode,
  loop: LogicNode,
  send_email: ActionNode,
  send_sms: ActionNode,
  send_whatsapp: ActionNode,
  send_push: ActionNode,
  update_inventory: ActionNode,
  create_task: ActionNode,
  update_customer: ActionNode,
  apply_discount: ActionNode,
  tag_customer: ActionNode,
  create_purchase_order: ActionNode,
  update_collection: ActionNode,
  filter_customers: ActionNode,
  query_menu_items: ActionNode,
  query_tables: ActionNode,
  send_notification: ActionNode,
  ai_classify: AINode,
  ai_generate: AINode,
  ai_summarize: AINode,
  ai_extract: AINode,
  fashion_size_alert: IndustryNode,
  restaurant_86_item: IndustryNode,
  realestate_schedule_showing: IndustryNode,
  healthcare_send_reminder: IndustryNode,
};

export { TriggerNode } from './TriggerNode.js';
export { ActionNode } from './ActionNode.js';
export { ConditionNode } from './ConditionNode.js';
export { LogicNode } from './LogicNode.js';
export { AINode } from './AINode.js';
export { IndustryNode } from './IndustryNode.js';
