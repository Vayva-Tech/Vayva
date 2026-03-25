/**
 * GDPR Deletion Worker
 * 
 * Scheduled worker that executes pending account deletions
 * Runs daily to process deletion requests that have passed their grace period
 * 
 * Deployment: Configure as a Cron Trigger in Cloudflare Workers
 * Schedule: 0 0 * * * (daily at midnight)
 */

// Cloudflare Worker global types
declare type ExecutionContext = {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
};

import { GdprAutomation, StorageProvider, WhatsAppNotifier } from "@vayva/compliance";

export interface Env {
  DATABASE_URL: string;
  EVOLUTION_API_URL: string;
  EVOLUTION_API_KEY: string;
}

// Simple storage provider for worker environment
class WorkerStorageProvider implements StorageProvider {
  async upload(data: Buffer | string, path: string): Promise<string> {
    // In a real implementation, use R2 or another storage service
    console.warn(`[Storage] Would upload to ${path}`);
    return path;
  }

  async getSignedUrl(path: string, expiresInSeconds: number): Promise<string> {
    return `https://storage.vayva.ng/${path}?expires=${expiresInSeconds}`;
  }
}

// WhatsApp notifier for worker environment
class WorkerWhatsAppNotifier implements WhatsAppNotifier {
  private apiUrl: string;
  private apiKey: string;

  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  async sendMessage(instanceName: string, phone: string, text: string): Promise<unknown> {
    const cleanPhone = phone.replace(/\D/g, "");
    
    const response = await fetch(
      `${this.apiUrl}/message/sendText/${instanceName}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: this.apiKey,
        },
        body: JSON.stringify({
          number: cleanPhone,
          options: { delay: 1200, presence: "composing" },
          text,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to send WhatsApp message: ${response.statusText}`);
    }

    return response.json();
  }
}

/**
 * Main worker handler
 */
export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    console.warn("[GDPR Worker] Starting scheduled deletion process...");

    const storage = new WorkerStorageProvider();
    const whatsapp = new WorkerWhatsAppNotifier(
      env.EVOLUTION_API_URL,
      env.EVOLUTION_API_KEY
    );
    const gdpr = new GdprAutomation(storage, whatsapp, "vayva-official");

    try {
      // Get pending deletions that are due
      const pendingDeletions = await gdpr.getPendingDeletionsDue();

      console.warn(`[GDPR Worker] Found ${pendingDeletions.length} deletions to process`);

      // Process each deletion
      for (const deletion of pendingDeletions) {
        ctx.waitUntil(
          processDeletion(gdpr, deletion.storeId, deletion.id)
        );
      }

      console.warn("[GDPR Worker] Scheduled deletion process completed");
    } catch (error) {
      console.error("[GDPR Worker] Error during deletion process:", error);
      throw error;
    }
  },

  // Also allow manual triggering via fetch
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // Simple auth check
    const authHeader = request.headers.get("Authorization");
    if (authHeader !== `Bearer ${env.WORKER_API_KEY}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (url.pathname === "/trigger") {
      // Trigger the scheduled function manually
      await this.scheduled(
        { scheduledTime: Date.now(), cron: "manual" } as ScheduledController,
        env,
        ctx
      );
      
      return new Response(
        JSON.stringify({ success: true, message: "Deletion worker triggered" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    if (url.pathname === "/status") {
      // Return worker status
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "GDPR Deletion Worker is running",
          timestamp: new Date().toISOString()
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response("Not found", { status: 404 });
  },
};

/**
 * Process a single deletion
 */
async function processDeletion(
  gdpr: GdprAutomation,
  storeId: string,
  _deletionRequestId: string
): Promise<void> {
  try {
    console.warn(`[GDPR Worker] Processing deletion for store ${storeId}`);

    const report = await gdpr.executeDeletion(storeId);

    console.warn(`[GDPR Worker] Deletion completed for store ${storeId}:`, {
      anonymizedId: report.anonymizedId,
      deletedAt: report.deletedAt,
      retentionDate: report.retentionDate,
    });
  } catch (error) {
    console.error(`[GDPR Worker] Failed to process deletion for store ${storeId}:`, error);
    // TODO: Send alert to ops team
  }
}

// Type definition for scheduled controller
interface ScheduledController {
  scheduledTime: number;
  cron: string;
}
