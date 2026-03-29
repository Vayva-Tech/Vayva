/**
 * WhatsApp Agent Client
 * Manages WhatsApp Business API connections via Evolution API
 */
export interface WhatsAppConversation {
  id: string;
  customerName: string;
  phoneNumber: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
}

export interface WhatsAppMessage {
  id: string;
  conversationId: string;
  content: string;
  sender: "customer" | "business";
  timestamp: Date;
  status: "sent" | "delivered" | "read";
}

export class WhatsAppAgentClient {
  /**
   * Connect WhatsApp instance for a store
   */
  static async connect(storeId: string): Promise<{ success: boolean; qrCode?: string }> {
    const res = await fetch("/whatsapp/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeId }),
    });
    if (!res.ok) {
      throw new Error(`Failed to connect WhatsApp: ${res.statusText}`);
    }
    return res.json();
  }

  /**
   * Disconnect WhatsApp instance
   */
  static async disconnect(storeId: string): Promise<{ success: boolean }> {
    const res = await fetch("/whatsapp/disconnect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeId }),
    });
    if (!res.ok) {
      throw new Error(`Failed to disconnect WhatsApp: ${res.statusText}`);
    }
    return res.json();
  }

  /**
   * Get WhatsApp connection status
   */
  static async getStatus(storeId: string): Promise<{ 
    connected: boolean; 
    state?: string;
    phoneNumber?: string;
    qrCode?: string;
  }> {
    const res = await fetch(`/api/whatsapp/instance/status?instanceName=store_${storeId}`);
    if (!res.ok) {
      throw new Error(`Failed to get WhatsApp status: ${res.statusText}`);
    }
    return res.json();
  }

  /**
   * Get conversations list
   */
  static async getConversations(storeId?: string): Promise<WhatsAppConversation[]> {
    const effectiveStoreId = storeId || (typeof window !== "undefined" ? localStorage.getItem("storeId") : null);
    if (!effectiveStoreId) {
      throw new Error("storeId is required");
    }
    const res = await fetch(`/api/whatsapp/conversations?storeId=${effectiveStoreId}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch conversations: ${res.statusText}`);
    }
    return res.json();
  }

  /**
   * Get messages for a conversation
   */
  static async getMessages(conversationId: string, storeId?: string): Promise<WhatsAppMessage[]> {
    const effectiveStoreId = storeId || (typeof window !== "undefined" ? localStorage.getItem("storeId") : null);
    if (!effectiveStoreId) {
      throw new Error("storeId is required");
    }
    const res = await fetch(`/api/whatsapp/conversations/${conversationId}/messages?storeId=${effectiveStoreId}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch messages: ${res.statusText}`);
    }
    return res.json();
  }

  /**
   * Send a message
   */
  static async sendMessage(
    conversationId: string, 
    content: string, 
    storeId?: string
  ): Promise<{ success: boolean; messageId?: string }> {
    const effectiveStoreId = storeId || (typeof window !== "undefined" ? localStorage.getItem("storeId") : null);
    if (!effectiveStoreId) {
      throw new Error("storeId is required");
    }
    const res = await fetch(`/api/whatsapp/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeId: effectiveStoreId, content }),
    });
    if (!res.ok) {
      throw new Error(`Failed to send message: ${res.statusText}`);
    }
    return res.json();
  }
}

// Alias for backward compatibility
export const WhatsAppAgentService = WhatsAppAgentClient;
