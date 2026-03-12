import {
  logger,
  WhatsAppMessage,
  WhatsAppMessageSender,
  WhatsAppConversation,
} from "@vayva/shared";
import React, { useState, useRef, useEffect } from "react";
import { Icon, cn, Button } from "@vayva/ui";

interface ChatWindowProps {
  conversation: WhatsAppConversation | null;
  messages: WhatsAppMessage[];
  onSendMessage: (
    content: string,
    linkedType?: string | null,
    linkedId?: string | null,
  ) => void;
  isLoadingMessages: boolean;
}

const QUICK_REPLIES = [
  "Confirm order",
  "Request payment",
  "Mark as ready",
  "Reschedule booking",
  "Send store link",
];

export const ChatWindow = ({
  conversation,
  messages,
  onSendMessage,
  isLoadingMessages,
}: ChatWindowProps) => {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    // Optimistic UI update could happen here, but for now we wait for API
    const messageToSend = inputValue;
    setInputValue(""); // Clear immediately

    try {
      await onSendMessage(messageToSend);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("Failed to send message", {
        error: _errMsg,
        app: "merchant",
      });
    } finally {
      setInputValue(messageToSend); // Restore on failure
    }
  };

  const handleQuickReply = (text: string) => {
    setInputValue(text); // Just insert text, don't auto-send
  };

  if (!conversation) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-text-tertiary">
        <Icon name="MessageSquare" size={48} className="mb-4 opacity-20" />
        <p>Select a conversation to start messaging</p>
      </div>
    );
  }

  if (isLoadingMessages) {
    return (
      <div className="h-full flex items-center justify-center text-text-tertiary">
        Loading messages...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#E5DDD5]/30 relative">
      {" "}
      {/* WhatsApp-ish mild background */}
      {/* Header */}
      <header className="h-[60px] bg-background border-b border-border flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-border flex items-center justify-center text-text-secondary font-bold text-xs">
            {conversation.customerName
              ? conversation.customerName.charAt(0)
              : "?"}
          </div>
          <div>
            <h3 className="font-bold text-sm text-text-primary">
              {conversation.customerName || conversation.customerPhone}
            </h3>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 block"></span>{" "}
              Online
            </p>
          </div>
        </div>
        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="text-text-tertiary hover:bg-white/40"
            aria-label="Call Customer"
            title="Call Customer"
          >
            <Icon name="Phone" size={18} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-text-tertiary hover:bg-white/40"
            aria-label="Search Messages"
            title="Search Messages"
          >
            <Icon name="Search" size={18} />
          </Button>
        </div>
      </header>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {messages.map((msg) => {
          const isMe = msg.sender === WhatsAppMessageSender.MERCHANT;
          const isSystem = msg.sender === WhatsAppMessageSender.SYSTEM;

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-4">
                <div className="bg-white/40 text-text-tertiary text-xs px-3 py-1.5 rounded-full shadow-sm border border-border flex items-center gap-2">
                  <Icon name="Zap" size={10} />
                  <span className="font-medium">Automated by Vayva:</span>{" "}
                  {msg.content}
                </div>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={cn(
                "flex w-full",
                isMe ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[70%] px-3 py-2 rounded-lg text-sm shadow-sm relative",
                  isMe
                    ? "bg-[#D9FDD3] text-text-primary rounded-br-none"
                    : "bg-background text-text-primary rounded-bl-none",
                )}
              >
                <p className="leading-relaxed">{msg.content}</p>
                <div
                  className={cn(
                    "text-[10px] mt-1 flex items-center gap-1",
                    isMe
                      ? "justify-end text-green-800/60"
                      : "text-text-tertiary",
                  )}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {isMe && <Icon name="CheckCheck" size={10} />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      {/* QUICK REPLY BAR */}
      <div className="bg-background border-t border-border p-2 overflow-x-auto whitespace-nowrap flex gap-2 custom-scrollbar shrink-0">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {QUICK_REPLIES.map((qr) => (
          <Button
            key={qr}
            variant="outline"
            size="sm"
            onClick={() => handleQuickReply(qr)}
            className="rounded-full bg-white/40 text-xs text-text-secondary border-border h-8"
          >
            {qr}
          </Button>
        ))}
      </div>
      {/* Input Area */}
      <div className="p-3 bg-background flex items-end gap-2 shrink-0">
        <Button
          size="icon"
          variant="ghost"
          className="text-text-tertiary hover:text-text-secondary hover:bg-white/40 rounded-full"
          aria-label="Add attachment"
          title="Add attachment"
        >
          <Icon name="Plus" size={20} />
        </Button>
        <div className="flex-1 bg-white/40 rounded-xl px-4 py-2 flex items-center">
          <input
            className="w-full bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-tertiary"
            placeholder="Type a message..."
            aria-label="Type a message"
            value={inputValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setInputValue(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
        </div>
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!inputValue.trim()}
          className="bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors h-10 w-10"
          aria-label="Send message"
          title="Send message"
        >
          <Icon
            name="Send"
            size={18}
            className={inputValue.trim() ? "translate-x-0.5" : ""}
          />
        </Button>
      </div>
    </div>
  );
};
