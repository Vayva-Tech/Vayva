/**
 * Fashion Industry Workflow Templates
 * Pre-built workflows for fashion retailers
 */

import type { WorkflowTemplate } from '@vayva/workflow-engine';

export const FASHION_WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'auto-reorder-size',
    name: 'Auto-Reorder Low Sizes',
    industry: 'fashion',
    description: 'Automatically create PO when size stock drops below threshold',
    trigger: {
      type: 'inventory_low',
      config: {
        thresholdType: 'size_specific',
        minQuantity: 5,
      },
    },
    nodes: [
      {
        id: 'trigger',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: { label: 'Size Stock < 5', triggerType: 'inventory_low' },
      },
      {
        id: 'check-season',
        type: 'condition',
        position: { x: 300, y: 100 },
        data: {
          label: 'Is Current Season?',
          condition: 'product.season == currentSeason',
          field: 'product.season',
          operator: 'equals',
          value: 'currentSeason',
        },
      },
      {
        id: 'create-po',
        type: 'create_purchase_order',
        position: { x: 550, y: 50 },
        data: {
          label: 'Create PO',
          quantity: 'reorder_point * 2',
          vendor: 'product.preferred_vendor',
        },
      },
      {
        id: 'notify-buyer',
        type: 'send_email',
        position: { x: 550, y: 150 },
        data: {
          label: 'Notify Buyer',
          template: 'low-stock-alert',
          to: 'buyer@store.com',
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger', target: 'check-season' },
      { id: 'e2', source: 'check-season', target: 'create-po', condition: { type: 'true' } },
      { id: 'e3', source: 'check-season', target: 'notify-buyer', condition: { type: 'false' } },
    ],
    tags: ['inventory', 'automation', 'reorder'],
  },

  {
    id: 'vip-customer-drop',
    name: 'VIP Early Access',
    industry: 'fashion',
    description: 'Give VIP customers 24hr early access to new drops',
    trigger: {
      type: 'schedule',
      config: { cron: '0 9 * * 1' }, // Mondays at 9am
    },
    nodes: [
      {
        id: 'trigger',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: { label: 'Weekly Drop Schedule', triggerType: 'schedule' },
      },
      {
        id: 'segment-vip',
        type: 'filter_customers',
        position: { x: 300, y: 100 },
        data: {
          label: 'VIP Customers',
          segment: 'vip',
        },
      },
      {
        id: 'send-early-access',
        type: 'send_email',
        position: { x: 550, y: 100 },
        data: {
          label: 'Send Early Access',
          template: 'vip-early-access',
          includeLookbook: true,
        },
      },
      {
        id: 'delay-24h',
        type: 'delay',
        position: { x: 800, y: 100 },
        data: { label: 'Wait 24h', delay: '24h', delayType: 'fixed' },
      },
      {
        id: 'public-launch',
        type: 'update_collection',
        position: { x: 1050, y: 100 },
        data: {
          label: 'Public Launch',
          visibility: 'public',
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger', target: 'segment-vip' },
      { id: 'e2', source: 'segment-vip', target: 'send-early-access' },
      { id: 'e3', source: 'send-early-access', target: 'delay-24h' },
      { id: 'e4', source: 'delay-24h', target: 'public-launch' },
    ],
    tags: ['marketing', 'vip', 'early-access'],
  },

  {
    id: 'abandoned-cart-recovery',
    name: 'Abandoned Cart Recovery',
    industry: 'fashion',
    description: 'Send personalized emails to customers who abandoned their cart',
    trigger: {
      type: 'schedule',
      config: { interval: '1h' },
    },
    nodes: [
      {
        id: 'trigger',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: { label: 'Check Hourly', triggerType: 'schedule' },
      },
      {
        id: 'ai-generate',
        type: 'ai_generate',
        position: { x: 300, y: 100 },
        data: {
          label: 'Generate Personal Message',
          prompt: 'Create a personalized message for customer based on cart items',
          outputVariable: 'personalizedMessage',
        },
      },
      {
        id: 'send-email',
        type: 'send_email',
        position: { x: 550, y: 100 },
        data: {
          label: 'Send Recovery Email',
          template: 'abandoned-cart',
        },
      },
      {
        id: 'delay-24h',
        type: 'delay',
        position: { x: 800, y: 100 },
        data: { label: 'Wait 24h', delay: '24h', delayType: 'fixed' },
      },
      {
        id: 'check-purchased',
        type: 'condition',
        position: { x: 800, y: 250 },
        data: {
          label: 'Still Abandoned?',
          condition: 'order.status != purchased',
          field: 'order.status',
          operator: 'not_equals',
          value: 'purchased',
        },
      },
      {
        id: 'send-reminder',
        type: 'send_email',
        position: { x: 1050, y: 250 },
        data: {
          label: 'Send Reminder',
          template: 'cart-reminder',
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger', target: 'ai-generate' },
      { id: 'e2', source: 'ai-generate', target: 'send-email' },
      { id: 'e3', source: 'send-email', target: 'delay-24h' },
      { id: 'e4', source: 'delay-24h', target: 'check-purchased' },
      { id: 'e5', source: 'check-purchased', target: 'send-reminder', condition: { type: 'true' } },
    ],
    tags: ['marketing', 'abandoned-cart', 'email'],
  },

  {
    id: 'size-recommendation',
    name: 'Size Recommendation Follow-up',
    industry: 'fashion',
    description: 'Follow up with customers after purchase to recommend sizes',
    trigger: {
      type: 'order_paid',
      config: {},
    },
    nodes: [
      {
        id: 'trigger',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: { label: 'Order Paid', triggerType: 'order_paid' },
      },
      {
        id: 'ai-analyze',
        type: 'ai_classify',
        position: { x: 300, y: 100 },
        data: {
          label: 'Analyze Purchase',
          input: '${order.items}',
          categories: ['first-time', 'repeat', 'size-uncertain'],
          outputVariable: 'customerType',
        },
      },
      {
        id: 'check-first-time',
        type: 'condition',
        position: { x: 550, y: 100 },
        data: {
          label: 'First Time Buyer?',
          condition: 'customerType == first-time',
          field: 'customerType',
          operator: 'equals',
          value: 'first-time',
        },
      },
      {
        id: 'send-size-guide',
        type: 'send_email',
        position: { x: 800, y: 50 },
        data: {
          label: 'Send Size Guide',
          template: 'size-guide',
        },
      },
      {
        id: 'tag-customer',
        type: 'tag_customer',
        position: { x: 800, y: 150 },
        data: {
          label: 'Tag Repeat Customer',
          tags: ['repeat-buyer'],
          operation: 'add',
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger', target: 'ai-analyze' },
      { id: 'e2', source: 'ai-analyze', target: 'check-first-time' },
      { id: 'e3', source: 'check-first-time', target: 'send-size-guide', condition: { type: 'true' } },
      { id: 'e4', source: 'check-first-time', target: 'tag-customer', condition: { type: 'false' } },
    ],
    tags: ['customer-service', 'sizing', 'follow-up'],
  },

  {
    id: 'flash-sale-alert',
    name: 'Flash Sale Alert',
    industry: 'fashion',
    description: 'Notify customers about flash sales based on their preferences',
    trigger: {
      type: 'manual',
      config: { allowBulkExecution: true },
    },
    nodes: [
      {
        id: 'trigger',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: { label: 'Manual Trigger', triggerType: 'manual' },
      },
      {
        id: 'split-segments',
        type: 'split',
        position: { x: 300, y: 100 },
        data: { label: 'Split by Segment' },
      },
      {
        id: 'vip-customers',
        type: 'filter_customers',
        position: { x: 550, y: 50 },
        data: { label: 'VIP Customers', segment: 'vip' },
      },
      {
        id: 'regular-customers',
        type: 'filter_customers',
        position: { x: 550, y: 150 },
        data: { label: 'Regular Customers', segment: 'regular' },
      },
      {
        id: 'vip-email',
        type: 'send_email',
        position: { x: 800, y: 50 },
        data: {
          label: 'VIP Early Access',
          template: 'flash-sale-vip',
        },
      },
      {
        id: 'regular-email',
        type: 'send_email',
        position: { x: 800, y: 150 },
        data: {
          label: 'Regular Sale Email',
          template: 'flash-sale-regular',
        },
      },
      {
        id: 'merge',
        type: 'merge',
        position: { x: 1050, y: 100 },
        data: { label: 'Merge' },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger', target: 'split-segments' },
      { id: 'e2', source: 'split-segments', target: 'vip-customers' },
      { id: 'e3', source: 'split-segments', target: 'regular-customers' },
      { id: 'e4', source: 'vip-customers', target: 'vip-email' },
      { id: 'e5', source: 'regular-customers', target: 'regular-email' },
      { id: 'e6', source: 'vip-email', target: 'merge' },
      { id: 'e7', source: 'regular-email', target: 'merge' },
    ],
    tags: ['marketing', 'flash-sale', 'segmentation'],
  },
];

export function getFashionTemplates(): WorkflowTemplate[] {
  return FASHION_WORKFLOW_TEMPLATES;
}

export function getFashionTemplateById(id: string): WorkflowTemplate | undefined {
  return FASHION_WORKFLOW_TEMPLATES.find((t) => t.id === id);
}
