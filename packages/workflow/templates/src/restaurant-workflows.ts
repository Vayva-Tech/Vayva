/**
 * Restaurant Industry Workflow Templates
 * Pre-built workflows for restaurants
 */

import type { WorkflowTemplate } from '@vayva/workflow-engine';

export const RESTAURANT_WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'auto-86-low-inventory',
    name: 'Auto-86 When Inventory Low',
    industry: 'restaurant',
    description: 'Automatically mark items as sold out when ingredients run low',
    trigger: {
      type: 'inventory_low',
      config: { 
        entity: 'ingredient',
        thresholdType: 'overall',
        minQuantity: 5,
      },
    },
    nodes: [
      {
        id: 'trigger',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: { label: 'Ingredient Low', triggerType: 'inventory_low' },
      },
      {
        id: 'find-affected-items',
        type: 'query_menu_items',
        position: { x: 350, y: 100 },
        data: {
          label: 'Find Menu Items',
          query: 'uses_ingredient',
        },
      },
      {
        id: '86-items',
        type: 'restaurant_86_item',
        position: { x: 600, y: 50 },
        data: {
          label: '86 Items',
          notifyKitchen: true,
          updateOnlineMenus: true,
        },
      },
      {
        id: 'notify-staff',
        type: 'send_notification',
        position: { x: 600, y: 150 },
        data: {
          label: 'Notify Staff',
          channels: ['kds', 'mobile_app'],
          message: 'Items have been 86\'d due to low inventory',
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger', target: 'find-affected-items' },
      { id: 'e2', source: 'find-affected-items', target: '86-items' },
      { id: 'e3', source: 'find-affected-items', target: 'notify-staff' },
    ],
    tags: ['inventory', '86', 'kitchen'],
  },

  {
    id: 'table-turn-optimization',
    name: 'Table Turn Optimization',
    industry: 'restaurant',
    description: 'Alert when tables are ready to be turned',
    trigger: {
      type: 'schedule',
      config: { interval: '5m' },
    },
    nodes: [
      {
        id: 'trigger',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: { label: 'Every 5 minutes', triggerType: 'schedule' },
      },
      {
        id: 'check-table-status',
        type: 'query_tables',
        position: { x: 350, y: 100 },
        data: {
          label: 'Check Tables',
          filter: 'check_paid_and_empty_15min',
        },
      },
      {
        id: 'notify-host',
        type: 'send_notification',
        position: { x: 600, y: 100 },
        data: {
          label: 'Alert Host Stand',
          message: 'Table {table.number} ready to reset',
          channels: ['kds', 'mobile_app'],
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger', target: 'check-table-status' },
      { id: 'e2', source: 'check-table-status', target: 'notify-host' },
    ],
    tags: ['operations', 'tables', 'host-stand'],
  },

  {
    id: 'online-order-prep',
    name: 'Online Order Preparation Alert',
    industry: 'restaurant',
    description: 'Alert kitchen when online orders need preparation',
    trigger: {
      type: 'order_created',
      config: { orderStatus: 'pending' },
    },
    nodes: [
      {
        id: 'trigger',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: { label: 'Online Order Received', triggerType: 'order_created' },
      },
      {
        id: 'check-pickup-time',
        type: 'condition',
        position: { x: 350, y: 100 },
        data: {
          label: 'Pickup < 15 min?',
          condition: 'pickup_time < 15min',
          field: 'pickup_time',
          operator: 'less_than',
          value: '15',
        },
      },
      {
        id: 'urgent-alert',
        type: 'send_notification',
        position: { x: 600, y: 50 },
        data: {
          label: 'URGENT: Start Now',
          message: 'URGENT: Order needs immediate preparation',
          channels: ['kds'],
        },
      },
      {
        id: 'normal-alert',
        type: 'send_notification',
        position: { x: 600, y: 150 },
        data: {
          label: 'Queue Order',
          message: 'New online order in queue',
          channels: ['kds'],
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger', target: 'check-pickup-time' },
      { id: 'e2', source: 'check-pickup-time', target: 'urgent-alert', condition: { type: 'true' } },
      { id: 'e3', source: 'check-pickup-time', target: 'normal-alert', condition: { type: 'false' } },
    ],
    tags: ['online-orders', 'kitchen', 'operations'],
  },

  {
    id: 'customer-feedback-followup',
    name: 'Customer Feedback Follow-up',
    industry: 'restaurant',
    description: 'Follow up with customers after their visit',
    trigger: {
      type: 'schedule',
      config: { interval: '1h' },
    },
    nodes: [
      {
        id: 'trigger',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: { label: 'Hourly Check', triggerType: 'schedule' },
      },
      {
        id: 'find-completed-visits',
        type: 'filter_customers',
        position: { x: 350, y: 100 },
        data: {
          label: 'Recent Diners',
          filters: { lastVisit: '2h ago', noFeedback: true },
        },
      },
      {
        id: 'ai-personalize',
        type: 'ai_generate',
        position: { x: 600, y: 100 },
        data: {
          label: 'Personalize Message',
          prompt: 'Create personalized feedback request based on order history',
          outputVariable: 'personalizedMessage',
        },
      },
      {
        id: 'send-sms',
        type: 'send_sms',
        position: { x: 850, y: 100 },
        data: {
          label: 'Send Feedback SMS',
          template: 'feedback-request',
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger', target: 'find-completed-visits' },
      { id: 'e2', source: 'find-completed-visits', target: 'ai-personalize' },
      { id: 'e3', source: 'ai-personalize', target: 'send-sms' },
    ],
    tags: ['customer-service', 'feedback', 'reviews'],
  },

  {
    id: 'staff-schedule-reminders',
    name: 'Staff Schedule Reminders',
    industry: 'restaurant',
    description: 'Remind staff of upcoming shifts',
    trigger: {
      type: 'schedule',
      config: { cron: '0 18 * * *' }, // Daily at 6 PM
    },
    nodes: [
      {
        id: 'trigger',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: { label: 'Daily at 6 PM', triggerType: 'schedule' },
      },
      {
        id: 'find-staff',
        type: 'filter_customers',
        position: { x: 350, y: 100 },
        data: {
          label: 'Staff Working Tomorrow',
          segment: 'staff',
          filters: { workingTomorrow: true },
        },
      },
      {
        id: 'send-reminders',
        type: 'send_sms',
        position: { x: 600, y: 100 },
        data: {
          label: 'Send Shift Reminder',
          template: 'shift-reminder',
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger', target: 'find-staff' },
      { id: 'e2', source: 'find-staff', target: 'send-reminders' },
    ],
    tags: ['staff', 'scheduling', 'operations'],
  },

  {
    id: 'happy-hour-promotion',
    name: 'Happy Hour Promotion',
    industry: 'restaurant',
    description: 'Automatically promote happy hour specials',
    trigger: {
      type: 'schedule',
      config: { cron: '0 16 * * 1-5' }, // Weekdays at 4 PM
    },
    nodes: [
      {
        id: 'trigger',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: { label: 'Weekdays 4 PM', triggerType: 'schedule' },
      },
      {
        id: 'update-menu',
        type: 'update_collection',
        position: { x: 350, y: 100 },
        data: {
          label: 'Activate Happy Hour',
          visibility: 'public',
        },
      },
      {
        id: 'notify-customers',
        type: 'send_notification',
        position: { x: 600, y: 100 },
        data: {
          label: 'Push to App Users',
          message: 'Happy Hour is now live! 🍻',
          channels: ['mobile_app'],
        },
      },
      {
        id: 'delay-4h',
        type: 'delay',
        position: { x: 850, y: 100 },
        data: { label: 'Wait 4 hours', delay: '4h', delayType: 'fixed' },
      },
      {
        id: 'deactivate-menu',
        type: 'update_collection',
        position: { x: 1100, y: 100 },
        data: {
          label: 'End Happy Hour',
          visibility: 'private',
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger', target: 'update-menu' },
      { id: 'e2', source: 'update-menu', target: 'notify-customers' },
      { id: 'e3', source: 'notify-customers', target: 'delay-4h' },
      { id: 'e4', source: 'delay-4h', target: 'deactivate-menu' },
    ],
    tags: ['marketing', 'happy-hour', 'promotions'],
  },
];

export function getRestaurantTemplates(): WorkflowTemplate[] {
  return RESTAURANT_WORKFLOW_TEMPLATES;
}

export function getRestaurantTemplateById(id: string): WorkflowTemplate | undefined {
  return RESTAURANT_WORKFLOW_TEMPLATES.find((t) => t.id === id);
}
