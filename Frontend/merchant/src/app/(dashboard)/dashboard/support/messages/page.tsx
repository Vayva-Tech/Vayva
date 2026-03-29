"use client";

import { logger } from "@vayva/shared";
import { useState, useEffect } from "react";
import { Spinner as Loader2 } from "@phosphor-icons/react/ssr";
import { ConversationList } from "@/components/whatsapp/ConversationList";

interface Conversation {
  id: string;
  contactName: string;
  subtitle: string;
  status: string;
  unread: boolean;
  lastMessage: string;
  lastMessageAt: string;
  direction: string;
}

import { apiJson } from "@/lib/api-client-shared";

interface ConversationsResponse {
  data: Conversation[];
}

export default function MessagesPage() {
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [_error, setError] = useState<unknown>(null);

  useEffect(() => {
    void fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const result = await apiJson<ConversationsResponse>(
        "/support/conversations",
      );
      setConversations(result?.data || []);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[FETCH_CONVERSATIONS_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Support Inbox
        </h1>
        <p className="text-gray-500">Communicate with your customers.</p>
      </div>

      <div className="bg-white  rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="p-12 flex justify-center h-full items-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        ) : (
          <ConversationList conversations={conversations} />
        )}
      </div>
    </div>
  );
}
