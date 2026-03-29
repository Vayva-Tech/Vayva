"use client";
import { logger, WhatsAppMessage, WhatsAppConversation } from "@vayva/shared";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Icon, Input } from "@vayva/ui";
import { toast } from "sonner";
import { ChatWindow } from "@/components/whatsapp/ChatWindow";

// --- Types ---
type Conversation = {
  id: string;
  customer: {
    id: string | null;
    name: string | null;
    email: string | null;
    phone: string | null;
  };
  lastMessage: {
    id: string;
    body: string;
    createdAt: string;
    senderType: string;
  } | null;
  unreadCount: number;
  slaStatus: "active" | "unread" | "overdue";
  priority: string;
  status: "open" | "closed";
};

interface CustomerOrder {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  itemCount: number;
}

import { apiJson } from "@/lib/api-client-shared";

interface ConversationsResponse {
  items: Conversation[];
}

interface MessagesResponse {
  items: WhatsAppMessage[];
}

interface RawOrder {
  id: string;
  orderNumber?: string;
  status?: string;
  fulfillmentStatus?: string;
  total?: number;
  totalAmount?: number;
  items?: any[];
  lineItems?: any[];
}

interface OrdersResponse {
  orders?: RawOrder[];
  data?: RawOrder[];
  items?: RawOrder[];
}

