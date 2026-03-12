/**
 * Real Estate Industry Workflow Templates
 * Pre-built workflows for real estate agents and agencies
 */

import type { WorkflowTemplate } from '@vayva/workflow-engine';

export const REALESTATE_WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'showing-scheduling',
    name: 'Property Showing Scheduler',
    industry: 'realestate',
    description: 'Automatically schedule property showings and send notifications',
    trigger: {
      type: 'schedule',
      config: {
        cron: '*/30 * * * *', // Every 30 minutes
        timezone: 'America/New_York',
      },
    },
    nodes: [
      {
        id: 'trigger',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: { label: 'Check New Showing Requests', triggerType: 'schedule' },
      },
      {
        id: 'find-requests',
        type: 'query_menu_items',
        position: { x: 300, y: 100 },
        data: {
          label: 'Find Pending Showings',
          query: 'showing_requests',
          filter: { status: 'pending' },
        },
      },
      {
        id: 'check-availability',
        type: 'condition',
        position: { x: 500, y: 50 },
        data: {
          label: 'Property Available?',
          condition: 'property.available_dates.contains(request_date)',
          field: 'property.available_dates',
          operator: 'contains',
          value: 'request_date',
        },
      },
      {
        id: 'schedule-showing',
        type: 'realestate_schedule_showing',
        position: { x: 700, y: 50 },
        data: {
          label: 'Schedule Showing',
        },
      },
      {
        id: 'notify-parties',
        type: 'send_notification',
        position: { x: 900, y: 50 },
        data: {
          label: 'Notify All Parties',
          channels: ['email', 'sms'],
          message: 'Showing confirmed for {{property_address}} on {{date}} at {{time}}',
        },
      },
      {
        id: 'send-decline',
        type: 'send_notification',
        position: { x: 700, y: 150 },
        data: {
          label: 'Send Decline Notice',
          channels: ['email', 'sms'],
          message: 'Unfortunately, the requested showing time is not available.',
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger', target: 'find-requests' },
      { id: 'e2', source: 'find-requests', target: 'check-availability' },
      { id: 'e3', source: 'check-availability', target: 'schedule-showing', condition: { type: 'true' } },
      { id: 'e4', source: 'schedule-showing', target: 'notify-parties' },
      { id: 'e5', source: 'check-availability', target: 'send-decline', condition: { type: 'false' } },
    ],
    tags: ['property-management', 'automation', 'client-communication'],
  },
  {
    id: 'lead-followup',
    name: 'Lead Follow-up Sequence',
    industry: 'realestate',
    description: 'Automated follow-up sequence for new leads',
    trigger: {
      type: 'customer_segment_entered',
      config: {
        segmentId: 'new_leads',
      },
    },
    nodes: [
      {
        id: 'trigger',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: { label: 'New Lead Entered', triggerType: 'customer_segment_entered' },
      },
      {
        id: 'send-welcome',
        type: 'send_email',
        position: { x: 300, y: 100 },
        data: {
          label: 'Send Welcome Email',
          template: 'welcome_lead',
          includeLookbook: true,
        },
      },
      {
        id: 'wait-24h',
        type: 'delay',
        position: { x: 500, y: 100 },
        data: {
          label: 'Wait 24 Hours',
          delay: '24 h',
          delayType: 'fixed',
        },
      },
      {
        id: 'followup-call',
        type: 'send_notification',
        position: { x: 700, y: 100 },
        data: {
          label: 'Send Follow-up Reminder',
          channels: ['mobile_app'],
          message: 'Time to follow up with {{customer_name}} about their property inquiry.',
        },
      },
      {
        id: 'wait-3d',
        type: 'delay',
        position: { x: 900, y: 100 },
        data: {
          label: 'Wait 3 Days',
          delay: '3 d',
          delayType: 'fixed',
        },
      },
      {
        id: 'send-market-update',
        type: 'send_email',
        position: { x: 1100, y: 100 },
        data: {
          label: 'Send Market Update',
          template: 'market_update',
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger', target: 'send-welcome' },
      { id: 'e2', source: 'send-welcome', target: 'wait-24h' },
      { id: 'e3', source: 'wait-24h', target: 'followup-call' },
      { id: 'e4', source: 'followup-call', target: 'wait-3d' },
      { id: 'e5', source: 'wait-3d', target: 'send-market-update' },
    ],
    tags: ['lead-generation', 'crm', 'follow-up'],
  },
];

export function getRealestateTemplates(): WorkflowTemplate[] {
  return REALESTATE_WORKFLOW_TEMPLATES;
}

export function getRealestateTemplateById(id: string): WorkflowTemplate | undefined {
  return REALESTATE_WORKFLOW_TEMPLATES.find(t => t.id === id);
}