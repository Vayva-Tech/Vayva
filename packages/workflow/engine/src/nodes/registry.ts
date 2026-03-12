/**
 * Node Registry
 * Central registry for all workflow node types and their definitions
 */

import type { NodeDefinition, NodeType, IndustrySlug } from '../types.js';

export const NODE_DEFINITIONS: Record<NodeType, NodeDefinition> = {
  // Trigger
  trigger: {
    type: 'trigger',
    category: 'trigger',
    label: 'Trigger',
    description: 'Workflow starting point',
    inputs: [],
    outputs: [{ name: 'output', type: 'object', description: 'Trigger event data' }],
  },

  // Logic nodes
  condition: {
    type: 'condition',
    category: 'logic',
    label: 'Condition',
    description: 'Branch workflow based on a condition',
    inputs: [{ name: 'input', type: 'object', required: true, description: 'Input data to evaluate' }],
    outputs: [
      { name: 'true', type: 'object', description: 'True branch' },
      { name: 'false', type: 'object', description: 'False branch' },
    ],
  },
  delay: {
    type: 'delay',
    category: 'logic',
    label: 'Delay',
    description: 'Wait for a specified time',
    inputs: [{ name: 'input', type: 'object', required: true, description: 'Input data' }],
    outputs: [{ name: 'output', type: 'object', description: 'Delayed output' }],
  },
  split: {
    type: 'split',
    category: 'logic',
    label: 'Split',
    description: 'Split workflow into parallel branches',
    inputs: [{ name: 'input', type: 'object', required: true, description: 'Input data' }],
    outputs: [{ name: 'branches', type: 'array', description: 'Parallel branch outputs' }],
  },
  merge: {
    type: 'merge',
    category: 'logic',
    label: 'Merge',
    description: 'Merge parallel branches back together',
    inputs: [{ name: 'branches', type: 'array', required: true, description: 'Branch outputs to merge' }],
    outputs: [{ name: 'output', type: 'object', description: 'Merged output' }],
  },
  loop: {
    type: 'loop',
    category: 'logic',
    label: 'Loop',
    description: 'Iterate over a collection',
    inputs: [
      { name: 'input', type: 'object', required: true, description: 'Input data' },
      { name: 'collection', type: 'array', required: true, description: 'Collection to iterate' },
    ],
    outputs: [
      { name: 'item', type: 'object', description: 'Current iteration item' },
      { name: 'completed', type: 'object', description: 'Loop completion output' },
    ],
  },

  // Action nodes
  send_email: {
    type: 'send_email',
    category: 'action',
    label: 'Send Email',
    description: 'Send an email to a customer or team member',
    inputs: [{ name: 'input', type: 'object', required: false, description: 'Context data for email template' }],
    outputs: [{ name: 'output', type: 'object', description: 'Email send result' }],
  },
  send_sms: {
    type: 'send_sms',
    category: 'action',
    label: 'Send SMS',
    description: 'Send an SMS message',
    inputs: [{ name: 'input', type: 'object', required: false, description: 'Context data for SMS' }],
    outputs: [{ name: 'output', type: 'object', description: 'SMS send result' }],
  },
  send_whatsapp: {
    type: 'send_whatsapp',
    category: 'action',
    label: 'Send WhatsApp',
    description: 'Send a WhatsApp message',
    inputs: [{ name: 'input', type: 'object', required: false, description: 'Context data for WhatsApp' }],
    outputs: [{ name: 'output', type: 'object', description: 'WhatsApp send result' }],
  },
  send_push: {
    type: 'send_push',
    category: 'action',
    label: 'Send Push Notification',
    description: 'Send a push notification',
    inputs: [{ name: 'input', type: 'object', required: false, description: 'Context data for push' }],
    outputs: [{ name: 'output', type: 'object', description: 'Push notification result' }],
  },
  update_inventory: {
    type: 'update_inventory',
    category: 'action',
    label: 'Update Inventory',
    description: 'Update product inventory levels',
    inputs: [
      { name: 'productId', type: 'string', required: true, description: 'Product ID' },
      { name: 'quantity', type: 'number', required: true, description: 'Quantity change' },
    ],
    outputs: [{ name: 'output', type: 'object', description: 'Inventory update result' }],
  },
  create_task: {
    type: 'create_task',
    category: 'action',
    label: 'Create Task',
    description: 'Create a task for a team member',
    inputs: [
      { name: 'title', type: 'string', required: true, description: 'Task title' },
      { name: 'assignee', type: 'string', required: false, description: 'Assignee user ID' },
    ],
    outputs: [{ name: 'output', type: 'object', description: 'Created task' }],
  },
  update_customer: {
    type: 'update_customer',
    category: 'action',
    label: 'Update Customer',
    description: 'Update customer information',
    inputs: [
      { name: 'customerId', type: 'string', required: true, description: 'Customer ID' },
      { name: 'data', type: 'object', required: true, description: 'Customer data to update' },
    ],
    outputs: [{ name: 'output', type: 'object', description: 'Updated customer' }],
  },
  apply_discount: {
    type: 'apply_discount',
    category: 'action',
    label: 'Apply Discount',
    description: 'Apply a discount to an order or customer',
    inputs: [
      { name: 'targetId', type: 'string', required: true, description: 'Order or customer ID' },
      { name: 'discountCode', type: 'string', required: false, description: 'Discount code' },
    ],
    outputs: [{ name: 'output', type: 'object', description: 'Discount application result' }],
  },
  tag_customer: {
    type: 'tag_customer',
    category: 'action',
    label: 'Tag Customer',
    description: 'Add or remove customer tags',
    inputs: [
      { name: 'customerId', type: 'string', required: true, description: 'Customer ID' },
      { name: 'tags', type: 'array', required: true, description: 'Tags to apply' },
    ],
    outputs: [{ name: 'output', type: 'object', description: 'Tag operation result' }],
  },
  create_purchase_order: {
    type: 'create_purchase_order',
    category: 'action',
    label: 'Create Purchase Order',
    description: 'Create a new purchase order',
    inputs: [
      { name: 'vendor', type: 'string', required: true, description: 'Vendor ID' },
      { name: 'items', type: 'array', required: true, description: 'Order items' },
    ],
    outputs: [{ name: 'output', type: 'object', description: 'Created purchase order' }],
  },
  update_collection: {
    type: 'update_collection',
    category: 'action',
    label: 'Update Collection',
    description: 'Update a product collection',
    inputs: [
      { name: 'collectionId', type: 'string', required: true, description: 'Collection ID' },
      { name: 'visibility', type: 'string', required: true, description: 'New visibility status' },
    ],
    outputs: [{ name: 'output', type: 'object', description: 'Updated collection' }],
  },
  filter_customers: {
    type: 'filter_customers',
    category: 'action',
    label: 'Filter Customers',
    description: 'Filter customers by criteria',
    inputs: [
      { name: 'segment', type: 'string', required: false, description: 'Segment filter' },
      { name: 'filters', type: 'object', required: false, description: 'Additional filters' },
    ],
    outputs: [{ name: 'customers', type: 'array', description: 'Filtered customers' }],
  },
  query_menu_items: {
    type: 'query_menu_items',
    category: 'action',
    label: 'Query Menu Items',
    description: 'Query menu items by criteria',
    inputs: [
      { name: 'query', type: 'string', required: true, description: 'Query string' },
      { name: 'filter', type: 'object', required: false, description: 'Additional filters' },
    ],
    outputs: [{ name: 'items', type: 'array', description: 'Menu items' }],
  },
  query_tables: {
    type: 'query_tables',
    category: 'action',
    label: 'Query Tables',
    description: 'Query restaurant tables by status',
    inputs: [{ name: 'filter', type: 'string', required: false, description: 'Table filter' }],
    outputs: [{ name: 'tables', type: 'array', description: 'Tables matching filter' }],
  },
  send_notification: {
    type: 'send_notification',
    category: 'action',
    label: 'Send Notification',
    description: 'Send notification to staff or systems',
    inputs: [
      { name: 'message', type: 'string', required: true, description: 'Notification message' },
      { name: 'channels', type: 'array', required: true, description: 'Notification channels' },
    ],
    outputs: [{ name: 'output', type: 'object', description: 'Notification result' }],
  },

  // AI nodes
  ai_classify: {
    type: 'ai_classify',
    category: 'ai',
    label: 'AI Classify',
    description: 'Classify content using AI',
    inputs: [
      { name: 'input', type: 'string', required: true, description: 'Text to classify' },
      { name: 'categories', type: 'array', required: true, description: 'Classification categories' },
    ],
    outputs: [{ name: 'classification', type: 'object', description: 'Classification result' }],
  },
  ai_generate: {
    type: 'ai_generate',
    category: 'ai',
    label: 'AI Generate',
    description: 'Generate content using AI',
    inputs: [
      { name: 'prompt', type: 'string', required: true, description: 'Generation prompt' },
      { name: 'context', type: 'object', required: false, description: 'Additional context' },
    ],
    outputs: [{ name: 'generated', type: 'string', description: 'Generated content' }],
  },
  ai_summarize: {
    type: 'ai_summarize',
    category: 'ai',
    label: 'AI Summarize',
    description: 'Summarize content using AI',
    inputs: [{ name: 'input', type: 'string', required: true, description: 'Text to summarize' }],
    outputs: [{ name: 'summary', type: 'string', description: 'Generated summary' }],
  },
  ai_extract: {
    type: 'ai_extract',
    category: 'ai',
    label: 'AI Extract',
    description: 'Extract information using AI',
    inputs: [
      { name: 'input', type: 'string', required: true, description: 'Text to extract from' },
      { name: 'fields', type: 'array', required: true, description: 'Fields to extract' },
    ],
    outputs: [{ name: 'extracted', type: 'object', description: 'Extracted data' }],
  },

  // Industry-specific nodes
  fashion_size_alert: {
    type: 'fashion_size_alert',
    category: 'industry',
    label: 'Size Stock Alert',
    description: 'Alert when specific size stock is low',
    inputs: [
      { name: 'productId', type: 'string', required: true, description: 'Product ID' },
      { name: 'size', type: 'string', required: true, description: 'Size to monitor' },
    ],
    outputs: [{ name: 'output', type: 'object', description: 'Alert result' }],
    industries: ['fashion'],
  },
  restaurant_86_item: {
    type: 'restaurant_86_item',
    category: 'industry',
    label: '86 Item',
    description: 'Mark menu items as sold out (86)',
    inputs: [
      { name: 'itemIds', type: 'array', required: true, description: 'Item IDs to 86' },
      { name: 'reason', type: 'string', required: false, description: 'Reason for 86' },
    ],
    outputs: [{ name: 'output', type: 'object', description: '86 operation result' }],
    industries: ['restaurant'],
  },
  realestate_schedule_showing: {
    type: 'realestate_schedule_showing',
    category: 'industry',
    label: 'Schedule Showing',
    description: 'Schedule a property showing',
    inputs: [
      { name: 'propertyId', type: 'string', required: true, description: 'Property ID' },
      { name: 'clientId', type: 'string', required: true, description: 'Client ID' },
      { name: 'datetime', type: 'string', required: true, description: 'Showing datetime' },
    ],
    outputs: [{ name: 'output', type: 'object', description: 'Scheduled showing' }],
    industries: ['realestate'],
  },
  healthcare_send_reminder: {
    type: 'healthcare_send_reminder',
    category: 'industry',
    label: 'Send Appointment Reminder',
    description: 'Send appointment reminder to patient',
    inputs: [
      { name: 'appointmentId', type: 'string', required: true, description: 'Appointment ID' },
      { name: 'patientId', type: 'string', required: true, description: 'Patient ID' },
    ],
    outputs: [{ name: 'output', type: 'object', description: 'Reminder send result' }],
    industries: ['healthcare'],
  },
};

export function getNodeDefinition(type: NodeType): NodeDefinition | undefined {
  return NODE_DEFINITIONS[type];
}

export function getNodesByCategory(category: NodeDefinition['category']): NodeDefinition[] {
  return Object.values(NODE_DEFINITIONS).filter((node) => node.category === category);
}

export function getNodesByIndustry(industry: IndustrySlug): NodeDefinition[] {
  return Object.values(NODE_DEFINITIONS).filter(
    (node) => !node.industries || node.industries.includes(industry)
  );
}

export function getAllNodeTypes(): NodeType[] {
  return Object.keys(NODE_DEFINITIONS) as NodeType[];
}

export function isValidNodeType(type: string): type is NodeType {
  return type in NODE_DEFINITIONS;
}