export default function InboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Composer
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);

  // Customer sidebar data
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);

  // URL Sync
  const searchParams = useSearchParams();
  const router = useRouter();

  const conversationsAbortRef = useRef<AbortController | null>(null);
  const messagesAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    void fetchConversations();
    return () => {
      conversationsAbortRef.current?.abort();
      messagesAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    const id = searchParams?.get("conversationId");
    if (id) {
      setSelectedId(id);
      void fetchMessages(id);
      // Fetch customer orders for sidebar
      const conv = conversations.find((c) => c.id === id);
      if (conv?.customer?.id) {
        void fetchCustomerOrders(conv.customer?.id);
      } else {
        setCustomerOrders([]);
      }
    } else {
      setSelectedId(null);
      setMessages([]);
      setCustomerOrders([]);
    }
  }, [searchParams, conversations]);

  // Update URL when selection changes manually (e.g. from list click if not using Request Link)
  const handleSelect = (id: string) => {
    router.push(`?conversationId=${id}`);
  };

  const fetchConversations = async () => {
    try {
      conversationsAbortRef.current?.abort();
      const controller = new AbortController();
      conversationsAbortRef.current = controller;

      const data = await apiJson<ConversationsResponse>(
        "/inbox/conversations",
        { signal: controller.signal },
      );
      setConversations(Array.isArray(data?.items) ? data.items : []);
    } catch (e: any) {
      const _errMsg = e instanceof Error ? e.message : String(e);
      if (e instanceof DOMException && e.name === "AbortError") return;
      logger.warn("[FETCH_CONVERSATIONS_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (id: string) => {
    setLoadingMessages(true);
    try {
      messagesAbortRef.current?.abort();
      const controller = new AbortController();
      messagesAbortRef.current = controller;

      const data = await apiJson<MessagesResponse>(
        `/api/inbox/conversations/${id}/messages?limit=30`,
        { signal: controller.signal },
      );
      setMessages(Array.isArray(data?.items) ? data.items : []);
    } catch (e: any) {
      const _errMsg = e instanceof Error ? e.message : String(e);
      if (e instanceof DOMException && e.name === "AbortError") return;
      logger.warn("[FETCH_MESSAGES_ERROR]", {
        error: _errMsg,
        conversationId: id,
        app: "merchant",
      });
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSend = async () => {
    if (!selectedId || !messageText.trim() || sending) return;
    setSending(true);
    try {
      await apiJson<{ success: boolean }>(
        `/api/inbox/conversations/${selectedId}/send`,
        {
          method: "POST",
          body: JSON.stringify({ text: messageText }),
        },
      );
      setMessageText("");
      // Refresh messages
      void fetchMessages(selectedId);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[SEND_MESSAGE_ERROR]", {
        error: _errMsg,
        conversationId: selectedId,
        app: "merchant",
      });
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const fetchCustomerOrders = async (customerId: string) => {
    try {
      const data = await apiJson<OrdersResponse>(
        `/api/orders?customerId=${customerId}&limit=5&sort=createdAt:desc`,
      );
      const orders = Array.isArray(data)
        ? data
        : (data?.orders ?? data?.data ?? data?.items ?? []);
      setCustomerOrders(
        (orders as RawOrder[]).map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber || o.id,
          status: (o as any).status || o.fulfillmentStatus || "UNKNOWN",
          total: o.total ?? o.totalAmount ?? 0,
          itemCount: o.items?.length || o.lineItems?.length || 0,
        })),
      );
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.warn("[FETCH_CUSTOMER_ORDERS_ERROR]", {
        error: _errMsg,
        customerId,
        app: "merchant",
      });
      setCustomerOrders([]);
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] -m-6 bg-white  overflow-hidden">
      {/* LEFT: Conversation List */}
      <div className="w-80 border-r border-gray-100 flex flex-col bg-white">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-bold text-lg mb-2">Inbox</h2>
          <Input type="search"
            placeholder="Search..."
            className="w-full text-sm p-2 rounded-lg border border-gray-200 bg-white "
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="p-4 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
              <Icon name="Loader2" size={16} className="animate-spin" /> Loading
              conversations...
            </div>
          )}
          {conversations.map((c: Conversation) => (
            <div
              key={c.id}
              onClick={() => handleSelect(c.id)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-white transition relative ${selectedId === c.id ? "bg-blue-50/50" : ""}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span
                  className={`font-bold text-sm ${c.unreadCount > 0 ? "text-black" : "text-gray-700"}`}
                >
                  {c.customer?.name || c.customer?.phone || "Unknown"}
                </span>
                <span className="text-[10px] text-gray-500">
                  {c.lastMessage
                    ? new Date(c.lastMessage?.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate">
                {c.lastMessage?.body || "No messages"}
              </p>

              {/* Badges */}
              <div className="flex gap-2 mt-2">
                {c.slaStatus === "overdue" && (
                  <span className="bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                    Overdue
                  </span>
                )}
                {c.unreadCount > 0 && (
                  <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold min-w-[20px] text-center">
                    {c.unreadCount}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MIDDLE: Thread */}
      <div className="flex-1 flex flex-col bg-white ">
        {selectedId ? (
          <>
            {/* Header */}
            <div className="h-14 border-b border-gray-100 flex items-center px-6 justify-between">
              <h3 className="font-bold">Chat</h3>
              <div className="flex items-center gap-2">
                <Button className="text-xs font-bold text-gray-500 hover:text-black border border-gray-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  AI Active
                </Button>
                <Button className="text-xs font-bold text-gray-500 hover:text-black border border-gray-200 px-3 py-1.5 rounded-lg transition-colors">
                  Resolve
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 min-h-0">
              <ChatWindow
                conversation={
                  (conversations.find((c: Conversation) => c.id === selectedId) as unknown as WhatsAppConversation | null) ?? null
                }
                messages={messages}
                isLoadingMessages={loadingMessages}
                onSendMessage={handleSend}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <Icon name="MessageSquare" size={48} className="mb-4 opacity-50" />
            <p>Select a conversation</p>
          </div>
        )}
      </div>

      {/* RIGHT: Profile Sidebar */}
      {selectedId &&
        (() => {
          const activeConv = conversations.find((c) => c.id === selectedId);
          const customer = activeConv?.customer;
          return (
            <div className="w-72 border-l border-gray-100 bg-white  flex flex-col p-6 overflow-y-auto">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-border rounded-full mx-auto mb-3" />
                <h3 className="font-bold text-lg">
                  {customer?.name || customer?.phone || "Unknown"}
                </h3>
                {customer?.phone && (
                  <p className="text-sm text-gray-500">{customer.phone}</p>
                )}
                {customer?.email && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {customer.email}
                  </p>
                )}
                {activeConv?.status === "open" && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-bold uppercase border border-green-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Active
                  </div>
                )}
              </div>

              {/* Recent Orders */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase text-gray-500 mb-3">
                  Recent Orders
                </h4>
                <div className="space-y-3">
                  {customerOrders.length === 0 ? (
                    <p className="text-xs text-gray-500">
                      No orders found
                    </p>
                  ) : (
                    customerOrders.map((order) => (
                      <div
                        key={order.id}
                        className="p-3 border border-gray-100 rounded-lg hover:border-gray-200 cursor-pointer"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-xs">
                            #{order.orderNumber}
                          </span>
                          <span className="text-[10px] bg-orange-50 text-orange-700 px-1.5 rounded">
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          ₦{order?.total?.toLocaleString()} &bull;{" "}
                          {order.itemCount} item
                          {order.itemCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Tags */}
              <div>
                <h4 className="text-xs font-bold uppercase text-gray-500 mb-3">
                  Tags & Labels
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Button className="text-[10px] border border-dashed border-gray-200 px-2 py-1 rounded text-gray-500 hover:border-gray-200">
                    + Add Tag
                  </Button>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
