"use client";

import { logger, WhatsAppConversation, WhatsAppMessage } from "@vayva/shared";
import { useState, useEffect, use } from "react";
import { toast } from "sonner";
import { Spinner as Loader2 } from "@phosphor-icons/react/ssr";
import { ChatWindow } from "@/components/whatsapp/ChatWindow";

import { apiJson } from "@/lib/api-client-shared";

export default function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [conversation, setConversation] = useState<WhatsAppConversation | null>(
    null,
  );
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);

  useEffect(() => {
    void fetchData();
    // Poll for new messages every 5 seconds
    const interval = setInterval(() => {
      void fetchMessages();
    }, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchData = async () => {
    try {
      await Promise.all([fetchConversation(), fetchMessages()]);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[FETCH_CHAT_DATA_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error(_errMsg || "Failed to load conversation");
    } finally {
      setLoading(false);
    }
  };

  const fetchConversation = async () => {
    const data = await apiJson<
      { data?: WhatsAppConversation } | WhatsAppConversation
    >(`/api/support/conversations/${id}`);
    const result = data as
      | { data?: WhatsAppConversation }
      | WhatsAppConversation;
    setConversation(
      (result as { data?: WhatsAppConversation }).data ??
        (result as WhatsAppConversation),
    );
  };

  const fetchMessages = async () => {
    const data = await apiJson<
      { data?: WhatsAppMessage[] } | WhatsAppMessage[]
    >(`/api/support/conversations/${id}/messages`);
    const result = data as { data?: WhatsAppMessage[] } | WhatsAppMessage[];
    setMessages(
      (result as { data?: WhatsAppMessage[] }).data ??
        (result as WhatsAppMessage[]) ??
        [],
    );
  };

  const handleSendMessage = async (content: string) => {
    try {
      await apiJson<{ success: boolean }>(
        `/api/support/conversations/${id}/messages`,
        {
          method: "POST",
          body: JSON.stringify({ content }),
        },
      );

      // Refresh messages immediately
      void fetchMessages();
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[SEND_MESSAGE_ERROR]", {
        error: _errMsg,
        conversationId: id,
        app: "merchant",
      });
      toast.error("Failed to send message");
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!conversation) return <div>Conversation not found</div>;

  return (
    <div className="h-[calc(100vh-120px)] border rounded-xl overflow-hidden shadow-sm bg-white ">
      <ChatWindow
        conversation={conversation}
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoadingMessages={false}
      />
    </div>
  );
}
