import type { ConnectionOptions } from "bullmq";

/** Shared connection type passed to all worker factories */
export type RedisConnection = ConnectionOptions;

// ─── Maintenance ───────────────────────────────────────────────
// ─── Maintenance ───────────────────────────────────────────────
export type MaintenanceJobData = Record<string, never>;

// ─── WhatsApp Inbound ──────────────────────────────────────────
export interface WhatsAppInboundJobData {
  storeId: string;
  payload: {
    messages?: Array<{
      id: string;
      type?: string;
      text?: { body: string };
    }>;
    contacts?: Array<{
      wa_id: string;
      profile?: { name: string };
    }>;
  };
}

// ─── WhatsApp Outbound ─────────────────────────────────────────
export interface WhatsAppOutboundJobData {
  to: string;
  body: string;
  storeId: string;
  messageId?: string;
}

// ─── Agent Actions ─────────────────────────────────────────────
export interface AgentActionsJobData {
  messageId: string;
  storeId: string;
}

// ─── Delivery Scheduler ────────────────────────────────────────
export interface DeliveryJobData {
  orderId: string;
}

// ─── Payments Webhooks ─────────────────────────────────────────
export interface PaymentsWebhookJobData {
  providerEventId: string;
  eventType: string;
  data: {
    amount: number;
    reference: string;
    currency?: string;
  };
  metadata?: {
    storeId?: string;
    type?: string;
    orderId?: string;
    templateId?: string;
  };
}

// ─── Reconciliation ────────────────────────────────────────────
export interface ReconciliationJobData {
  storeId: string;
}

// ─── Thumbnail Generation ──────────────────────────────────────
export interface ThumbnailJobData {
  storeId: string;
  url: string;
  deploymentId?: string;
  templateProjectId?: string;
}

// ─── China Catalog Sync ────────────────────────────────────────
// ─── China Catalog Sync ────────────────────────────────────────
export type ChinaSyncJobData = Record<string, never>;

/** Factory signature: each worker module exports a `register` function */
export type WorkerFactory = (connection: RedisConnection) => void;
