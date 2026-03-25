"use client";

import { logger } from "@vayva/shared";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@vayva/ui";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChatCircleText as MessageCircle,
  PaperPlaneRight as Send,
  X,
  ThumbsUp,
  ThumbsDown
} from "@phosphor-icons/react/ssr";
import Image from "next/image";

interface Message {
  id: string;
  role: "bot" | "user";
  text: string;
  timestamp: Date;
  actions?: string[];
  messageId?: string; // Server ID for feedback
  feedback?: "SOLVED" | "NOT_SOLVED";
}

import { apiJson } from "@/lib/api-client-shared";

interface SupportChatResponse {
  message?: string;
  suggestedActions?: string[];
  messageId?: string;
}

export const SupportChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "bot",
      text: "Hi! I am your Vayva Support Assistant. How can I help you manage your store today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const data = await apiJson<SupportChatResponse>("/api/support/chat", {
        method: "POST",
        body: JSON.stringify({
          query: input,
          history: messages.map((m) => ({
            role: m.role === "bot" ? "assistant" : "user",
            content: m.text,
          })),
        }),
      });

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        text:
          data.message ||
          "I'm sorry, I'm having trouble processing that right now.",
        timestamp: new Date(),
        actions: data.suggestedActions,
        messageId: data.messageId,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[SUPPORT_CHAT_ERROR]", { error: _errMsg, app: "merchant" });
      setMessages((prev) => [
        ...prev,
        {
          id: "err",
          role: "bot",
          text: "Sorry, I lost my connection. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (
    msgLocalId: string,
    serverId: string,
    rating: "SOLVED" | "NOT_SOLVED",
  ) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgLocalId ? { ...m, feedback: rating } : m)),
    );
    try {
      await apiJson<{ success: boolean }>("/api/support/feedback", {
        method: "POST",
        body: JSON.stringify({
          messageId: serverId,
          rating,
          conversationId: "session_1",
        }),
      });
    } catch (e: unknown) {
      const _errMsg = e instanceof Error ? e.message : String(e);
      logger.error("[SUPPORT_FEEDBACK_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-text-inverse shadow-elevated hover:bg-primary-hover transition-colors"
          >
            <MessageCircle size={28} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            className="w-80 sm:w-96 h-[500px] bg-background rounded-2xl shadow-elevated overflow-hidden flex flex-col border border-border"
          >
            {/* Header */}
            <div className="bg-background/80 backdrop-blur-xl p-4 text-text-primary flex items-center justify-between border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/40 rounded-full flex items-center justify-center border border-border/60 overflow-hidden">
                  <Image
                    src="/vayva-logo-official.svg"
                    alt="Vayva"
                    width={18}
                    height={18}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Vayva Assistant</h3>
                  <p className="text-[10px] text-text-tertiary">
                    Usually replies instantly
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="icon"
                className="hover:bg-white/40 text-text-secondary"
              >
                <X size={20} />
              </Button>
            </div>

            {/* Auto-Escalation Banner */}
            {messages.filter((m) => m.feedback === "NOT_SOLVED").length >=
              2 && (
              <div className="bg-white/40 p-3 border-b border-border/60 flex items-center justify-between">
                <div className="text-xs text-text-secondary">
                  <strong>Need extra help?</strong>
                  <br />
                  We can connect you to a human agent.
                </div>
                <Button
                  onClick={() => {
                    setInput("Please connect me to a human agent");
                    handleSendMessage();
                  }}
                  className="text-xs bg-background text-text-primary px-3 py-1.5 rounded-lg border border-border font-medium hover:bg-white/40 transition-colors"
                >
                  Talk to Human
                </Button>
              </div>
            )}

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/30"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-text-inverse rounded-tr-none"
                        : "bg-background text-text-primary shadow-sm border border-border rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>

                  {msg.role === "bot" && msg.actions && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {msg.actions.map((action: string, i: number) => (
                        <Button
                          key={i}
                          onClick={() =>
                            setInput(
                              action === "Talk to Human"
                                ? "I need to speak to a human"
                                : action,
                            )
                          }
                          className="text-xs bg-white/40 text-text-secondary px-2 py-1 rounded-full border border-border hover:bg-white/50 transition-colors"
                        >
                          {action}
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Feedback Loop */}
                  {msg.role === "bot" && msg.messageId && (
                    <div className="mt-1 flex gap-2 ml-1">
                      {msg.feedback ? (
                        <span
                          className={`text-[10px] font-medium ${msg.feedback === "SOLVED" ? "text-text-secondary" : "text-text-tertiary"}`}
                        >
                          {msg.feedback === "SOLVED"
                            ? "Marked as Solved"
                            : "Feedback recorded"}
                        </span>
                      ) : (
                        <>
                          <Button
                            onClick={() =>
                              handleFeedback(msg.id, msg.messageId!, "SOLVED")
                            }
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-text-tertiary hover:text-text-primary"
                            title="Solved my issue"
                          >
                            <ThumbsUp size={12} />
                          </Button>
                          <Button
                            onClick={() =>
                              handleFeedback(
                                msg.id,
                                msg.messageId!,
                                "NOT_SOLVED",
                              )
                            }
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-text-tertiary hover:text-text-primary"
                            title="Didn't help"
                          >
                            <ThumbsDown size={12} />
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-background p-3 rounded-2xl shadow-sm border border-border rounded-tl-none flex gap-1 items-center">
                    <div className="w-1.5 h-1.5 bg-text-tertiary rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-text-tertiary rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-text-tertiary rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Chips & Input */}
            <div className="bg-background border-t border-border/60">
              {/* Quick Suggestion Chips */}
              <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar mask-linear-fade">
                {[
                  "Check Status",
                  "Billing Help",
                  "Connect WhatsApp",
                  "Talk to Human",
                ].map((chip) => (
                  <Button
                    key={chip}
                    onClick={() => {
                      if (chip === "Talk to Human") {
                        setInput("Please connect me to a human agent");
                        handleSendMessage();
                      } else {
                        setInput(chip);
                      }
                    }}
                    className="whitespace-nowrap flex-shrink-0 text-[10px] font-medium bg-white/40 text-text-secondary px-2.5 py-1.5 rounded-full border border-border hover:bg-white/50 transition-colors"
                  >
                    {chip}
                  </Button>
                ))}
              </div>

              {/* Main Input */}
              <div className="p-4 pt-2">
                <div className="flex items-center gap-2 bg-white/40 rounded-xl px-3 py-2 border border-border focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <input
                    type="text"
                    value={input}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setInput(e.target.value)
                    }
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Ask for help..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-1 placeholder:text-text-tertiary text-text-primary"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    className="p-1.5 bg-primary text-text-inverse rounded-lg disabled:opacity-50 disabled:bg-white/40 disabled:text-text-tertiary hover:bg-primary-hover transition-colors"
                  >
                    <Send size={16} />
                  </Button>
                </div>
                <p className="text-[10px] text-text-tertiary text-center mt-3">
                  Secure, AI-powered merchant support
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
