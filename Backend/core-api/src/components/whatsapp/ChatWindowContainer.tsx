import {
  logger,
  type WhatsAppMessage,
  type WhatsAppConversation,
  WhatsAppMessageSender,
  WhatsAppLinkedEntityType
} from "@vayva/shared";
import React, { useState, useEffect } from "react";
import { ChatWindow } from "./ChatWindow";
import { apiJson } from "@/lib/api-client-shared";
import { toast } from "sonner";

interface ChatWindowContainerProps {
  conversationId: string;
  conversations: WhatsAppConversation[];
}

export const ChatWindowContainer = ({
  conversationId,
  conversations,
}: ChatWindowContainerProps) => {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!conversationId) return;

    const loadMessages = async () => {
      setLoading(true);
      try {
        const res = await apiJson<{ data?: WhatsAppMessage[] }>(
          `/api/support/conversations/${conversationId}/messages`,
        );
        const items = Array.isArray(res.data) ? res.data : [];
        setMessages(items);
      } catch (error: unknown) {
        const _errMsg = error instanceof Error ? error.message : String(error);
        logger.error("[LOAD_CHAT_MESSAGES_ERROR]", {
          error: _errMsg,
          app: "merchant",
        });
      } finally {
        setLoading(false);
      }
    };
    void loadMessages();
  }, [conversationId]);

  const conversation = conversations.find((c) => c.id === conversationId);

  const onSendMessage = async (text: string) => {
    if (!conversationId) return;

    const tempId = `temp-${Date.now()}`;
    // Optimistic UI update
    const optimisticMsg: WhatsAppMessage = {
      id: tempId,
      conversationId,
      sender: WhatsAppMessageSender.MERCHANT,
      content: text,
      timestamp: new Date().toISOString(),
      isAutomated: false,
      linkedType: WhatsAppLinkedEntityType.NONE,
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await apiJson<{ data?: WhatsAppMessage }>(
        `/api/support/conversations/${conversationId}/messages`,
        {
          method: "POST",
          body: JSON.stringify({ content: text }),
        },
      );

      // Replace temp message with server version
      const replacement = res.data || (res as unknown as WhatsAppMessage);
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? replacement : m)),
      );
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[SEND_CHAT_MESSAGE_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      toast.error("Failed to send message");
    }
  };

  if (!conversation) {
    return <div>Conversation not found</div>;
  }

  return (
    <ChatWindow
      conversation={conversation}
      messages={messages}
      onSendMessage={onSendMessage}
      isLoadingMessages={loading}
    />
  );
};
