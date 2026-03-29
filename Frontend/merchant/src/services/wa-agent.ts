import { apiJson } from "@/lib/api-client-shared";
import { FEATURES } from "@/lib/env-validation";
import { logger } from "@vayva/shared";
import type {
    ApiEnvelope,
    ApprovalAction,
    KnowledgeBaseEntry,
    SocialChannel,
    SupportApproval,
    SupportConversation,
    SupportThread,
    UiKnowledgeBaseItem,
    WaAgentProfile,
    WaAgentSettings,
} from "@/types/wa-agent";

export const WaAgentService = {
    // 1. Settings & Profile
    getSettings: async () => {
        if (!FEATURES.WHATSAPP_ENABLED) {
            throw new Error("WhatsApp integration is not configured");
        }
        try {
            const data = await apiJson<ApiEnvelope<WaAgentSettings>>("/seller/ai/whatsapp-settings");
            const fallback: WaAgentSettings = {
                enabled: false,
                businessHours: {},
                autoReplyOutsideHours: false,
                catalogMode: "StrictCatalogOnly",
                allowImageUnderstanding: false,
                orderStatusAccess: true,
                paymentGuidanceMode: "ExplainAndLink",
                maxDailyMsgsPerUser: 50,
                humanHandoffEnabled: true,
            };
            return data?.data ?? fallback;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
            const err = error instanceof Error ? error : new Error(String(error));
            logger.error("[WA_AGENT_GET_SETTINGS_ERROR]", { error: err.message, stack: err.stack });
            throw err;
        }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateSettings: async (settings: WaAgentSettings) => {
        if (!FEATURES.WHATSAPP_ENABLED) {
            throw new Error("WhatsApp integration is not configured");
        }
        try {
            await apiJson("/seller/ai/whatsapp-settings", {
                method: "PUT",
                body: JSON.stringify(settings),
            });
            return true;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
            const err = error instanceof Error ? error : new Error(String(error));
            logger.error("[WA_AGENT_UPDATE_SETTINGS_ERROR]", { error: err.message, stack: err.stack });
            return false;
        }
    },
    getProfile: async () => {
        if (!FEATURES.WHATSAPP_ENABLED) {
            throw new Error("WhatsApp integration is not configured");
        }
        try {
            const data = await apiJson<ApiEnvelope<WaAgentProfile>>("/seller/ai/profile");
            const fallback: WaAgentProfile = {
                agentName: "Assistant",
                tonePreset: "Friendly",
                greetingTemplate: "Hi {customer_name}! How can I help?",
                signoffTemplate: "Best regards!",
                persuasionLevel: 1,
                brevityMode: "Short",
                oneQuestionRule: true,
                prohibitedClaims: [],
            };
            return data?.data ?? fallback;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
            const err = error instanceof Error ? error : new Error(String(error));
            logger.error("[WA_AGENT_GET_PROFILE_ERROR]", { error: err.message, stack: err.stack });
            throw err;
        }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateProfile: async (profile: WaAgentProfile) => {
        if (!FEATURES.WHATSAPP_ENABLED) {
            throw new Error("WhatsApp integration is not configured");
        }
        try {
            await apiJson("/seller/ai/profile", {
                method: "PUT",
                body: JSON.stringify(profile),
            });
            return true;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
            const err = error instanceof Error ? error : new Error(String(error));
            logger.error("[WA_AGENT_UPDATE_PROFILE_ERROR]", { error: err.message, stack: err.stack });
            return false;
        }
    },
    // 2. Inbox
    getConversations: async (channel?: SocialChannel): Promise<SupportConversation[]> => {
        if (!FEATURES.WHATSAPP_ENABLED) {
            // Return empty instead of error to prevent UI crash
            return [];
        }
        try {
            const url = new URL("/support/conversations", window.location?.origin);
            if (channel) url.searchParams?.set("channel", channel);
            const data = await apiJson<ApiEnvelope<SupportConversation[]>>(url.pathname + url.search);
            const conversations = data?.data ?? [];
            return conversations.map((c) => ({
                ...c,
                unreadCount: c.unreadCount ?? 0,
            }));
        }
        catch (e) {
            logger.error("[WA_AGENT_GET_CONVERSATIONS_ERROR]", { error: (e as Error).message, stack: (e as Error).stack });
            return [];
        }
    },
    // 3. Test Message
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sendTestMessage: async (text: string): Promise<unknown> => {
        if (!FEATURES.WHATSAPP_ENABLED) {
            throw new Error("WhatsApp integration is not configured");
        }
        try {
            return await apiJson("/ai/chat", {
                method: "POST",
                body: JSON.stringify({ messages: [{ role: "user", content: text }] }),
            });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
            const err = error instanceof Error ? error : new Error(String(error));
            logger.error("[WA_AGENT_SEND_TEST_ERROR]", { error: err.message, stack: err.stack });
            throw err;
        }
    },
    // 4. Approvals
    getApprovals: async (): Promise<SupportApproval[]> => {
        if (!FEATURES.WHATSAPP_ENABLED)
            return [];
        try {
            const data = await apiJson<ApiEnvelope<SupportApproval[]>>("/support/approvals");
            return data?.data ?? [];
        }
        catch (e) {
            logger.error("[WA_AGENT_GET_APPROVALS_ERROR]", { error: (e as Error).message, stack: (e as Error).stack });
            return [];
        }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    actionApproval: async (id: string, action: ApprovalAction) => {
        if (!FEATURES.WHATSAPP_ENABLED)
            throw new Error("Not configured");
        try {
            await apiJson(`/api/support/approvals/${id}/action`, {
                method: "POST",
                body: JSON.stringify({ action })
            });
            return true;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
            const err = error instanceof Error ? error : new Error(String(error));
            logger.error("[WA_AGENT_ACTION_APPROVAL_ERROR]", { error: err.message, stack: err.stack });
            return false;
        }
    },
    // 5. Inbox Pendings
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getThread: async (threadId: string): Promise<SupportThread | null> => {
        if (!FEATURES.WHATSAPP_ENABLED)
            return null;
        try {
            const data = await apiJson<ApiEnvelope<SupportThread>>(`/api/support/conversations/${threadId}`);
            return data?.data ?? null;
        }
        catch (e) {
            logger.error("[WA_AGENT_GET_THREAD_ERROR]", { error: (e as Error).message, stack: (e as Error).stack });
            return null;
        }
    },
    getKnowledgeBase: async (): Promise<UiKnowledgeBaseItem[]> => {
        if (!FEATURES.WHATSAPP_ENABLED)
            return [];
        try {
            const json = await apiJson<ApiEnvelope<KnowledgeBaseEntry[]>>("/seller/ai/knowledge-base");
            const entries = json?.data ?? [];
            // Map knowledge base entries to UI interface
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return entries.map((e: KnowledgeBaseEntry) => ({
                id: e.id,
                question: e.sourceType === "FILE" ? "Document Upload" : "Manual Entry",
                answer: (() => {
                    const content = e.content ?? "";
                    return content.length > 100 ? content.substring(0, 100) + "..." : content;
                })(),
                fullContent: e.content,
                tags: [e.sourceType],
                category: "General",
                status: "active"
            }));
        }
        catch (e) {
            logger.error("[WA_AGENT_GET_KB_ERROR]", { error: (e as Error).message, stack: (e as Error).stack });
            return [];
        }
    },
};
