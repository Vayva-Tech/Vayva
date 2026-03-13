// Workflow Templates - Pre-built workflow templates for different industries

import type { IndustrySlug, TriggerType, NodeType } from '@vayva/workflow-engine';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  industry: IndustrySlug;
  trigger: {
    type: TriggerType;
    label: string;
    config?: Record<string, unknown>;
  };
  nodes: Array<{
    type: NodeType;
    label: string;
    description?: string;
  }>;
}

// Template library
export const templates: WorkflowTemplate[] = [
  // Fashion templates
  {
    id: 'fashion-inventory-alert',
    name: 'Low Inventory Alert',
    description: 'Automatically notify when stock is low',
    industry: 'fashion',
    trigger: {
      type: 'event',
      label: 'Inventory Threshold Reached',
    },
    nodes: [
      { type: 'trigger', label: 'Stock Level Check' },
      { type: 'condition', label: 'Is Below Threshold?' },
      { type: 'action', label: 'Send Email Alert' },
    ],
  },
  // Restaurant templates
  {
    id: 'restaurant-order-notification',
    name: 'New Order Notification',
    description: 'Notify kitchen of new orders',
    industry: 'restaurant',
    trigger: {
      type: 'webhook',
      label: 'Order Placed',
    },
    nodes: [
      { type: 'trigger', label: 'Order Received' },
      { type: 'action', label: 'Display in Kitchen' },
      { type: 'action', label: 'Send SMS to Chef' },
    ],
  },
  // Retail templates
  {
    id: 'retail-customer-followup',
    name: 'Customer Follow-up',
    description: 'Automated post-purchase follow-up',
    industry: 'retail',
    trigger: {
      type: 'schedule',
      label: '24 Hours After Purchase',
    },
    nodes: [
      { type: 'trigger', label: 'Purchase Completed' },
      { type: 'delay', label: 'Wait 24 Hours' },
      { type: 'action', label: 'Send Feedback Request' },
    ],
  },
];

// Get templates by industry
export function getTemplatesByIndustry(industry: IndustrySlug): WorkflowTemplate[] {
  return templates.filter((t) => t.industry === industry);
}

// Get all templates
export function getAllTemplates(): WorkflowTemplate[] {
  return templates;
}
