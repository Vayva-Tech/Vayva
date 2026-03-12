/**
 * Healthcare Industry Workflow Templates
 * Pre-built workflows for healthcare providers
 */

import type { WorkflowTemplate } from '@vayva/workflow-engine';

export const HEALTHCARE_WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'patient-appointment-reminder',
    name: 'Patient Appointment Reminder',
    industry: 'healthcare',
    description: 'Send automated appointment reminders to patients 24 hours before',
    trigger: {
      type: 'schedule',
      config: {
        cron: '0 9 * * *', // Daily at 9 AM
        timezone: 'America/New_York',
      },
    },
    nodes: [
      {
        id: 'trigger',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: { label: 'Daily Schedule Check', triggerType: 'schedule' },
      },
      {
        id: 'find-appointments',
        type: 'query_menu_items',
        position: { x: 300, y: 100 },
        data: {
          label: 'Find Tomorrow\'s Appointments',
          query: 'appointments',
          filter: { date: 'tomorrow' },
        },
      },
      {
        id: 'filter-patients',
        type: 'filter_customers',
        position: { x: 500, y: 100 },
        data: {
          label: 'Filter Confirmed Patients',
          segment: 'confirmed_appointments',
        },
      },
      {
        id: 'send-reminders',
        type: 'healthcare_send_reminder',
        position: { x: 700, y: 100 },
        data: {
          label: 'Send Reminders',
          channels: ['mobile_app', 'sms'],
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger', target: 'find-appointments' },
      { id: 'e2', source: 'find-appointments', target: 'filter-patients' },
      { id: 'e3', source: 'filter-patients', target: 'send-reminders' },
    ],
    tags: ['patient-care', 'automation', 'reminders'],
  },
  {
    id: 'medication-refill-alert',
    name: 'Medication Refill Alert',
    industry: 'healthcare',
    description: 'Notify patients when prescriptions are due for refill',
    trigger: {
      type: 'schedule',
      config: {
        cron: '0 10 * * 1', // Weekly on Mondays at 10 AM
        timezone: 'America/New_York',
      },
    },
    nodes: [
      {
        id: 'trigger',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: { label: 'Weekly Medication Check', triggerType: 'schedule' },
      },
      {
        id: 'check-prescriptions',
        type: 'query_menu_items',
        position: { x: 300, y: 100 },
        data: {
          label: 'Check Expiring Prescriptions',
          query: 'prescriptions',
          filter: { days_until_expire: '<= 7' },
        },
      },
      {
        id: 'filter-patients',
        type: 'filter_customers',
        position: { x: 500, y: 100 },
        data: {
          label: 'Active Patients Only',
          segment: 'active_patients',
        },
      },
      {
        id: 'send-alerts',
        type: 'send_notification',
        position: { x: 700, y: 100 },
        data: {
          label: 'Send Refill Alerts',
          channels: ['mobile_app', 'sms'],
          message: 'Your prescription is expiring soon. Please schedule a refill.',
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger', target: 'check-prescriptions' },
      { id: 'e2', source: 'check-prescriptions', target: 'filter-patients' },
      { id: 'e3', source: 'filter-patients', target: 'send-alerts' },
    ],
    tags: ['medication', 'patient-safety', 'compliance'],
  },
];

export function getHealthcareTemplates(): WorkflowTemplate[] {
  return HEALTHCARE_WORKFLOW_TEMPLATES;
}

export function getHealthcareTemplateById(id: string): WorkflowTemplate | undefined {
  return HEALTHCARE_WORKFLOW_TEMPLATES.find(t => t.id === id);
}