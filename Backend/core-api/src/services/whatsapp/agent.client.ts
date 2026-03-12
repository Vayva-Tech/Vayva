import { apiJson } from "@/lib/api-client-shared";
import { FEATURES } from "@/lib/env-validation";
import { logger } from "@vayva/shared";

/**
 * Client-side service for WhatsApp AI Agent interactions.
 * Ensures consistent error handling and feature-flag validation.
 */
export const WhatsAppAgentClient = {
  // 1. Core Config & Status
  getStatus: async () => {
    if (!FEATURES.WHATSAPP_ENABLED)
      return { connected: false, status: "DISABLED" };
    try {
      return await apiJson<{ connected: boolean; status: string }>(
        "/api/settings/whatsapp/status",
      );
    } catch (e: unknown) {
      const _errMsg = e instanceof Error ? e.message : String(e);
      logger.error("[WA_AGENT_STATUS_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      return { connected: false, status: "ERROR" };
    }
  },
  // 2. Conversation List
  listThreads: async () => {
    if (!FEATURES.WHATSAPP_ENABLED) return [];
    try {
      const res = await apiJson<{ data?: unknown[] }>(
        "/api/support/conversations",
      );
      return res.data || [];
    } catch (e: unknown) {
      const _errMsg = e instanceof Error ? e.message : String(e);
      logger.error("[WA_AGENT_LIST_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      return [];
    }
  },
  // 3. Message Interaction
  sendMessage: async (threadId: string, message: string) => {
    if (!FEATURES.WHATSAPP_ENABLED) return false;
    try {
      await apiJson<{ success: boolean }>(
        `/api/support/conversations/${threadId}/messages`,
        {
          method: "POST",
          body: JSON.stringify({ message }),
        },
      );
      return true;
    } catch (e: unknown) {
      const _errMsg = e instanceof Error ? e.message : String(e);
      logger.error("[WA_AGENT_SEND_ERROR]", {
        error: _errMsg,
        app: "merchant",
        threadId,
      });
      return false;
    }
  },
  // 4. Knowledge Base Operations
  deleteKBEntry: async (id: string) => {
    if (!FEATURES.WHATSAPP_ENABLED) return false;
    try {
      await apiJson<{ success: boolean }>(
        `/api/seller/ai/knowledge-base/${id}`,
        {
          method: "DELETE",
        },
      );
      return true;
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[WA_AGENT_DELETE_KB_ERROR]", {
        error: _errMsg,
        app: "merchant",
        id,
      });
      return false;
    }
  },
  // 5. Inbox Pendings
  getThread: async (threadId: string) => {
    if (!FEATURES.WHATSAPP_ENABLED) return null;
    try {
      const res = await apiJson<{ data?: unknown }>(
        `/api/support/conversations/${threadId}`,
      );
      return res.data;
    } catch (e: unknown) {
      const _errMsg = e instanceof Error ? e.message : String(e);
      logger.error("[WA_AGENT_GET_THREAD_ERROR]", {
        error: _errMsg,
        app: "merchant",
        threadId,
      });
      return null;
    }
  },
  getKnowledgeBase: async () => {
    if (!FEATURES.WHATSAPP_ENABLED) return [];
    try {
      const res = await apiJson<{ data?: unknown[] }>(
        "/api/seller/ai/knowledge-base",
      );
      const entries = (res.data as Record<string, unknown>[]) || [];
      return entries.map((e) => ({
        id: e.id as string,
        question: e.sourceType === "FILE" ? "Document Upload" : "Manual Entry",
        answer:
          String(e.content || "").length > 100
            ? String(e.content || "").substring(0, 100) + "..."
            : String(e.content || ""),
        fullContent: String(e.content || ""),
        tags: [String(e.sourceType || "")],
        category: "General",
        status: "ACTIVE",
      }));
    } catch (e: unknown) {
      const _errMsg = e instanceof Error ? e.message : String(e);
      logger.error("[WA_AGENT_GET_KB_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      return [];
    }
  },
};
